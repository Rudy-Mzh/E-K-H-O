"""FastAPI REST API for NMT service."""

import logging

from ekho_core.models import TranslationResult
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from nmt.config import SUPPORTED_PAIRS, config
from nmt.translation_engine import TranslationEngine
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EKHO NMT Service",
    description="Neural Machine Translation using Helsinki-NLP OPUS-MT models",
    version="0.1.0",
)

# Initialize Translation engine (lazy loading)
translation_engine: TranslationEngine | None = None


def get_translation_engine() -> TranslationEngine:
    """
    Get or create Translation engine instance (singleton pattern).

    Returns:
        TranslationEngine instance
    """
    global translation_engine
    if translation_engine is None:
        translation_engine = TranslationEngine(config)
        translation_engine.load_model()
    return translation_engine


# Request/Response models
class TranslateRequest(BaseModel):
    """Request model for translation."""

    text: str = Field(..., description="Text to translate", min_length=1)
    source_lang: str = Field(default="en", description="Source language code (e.g., 'en')")
    target_lang: str = Field(default="fr", description="Target language code (e.g., 'fr')")


class BatchTranslateRequest(BaseModel):
    """Request model for batch translation."""

    texts: list[str] = Field(..., description="List of texts to translate", min_length=1)
    source_lang: str = Field(default="en", description="Source language code")
    target_lang: str = Field(default="fr", description="Target language code")


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    logger.info("Starting NMT service...")
    logger.info(f"Model: {config.model_name}, Port: {config.service_port}")
    # Preload model on startup for faster first request
    get_translation_engine()
    logger.info("Service started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down NMT service...")
    global translation_engine
    if translation_engine:
        translation_engine.unload_model()
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
        "service": "nmt",
        "model": config.model_name,
        "device": get_translation_engine().device,
    }


@app.get("/supported-pairs")
async def list_supported_pairs():
    """
    List supported language pairs.

    Returns:
        Dictionary of supported language pairs
    """
    return {
        "supported_pairs": list(SUPPORTED_PAIRS.keys()),
        "models": SUPPORTED_PAIRS,
        "current_model": config.model_name,
    }


@app.post("/translate", response_model=TranslationResult)
async def translate_text(request: TranslateRequest):
    """
    Translate text from source language to target language.

    Args:
        request: TranslateRequest with text and language codes

    Returns:
        TranslationResult with translated text

    Raises:
        HTTPException: If translation fails
    """
    logger.info(
        f"Received translation request: {len(request.text)} chars "
        f"({request.source_lang} → {request.target_lang})"
    )

    try:
        engine = get_translation_engine()
        result = engine.translate(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
        )

        logger.info(f"Translation successful: {len(result.translated_text)} chars")
        return result

    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(status_code=400, detail=str(e)) from e

    except Exception as e:
        logger.error(f"Translation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}") from e


@app.post("/translate-batch", response_model=list[TranslationResult])
async def translate_batch(request: BatchTranslateRequest):
    """
    Translate multiple texts in a batch (more efficient).

    Args:
        request: BatchTranslateRequest with list of texts and language codes

    Returns:
        List of TranslationResult objects

    Raises:
        HTTPException: If translation fails
    """
    logger.info(
        f"Received batch translation request: {len(request.texts)} texts "
        f"({request.source_lang} → {request.target_lang})"
    )

    try:
        engine = get_translation_engine()
        results = engine.translate_batch(
            texts=request.texts,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
        )

        logger.info(f"Batch translation successful: {len(results)} translations")
        return results

    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(status_code=400, detail=str(e)) from e

    except Exception as e:
        logger.error(f"Batch translation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch translation failed: {str(e)}") from e


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
