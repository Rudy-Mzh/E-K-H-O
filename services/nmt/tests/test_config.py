"""Tests for configuration."""

import pytest
from nmt.config import NMTConfig, get_device, get_model_for_pair


def test_default_config():
    """Test default configuration values."""
    config = NMTConfig()
    assert config.model_name == "Helsinki-NLP/opus-mt-en-fr"
    assert config.device == "auto"
    assert config.service_port == 8002
    assert config.max_length == 512


def test_get_device_cpu():
    """Test device detection with CPU."""
    config = NMTConfig(device="cpu")
    device = get_device(config)
    assert device == "cpu"


def test_get_device_explicit():
    """Test explicit device setting."""
    config = NMTConfig(device="cuda")
    device = get_device(config)
    assert device == "cuda"


def test_get_model_for_pair_valid():
    """Test getting model for valid language pair."""
    model = get_model_for_pair("en", "fr")
    assert model == "Helsinki-NLP/opus-mt-en-fr"

    model = get_model_for_pair("fr", "en")
    assert model == "Helsinki-NLP/opus-mt-fr-en"


def test_get_model_for_pair_invalid():
    """Test getting model for invalid language pair."""
    with pytest.raises(ValueError, match="Language pair .* not supported"):
        get_model_for_pair("en", "zz")
