"""Tests for configuration."""

from asr_whisper.config import WhisperConfig, get_device


def test_default_config():
    """Test default configuration values."""
    config = WhisperConfig()
    assert config.model_name == "base"
    assert config.device == "auto"
    assert config.word_timestamps is True
    assert config.service_port == 8001


def test_get_device_cpu():
    """Test device detection with CPU."""
    config = WhisperConfig(device="cpu")
    device = get_device(config)
    assert device == "cpu"


def test_get_device_explicit():
    """Test explicit device setting."""
    config = WhisperConfig(device="cuda")
    device = get_device(config)
    assert device == "cuda"
