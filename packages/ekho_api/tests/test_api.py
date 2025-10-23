"""Tests for FastAPI endpoints."""

import pytest
from ekho_api.api import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_health_endpoint():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["service"] == "ekho-api"
    assert "services" in data


def test_services_endpoint():
    """Test services listing endpoint."""
    response = client.get("/services")
    assert response.status_code == 200
    data = response.json()
    assert "asr" in data
    assert "nmt" in data
    assert "tts" in data


@pytest.mark.skip(reason="Requires all services running (integration test)")
def test_dub_video_endpoint():
    """Test video dubbing endpoint (integration test)."""
    # This would require:
    # 1. All three services running
    # 2. A test video file
    # 3. Running the full pipeline
    pass


@pytest.mark.skip(reason="Requires ASR service running")
def test_transcribe_endpoint():
    """Test transcription endpoint (integration test)."""
    pass
