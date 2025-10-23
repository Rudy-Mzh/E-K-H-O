"""Tests for configuration."""

from ekho_api.config import EkhoAPIConfig


def test_default_config():
    """Test default configuration values."""
    config = EkhoAPIConfig()
    assert config.asr_service_url == "http://localhost:8001"
    assert config.nmt_service_url == "http://localhost:8002"
    assert config.tts_service_url == "http://localhost:8003"
    assert config.service_port == 8000
    assert config.source_language == "en"
    assert config.target_language == "fr"
