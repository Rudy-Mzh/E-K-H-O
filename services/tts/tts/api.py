"""FastAPI REST API for TTS service."""

import logging
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from tts.config import SUPPORTED_LANGUAGES, config
from tts.engine_factory import TTSEngineFactory

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EKHO TTS Service",
    description="Text-to-Speech with Voice Cloning using Coqui TTS / OpenVoice",
    version="0.1.0",
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
    voice_id: str | None = Field(None, description="Optional cached voice ID")


class CloneVoiceResponse(BaseModel):
    """Response model for voice cloning."""

    voice_id: str = Field(..., description="Voice ID for future synthesis")
    reference_path: str = Field(..., description="Path to cached reference audio")
    duration: float | None = Field(None, description="Reference audio duration in seconds")


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


@app.post("/clone-voice", response_model=CloneVoiceResponse)
async def clone_voice(
    file: UploadFile = File(..., description="Reference audio file for voice cloning"),
    voice_id: str = Form(..., description="Identifier for the cloned voice"),
):
    """
    Clone voice from reference audio.

    For best results, provide 1 minute of clean audio from the target voice.
    Minimum: 6 seconds.

    Args:
        file: Reference audio file (wav, mp3, etc.)
        voice_id: Unique identifier for this voice

    Returns:
        CloneVoiceResponse with voice_id and cache path

    Raises:
        HTTPException: If cloning fails
    """
    logger.info(f"Received voice cloning request: {file.filename}, voice_id={voice_id}")

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

        logger.info(f"Saved reference audio to: {temp_file}")

        # Clone voice using TTS engine
        engine = get_tts_engine()
        cached_path = engine.clone_voice(temp_file, voice_id)

        # Get duration if possible
        duration = None
        try:
            import librosa

            audio, sr = librosa.load(str(temp_file), sr=None)
            duration = len(audio) / sr
        except ImportError:
            pass

        logger.info(f"Voice cloning successful: {voice_id}")

        return CloneVoiceResponse(voice_id=voice_id, reference_path=cached_path, duration=duration)

    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(status_code=400, detail=str(e)) from e

    except Exception as e:
        logger.error(f"Voice cloning failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Voice cloning failed: {str(e)}") from e

    finally:
        # Cleanup temp file
        if temp_file and temp_file.exists():
            temp_file.unlink()
            logger.debug(f"Cleaned up temp file: {temp_file}")


@app.post("/synthesize")
async def synthesize_speech(
    text: str = Form(..., description="Text to synthesize", min_length=1),
    language: str = Form(default="fr", description="Target language code"),
    reference_audio: UploadFile | None = File(None, description="Reference audio for cloning"),
    voice_id: str | None = Form(None, description="Previously cached voice ID"),
):
    """
    Synthesize speech from text with optional voice cloning.

    You can either:
    1. Provide reference_audio directly (for one-time use)
    2. Provide voice_id from a previous /clone-voice call (faster)

    Args:
        text: Text to synthesize
        language: Target language code (default: fr)
        reference_audio: Optional reference audio file
        voice_id: Optional cached voice ID

    Returns:
        Audio file (wav format)

    Raises:
        HTTPException: If synthesis fails
    """
    logger.info(f"Received synthesis request: {len(text)} chars, language={language}")

    # Validate that we have either reference_audio or voice_id
    if reference_audio is None and voice_id is None:
        raise HTTPException(
            status_code=400,
            detail="Must provide either 'reference_audio' or 'voice_id' for voice cloning",
        )

    temp_reference = None
    output_file = None

    try:
        # Handle reference audio
        if reference_audio:
            # Save uploaded reference audio to temp file
            suffix = Path(reference_audio.filename).suffix if reference_audio.filename else ".wav"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
                temp_reference = Path(temp.name)
                content = await reference_audio.read()
                temp.write(content)
            reference_path = temp_reference
        else:
            # Use cached voice
            reference_path = config.voice_cache_dir / f"{voice_id}.wav"
            if not reference_path.exists():
                raise HTTPException(
                    status_code=404, detail=f"Voice ID '{voice_id}' not found in cache"
                )

        # Create output file
        output_file = Path(tempfile.mktemp(suffix=".wav"))

        # Synthesize speech
        engine = get_tts_engine()
        result_path = engine.synthesize(
            text=text, output_path=output_file, reference_audio=reference_path, language=language
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

    finally:
        # Cleanup temp reference file (keep output file for response)
        if temp_reference and temp_reference.exists():
            temp_reference.unlink()
            logger.debug(f"Cleaned up temp reference: {temp_reference}")


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
