"""Pipeline orchestrator for video dubbing."""

import logging
from pathlib import Path

import httpx
from ekho_api.config import EkhoAPIConfig
from ekho_core.audio import (
    combine_audio_video,
    extract_audio_from_video,
    extract_voice_sample_for_cloning,
)
from ekho_core.models import TranscriptionResult, TranslationResult

logger = logging.getLogger(__name__)


class DubbingOrchestrator:
    """Orchestrates ASR, NMT, and TTS services for video dubbing."""

    def __init__(self, config: EkhoAPIConfig):
        """
        Initialize orchestrator.

        Args:
            config: EkhoAPIConfig instance
        """
        self.config = config
        self.client = httpx.AsyncClient(timeout=config.service_timeout)
        logger.info("DubbingOrchestrator initialized")

    async def health_check(self) -> dict[str, dict]:
        """
        Check health of all services.

        Returns:
            Dictionary with service statuses
        """
        services = {
            "asr": self.config.asr_service_url,
            "nmt": self.config.nmt_service_url,
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

    async def transcribe_audio(
        self, audio_path: str | Path, language: str = "en"
    ) -> TranscriptionResult:
        """
        Transcribe audio using ASR service.

        Args:
            audio_path: Path to audio file
            language: Source language code

        Returns:
            TranscriptionResult with text and timestamps

        Raises:
            httpx.HTTPError: If ASR service fails
        """
        audio_path = Path(audio_path)
        logger.info(f"Transcribing audio: {audio_path.name}")

        with open(audio_path, "rb") as f:
            files = {"file": (audio_path.name, f, "audio/wav")}
            data = {"language": language} if language else {}

            response = await self.client.post(
                f"{self.config.asr_service_url}/transcribe", files=files, data=data
            )
            response.raise_for_status()

        result = TranscriptionResult(**response.json())
        logger.info(f"Transcription complete: {len(result.text)} chars, {len(result.words)} words")
        return result

    async def translate_text(
        self, text: str, source_lang: str = "en", target_lang: str = "fr"
    ) -> TranslationResult:
        """
        Translate text using NMT service.

        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code

        Returns:
            TranslationResult with translated text

        Raises:
            httpx.HTTPError: If NMT service fails
        """
        logger.info(f"Translating text: {len(text)} chars ({source_lang} → {target_lang})")

        response = await self.client.post(
            f"{self.config.nmt_service_url}/translate",
            json={"text": text, "source_lang": source_lang, "target_lang": target_lang},
        )
        response.raise_for_status()

        result = TranslationResult(**response.json())
        logger.info(f"Translation complete: {len(result.translated_text)} chars")
        return result

    async def synthesize_speech(
        self, text: str, reference_audio: str | Path, language: str = "fr", voice_id: str = None
    ) -> Path:
        """
        Synthesize speech using TTS service with voice cloning.

        Args:
            text: Text to synthesize
            reference_audio: Reference audio for voice cloning
            language: Target language code
            voice_id: Optional cached voice ID

        Returns:
            Path to synthesized audio file

        Raises:
            httpx.HTTPError: If TTS service fails
        """
        logger.info(f"Synthesizing speech: {len(text)} chars, language={language}")

        # Prepare request
        data = {"text": text, "language": language}
        if voice_id:
            data["voice_id"] = voice_id

        # Make request with file upload if needed
        if reference_audio and not voice_id:
            reference_audio = Path(reference_audio)
            with open(reference_audio, "rb") as f:
                files = {"reference_audio": (reference_audio.name, f, "audio/wav")}
                response = await self.client.post(
                    f"{self.config.tts_service_url}/synthesize", data=data, files=files
                )
        else:
            response = await self.client.post(
                f"{self.config.tts_service_url}/synthesize", data=data
            )
        response.raise_for_status()

        # Save synthesized audio
        output_path = Path(f"/tmp/ekho/synthesized_{language}.wav")
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "wb") as f:
            f.write(response.content)

        logger.info(f"Speech synthesis complete: {output_path}")
        return output_path

    async def dub_video(
        self,
        video_path: str | Path,
        output_path: str | Path,
        source_lang: str = "en",
        target_lang: str = "fr",
    ) -> Path:
        """
        Complete video dubbing pipeline.

        Workflow:
        1. Extract audio from video
        2. Transcribe audio (ASR)
        3. Translate text (NMT)
        4. Synthesize translated speech with voice cloning (TTS)
        5. Combine new audio with original video

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
            f"Starting video dubbing pipeline: {video_path.name} ({source_lang} → {target_lang})"
        )

        try:
            # Step 1: Extract audio from video
            logger.info("Step 1/6: Extracting audio from video")
            audio_path = extract_audio_from_video(video_path)

            # Step 2: Extract optimal voice sample for cloning (NEW!)
            logger.info("Step 2/6: Extracting optimal voice sample for cloning")
            logger.info("Using first 15 seconds for best voice quality capture")
            voice_sample = extract_voice_sample_for_cloning(
                audio_path,
                start_time=0.0,  # Start at beginning
                duration=15.0,  # 15 seconds optimal for XTTS-v2
            )
            logger.info(f"Voice sample ready: {voice_sample}")

            # Step 3: Transcribe audio (full audio for complete transcription)
            logger.info("Step 3/6: Transcribing audio")
            transcription = await self.transcribe_audio(audio_path, language=source_lang)

            # Step 4: Translate text
            logger.info("Step 4/6: Translating text")
            translation = await self.translate_text(
                transcription.text, source_lang=source_lang, target_lang=target_lang
            )

            # Step 5: Synthesize translated speech with optimized voice cloning
            logger.info("Step 5/6: Synthesizing speech with optimized voice cloning")
            logger.info("Using voice sample for high-quality cloning")
            synthesized_audio = await self.synthesize_speech(
                text=translation.translated_text,
                reference_audio=voice_sample,  # Use optimized sample (not full audio!)
                language=target_lang,
            )

            # Step 6: Combine new audio with video
            logger.info("Step 6/6: Combining audio with video")
            dubbed_video = combine_audio_video(video_path, synthesized_audio, output_path)

            logger.info(f"Video dubbing complete with optimized voice cloning: {dubbed_video}")
            return dubbed_video

        except Exception as e:
            logger.error(f"Video dubbing failed: {e}", exc_info=True)
            raise

    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()
