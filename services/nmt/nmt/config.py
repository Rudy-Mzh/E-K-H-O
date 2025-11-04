"""Configuration for NMT service."""

import logging
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class NMTConfig(BaseSettings):
    """Configuration for Neural Machine Translation service."""

    # Model settings
    model_name: str = Field(
        default="Helsinki-NLP/opus-mt-en-fr",
        description="HuggingFace model name for translation",
    )
    device: str = Field(default="auto", description="Device to use (cpu, cuda, auto)")

    # Translation settings (optimized for natural, contextual translations)
    max_length: int = Field(default=512, description="Maximum translation length in tokens")
    num_beams: int = Field(
        default=6, description="Number of beams for beam search (higher=better quality)"
    )
    temperature: float = Field(default=0.8, description="Sampling temperature (lower=more focused)")
    do_sample: bool = Field(default=True, description="Use sampling for more natural translations")
    top_k: int = Field(default=50, description="Top-k sampling for diversity")
    top_p: float = Field(default=0.92, description="Nucleus sampling threshold")
    repetition_penalty: float = Field(default=1.2, description="Penalty for repetitions")
    length_penalty: float = Field(
        default=0.8, description="Penalty for length (lower=more concise)"
    )

    # Service settings
    service_host: str = Field(default="0.0.0.0", description="Service host")
    service_port: int = Field(default=8002, description="Service port")
    max_batch_size: int = Field(default=32, description="Maximum batch size for translation")

    # Cache settings
    model_cache_dir: Path | None = Field(default=None, description="Directory for caching models")

    class Config:
        """Pydantic settings config."""

        env_prefix = "NMT_"
        case_sensitive = False


def get_device(config: NMTConfig) -> str:
    """
    Determine the best device to use.

    Args:
        config: NMTConfig instance

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

    logger.info("Using CPU for NMT")
    return "cpu"


# Supported language pairs (Helsinki-NLP OPUS-MT models)
SUPPORTED_PAIRS = {
    "en-fr": "Helsinki-NLP/opus-mt-en-fr",
    "fr-en": "Helsinki-NLP/opus-mt-fr-en",
    "en-es": "Helsinki-NLP/opus-mt-en-es",
    "en-de": "Helsinki-NLP/opus-mt-en-de",
    "en-it": "Helsinki-NLP/opus-mt-en-it",
    "en-pt": "Helsinki-NLP/opus-mt-en-pt",
}


def get_model_for_pair(source_lang: str, target_lang: str) -> str:
    """
    Get the model name for a language pair.

    Args:
        source_lang: Source language code (e.g., 'en')
        target_lang: Target language code (e.g., 'fr')

    Returns:
        HuggingFace model name

    Raises:
        ValueError: If language pair is not supported
    """
    pair = f"{source_lang}-{target_lang}"
    if pair not in SUPPORTED_PAIRS:
        raise ValueError(
            f"Language pair '{pair}' not supported. "
            f"Supported pairs: {list(SUPPORTED_PAIRS.keys())}"
        )
    return SUPPORTED_PAIRS[pair]


# Global config instance
config = NMTConfig()
