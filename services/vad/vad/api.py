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
    logger.info(f"Diarization enabled: {config.enable_diarization}")

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


def _find_speaker_for_segment(segment, timeline):
    """
    Find dominant speaker in a VAD segment.

    Args:
        segment: AudioSegment with start, end times
        timeline: List of speaker turns from diarization

    Returns:
        Dict with speaker_id, gender, confidence
    """
    overlaps = {}
    for turn in timeline:
        if turn["start"] < segment.end and turn["end"] > segment.start:
            # Calculate overlap duration
            overlap = min(segment.end, turn["end"]) - max(segment.start, turn["start"])
            speaker_id = turn["speaker_id"]
            overlaps[speaker_id] = overlaps.get(speaker_id, 0) + overlap

    if overlaps:
        # Return speaker with most overlap
        dominant_speaker = max(overlaps, key=overlaps.get)
        total_overlap = sum(overlaps.values())
        confidence = overlaps[dominant_speaker] / total_overlap
        return {"speaker_id": dominant_speaker, "confidence": round(confidence, 2)}
    else:
        # No speaker found, default to speaker 0
        return {"speaker_id": 0, "confidence": 0.0}


@app.post("/segment")
async def segment_audio(file: UploadFile = File(...)):  # noqa: B008
    """
    Segment audio file by detecting pauses and optionally identify speakers.

    Args:
        file: Audio file (WAV, MP3, etc.)

    Returns:
        JSON with:
        - segments: list with start, end, duration, speaker_id, speaker_gender
        - total_segments: int
        - num_speakers: int (if diarization enabled)
        - speaker_info: dict (if diarization enabled)
        - filename: str
    """
    try:
        # Save uploaded file to temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = Path(tmp_file.name)

        logger.info(f"Processing audio file: {file.filename}")

        # Step 1: Segment audio using VAD
        segments = segmentation_engine.segment_audio(tmp_path)
        logger.info(f"VAD segmentation: {len(segments)} segments")

        # Step 2: Diarization if enabled
        diarization_result = None
        if config.enable_diarization:
            try:
                logger.info("Running speaker diarization...")
                diarization_result = segmentation_engine.diarize_audio(tmp_path)
                logger.info(f"Diarization complete: {diarization_result['num_speakers']} speakers")
            except Exception as e:
                logger.warning(f"Diarization failed: {e}, continuing without it")
                diarization_result = None

        # Step 3: Merge VAD segments with speaker info
        segments_with_speakers = []
        for seg in segments:
            segment_data = {
                "start": seg.start,
                "end": seg.end,
                "duration": seg.duration,
            }

            if diarization_result:
                # Find dominant speaker in this segment
                speaker_info = _find_speaker_for_segment(seg, diarization_result["timeline"])
                speaker_id = speaker_info["speaker_id"]

                segment_data.update(
                    {
                        "speaker_id": speaker_id,
                        "speaker_gender": diarization_result["speakers"]
                        .get(speaker_id, {})
                        .get("gender", "male"),
                        "speaker_confidence": speaker_info["confidence"],
                    }
                )
            else:
                # No diarization - default values
                segment_data.update(
                    {"speaker_id": 0, "speaker_gender": "male", "speaker_confidence": 0.0}
                )

            segments_with_speakers.append(segment_data)

        # Cleanup temp file
        tmp_path.unlink()

        logger.info(f"Segmentation complete: {len(segments_with_speakers)} segments")

        # Build response
        response_data = {
            "segments": segments_with_speakers,
            "total_segments": len(segments_with_speakers),
            "filename": file.filename,
        }

        if diarization_result:
            response_data["num_speakers"] = diarization_result["num_speakers"]
            response_data["speaker_info"] = diarization_result["speakers"]
        else:
            response_data["num_speakers"] = 1
            response_data["speaker_info"] = {}

        return JSONResponse(content=response_data)

    except Exception as e:
        logger.error(f"Segmentation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) from e


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "vad.api:app",
        host=config.service_host,
        port=config.service_port,
        reload=False,
    )
