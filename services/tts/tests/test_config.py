"""Tests for configuration."""

from tts.config import SUPPORTED_LANGUAGES, TTSConfig, get_device


def test_default_config():
    """Test default configuration values."""
    config = TTSConfig()
    assert config.engine == "coqui"
    assert config.device == "auto"
    assert config.service_port == 8003
    assert config.sample_rate == 22050


def test_get_device_cpu():
    """Test device detection with CPU."""
    config = TTSConfig(device="cpu")
    device = get_device(config)
    assert device == "cpu"


def test_get_device_explicit():
    """Test explicit device setting."""
    config = TTSConfig(device="cuda")
    device = get_device(config)
    assert device == "cuda"


def test_supported_languages():
    """Test supported languages list."""
    assert "en" in SUPPORTED_LANGUAGES
    assert "fr" in SUPPORTED_LANGUAGES
    assert SUPPORTED_LANGUAGES["en"] == "English"
    assert SUPPORTED_LANGUAGES["fr"] == "French"
