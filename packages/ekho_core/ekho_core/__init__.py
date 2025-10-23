"""EKHO Core - Shared utilities for voice translation platform."""

__version__ = "0.1.0"

from ekho_core.models import AudioSegment, TimeRange, TranscriptionResult, TranslationResult, Word

__all__ = [
    "AudioSegment",
    "TimeRange",
    "TranscriptionResult",
    "TranslationResult",
    "Word",
]
