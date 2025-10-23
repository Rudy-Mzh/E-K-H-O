"""Factory for creating TTS engines with easy switching."""

import logging

from tts.base_engine import BaseTTSEngine
from tts.config import TTSConfig
from tts.coqui_engine import CoquiTTSEngine
from tts.openvoice_engine import OpenVoiceEngine

logger = logging.getLogger(__name__)


class TTSEngineFactory:
    """Factory for creating and managing TTS engines."""

    @staticmethod
    def create_engine(config: TTSConfig) -> BaseTTSEngine:
        """
        Create TTS engine based on configuration.

        Args:
            config: TTSConfig instance

        Returns:
            TTS engine instance

        Raises:
            ValueError: If engine type is not supported
        """
        logger.info(f"Creating TTS engine: {config.engine}")

        if config.engine == "coqui":
            return CoquiTTSEngine(config)
        elif config.engine == "openvoice":
            return OpenVoiceEngine(config)
        else:
            raise ValueError(
                f"Unknown TTS engine: {config.engine}. " f"Supported engines: 'coqui', 'openvoice'"
            )

    @staticmethod
    def list_engines() -> dict[str, dict[str, str]]:
        """
        List available TTS engines with their features.

        Returns:
            Dictionary of engine information
        """
        return {
            "coqui": {
                "name": "Coqui TTS (XTTS-v2)",
                "status": "available",
                "features": "High-quality voice cloning, 17 languages, 6+ sec reference",
                "speed": "2-3x realtime (CPU), near-realtime (GPU)",
                "quality": "excellent",
            },
            "openvoice": {
                "name": "OpenVoice (MyShell.ai)",
                "status": "planned",
                "features": "Fast voice cloning, emotion control, multilingual",
                "speed": "near-realtime",
                "quality": "good",
            },
        }
