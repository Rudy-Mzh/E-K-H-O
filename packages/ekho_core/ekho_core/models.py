"""Shared data models for EKHO platform."""

from pydantic import BaseModel, Field


class TimeRange(BaseModel):
    """Time range in seconds with start and end timestamps."""

    start: float = Field(..., ge=0, description="Start time in seconds")
    end: float = Field(..., ge=0, description="End time in seconds")

    def duration(self) -> float:
        """Calculate duration of the time range."""
        return self.end - self.start

    def model_post_init(self, __context) -> None:
        """Validate that end is after start."""
        if self.end < self.start:
            raise ValueError(f"End time ({self.end}) must be >= start time ({self.start})")


class Word(BaseModel):
    """A word with its timing information."""

    text: str = Field(..., description="The word text")
    time_range: TimeRange = Field(..., description="When this word is spoken")
    confidence: float | None = Field(None, ge=0, le=1, description="Confidence score from ASR")


class TranscriptionResult(BaseModel):
    """Result from speech-to-text transcription."""

    text: str = Field(..., description="Full transcribed text")
    language: str = Field(..., description="Detected or specified language code (e.g., 'en')")
    words: list[Word] = Field(default_factory=list, description="Word-level timestamps and text")
    confidence: float | None = Field(
        None, ge=0, le=1, description="Overall transcription confidence"
    )


class TranslationResult(BaseModel):
    """Result from text translation."""

    source_text: str = Field(..., description="Original text")
    translated_text: str = Field(..., description="Translated text")
    source_language: str = Field(..., description="Source language code (e.g., 'en')")
    target_language: str = Field(..., description="Target language code (e.g., 'fr')")
    confidence: float | None = Field(None, ge=0, le=1, description="Translation confidence score")


class AudioSegment(BaseModel):
    """Audio segment with associated metadata."""

    audio_path: str = Field(..., description="Path to audio file")
    time_range: TimeRange | None = Field(None, description="Time range within the audio file")
    sample_rate: int | None = Field(None, description="Sample rate in Hz")
    channels: int | None = Field(None, description="Number of audio channels")
    duration: float | None = Field(None, ge=0, description="Duration in seconds")

    class Config:
        """Pydantic config."""

        arbitrary_types_allowed = True
