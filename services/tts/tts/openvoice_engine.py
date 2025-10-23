"""OpenVoice engine implementation (placeholder for future)."""

import logging
from pathlib import Path

from tts.base_engine import BaseTTSEngine
from tts.config import TTSConfig

logger = logging.getLogger(__name__)


class OpenVoiceEngine(BaseTTSEngine):
    """
    OpenVoice TTS engine with voice cloning.

    Note: This is a placeholder implementation. OpenVoice integration
    will be added in a future update. For now, falls back to Coqui.
    """

    def __init__(self, config: TTSConfig):
        """
        Initialize OpenVoice engine.

        Args:
            config: TTSConfig instance
        """
        self.config = config
        self.model = None
        logger.warning(
            "OpenVoice engine not yet implemented. "
            "Please use Coqui engine or contribute OpenVoice integration!"
        )

    def load_model(self) -> None:
        """Load OpenVoice model (not implemented)."""
        logger.error("OpenVoice engine not yet implemented")
        raise NotImplementedError(
            "OpenVoice engine is planned but not yet implemented. "
            "Please use 'coqui' engine instead. "
            "Set TTS_ENGINE=coqui in environment variables."
        )

    def synthesize(
        self,
        text: str,
        output_path: str | Path,
        reference_audio: str | Path | None = None,
        language: str = "fr",
    ) -> Path:
        """Synthesize speech (not implemented)."""
        raise NotImplementedError("OpenVoice engine not yet implemented")

    def clone_voice(self, reference_audio: str | Path, voice_id: str) -> str:
        """Clone voice (not implemented)."""
        raise NotImplementedError("OpenVoice engine not yet implemented")

    def unload_model(self) -> None:
        """Unload model (not implemented)."""
        pass

    @property
    def name(self) -> str:
        """Get engine name."""
        return "openvoice"


# TODO: Implement OpenVoice integration
#
# OpenVoice (MyShell.ai) implementation would follow this pattern:
#
# from openvoice import OpenVoice
#
# class OpenVoiceEngine(BaseTTSEngine):
#     def load_model(self):
#         self.model = OpenVoice(...)
#
#     def synthesize(self, text, output_path, reference_audio, language):
#         # Use OpenVoice API for synthesis
#         pass
#
# Contribution welcome! See: https://github.com/myshell-ai/OpenVoice
