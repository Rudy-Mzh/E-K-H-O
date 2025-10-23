"""Configuration for EKHO API orchestrator."""

import logging

from pydantic import Field
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class EkhoAPIConfig(BaseSettings):
    """Configuration for EKHO API orchestrator."""

    # Service URLs
    asr_service_url: str = Field(
        default="http://localhost:8001", description="ASR Whisper service URL"
    )
    nmt_service_url: str = Field(default="http://localhost:8002", description="NMT service URL")
    tts_service_url: str = Field(default="http://localhost:8003", description="TTS service URL")

    # API settings
    service_host: str = Field(default="0.0.0.0", description="Service host")
    service_port: int = Field(default=8000, description="Service port")
    max_file_size: int = Field(default=500 * 1024 * 1024, description="Max upload size (500MB)")

    # Timeout settings
    service_timeout: int = Field(default=300, description="Service request timeout in seconds")

    # Pipeline settings
    source_language: str = Field(default="en", description="Default source language")
    target_language: str = Field(default="fr", description="Default target language")

    class Config:
        """Pydantic settings config."""

        env_prefix = "EKHO_"
        case_sensitive = False


# Global config instance
config = EkhoAPIConfig()
