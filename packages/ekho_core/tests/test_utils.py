"""Tests for utility functions."""

import pytest

from ekho_core.utils import create_temp_file, format_timestamp, generate_file_hash, parse_timestamp


def test_format_timestamp():
    """Test timestamp formatting."""
    assert format_timestamp(0.0) == "00:00:00.000"
    assert format_timestamp(65.5) == "00:01:05.500"
    assert format_timestamp(3665.123) == "01:01:05.123"


def test_parse_timestamp():
    """Test timestamp parsing."""
    assert parse_timestamp("00:00:00.000") == 0.0
    assert parse_timestamp("00:01:05.500") == 65.5
    assert parse_timestamp("01:01:05.123") == pytest.approx(3665.123)


def test_timestamp_roundtrip():
    """Test timestamp format/parse roundtrip."""
    original = 123.456
    formatted = format_timestamp(original)
    parsed = parse_timestamp(formatted)
    assert parsed == pytest.approx(original, rel=1e-3)


def test_parse_timestamp_invalid():
    """Test invalid timestamp parsing."""
    with pytest.raises(ValueError, match="Invalid timestamp format"):
        parse_timestamp("invalid")


def test_create_temp_file():
    """Test temporary file creation."""
    temp_file = create_temp_file(suffix=".wav", prefix="test_")
    assert temp_file.exists()
    assert temp_file.suffix == ".wav"
    assert temp_file.name.startswith("test_")
    # Cleanup
    temp_file.unlink()


def test_generate_file_hash(tmp_path):
    """Test file hash generation."""
    # Create a test file
    test_file = tmp_path / "test.txt"
    test_file.write_text("hello world")

    hash1 = generate_file_hash(test_file)
    assert isinstance(hash1, str)
    assert len(hash1) == 32  # MD5 hash length

    # Same content should produce same hash
    hash2 = generate_file_hash(test_file)
    assert hash1 == hash2

    # Different content should produce different hash
    test_file.write_text("different content")
    hash3 = generate_file_hash(test_file)
    assert hash1 != hash3
