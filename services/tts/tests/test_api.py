"""Tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from tts.api import app

client = TestClient(app)


def test_health_endpoint():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["service"] == "tts"
    assert "engine" in data


def test_engines_endpoint():
    """Test engines listing endpoint."""
    response = client.get("/engines")
    assert response.status_code == 200
    data = response.json()
    assert "current_engine" in data
    assert "available_engines" in data
    assert "coqui" in data["available_engines"]


def test_languages_endpoint():
    """Test languages listing endpoint."""
    response = client.get("/languages")
    assert response.status_code == 200
    data = response.json()
    assert "supported_languages" in data
    assert "en" in data["supported_languages"]
    assert "fr" in data["supported_languages"]


@pytest.mark.skip(reason="Requires model loading (slow)")
def test_clone_voice_endpoint():
    """Test voice cloning endpoint (integration test - requires model)."""
    # This would require:
    # 1. Creating a test audio file
    # 2. Loading the TTS model (slow)
    # 3. Running actual voice cloning
    pass


@pytest.mark.skip(reason="Requires model loading (slow)")
def test_synthesize_endpoint():
    """Test synthesis endpoint (integration test - requires model)."""
    pass


def test_synthesize_missing_reference():
    """Test synthesis without reference audio or voice_id."""
    response = client.post("/synthesize", data={"text": "Hello world", "language": "fr"})
    assert response.status_code == 400
    assert "reference_audio" in response.json()["detail"]
