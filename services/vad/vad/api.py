"""FastAPI REST API for VAD service."""

import logging
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from vad.config import config
from vad.segmentation_engine import SegmentationEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EKHO VAD - Voice Activity Detection",
    description="Segments audio by detecting pauses for synchronized dubbing",
    version="0.1.0",
)

# Initialize segmentation engine
segmentation_engine = SegmentationEngine(config)


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    logger.info("Starting VAD service...")
    logger.info(f"Port: {config.service_port}")
    logger.info(f"Min pause duration: {config.min_pause_duration}s")
    logger.info(f"Min segment duration: {config.min_segment_duration}s")

    # Load model
    segmentation_engine.load_model()
    logger.info("VAD service started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down VAD service...")
    segmentation_engine.unload_model()
    logger.info("VAD service stopped")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "vad", "version": "0.1.0"}


@app.post("/segment")
async def segment_audio(file: UploadFile = File(...)):
    """
    Segment audio file by detecting pauses.

    Args:
        file: Audio file (WAV, MP3, etc.)

    Returns:
        JSON with list of segments (start, end, duration)
    """
    try:
        # Save uploaded file to temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = Path(tmp_file.name)

        logger.info(f"Processing audio file: {file.filename}")

        # Segment audio
        segments = segmentation_engine.segment_audio(tmp_path)

        # Convert segments to JSON format
        segments_json = [
            {
                "start": seg.start,
                "end": seg.end,
                "duration": seg.duration,
            }
            for seg in segments
        ]

        # Cleanup temp file
        tmp_path.unlink()

        logger.info(f"Segmentation complete: {len(segments)} segments")

        return JSONResponse(
            content={
                "segments": segments_json,
                "total_segments": len(segments),
                "filename": file.filename,
            }
        )

    except Exception as e:
        logger.error(f"Segmentation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "vad.api:app",
        host=config.service_host,
        port=config.service_port,
        reload=False,
    )
