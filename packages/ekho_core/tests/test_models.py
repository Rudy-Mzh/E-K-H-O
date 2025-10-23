"""Tests for data models."""

import pytest

from ekho_core.models import TimeRange, TranscriptionResult, TranslationResult, Word


def test_time_range_valid():
    """Test valid time range creation."""
    tr = TimeRange(start=0.0, end=5.5)
    assert tr.start == 0.0
    assert tr.end == 5.5
    assert tr.duration() == 5.5


def test_time_range_invalid():
    """Test that end < start raises error."""
    with pytest.raises(ValueError, match="End time .* must be >= start time"):
        TimeRange(start=5.0, end=2.0)


def test_word_model():
    """Test Word model."""
    word = Word(text="hello", time_range=TimeRange(start=0.0, end=0.5), confidence=0.95)
    assert word.text == "hello"
    assert word.time_range.duration() == 0.5
    assert word.confidence == 0.95


def test_transcription_result():
    """Test TranscriptionResult model."""
    words = [
        Word(text="hello", time_range=TimeRange(start=0.0, end=0.5), confidence=0.95),
        Word(text="world", time_range=TimeRange(start=0.5, end=1.0), confidence=0.92),
    ]

    result = TranscriptionResult(text="hello world", language="en", words=words, confidence=0.93)

    assert result.text == "hello world"
    assert result.language == "en"
    assert len(result.words) == 2
    assert result.confidence == 0.93


def test_translation_result():
    """Test TranslationResult model."""
    result = TranslationResult(
        source_text="hello world",
        translated_text="bonjour le monde",
        source_language="en",
        target_language="fr",
        confidence=0.88,
    )

    assert result.source_text == "hello world"
    assert result.translated_text == "bonjour le monde"
    assert result.source_language == "en"
    assert result.target_language == "fr"
