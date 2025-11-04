"""NEW Pipeline orchestrator with segment-based dubbing."""

import logging
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
        """Transcribe each segment independently."""
        transcribed = []

        for i, segment in enumerate(segments):
            logger.info(
                f"Transcribing segment {i+1}/{len(segments)}: {segment['start']:.1f}s-{segment['end']:.1f}s"
            )

            # For now, transcribe full audio (Whisper will handle it)
            # TODO: Extract segment audio first for better accuracy
            with open(audio_path, "rb") as f:
                files = {"file": (audio_path.name, f, "audio/wav")}
                data = {"language": language}

                response = await self.client.post(
                    f"{self.config.asr_service_url}/transcribe", files=files, data=data
                )
                response.raise_for_status()

            result = response.json()

            # Match transcription to segment timing
            # For now, use simple split (TODO: improve with word timestamps)
            transcribed.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "duration": segment["duration"],
                    "text": result["text"],  # Full text for now
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

            translated.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "duration": segment["duration"],
                    "text": result["translated_text"],
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
        """Assemble segments into final audio timeline."""
        # TODO: Implement proper audio assembly with ffmpeg
        # For now, return first segment (placeholder)
        logger.warning("Audio assembly not fully implemented - using first segment only")

        if segments:
            return segments[0]["audio_path"]
        else:
            raise RuntimeError("No segments to assemble")

    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()
