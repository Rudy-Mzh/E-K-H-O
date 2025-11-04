"""Configuration for LLM service."""

import logging
import os

from dotenv import load_dotenv
from pydantic import Field
from pydantic_settings import BaseSettings

# Load .env file
load_dotenv()

logger = logging.getLogger(__name__)


class LLMConfig(BaseSettings):
    """Configuration for LLM service using Gemini."""

    # Service settings
    service_host: str = Field(default="0.0.0.0", description="Service host")
    service_port: int = Field(default=8005, description="Service port")

    # Gemini API settings
    gemini_api_key: str = Field(
        default_factory=lambda: os.getenv("GEMINI_API_KEY", ""),
        description="Gemini API key",
    )
    gemini_model: str = Field(
        default="gemini-2.0-flash-exp",
        description="Gemini model name",
    )

    # Translation settings
    temperature: float = Field(default=0.7, description="Sampling temperature (0.0-1.0)")
    max_tokens: int = Field(default=2048, description="Maximum output tokens")

    class Config:
        """Pydantic settings config."""

        env_prefix = "LLM_"
        case_sensitive = False


# Global config instance
config = LLMConfig()
