"""NEW Pipeline orchestrator with segment-based dubbing."""

import logging
import subprocess
from pathlib import Path

import httpx
import librosa
import numpy as np
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

            # Step 2: Segment audio by pauses AND identify speakers (VAD + Diarization)
            logger.info("Step 2/8: Segmenting audio and detecting speakers")
            vad_result = await self._segment_audio(audio_path)
            segments = vad_result["segments"]  # Now includes speaker_id, speaker_gender
            num_speakers = vad_result.get("num_speakers", 1)
            speaker_info = vad_result.get("speaker_info", {})
            logger.info(f"Found {len(segments)} segments from {num_speakers} speakers")
            logger.info(f"Speakers: {speaker_info}")

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

            # Save transcriptions for debugging
            self._save_transcriptions(
                transcribed_segments,
                translated_segments,
                output_path,
                source_lang,
                target_lang,
            )

            # Step 6: Synthesize EACH segment (TTS with per-speaker gender)
            logger.info("Step 6/8: Synthesizing each segment with per-speaker voices")
            audio_segments = await self._synthesize_segments(
                translated_segments, target_lang, default_gender="male"
            )

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

    async def _segment_audio(self, audio_path: Path) -> dict:
        """Segment audio using VAD service with diarization."""
        with open(audio_path, "rb") as f:
            files = {"file": (audio_path.name, f, "audio/wav")}
            response = await self.client.post("http://localhost:8004/segment", files=files)
            response.raise_for_status()

        result = response.json()
        return result  # Return full dict with segments, num_speakers, speaker_info

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
                    "speaker_id": segment.get("speaker_id", 0),
                    "speaker_gender": segment.get("speaker_gender", "male"),
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
            source_text = segment["text"].strip()

            # Skip empty or very short segments (avoid LLM hallucinations)
            if not source_text or len(source_text) < 3:
                logger.info(f"Skipping empty segment {i+1}/{len(segments)}")
                translated.append(
                    {
                        "start": segment["start"],
                        "end": segment["end"],
                        "duration": segment["duration"],
                        "text": "",  # Empty = silence
                        "speaker_id": segment.get("speaker_id", 0),
                        "speaker_gender": segment.get("speaker_gender", "male"),
                    }
                )
                continue

            logger.info(f"Translating segment {i+1}/{len(segments)}: {len(source_text)} chars")

            response = await self.client.post(
                "http://localhost:8005/translate",
                json={
                    "text": source_text,
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

            # Limit text length based on target duration
            # Average speech rate: ~150 words/min = ~2.5 words/sec = ~15 chars/sec
            max_chars = int(segment["duration"] * 18)  # 18 chars/sec max
            if len(translated_text) > max_chars:
                logger.warning(
                    f"Translated text too long for duration ({len(translated_text)} chars > {max_chars} max), truncating"
                )
                # Truncate at phrase/sentence boundary for natural flow
                translated_text = self._truncate_at_phrase_boundary(translated_text, max_chars)

            # Hard limit for TTS safety
            if len(translated_text) > 600:
                translated_text = self._truncate_at_phrase_boundary(translated_text, 600)

            translated.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "duration": segment["duration"],
                    "text": translated_text,
                    "speaker_id": segment.get("speaker_id", 0),
                    "speaker_gender": segment.get("speaker_gender", "male"),
                }
            )

        return translated

    def _truncate_at_phrase_boundary(self, text: str, max_chars: int) -> str:
        """
        Truncate text at a natural phrase boundary for better flow.

        Tries to cut at (in order of preference):
        1. Sentence end (. ! ?)
        2. Clause boundary (, ; :)
        3. Word boundary (space)

        Args:
            text: Text to truncate
            max_chars: Maximum character count

        Returns:
            Truncated text at natural boundary
        """
        if len(text) <= max_chars:
            return text

        # Get the substring up to max_chars
        truncated = text[:max_chars]

        # Try to find a sentence boundary (. ! ?)
        for punct in [". ", "! ", "? "]:
            last_pos = truncated.rfind(punct)
            if last_pos > max_chars * 0.5:  # Must keep at least 50% of text
                return truncated[: last_pos + 1].strip()

        # Try to find a clause boundary (, ; :)
        for punct in [", ", "; ", ": "]:
            last_pos = truncated.rfind(punct)
            if last_pos > max_chars * 0.6:  # Must keep at least 60% of text
                return truncated[: last_pos + 1].strip()

        # Fall back to word boundary
        last_space = truncated.rfind(" ")
        if last_space > max_chars * 0.7:
            return truncated[:last_space].strip()

        # Last resort: just truncate
        return truncated.strip()

    def _clean_text_for_tts(self, text: str) -> str:
        """
        Clean text before TTS synthesis to avoid pathological cases.

        Removes excessive repetitions of filler words (uh, um, euh, etc.)
        that can cause TTS failures.
        """
        import re

        # Remove excessive repetitions of filler words
        # Pattern: matches 3+ consecutive repetitions of "euh", "uh", "um", etc.
        fillers = r"\b(euh|uh|um|hum|hmm|er|ah|oh)\b"

        # Replace 3+ consecutive fillers with just 2
        cleaned = re.sub(
            f"({fillers}[,\\s]*)+",
            lambda m: (
                " ".join(m.group(0).split()[:2]) if len(m.group(0).split()) > 2 else m.group(0)
            ),
            text,
            flags=re.IGNORECASE,
        )

        # Limit total text length to 800 chars for safety
        if len(cleaned) > 800:
            logger.warning(f"Text too long ({len(cleaned)} chars), truncating to 800")
            cleaned = cleaned[:800]

        return cleaned

    async def _synthesize_segments(
        self, segments: list[dict], language: str, default_gender: str = "male"
    ) -> list[dict]:
        """Synthesize each segment with voice matching detected speaker gender."""
        synthesized = []

        for i, segment in enumerate(segments):
            # Clean text before synthesis to avoid TTS crashes
            original_text = segment["text"]
            cleaned_text = self._clean_text_for_tts(original_text)

            # Skip empty segments (silence in output)
            if not cleaned_text or len(cleaned_text.strip()) < 2:
                logger.info(f"Skipping empty segment {i+1}/{len(segments)} (silence)")
                continue

            if len(original_text) != len(cleaned_text):
                logger.info(
                    f"Cleaned segment {i+1} text: {len(original_text)} → {len(cleaned_text)} chars"
                )

            # Get speaker-specific gender and ID (from diarization)
            speaker_gender = segment.get("speaker_gender", default_gender)
            speaker_id = segment.get("speaker_id", 0)

            logger.info(
                f"Synthesizing segment {i+1}/{len(segments)}: "
                f"speaker {speaker_id} ({speaker_gender}), "
                f"{len(cleaned_text)} chars"
            )

            data = {
                "text": cleaned_text,
                "language": language,
                "speaker_gender": speaker_gender,
                "speaker_id": speaker_id,
            }

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

    def _extract_segment_energy(self, audio_path: Path, start: float, end: float) -> float:
        """
        Extract RMS energy from an audio segment.

        Args:
            audio_path: Path to audio file
            start: Start time in seconds
            end: End time in seconds

        Returns:
            RMS energy value (dB scale, normalized)
        """
        try:
            duration = end - start
            y, sr = librosa.load(str(audio_path), sr=None, offset=start, duration=duration)
            rms = np.sqrt(np.mean(y**2))
            # Convert to dB scale (avoid log(0))
            db = 20 * np.log10(max(rms, 1e-10))
            return db
        except Exception as e:
            logger.warning(f"Energy extraction failed: {e}")
            return -20.0  # Default value

    def _calculate_gain_adjustment(self, original_db: float, tts_db: float) -> float:
        """
        Calculate gain adjustment to match original energy.

        Args:
            original_db: Original audio energy in dB
            tts_db: TTS audio energy in dB

        Returns:
            Gain adjustment in dB
        """
        # Limit adjustment to avoid extreme changes
        diff = original_db - tts_db
        return max(-12, min(12, diff))  # Clamp between -12dB and +12dB

    async def _assemble_audio_timeline(self, segments: list[dict], reference_audio: Path) -> Path:
        """Assemble segments at original timestamps with energy matching."""
        if not segments:
            raise RuntimeError("No segments to assemble")

        logger.info(f"Assembling {len(segments)} audio segments into timeline with energy matching")

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

        # Build filter_complex: trim, apply energy matching, add fades, delay each segment
        filter_parts = []

        for i, segment in enumerate(sorted_segments):
            delay_ms = int(segment["start"] * 1000)
            duration = segment["end"] - segment["start"]

            # Extract energy from original and TTS audio for matching
            original_energy = self._extract_segment_energy(
                reference_audio, segment["start"], segment["end"]
            )
            tts_energy = self._extract_segment_energy(segment["audio_path"], 0, duration)
            gain_db = self._calculate_gain_adjustment(original_energy, tts_energy)

            logger.info(
                f"Segment {i+1}/{len(sorted_segments)}: "
                f"{segment['start']:.2f}s-{segment['end']:.2f}s "
                f"(energy: orig={original_energy:.1f}dB, tts={tts_energy:.1f}dB, gain={gain_db:+.1f}dB)"
            )

            # Apply: volume adjustment for energy matching, trim, fade-in/out, delay
            fade_out_start = max(0, duration - 0.1)  # Start fade-out 100ms before end
            filter_parts.append(
                f"[{i+1}:a]volume={gain_db}dB,atrim=0:{duration},"
                f"afade=t=in:st=0:d=0.05,afade=t=out:st={fade_out_start}:d=0.1[trimmed{i}];"
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

    def _save_transcriptions(
        self,
        source_segments: list[dict],
        target_segments: list[dict],
        output_video_path: Path,
        source_lang: str,
        target_lang: str,
    ) -> None:
        """
        Save transcriptions for debugging and quality analysis.

        Creates 3 files:
        - {output}_transcription_source.txt: Original transcription
        - {output}_transcription_target.txt: Translated text
        - {output}_transcription_comparison.txt: Side-by-side comparison

        Args:
            source_segments: Transcribed segments (original language)
            target_segments: Translated segments (target language)
            output_video_path: Path to output video (used as base for filenames)
            source_lang: Source language code
            target_lang: Target language code
        """
        base_path = output_video_path.with_suffix("")

        # File 1: Source transcription
        source_file = base_path.with_name(f"{base_path.name}_transcription_source.txt")
        with open(source_file, "w", encoding="utf-8") as f:
            f.write(f"=== SOURCE TRANSCRIPTION ({source_lang.upper()}) ===\n\n")
            for i, seg in enumerate(source_segments, 1):
                timing = f"[{seg['start']:.2f}s - {seg['end']:.2f}s]"
                f.write(f"{i}. {timing}\n{seg['text']}\n\n")
        logger.info(f"Source transcription saved: {source_file}")

        # File 2: Target translation
        target_file = base_path.with_name(f"{base_path.name}_transcription_target.txt")
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(f"=== TARGET TRANSLATION ({target_lang.upper()}) ===\n\n")
            for i, seg in enumerate(target_segments, 1):
                timing = f"[{seg['start']:.2f}s - {seg['end']:.2f}s]"
                f.write(f"{i}. {timing}\n{seg['text']}\n\n")
        logger.info(f"Target translation saved: {target_file}")

        # File 3: Side-by-side comparison
        comparison_file = base_path.with_name(f"{base_path.name}_transcription_comparison.txt")
        with open(comparison_file, "w", encoding="utf-8") as f:
            f.write(
                f"=== TRANSCRIPTION COMPARISON ({source_lang.upper()} → {target_lang.upper()}) ===\n\n"
            )
            for i, (src, tgt) in enumerate(zip(source_segments, target_segments, strict=False), 1):
                timing = f"[{src['start']:.2f}s - {src['end']:.2f}s]"
                f.write(f"{'='*70}\n")
                f.write(f"Segment {i} {timing}\n")
                f.write(f"{'='*70}\n\n")
                f.write(f"SOURCE ({source_lang.upper()}):\n{src['text']}\n\n")
                f.write(f"TARGET ({target_lang.upper()}):\n{tgt['text']}\n\n")
        logger.info(f"Comparison saved: {comparison_file}")

    def _detect_speaker_gender(self, audio_path: Path) -> str:
        """
        Detect speaker gender from audio using pitch analysis.

        Args:
            audio_path: Path to audio file

        Returns:
            "male" or "female" based on fundamental frequency analysis
        """
        try:
            # Load audio
            y, sr = librosa.load(str(audio_path), sr=None, duration=30)  # Analyze first 30s

            # Extract fundamental frequency (F0) using pyin algorithm
            f0, voiced_flag, voiced_probs = librosa.pyin(
                y, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7"), sr=sr
            )

            # Filter out unvoiced frames (silence, noise)
            f0_voiced = f0[voiced_flag]

            if len(f0_voiced) == 0:
                logger.warning("No voiced frames detected, defaulting to male")
                return "male"

            # Calculate median pitch
            median_pitch = np.nanmedian(f0_voiced)

            # Gender classification based on typical pitch ranges:
            # Male: 85-180 Hz (median ~120 Hz)
            # Female: 165-255 Hz (median ~210 Hz)
            # Threshold: 165 Hz
            gender = "male" if median_pitch < 165 else "female"

            logger.info(f"Detected speaker gender: {gender} (median pitch: {median_pitch:.1f} Hz)")
            return gender

        except Exception as e:
            logger.error(f"Gender detection failed: {e}, defaulting to male")
            return "male"  # Default to male if detection fails

    async def dub_video_global_with_validation(
        self,
        video_path: Path,
        output_path: Path,
        source_lang: str,
        target_lang: str,
    ) -> Path:
        """
        Global pipeline with contextual validation (3 phases).

        Phase 1: Deep contextual analysis with full transcription
        Phase 2: Global translation with PAUSE markers → segmentation → synthesis
        Phase 3: Post-translation validation (compare source vs target context)

        Args:
            video_path: Path to input video
            output_path: Path for output video
            source_lang: Source language code (e.g., "fr")
            target_lang: Target language code (e.g., "en")

        Returns:
            Path to dubbed video file

        Raises:
            RuntimeError: If dubbing fails
        """
        try:
            logger.info("=" * 80)
            logger.info("GLOBAL PIPELINE WITH VALIDATION - Starting")
            logger.info(f"Video: {video_path.name}")
            logger.info(f"Translation: {source_lang} → {target_lang}")
            logger.info("=" * 80)

            # Step 1: Extract audio
            logger.info("Step 1/10: Extracting audio from video")
            audio_path = Path("/tmp") / f"audio_{video_path.stem}.wav"
            extract_audio_from_video(video_path, audio_path)
            logger.info(f"Audio extracted: {audio_path}")

            # Step 1.5: Detect speaker gender
            logger.info("Step 1.5/10: Detecting speaker gender")
            speaker_gender = self._detect_speaker_gender(audio_path)

            # Step 2: Segment audio (VAD)
            logger.info("Step 2/10: Detecting voice segments (VAD)")
            with open(audio_path, "rb") as f:
                files = {"file": (audio_path.name, f, "audio/wav")}
                response = await self.client.post("http://localhost:8004/segment", files=files)
                response.raise_for_status()
            segments = response.json()["segments"]
            logger.info(f"Found {len(segments)} voice segments")

            # Step 3: Transcribe all segments
            logger.info("Step 3/10: Transcribing all segments")
            transcribed_segments = await self._transcribe_segments(
                audio_path, segments, source_lang
            )
            full_transcript = " ".join([seg["text"] for seg in transcribed_segments])
            logger.info(f"Full transcript: {len(full_transcript)} chars")

            # ==================== PHASE 1: DEEP CONTEXTUAL ANALYSIS ====================
            logger.info("=" * 80)
            logger.info("PHASE 1: DEEP CONTEXTUAL ANALYSIS")
            logger.info("=" * 80)

            logger.info("Step 4/10: Analyzing deep context with LLM")
            response = await self.client.post(
                "http://localhost:8005/analyze-deep-context",
                json={
                    "transcript": full_transcript,
                    "source_lang": source_lang,
                    "target_lang": target_lang,
                },
            )
            response.raise_for_status()
            deep_context = response.json()["deep_context"]
            logger.info("Deep context analysis complete")
            logger.info(f"  Subject: {deep_context.get('subject', {}).get('main_topic', 'N/A')}")
            logger.info(f"  Tone: {deep_context.get('tone_style', {}).get('register', 'N/A')}")

            # ==================== PHASE 2: GLOBAL TRANSLATION ====================
            logger.info("=" * 80)
            logger.info("PHASE 2: GLOBAL TRANSLATION WITH PAUSE MARKERS")
            logger.info("=" * 80)

            logger.info("Step 5/10: Global translation with context")
            response = await self.client.post(
                "http://localhost:8005/translate-global",
                json={
                    "transcript": full_transcript,
                    "deep_context": deep_context,
                    "source_lang": source_lang,
                    "target_lang": target_lang,
                },
            )
            response.raise_for_status()
            translated_text_with_pauses = response.json()["translated_text"]
            pause_count = response.json()["pause_count"]
            logger.info(
                f"Global translation complete: {len(translated_text_with_pauses)} chars, "
                f"{pause_count} pauses"
            )

            # Step 6: Parse PAUSE markers to create translation segments
            logger.info("Step 6/10: Parsing PAUSE markers into segments")
            translated_text_segments = [
                seg.strip() for seg in translated_text_with_pauses.split("[PAUSE]") if seg.strip()
            ]
            logger.info(f"Created {len(translated_text_segments)} translation segments")

            # Map translation segments to original timing segments
            # Simple approach: distribute translations across original segments proportionally
            if len(translated_text_segments) != len(transcribed_segments):
                logger.warning(
                    f"Mismatch: {len(translated_text_segments)} translations vs "
                    f"{len(transcribed_segments)} segments. Adjusting..."
                )
                # Pad or truncate to match
                while len(translated_text_segments) < len(transcribed_segments):
                    translated_text_segments.append("")
                translated_text_segments = translated_text_segments[: len(transcribed_segments)]

            # Create final segments with timing and translation
            final_segments = []
            for orig_seg, trans_text in zip(
                transcribed_segments, translated_text_segments, strict=False
            ):
                final_segments.append(
                    {
                        "start": orig_seg["start"],
                        "end": orig_seg["end"],
                        "duration": orig_seg["duration"],
                        "text": trans_text,
                    }
                )

            # Step 7: Synthesize translated segments (filter empty segments)
            logger.info("Step 7/10: Synthesizing translated audio segments")
            # Filter out empty segments before synthesis
            non_empty_segments = [seg for seg in final_segments if seg["text"].strip()]
            logger.info(
                f"Synthesizing {len(non_empty_segments)} non-empty segments "
                f"(filtered {len(final_segments) - len(non_empty_segments)} empty)"
            )
            synthesized_segments = await self._synthesize_segments(
                non_empty_segments, target_lang, speaker_gender
            )

            # Step 8: Assemble final dubbed audio
            logger.info("Step 8/10: Assembling final dubbed audio track")
            dubbed_audio_path = await self._assemble_audio_timeline(
                synthesized_segments, audio_path
            )

            # Step 9: Combine dubbed audio with original video
            logger.info("Step 9/10: Combining dubbed audio with video")
            combine_audio_video(video_path, dubbed_audio_path, output_path)
            logger.info(f"Dubbed video created: {output_path}")

            # ==================== PHASE 3: POST-TRANSLATION VALIDATION ====================
            logger.info("=" * 80)
            logger.info("PHASE 3: POST-TRANSLATION CONTEXT VALIDATION")
            logger.info("=" * 80)

            logger.info("Step 10/10: Validating translation context")
            # Analyze context of translated text
            translated_full_text = " ".join([seg["text"] for seg in final_segments])
            response = await self.client.post(
                "http://localhost:8005/analyze-deep-context",
                json={
                    "transcript": translated_full_text,
                    "source_lang": target_lang,
                    "target_lang": target_lang,  # Analyze in target language
                },
            )
            response.raise_for_status()
            target_context = response.json()["deep_context"]

            # Compare source and target contexts
            validation_report = self._generate_validation_report(
                deep_context, target_context, source_lang, target_lang
            )

            # Save validation report
            validation_file = output_path.with_name(f"{output_path.stem}_validation_report.txt")
            with open(validation_file, "w", encoding="utf-8") as f:
                f.write(validation_report)
            logger.info(f"Validation report saved: {validation_file}")

            # Save transcriptions (source, target, comparison)
            self._save_transcriptions(
                transcribed_segments, final_segments, output_path, source_lang, target_lang
            )

            logger.info("=" * 80)
            logger.info("GLOBAL PIPELINE COMPLETED SUCCESSFULLY")
            logger.info("=" * 80)

            return output_path

        except Exception as e:
            logger.error(f"Global dubbing with validation failed: {e}", exc_info=True)
            raise RuntimeError(f"Global dubbing with validation failed: {e}") from e

    def _generate_validation_report(
        self, source_context: dict, target_context: dict, source_lang: str, target_lang: str
    ) -> str:
        """
        Generate validation report comparing source and target contexts.

        Args:
            source_context: Deep context from source language analysis
            target_context: Deep context from target language analysis
            source_lang: Source language code
            target_lang: Target language code

        Returns:
            Formatted validation report
        """
        report = []
        report.append("=" * 80)
        report.append("EKHO TRANSLATION VALIDATION REPORT")
        report.append("=" * 80)
        report.append("")
        report.append(f"Translation: {source_lang.upper()} → {target_lang.upper()}")
        report.append("")

        # Compare subjects
        report.append("=" * 80)
        report.append("1. SUBJECT COMPARISON")
        report.append("=" * 80)
        source_subject = source_context.get("subject", {})
        target_subject = target_context.get("subject", {})
        report.append(f"SOURCE: {source_subject.get('main_topic', 'N/A')}")
        report.append(f"TARGET: {target_subject.get('main_topic', 'N/A')}")
        report.append("")

        # Compare tone/style
        report.append("=" * 80)
        report.append("2. TONE & STYLE COMPARISON")
        report.append("=" * 80)
        source_tone = source_context.get("tone_style", {})
        target_tone = target_context.get("tone_style", {})
        report.append(f"SOURCE Register: {source_tone.get('register', 'N/A')}")
        report.append(f"TARGET Register: {target_tone.get('register', 'N/A')}")
        report.append(f"SOURCE Emotion: {source_tone.get('dominant_emotion', 'N/A')}")
        report.append(f"TARGET Emotion: {target_tone.get('dominant_emotion', 'N/A')}")
        report.append("")

        # Glossary comparison
        report.append("=" * 80)
        report.append("3. TERMINOLOGY")
        report.append("=" * 80)
        source_glossary = source_context.get("glossary", {})
        target_glossary = target_context.get("glossary", {})
        report.append(f"SOURCE Technical Terms: {len(source_glossary.get('technical_terms', {}))}")
        report.append(f"TARGET Technical Terms: {len(target_glossary.get('technical_terms', {}))}")
        report.append("")

        # Overall assessment
        report.append("=" * 80)
        report.append("4. CONTEXTUAL COHERENCE ASSESSMENT")
        report.append("=" * 80)
        report.append(
            "✅ Subject coherence: "
            + (
                "MAINTAINED"
                if source_subject.get("main_topic", "").lower()
                in target_subject.get("main_topic", "").lower()
                or target_subject.get("main_topic", "").lower()
                in source_subject.get("main_topic", "").lower()
                else "NEEDS REVIEW"
            )
        )
        report.append(
            "✅ Tone coherence: "
            + (
                "MAINTAINED"
                if source_tone.get("register", "") == target_tone.get("register", "")
                else "DIVERGENT"
            )
        )
        report.append("")
        report.append("=" * 80)
        report.append("END OF VALIDATION REPORT")
        report.append("=" * 80)

        return "\n".join(report)

    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()
