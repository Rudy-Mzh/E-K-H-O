"""FastAPI REST API for LLM service."""

import logging

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from llm.config import config
from llm.gemini_engine import GeminiEngine
from llm.openai_engine import OpenAIEngine
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EKHO LLM - Contextual Translation",
    description="Multi-provider LLM contextual translation for video dubbing",
    version="0.2.0",
)

# Initialize LLM engine based on config
llm_engine = None


class ContextRequest(BaseModel):
    """Request model for context analysis."""

    transcript: str
    source_lang: str = "en"
    target_lang: str = "fr"


class TranslationRequest(BaseModel):
    """Request model for segment translation."""

    text: str
    context: str
    source_lang: str = "en"
    target_lang: str = "fr"
    target_duration: float


class GlobalTranslationRequest(BaseModel):
    """Request model for global translation."""

    transcript: str
    deep_context: dict
    source_lang: str = "en"
    target_lang: str = "fr"


@app.on_event("startup")
async def startup_event():
    """Initialize service on startup."""
    global llm_engine

    logger.info("Starting LLM service...")
    logger.info(f"Port: {config.service_port}")
    logger.info(f"Provider: {config.provider}")

    # Initialize the appropriate engine
    if config.provider.lower() == "openai":
        logger.info(f"Using OpenAI with model: {config.openai_model}")
        llm_engine = OpenAIEngine(config)
    else:
        logger.info(f"Using Gemini with model: {config.gemini_model}")
        llm_engine = GeminiEngine(config)

    # Load model
    llm_engine.load_model()
    logger.info("LLM service started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down LLM service...")
    if llm_engine:
        llm_engine.unload_model()
    logger.info("LLM service stopped")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    model_name = config.openai_model if config.provider.lower() == "openai" else config.gemini_model
    return {
        "status": "healthy",
        "service": "llm",
        "provider": config.provider,
        "model": model_name,
        "version": "0.2.0",
    }


@app.post("/analyze-context")
async def analyze_context(request: ContextRequest):
    """
    Analyze full transcript to extract context.

    Args:
        request: ContextRequest with transcript and languages

    Returns:
        JSON with context description
    """
    try:
        logger.info(
            f"Analyzing context: {len(request.transcript)} chars ({request.source_lang} → {request.target_lang})"
        )

        context = llm_engine.analyze_context(
            request.transcript, request.source_lang, request.target_lang
        )

        return JSONResponse(
            content={
                "context": context,
                "transcript_length": len(request.transcript),
                "source_lang": request.source_lang,
                "target_lang": request.target_lang,
            }
        )

    except Exception as e:
        logger.error(f"Context analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/translate")
async def translate_segment(request: TranslationRequest):
    """
    Translate a segment with context awareness.

    Args:
        request: TranslationRequest with text, context, and timing

    Returns:
        JSON with translated text
    """
    try:
        logger.info(
            f"Translating segment: {len(request.text)} chars, duration={request.target_duration:.1f}s"
        )

        translated_text = llm_engine.translate_segment(
            request.text,
            request.context,
            request.source_lang,
            request.target_lang,
            request.target_duration,
        )

        return JSONResponse(
            content={
                "translated_text": translated_text,
                "source_text": request.text,
                "source_lang": request.source_lang,
                "target_lang": request.target_lang,
                "target_duration": request.target_duration,
            }
        )

    except Exception as e:
        logger.error(f"Translation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/analyze-deep-context")
async def analyze_deep_context(request: ContextRequest):
    """
    Deep contextual analysis for professional translation (Phase 1).

    Args:
        request: ContextRequest with transcript and languages

    Returns:
        JSON with structured deep context
    """
    try:
        logger.info(
            f"Deep context analysis: {len(request.transcript)} chars ({request.source_lang} → {request.target_lang})"
        )

        deep_context = llm_engine.analyze_deep_context(
            request.transcript, request.source_lang, request.target_lang
        )

        return JSONResponse(
            content={
                "deep_context": deep_context,
                "transcript_length": len(request.transcript),
                "source_lang": request.source_lang,
                "target_lang": request.target_lang,
            }
        )

    except Exception as e:
        logger.error(f"Deep context analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/translate-global")
async def translate_global(request: GlobalTranslationRequest):
    """
    Global translation with pause markers (Phase 2).

    Args:
        request: GlobalTranslationRequest with transcript and deep context

    Returns:
        JSON with global translation containing [PAUSE] markers
    """
    try:
        logger.info(
            f"Global translation: {len(request.transcript)} chars ({request.source_lang} → {request.target_lang})"
        )

        translated_text = llm_engine.translate_global(
            request.transcript,
            request.deep_context,
            request.source_lang,
            request.target_lang,
        )

        return JSONResponse(
            content={
                "translated_text": translated_text,
                "pause_count": translated_text.count("[PAUSE]"),
                "source_length": len(request.transcript),
                "target_length": len(translated_text),
                "source_lang": request.source_lang,
                "target_lang": request.target_lang,
            }
        )

    except Exception as e:
        logger.error(f"Global translation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e)) from e


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "llm.api:app",
        host=config.service_host,
        port=config.service_port,
        reload=False,
    )
