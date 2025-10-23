"""Tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from nmt.api import app

client = TestClient(app)


def test_health_endpoint():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "nmt"
    assert "model" in data
    assert "device" in data


def test_supported_pairs_endpoint():
    """Test supported pairs listing endpoint."""
    response = client.get("/supported-pairs")
    assert response.status_code == 200
    data = response.json()
    assert "supported_pairs" in data
    assert "models" in data
    assert "en-fr" in data["supported_pairs"]
    assert "fr-en" in data["supported_pairs"]


@pytest.mark.skip(reason="Requires model loading (slow)")
def test_translate_endpoint():
    """Test translation endpoint (integration test - requires model)."""
    # This would require loading the translation model (slow)
    # Example:
    # response = client.post(
    #     "/translate",
    #     json={
    #         "text": "Hello world",
    #         "source_lang": "en",
    #         "target_lang": "fr"
    #     }
    # )
    # assert response.status_code == 200
    # data = response.json()
    # assert "translated_text" in data
    pass


def test_translate_missing_text():
    """Test translation with missing text."""
    response = client.post("/translate", json={"source_lang": "en", "target_lang": "fr"})
    assert response.status_code == 422  # Unprocessable Entity


def test_translate_empty_text():
    """Test translation with empty text."""
    response = client.post(
        "/translate", json={"text": "", "source_lang": "en", "target_lang": "fr"}
    )
    assert response.status_code == 422  # Validation error


@pytest.mark.skip(reason="Requires model loading (slow)")
def test_batch_translate_endpoint():
    """Test batch translation endpoint (integration test - requires model)."""
    pass
