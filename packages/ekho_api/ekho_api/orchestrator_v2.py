"""NEW Pipeline orchestrator with segment-based dubbing."""

import logging
import subprocess
from pathlib import Path

import httpx
from ekho_api.config import EkhoAPIConfig
from ekho_core.audio import combine_audio_video, extract_audio_from_video

logger = logging.getLogger(__name__)


class SegmentedDubbingOrchestrator:
    """Orchestrates segmented dubbing pipeline: VAD → ASR → LLM → TTS → Assembly."""

    def __init__(self, config: EkhoAPIConfig):
        """
        Initialize orchestrator.

        Args:
            config: EkhoAPIConfig instance
        """
        self.config = config
        self.client = httpx.AsyncClient(timeout=config.service_timeout)
        logger.info("SegmentedDubbingOrchestrator initialized")

    async def health_check(self) -> dict[str, dict]:
        """
        Check health of all services.

        Returns:
            Dictionary with service statuses
        """
        services = {
            "asr": self.config.asr_service_url,
            "vad": "http://localhost:8004",  # VAD service
            "llm": "http://localhost:8005",  # LLM service
            "tts": self.config.tts_service_url,
        }

        statuses = {}
        for service_name, url in services.items():
            try:
                response = await self.client.get(f"{url}/health", timeout=5.0)
                statuses[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "url": url,
                    "details": response.json() if response.status_code == 200 else None,
                }
            except Exception as e:
                statuses[service_name] = {"status": "unreachable", "url": url, "error": str(e)}

        return statuses

    async def dub_video_segmented(
        self,
        video_path: str | Path,
        output_path: str | Path,
        source_lang: str = "en",
        target_lang: str = "fr",
    ) -> Path:
        """
        Complete segmented video dubbing pipeline.

        Simplified Workflow (NO voice cloning):
        1. Extract audio from video
        2. **SEGMENT audio by pauses** (VAD)
        3. **Transcribe EACH segment** (ASR per segment)
        4. **Analyze GLOBAL context** (LLM Pass #1)
        5. **Translate EACH segment with context** (LLM Pass #2 per segment)
        6. **Synthesize EACH segment** (TTS per segment - default voice)
        7. **Assemble segments at correct timestamps**
        8. Combine final audio with video

        Args:
            video_path: Path to input video
            output_path: Path for output dubbed video
            source_lang: Source language code
            target_lang: Target language code

        Returns:
            Path to dubbed video

        Raises:
            Exception: If any step fails
        """
        video_path = Path(video_path)
        output_path = Path(output_path)

        logger.info(
            f"Starting SEGMENTED dubbing pipeline: {video_path.name} ({source_lang} → {target_lang})"
        )

        try:
            # Step 1: Extract audio from video
            logger.info("Step 1/8: Extracting audio from video")
            audio_path = extract_audio_from_video(video_path)

            # Step 2: Segment audio by pauses (VAD)
            logger.info("Step 2/8: Segmenting audio by pauses (VAD)")
            segments = await self._segment_audio(audio_path)
            logger.info(f"Found {len(segments)} speech segments")

            # Step 3: Transcribe EACH segment
            logger.info("Step 3/8: Transcribing each segment")
            transcribed_segments = await self._transcribe_segments(
                audio_path, segments, source_lang
            )

            # Get full transcript for context analysis
            full_transcript = " ".join([seg["text"] for seg in transcribed_segments])
            logger.info(f"Full transcript: {len(full_transcript)} chars")

            # Step 4: Analyze GLOBAL context (LLM Pass #1)
            logger.info("Step 4/8: Analyzing global context with LLM")
            context = await self._analyze_context(full_transcript, source_lang, target_lang)
            logger.info(f"Context analyzed: {len(context)} chars")

            # Step 5: Translate EACH segment with context (LLM Pass #2)
            logger.info("Step 5/8: Translating each segment with context")
            translated_segments = await self._translate_segments(
                transcribed_segments, context, source_lang, target_lang
            )

            # Step 6: Synthesize EACH segment (TTS with default voice)
            logger.info("Step 6/8: Synthesizing each segment with default voice")
            audio_segments = await self._synthesize_segments(translated_segments, target_lang)

            # Step 7: Assemble segments at correct timestamps
            logger.info("Step 7/8: Assembling audio timeline")
            final_audio = await self._assemble_audio_timeline(audio_segments, audio_path)

            # Step 8: Combine with video
            logger.info("Step 8/8: Combining audio with video")
            dubbed_video = combine_audio_video(video_path, final_audio, output_path)

            logger.info(f"Segmented dubbing complete: {dubbed_video}")
            return dubbed_video

        except Exception as e:
            logger.error(f"Segmented dubbing failed: {e}", exc_info=True)
            raise

    async def _segment_audio(self, audio_path: Path) -> list[dict]:
        """Segment audio using VAD service."""
        with open(audio_path, "rb") as f:
            files = {"file": (audio_path.name, f, "audio/wav")}
            response = await self.client.post("http://localhost:8004/segment", files=files)
            response.raise_for_status()

        result = response.json()
        return result["segments"]

    async def _transcribe_segments(
        self, audio_path: Path, segments: list[dict], language: str
    ) -> list[dict]:
        """Transcribe each segment independently by extracting audio segments."""
        transcribed = []

        for i, segment in enumerate(segments):
            logger.info(
                f"Transcribing segment {i+1}/{len(segments)}: {segment['start']:.1f}s-{segment['end']:.1f}s"
            )

            # Extract this specific segment audio using ffmpeg
            segment_audio_path = Path(f"/tmp/ekho/asr_segment_{i}.wav")
            segment_audio_path.parent.mkdir(parents=True, exist_ok=True)

            # Use ffmpeg to extract segment from start to end time
            extract_cmd = [
                "ffmpeg",
                "-y",  # Overwrite
                "-i",
                str(audio_path),
                "-ss",
                str(segment["start"]),  # Start time
                "-t",
                str(segment["duration"]),  # Duration
                "-acodec",
                "pcm_s16le",  # WAV format
                "-ar",
                "16000",  # Sample rate for Whisper
                "-ac",
                "1",  # Mono
                str(segment_audio_path),
            ]

            subprocess.run(extract_cmd, capture_output=True, text=True, check=True)

            # Transcribe the extracted segment
            with open(segment_audio_path, "rb") as f:
                files = {"file": (segment_audio_path.name, f, "audio/wav")}
                data = {"language": language}

                response = await self.client.post(
                    f"{self.config.asr_service_url}/transcribe", files=files, data=data
                )
                response.raise_for_status()

            result = response.json()

            # Clean up segment audio file
            segment_audio_path.unlink(missing_ok=True)

            transcribed.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "duration": segment["duration"],
                    "text": result["text"].strip(),
                }
            )

        return transcribed

    async def _analyze_context(self, transcript: str, source_lang: str, target_lang: str) -> str:
        """Analyze global context using LLM."""
        response = await self.client.post(
            "http://localhost:8005/analyze-context",
            json={
                "transcript": transcript,
                "source_lang": source_lang,
                "target_lang": target_lang,
            },
        )
        response.raise_for_status()

        result = response.json()
        return result["context"]

    async def _translate_segments(
        self,
        segments: list[dict],
        context: str,
        source_lang: str,
        target_lang: str,
    ) -> list[dict]:
        """Translate each segment with context."""
        translated = []

        for i, segment in enumerate(segments):
            logger.info(f"Translating segment {i+1}/{len(segments)}: {len(segment['text'])} chars")

            response = await self.client.post(
                "http://localhost:8005/translate",
                json={
                    "text": segment["text"],
                    "context": context,
                    "source_lang": source_lang,
                    "target_lang": target_lang,
                    "target_duration": segment["duration"],
                },
            )
            response.raise_for_status()

            result = response.json()

            # Clean translated text: remove quotes and extra whitespace
            translated_text = result["translated_text"].strip()
            # Remove surrounding quotes if present
            if translated_text.startswith('"') and translated_text.endswith('"'):
                translated_text = translated_text[1:-1]
            if translated_text.startswith("'") and translated_text.endswith("'"):
                translated_text = translated_text[1:-1]

            # Limit to ~400 characters (to stay under XTTS 400 token limit)
            # Approximate: 1 token ≈ 4 chars in French, so 400 tokens ≈ 1600 chars max
            # But let's be conservative and limit to 800 chars to avoid issues
            if len(translated_text) > 800:
                logger.warning(
                    f"Translated text too long ({len(translated_text)} chars), truncating to 800 chars"
                )
                translated_text = translated_text[:800]

            translated.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "duration": segment["duration"],
                    "text": translated_text,
                }
            )

        return translated

    async def _synthesize_segments(self, segments: list[dict], language: str) -> list[dict]:
        """Synthesize each segment with default TTS voice (no cloning)."""
        synthesized = []

        for i, segment in enumerate(segments):
            logger.info(f"Synthesizing segment {i+1}/{len(segments)}: {len(segment['text'])} chars")

            data = {"text": segment["text"], "language": language}

            response = await self.client.post(
                f"{self.config.tts_service_url}/synthesize", data=data
            )
            response.raise_for_status()

            # Save segment audio
            segment_audio_path = Path(f"/tmp/ekho/segment_{i}_{language}.wav")
            segment_audio_path.parent.mkdir(parents=True, exist_ok=True)

            with open(segment_audio_path, "wb") as f:
                f.write(response.content)

            synthesized.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "duration": segment["duration"],
                    "audio_path": segment_audio_path,
                }
            )

        return synthesized

    async def _assemble_audio_timeline(self, segments: list[dict], reference_audio: Path) -> Path:
        """Assemble segments at original timestamps with smooth transitions."""
        if not segments:
            raise RuntimeError("No segments to assemble")

        logger.info(f"Assembling {len(segments)} audio segments into timeline")

        # Get reference audio duration
        probe_cmd = [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(reference_audio),
        ]
        result = subprocess.run(probe_cmd, capture_output=True, text=True, check=True)
        total_duration = float(result.stdout.strip())
        logger.info(f"Reference audio duration: {total_duration:.2f}s")

        # Sort segments by start time
        sorted_segments = sorted(segments, key=lambda x: x["start"])

        # Build inputs: base silence + all segments
        inputs = ["-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo:d={total_duration}"]

        for segment in sorted_segments:
            inputs.extend(["-i", str(segment["audio_path"])])

        # Build filter_complex: trim to duration with fades, then delay each segment, then mix
        filter_parts = []

        for i, segment in enumerate(sorted_segments):
            delay_ms = int(segment["start"] * 1000)
            duration = segment["end"] - segment["start"]
            logger.info(
                f"Segment {i+1}/{len(sorted_segments)}: "
                f"{segment['start']:.2f}s-{segment['end']:.2f}s (duration={duration:.2f}s, delay={delay_ms}ms)"
            )
            # CRITICAL FIX: Trim audio to exact duration to prevent overlapping
            # Add fade-in (50ms) and fade-out (100ms) for smooth transitions
            # Then delay segment to original timestamp
            fade_out_start = max(0, duration - 0.1)  # Start fade-out 100ms before end
            filter_parts.append(
                f"[{i+1}:a]atrim=0:{duration},afade=t=in:st=0:d=0.05,afade=t=out:st={fade_out_start}:d=0.1[trimmed{i}];"
                f"[trimmed{i}]adelay={delay_ms}|{delay_ms}[delayed{i}]"
            )

        # Mix base + all delayed segments (normalize=0 to preserve volume)
        mix_inputs = "[0:a]"
        for i in range(len(sorted_segments)):
            mix_inputs += f"[delayed{i}]"

        filter_parts.append(
            f"{mix_inputs}amix=inputs={len(sorted_segments)+1}:duration=longest:normalize=0[out]"
        )

        filter_complex = ";".join(filter_parts)

        # Output
        output_path = Path("/tmp/ekho/assembled_audio.wav")
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Single-pass assembly
        ffmpeg_cmd = [
            "ffmpeg",
            "-y",
            *inputs,
            "-filter_complex",
            filter_complex,
            "-map",
            "[out]",
            "-ar",
            "44100",
            "-ac",
            "2",
            str(output_path),
        ]

        logger.info("Running single-pass ffmpeg assembly...")
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)

        if result.returncode != 0:
            logger.error(f"Single-pass failed: {result.stderr}")
            # Fallback: simple concat (preserves volume but no timing)
            logger.warning("Fallback: simple concatenation")

            concat_inputs = []
            for segment in sorted_segments:
                concat_inputs.extend(["-i", str(segment["audio_path"])])

            concat_filter = "".join([f"[{i}:a]" for i in range(len(sorted_segments))])
            concat_filter += f"concat=n={len(sorted_segments)}:v=0:a=1[out]"

            fallback_cmd = [
                "ffmpeg",
                "-y",
                *concat_inputs,
                "-filter_complex",
                concat_filter,
                "-map",
                "[out]",
                str(output_path),
            ]
            subprocess.run(fallback_cmd, capture_output=True, text=True, check=True)

        logger.info(f"Audio timeline assembled: {output_path}")
        return output_path

    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()
