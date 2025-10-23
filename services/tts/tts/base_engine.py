"""Base class for TTS engines."""

from abc import ABC, abstractmethod
from pathlib import Path


class BaseTTSEngine(ABC):
    """Abstract base class for TTS engines."""

    @abstractmethod
    def load_model(self) -> None:
        """Load TTS model into memory."""
        pass

    @abstractmethod
    def synthesize(
        self,
        text: str,
        output_path: str | Path,
        reference_audio: str | Path | None = None,
        language: str = "fr",
    ) -> Path:
        """
        Synthesize speech from text.

        Args:
            text: Text to synthesize
            output_path: Path for output audio file
            reference_audio: Optional reference audio for voice cloning
            language: Target language code

        Returns:
            Path to generated audio file
        """
        pass

    @abstractmethod
    def clone_voice(self, reference_audio: str | Path, voice_id: str) -> str:
        """
        Clone voice from reference audio.

        Args:
            reference_audio: Path to reference audio file
            voice_id: Identifier for the cloned voice

        Returns:
            Voice ID for future synthesis
        """
        pass

    @abstractmethod
    def unload_model(self) -> None:
        """Unload model from memory."""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """Get engine name."""
        pass
