#!/usr/bin/env python3
"""Test script to verify voice cloning optimization."""

import asyncio
import logging
from pathlib import Path

from ekho_api.config import config
from ekho_api.orchestrator import DubbingOrchestrator

# Configure logging to show all details
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


async def main():
    """Test the dubbing pipeline with detailed logging."""
    video_path = Path(
        "/Users/rudymezoughi/Documents/Documents - MacBook Pro de RUDY - 1"
        "/2. Projet Polyglotte/Résultats vidéos/Vidéo Source En --> FR"
        "/Vidéo 1 minute US.mp4"
    )

    output_path = Path(
        "/Users/rudymezoughi/Documents/Documents - MacBook Pro de RUDY - 1"
        "/2. Projet Polyglotte/Résultats vidéos/Vidéo Test Traduite"
        "/3ème test avec clonage vocal optimisé.mp4"
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)

    logger.info("=" * 80)
    logger.info("EKHO Video Dubbing Test - Voice Cloning Optimization")
    logger.info("=" * 80)
    logger.info(f"Input: {video_path.name}")
    logger.info(f"Output: {output_path}")
    logger.info("Language: en → fr")
    logger.info("=" * 80)

    orchestrator = DubbingOrchestrator(config)

    try:
        result = await orchestrator.dub_video(
            video_path=video_path,
            output_path=output_path,
            source_lang="en",
            target_lang="fr",
        )

        logger.info("=" * 80)
        logger.info(f"✅ SUCCESS! Output: {result}")
        logger.info("=" * 80)

    except Exception as e:
        logger.error(f"❌ FAILED: {e}", exc_info=True)

    finally:
        await orchestrator.close()


if __name__ == "__main__":
    asyncio.run(main())
