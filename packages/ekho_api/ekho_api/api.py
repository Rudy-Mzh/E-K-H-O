"""FastAPI REST API for EKHO orchestrator."""

import logging
import tempfile
from pathlib import Path

import httpx
from ekho_api.config import config
from ekho_api.orchestrator import DubbingOrchestrator
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EKHO API - Video Dubbing Orchestrator",
    description="Complete pipeline for video dubbing: ASR → NMT → TTS",
    version="0.1.0",
)

# Initialize orchestrator
orchestrator = DubbingOrchestrator(config)


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    logger.info("Starting EKHO API orchestrator...")
    logger.info(f"Port: {config.service_port}")
    logger.info(f"ASR: {config.asr_service_url}")
    logger.info(f"NMT: {config.nmt_service_url}")
    logger.info(f"TTS: {config.tts_service_url}")

    # Check service health
    statuses = await orchestrator.health_check()
    for service, status in statuses.items():
        logger.info(f"Service {service}: {status['status']}")

    logger.info("EKHO API started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down EKHO API...")
    await orchestrator.close()
    logger.info("EKHO API stopped")


@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        Status of orchestrator and all services
    """
    services = await orchestrator.health_check()

    # Determine overall status
    all_healthy = all(s["status"] == "healthy" for s in services.values())

    return {
        "status": "healthy" if all_healthy else "degraded",
        "service": "ekho-api",
        "services": services,
    }


@app.get("/services")
async def list_services():
    """
    List all connected services and their status.

    Returns:
        Service information
    """
    return await orchestrator.health_check()


@app.post("/dub-video")
async def dub_video(
    file: UploadFile = File(..., description="Video file to dub"),
    source_lang: str = Form(default="en", description="Source language code"),
    target_lang: str = Form(default="fr", description="Target language code"),
):
    """
    Complete video dubbing pipeline.

    Workflow:
    1. Extract audio from video
    2. Transcribe audio (ASR) with timestamps
    3. Translate text (NMT)
    4. Clone voice from original audio
    5. Synthesize translated speech (TTS)
    6. Combine new audio with video

    Args:
        file: Input video file
        source_lang: Source language (default: en)
        target_lang: Target language (default: fr)

    Returns:
        Dubbed video file

    Raises:
        HTTPException: If dubbing fails
    """
    logger.info(f"Received dubbing request: {file.filename} ({source_lang} → {target_lang})")

    # Check file size
    if file.size and file.size > config.max_file_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {config.max_file_size / 1024 / 1024}MB",
        )

    # Save uploaded video
    temp_input = None
    temp_output = None

    try:
        # Save input video
        suffix = Path(file.filename).suffix if file.filename else ".mp4"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp_input = Path(temp.name)
            content = await file.read()
            temp.write(content)

        logger.info(f"Saved input video to: {temp_input}")

        # Create output path
        temp_output = Path(tempfile.mktemp(suffix=f"_dubbed{suffix}"))

        # Run dubbing pipeline
        result = await orchestrator.dub_video(
            video_path=temp_input,
            output_path=temp_output,
            source_lang=source_lang,
            target_lang=target_lang,
        )

        logger.info(f"Dubbing successful: {result}")

        # Return dubbed video
        return FileResponse(
            path=str(result),
            media_type="video/mp4",
            filename=f"dubbed_{target_lang}_{file.filename}",
        )

    except httpx.HTTPError as e:
        logger.error(f"Service communication error: {e}")
        raise HTTPException(
            status_code=502, detail=f"Failed to communicate with backend service: {str(e)}"
        ) from e

    except Exception as e:
        logger.error(f"Dubbing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Video dubbing failed: {str(e)}") from e

    finally:
        # Cleanup temp input file (keep output for response)
        if temp_input and temp_input.exists():
            temp_input.unlink()
            logger.debug(f"Cleaned up temp input: {temp_input}")


@app.post("/transcribe")
async def transcribe_only(
    file: UploadFile = File(..., description="Audio file to transcribe"),
    language: str = Form(default="en", description="Source language code"),
):
    """
    Transcribe audio file only (ASR step).

    Args:
        file: Audio file
        language: Source language code

    Returns:
        Transcription result with text and timestamps
    """
    logger.info(f"Received transcription request: {file.filename}")

    temp_file = None
    try:
        # Save audio file
        suffix = Path(file.filename).suffix if file.filename else ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp_file = Path(temp.name)
            content = await file.read()
            temp.write(content)

        # Transcribe
        result = await orchestrator.transcribe_audio(temp_file, language=language)
        return result

    except Exception as e:
        logger.error(f"Transcription failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) from e

    finally:
        if temp_file and temp_file.exists():
            temp_file.unlink()


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
