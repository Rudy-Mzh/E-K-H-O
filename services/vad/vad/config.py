"""Configuration for VAD service."""

import logging
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class VADConfig(BaseSettings):
    """Configuration for Voice Activity Detection service."""

    # Service settings
    service_host: str = Field(default="0.0.0.0", description="Service host")
    service_port: int = Field(default=8004, description="Service port")

    # VAD model settings
    model_name: str = Field(
        default="pyannote/voice-activity-detection",
        description="HuggingFace model for VAD",
    )
    device: str = Field(default="auto", description="Device to use (cpu, cuda, mps, auto)")

    # Segmentation settings
    min_pause_duration: float = Field(
        default=0.5, description="Minimum pause duration in seconds to split segments"
    )
    min_segment_duration: float = Field(
        default=1.0, description="Minimum segment duration in seconds"
    )
    max_segment_duration: float = Field(
        default=30.0, description="Maximum segment duration in seconds"
    )

    # Cache settings
    model_cache_dir: Path | None = Field(default=None, description="Directory for caching models")

    class Config:
        """Pydantic settings config."""

        env_prefix = "VAD_"
        case_sensitive = False


def get_device(config: VADConfig) -> str:
    """
    Determine the best device to use.

    Args:
        config: VADConfig instance

    Returns:
        Device string ('cpu', 'cuda', or 'mps')
    """
    if config.device != "auto":
        return config.device

    try:
        import torch

        if torch.cuda.is_available():
            logger.info("CUDA available, using GPU")
            return "cuda"
        elif torch.backends.mps.is_available():
            logger.info("MPS available, using Apple Silicon GPU")
            return "mps"
    except ImportError:
        pass

    logger.info("Using CPU for VAD")
    return "cpu"


# Global config instance
config = VADConfig()
