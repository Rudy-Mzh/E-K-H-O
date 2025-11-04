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
            reference_audio: Optional reference audio (ignored in no-cloning version)
            language: Target language code

        Returns:
            Path to generated audio file
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
