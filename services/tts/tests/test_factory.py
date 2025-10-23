"""Tests for engine factory."""

import pytest
from tts.config import TTSConfig
from tts.coqui_engine import CoquiTTSEngine
from tts.engine_factory import TTSEngineFactory
from tts.openvoice_engine import OpenVoiceEngine


def test_create_coqui_engine():
    """Test creating Coqui engine."""
    config = TTSConfig(engine="coqui")
    engine = TTSEngineFactory.create_engine(config)
    assert isinstance(engine, CoquiTTSEngine)
    assert engine.name == "coqui"


def test_create_openvoice_engine():
    """Test creating OpenVoice engine."""
    config = TTSConfig(engine="openvoice")
    engine = TTSEngineFactory.create_engine(config)
    assert isinstance(engine, OpenVoiceEngine)
    assert engine.name == "openvoice"


def test_create_unknown_engine():
    """Test creating unknown engine raises error."""
    config = TTSConfig(engine="unknown")
    with pytest.raises(ValueError, match="Unknown TTS engine"):
        TTSEngineFactory.create_engine(config)


def test_list_engines():
    """Test listing available engines."""
    engines = TTSEngineFactory.list_engines()
    assert "coqui" in engines
    assert "openvoice" in engines
    assert engines["coqui"]["status"] == "available"
    assert engines["openvoice"]["status"] == "planned"
