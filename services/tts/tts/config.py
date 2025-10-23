"""Configuration for TTS service."""

import logging
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class TTSConfig(BaseSettings):
    """Configuration for Text-to-Speech service."""

    # Engine selection
    engine: Literal["coqui", "openvoice"] = Field(default="coqui", description="TTS engine to use")

    # Device settings
    device: str = Field(default="auto", description="Device to use (cpu, cuda, auto)")

    # Coqui TTS settings
    coqui_model: str = Field(
        default="tts_models/multilingual/multi-dataset/xtts_v2",
        description="Coqui TTS model name",
    )
    coqui_language: str = Field(default="fr", description="Default language for Coqui")

    # Audio settings
    sample_rate: int = Field(default=22050, description="Output sample rate in Hz")

    # Voice cloning settings
    min_reference_duration: float = Field(
        default=6.0, description="Minimum reference audio duration in seconds"
    )
    optimal_reference_duration: float = Field(
        default=60.0, description="Optimal reference audio duration (1 minute)"
    )

    # Service settings
    service_host: str = Field(default="0.0.0.0", description="Service host")
    service_port: int = Field(default=8003, description="Service port")
    max_file_size: int = Field(default=50 * 1024 * 1024, description="Max upload size (50MB)")

    # Cache settings
    model_cache_dir: Path | None = Field(default=None, description="Directory for caching models")
    voice_cache_dir: Path = Field(
        default_factory=lambda: Path("/tmp/ekho/voices"),
        description="Directory for cached voice models",
    )

    class Config:
        """Pydantic settings config."""

        env_prefix = "TTS_"
        case_sensitive = False


def get_device(config: TTSConfig) -> str:
    """
    Determine the best device to use.

    Args:
        config: TTSConfig instance

    Returns:
        Device string ('cpu' or 'cuda')
    """
    if config.device != "auto":
        return config.device

    try:
        import torch

        if torch.cuda.is_available():
            logger.info("CUDA available, using GPU")
            return "cuda"
    except ImportError:
        pass

    logger.info("Using CPU for TTS")
    return "cpu"


# Supported languages
SUPPORTED_LANGUAGES = {
    "en": "English",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "pl": "Polish",
    "tr": "Turkish",
    "ru": "Russian",
    "nl": "Dutch",
    "cs": "Czech",
    "ar": "Arabic",
    "zh-cn": "Chinese (Simplified)",
    "ja": "Japanese",
    "hu": "Hungarian",
    "ko": "Korean",
    "hi": "Hindi",
}


# Global config instance
config = TTSConfig()
