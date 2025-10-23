"""Configuration for ASR Whisper service."""

import logging
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class WhisperConfig(BaseSettings):
    """Configuration for Whisper ASR service."""

    # Model settings
    model_name: Literal["tiny", "base", "small", "medium", "large"] = Field(
        default="base", description="Whisper model size"
    )
    device: str = Field(default="auto", description="Device to use (cpu, cuda, auto)")
    compute_type: str = Field(default="float32", description="Computation type")

    # Transcription settings
    language: str | None = Field(default=None, description="Force language (e.g., 'en', 'fr')")
    task: Literal["transcribe", "translate"] = Field(default="transcribe", description="Task type")
    word_timestamps: bool = Field(default=True, description="Enable word-level timestamps")

    # Performance settings
    beam_size: int = Field(default=5, description="Beam size for decoding")
    best_of: int = Field(default=5, description="Number of candidates for decoding")
    temperature: float = Field(default=0.0, description="Temperature for sampling")

    # Service settings
    service_host: str = Field(default="0.0.0.0", description="Service host")
    service_port: int = Field(default=8001, description="Service port")
    max_file_size: int = Field(default=100 * 1024 * 1024, description="Max upload size (100MB)")

    # Cache settings
    model_cache_dir: Path | None = Field(default=None, description="Directory for caching models")

    class Config:
        """Pydantic settings config."""

        env_prefix = "WHISPER_"
        case_sensitive = False


def get_device(config: WhisperConfig) -> str:
    """
    Determine the best device to use.

    Args:
        config: WhisperConfig instance

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

    logger.info("Using CPU for Whisper")
    return "cpu"


# Global config instance
config = WhisperConfig()
