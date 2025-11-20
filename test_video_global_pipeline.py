"""Test script for GLOBAL TRANSLATION pipeline (Phase 1+2+3)."""

import asyncio
import sys
from datetime import datetime
from pathlib import Path

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent / "packages"))

from ekho_api.config import EkhoAPIConfig
from ekho_api.orchestrator_v2 import SegmentedDubbingOrchestrator


async def test_video_global_pipeline():
    """Test complete video dubbing with GLOBAL TRANSLATION pipeline."""
    print("=" * 70)
    print("  EKHO GLOBAL TRANSLATION Pipeline Test (Phase 1+2+3)")
    print("=" * 70)
    print()

    # Configuration
    video_path = Path(
        "/Users/rudymezoughi/Documents/Documents - MacBook Pro de RUDY - 1/2. Projet Polyglotte/Résultats vidéos/Vidéo Source En --> FR/Vidéo 1 minute US.mp4"
    )
    output_dir = Path(
        "/Users/rudymezoughi/Documents/Documents - MacBook Pro de RUDY - 1/2. Projet Polyglotte/Résultats vidéos/Vidéo Test Traduite"
    )

    source_lang = "en"
    target_lang = "fr"

    # Generate output filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"EKHO_GLOBAL_PIPELINE_{timestamp}_dubbed_{target_lang}.mp4"
    output_path = output_dir / output_filename

    print(f"📹 Video source: {video_path.name}")
    print(f"   Size: {video_path.stat().st_size / 1024 / 1024:.2f} MB")
    print()
    print(f"🌍 Translation: {source_lang.upper()} → {target_lang.upper()}")
    print("   Pipeline: GLOBAL TRANSLATION (Deep Context + Full Translation)")
    print()
    print(f"💾 Output: {output_path.name}")
    print()

    # Initialize orchestrator
    print("🔧 Initializing orchestrator...")
    config = EkhoAPIConfig()
    # Override service URLs to use correct ports
    config.asr_service_url = "http://localhost:8001"
    config.tts_service_url = "http://localhost:8003"
    orchestrator = SegmentedDubbingOrchestrator(config)

    # Check service health
    print("\n🏥 Checking service health...")
    health = await orchestrator.health_check()

    all_healthy = True
    for service, status in health.items():
        status_emoji = "✅" if status["status"] == "healthy" else "❌"
        print(f"  {status_emoji} {service.upper()}: {status['status']}")
        if status["status"] != "healthy":
            all_healthy = False
            print(f"      Error: {status.get('error', 'Unknown')}")

    if not all_healthy:
        print("\n❌ Some services are not healthy. Aborting.")
        print("\nCheck the logs:")
        print("  • tail -f /tmp/ekho_vad.log")
        print("  • tail -f /tmp/ekho_asr.log")
        print("  • tail -f /tmp/ekho_llm.log")
        print("  • tail -f /tmp/ekho_tts_coqui.log")
        await orchestrator.close()
        return

    print("\n✅ All services ready!")
    print()

    # Run GLOBAL TRANSLATION pipeline
    print("=" * 70)
    print("  Starting GLOBAL TRANSLATION Dubbing Pipeline")
    print("=" * 70)
    print()

    try:
        # Use NEW global translation method
        result = await orchestrator.dub_video_global(
            video_path=video_path,
            output_path=output_path,
            source_lang=source_lang,
            target_lang=target_lang,
        )

        print()
        print("=" * 70)
        print("  ✅ GLOBAL TRANSLATION Dubbing SUCCESSFUL!")
        print("=" * 70)
        print()
        print("📹 Dubbed video saved to:")
        print(f"   {result}")
        print()
        print(f"📊 File size: {result.stat().st_size / 1024 / 1024:.2f} MB")
        print()
        print("🎬 You can now watch the dubbed video with GLOBAL CONTEXT!")
        print()
        print("Key improvements:")
        print("  ✅ Phase 1: Deep contextual analysis (structured)")
        print("  ✅ Phase 2: Global translation with natural pauses")
        print("  ✅ Phase 3: Smart segmentation aligned with audio")
        print("  ✅ Rich, coherent, impactful translation")
        print()

    except Exception as e:
        print()
        print("=" * 70)
        print("  ❌ GLOBAL TRANSLATION Dubbing FAILED")
        print("=" * 70)
        print()
        print(f"Error: {e}")
        print()
        import traceback

        traceback.print_exc()
        print()
        print("Check the logs for more details:")
        print("  • tail -f /tmp/ekho_vad.log")
        print("  • tail -f /tmp/ekho_asr.log")
        print("  • tail -f /tmp/ekho_llm.log")
        print("  • tail -f /tmp/ekho_tts_coqui.log")
        print("  • tail -f /tmp/ekho_orchestrator.log")
        print()

    finally:
        await orchestrator.close()


if __name__ == "__main__":
    try:
        asyncio.run(test_video_global_pipeline())
    except KeyboardInterrupt:
        print("\n\n❌ Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback

        traceback.print_exc()
