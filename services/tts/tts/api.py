"""FastAPI REST API for TTS service."""

import logging
import tempfile
from pathlib import Path

from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from tts.config import SUPPORTED_LANGUAGES, config
from tts.engine_factory import TTSEngineFactory

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EKHO TTS Service",
    description="Text-to-Speech using Coqui TTS with default voices (NO voice cloning)",
    version="0.2.0",
)

# Initialize TTS engine (lazy loading)
tts_engine = None


def get_tts_engine():
    """
    Get or create TTS engine instance (singleton pattern).

    Returns:
        TTS engine instance
    """
    global tts_engine
    if tts_engine is None:
        tts_engine = TTSEngineFactory.create_engine(config)
        tts_engine.load_model()
    return tts_engine


# Request/Response models
class SynthesizeRequest(BaseModel):
    """Request model for speech synthesis."""

    text: str = Field(..., description="Text to synthesize", min_length=1)
    language: str = Field(default="fr", description="Target language code")


class EngineInfo(BaseModel):
    """Engine information model."""

    current_engine: str
    available_engines: dict


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    logger.info("Starting TTS service...")
    logger.info(f"Engine: {config.engine}, Port: {config.service_port}")
    # Preload model on startup for faster first request
    try:
        get_tts_engine()
        logger.info("Service started successfully")
    except NotImplementedError as e:
        logger.error(f"Failed to start service: {e}")
        logger.error("TTS service started but engine is not available")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down TTS service...")
    global tts_engine
    if tts_engine:
        tts_engine.unload_model()
    logger.info("Service stopped")


@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        Status information
    """
    engine_status = "unavailable"
    try:
        get_tts_engine()
        engine_status = "ready"
    except NotImplementedError:
        engine_status = "not_implemented"
    except Exception as e:
        engine_status = f"error: {str(e)}"

    return {
        "status": "healthy" if engine_status == "ready" else "degraded",
        "service": "tts",
        "engine": config.engine,
        "engine_status": engine_status,
    }


@app.get("/engines", response_model=EngineInfo)
async def list_engines():
    """
    List available TTS engines.

    Returns:
        Engine information
    """
    return EngineInfo(
        current_engine=config.engine,
        available_engines=TTSEngineFactory.list_engines(),
    )


@app.get("/languages")
async def list_languages():
    """
    List supported languages.

    Returns:
        Dictionary of supported languages
    """
    return {"supported_languages": SUPPORTED_LANGUAGES}


@app.post("/synthesize")
async def synthesize_speech(
    text: str = Form(..., description="Text to synthesize", min_length=1),
    language: str = Form(default="fr", description="Target language code"),
    speaker_gender: str = Form(default="male", description="Speaker gender (male/female)"),
):
    """
    Synthesize speech from text with voice matching speaker gender.

    Args:
        text: Text to synthesize
        language: Target language code (default: fr)
        speaker_gender: Speaker gender for voice selection (male/female, default: male)

    Returns:
        Audio file (wav format)

    Raises:
        HTTPException: If synthesis fails
    """
    logger.info(
        f"Received synthesis request: {len(text)} chars, language={language}, gender={speaker_gender}"
    )

    output_file = None

    try:
        # Create output file
        output_file = Path(tempfile.mktemp(suffix=".wav"))

        # Synthesize speech with gender-matched voice
        engine = get_tts_engine()
        result_path = engine.synthesize(
            text=text,
            output_path=output_file,
            reference_audio=None,
            language=language,
            speaker_gender=speaker_gender,
        )

        logger.info(f"Synthesis successful: {result_path}")

        # Return audio file
        return FileResponse(
            path=str(result_path),
            media_type="audio/wav",
            filename=f"synthesis_{language}.wav",
        )

    except HTTPException:
        raise

    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(status_code=400, detail=str(e)) from e

    except Exception as e:
        logger.error(f"Synthesis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}") from e


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
