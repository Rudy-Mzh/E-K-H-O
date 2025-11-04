"""Mock TTS engine for testing (Coqui TTS doesn't support Python 3.13 yet)."""

import logging
from pathlib import Path

from tts.base_engine import BaseTTSEngine
from tts.config import TTSConfig

logger = logging.getLogger(__name__)


class MockTTSEngine(BaseTTSEngine):
    """Mock TTS engine that generates silent audio for testing."""

    def __init__(self, config: TTSConfig):
        """
        Initialize mock engine.

        Args:
            config: TTSConfig instance
        """
        self.config = config
        logger.warning("Using MockTTSEngine - Coqui TTS not available on Python 3.13")
        logger.info("MockTTSEngine initialized (generates silent audio)")

    @property
    def name(self) -> str:
        """Get engine name."""
        return "MockTTS"

    def load_model(self) -> None:
        """Load model (no-op for mock)."""
        logger.info("Mock: load_model called (no-op)")

    def unload_model(self) -> None:
        """Unload model (no-op for mock)."""
        logger.info("Mock: unload_model called (no-op)")

    def synthesize(
        self,
        text: str,
        output_path: str | Path,
        reference_audio: str | Path | None = None,
        language: str = "fr",
        voice_id: str | None = None,
    ) -> Path:
        """
        Generate silent WAV file for testing.

        Args:
            text: Text to synthesize
            output_path: Where to save audio
            reference_audio: Reference audio for voice cloning (unused in mock)
            language: Target language
            voice_id: Cached voice ID (unused in mock)

        Returns:
            Path to generated file
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        logger.info(f"Mock synthesizing: {len(text)} chars, language={language}")
        logger.warning("Generated SILENT audio - replace with real TTS for production")

        # Generate 3 seconds of silent audio (16kHz, mono, 16-bit PCM WAV)
        import wave

        duration_seconds = 3
        sample_rate = 16000
        num_samples = duration_seconds * sample_rate

        with wave.open(str(output_path), "wb") as wav_file:
            wav_file.setnchannels(1)  # mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(b"\x00\x00" * num_samples)

        logger.info(f"Mock synthesis complete: {output_path}")
        return output_path

    def clone_voice(self, reference_audio: str | Path, voice_id: str) -> str:
        """
        Mock voice cloning (does nothing in mock).

        Args:
            reference_audio: Reference audio file
            voice_id: Voice ID to cache

        Returns:
            Voice ID
        """
        logger.info(f"Mock voice cloning: {reference_audio} -> {voice_id}")
        return voice_id
