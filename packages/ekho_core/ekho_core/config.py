"""Configuration management for EKHO."""

import logging
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings


class EkhoConfig(BaseSettings):
    """Global configuration for EKHO platform."""

    # Logging
    log_level: str = Field(default="INFO", description="Logging level")

    # Audio processing
    default_sample_rate: int = Field(default=16000, description="Default audio sample rate (Hz)")
    default_channels: int = Field(default=1, description="Default number of audio channels")

    # Paths
    temp_dir: Path = Field(
        default_factory=lambda: Path("/tmp/ekho"), description="Temporary files directory"
    )
    cache_dir: Path | None = Field(default=None, description="Cache directory for models")

    # API endpoints (will be used by services)
    asr_service_url: str = Field(
        default="http://localhost:8001", description="ASR Whisper service URL"
    )
    nmt_service_url: str = Field(default="http://localhost:8002", description="NMT service URL")
    tts_service_url: str = Field(default="http://localhost:8003", description="TTS service URL")

    class Config:
        """Pydantic settings config."""

        env_prefix = "EKHO_"
        env_file = ".env"
        case_sensitive = False


def setup_logging(level: str = "INFO") -> None:
    """
    Setup logging configuration.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def ensure_temp_dir(config: EkhoConfig) -> Path:
    """
    Ensure temporary directory exists.

    Args:
        config: EkhoConfig instance

    Returns:
        Path to temp directory
    """
    config.temp_dir.mkdir(parents=True, exist_ok=True)
    return config.temp_dir


# Global config instance
config = EkhoConfig()
setup_logging(config.log_level)
