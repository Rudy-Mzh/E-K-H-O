"""FastAPI REST API for ASR Whisper service."""

import logging
import tempfile
from pathlib import Path

from asr_whisper.config import config
from asr_whisper.whisper_engine import WhisperEngine
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from ekho_core.models import TranscriptionResult

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EKHO ASR Whisper Service",
    description="Automatic Speech Recognition using OpenAI Whisper",
    version="0.1.0",
)

# Initialize Whisper engine (lazy loading)
whisper_engine: WhisperEngine | None = None


def get_whisper_engine() -> WhisperEngine:
    """
    Get or create Whisper engine instance (singleton pattern).

    Returns:
        WhisperEngine instance
    """
    global whisper_engine
    if whisper_engine is None:
        whisper_engine = WhisperEngine(config)
        whisper_engine.load_model()
    return whisper_engine


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    logger.info("Starting ASR Whisper service...")
    logger.info(f"Model: {config.model_name}, Port: {config.service_port}")
    # Preload model on startup for faster first request
    get_whisper_engine()
    logger.info("Service started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down ASR Whisper service...")
    global whisper_engine
    if whisper_engine:
        whisper_engine.unload_model()
    logger.info("Service stopped")


@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        Status information
    """
    return {
        "status": "healthy",
        "service": "asr-whisper",
        "model": config.model_name,
        "device": get_whisper_engine().device,
    }


@app.get("/models")
async def list_models():
    """
    List available Whisper models.

    Returns:
        List of available models with descriptions
    """
    models = {
        "tiny": {"size": "~1GB RAM", "speed": "fastest", "accuracy": "lowest"},
        "base": {"size": "~1GB RAM", "speed": "fast", "accuracy": "good"},
        "small": {"size": "~2GB RAM", "speed": "medium", "accuracy": "better"},
        "medium": {"size": "~5GB RAM", "speed": "slow", "accuracy": "high"},
        "large": {"size": "~10GB RAM", "speed": "slowest", "accuracy": "highest"},
    }
    return {
        "current_model": config.model_name,
        "available_models": models,
    }


@app.post("/transcribe", response_model=TranscriptionResult)
async def transcribe_audio(
    file: UploadFile = File(..., description="Audio file to transcribe"),
    language: str | None = None,
):
    """
    Transcribe audio file to text with word-level timestamps.

    Args:
        file: Audio file (wav, mp3, m4a, etc.)
        language: Optional language code (e.g., 'en', 'fr')

    Returns:
        TranscriptionResult with text and word-level timestamps

    Raises:
        HTTPException: If transcription fails
    """
    logger.info(f"Received transcription request: {file.filename}")

    # Check file size
    if file.size and file.size > config.max_file_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {config.max_file_size / 1024 / 1024}MB",
        )

    # Save uploaded file to temporary location
    temp_file = None
    try:
        # Create temp file with proper extension
        suffix = Path(file.filename).suffix if file.filename else ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp_file = Path(temp.name)
            content = await file.read()
            temp.write(content)

        logger.info(f"Saved upload to: {temp_file}")

        # Transcribe using Whisper
        engine = get_whisper_engine()
        result = engine.transcribe(temp_file, language=language)

        logger.info(f"Transcription successful: {len(result.text)} chars")
        return result

    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        raise HTTPException(status_code=404, detail=str(e)) from e

    except Exception as e:
        logger.error(f"Transcription failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}") from e

    finally:
        # Cleanup temp file
        if temp_file and temp_file.exists():
            temp_file.unlink()
            logger.debug(f"Cleaned up temp file: {temp_file}")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=config.service_host,
        port=config.service_port,
        log_level="info",
    )
