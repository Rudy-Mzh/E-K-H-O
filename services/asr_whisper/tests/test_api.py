"""Tests for FastAPI endpoints."""

import pytest
from asr_whisper.api import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_health_endpoint():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "asr-whisper"
    assert "model" in data
    assert "device" in data


def test_models_endpoint():
    """Test models listing endpoint."""
    response = client.get("/models")
    assert response.status_code == 200
    data = response.json()
    assert "current_model" in data
    assert "available_models" in data
    assert "tiny" in data["available_models"]
    assert "base" in data["available_models"]
    assert "large" in data["available_models"]


@pytest.mark.skip(reason="Requires actual audio file and model loading (slow)")
def test_transcribe_endpoint():
    """Test transcription endpoint (integration test - requires model)."""
    # This would require:
    # 1. Creating a test audio file
    # 2. Loading the Whisper model (slow)
    # 3. Running actual transcription
    #
    # Example:
    # with open("test_audio.wav", "rb") as f:
    #     response = client.post(
    #         "/transcribe",
    #         files={"file": ("test.wav", f, "audio/wav")}
    #     )
    # assert response.status_code == 200
    pass


def test_transcribe_missing_file():
    """Test transcription with missing file."""
    response = client.post("/transcribe")
    assert response.status_code == 422  # Unprocessable Entity
