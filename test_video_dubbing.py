"""Test script for complete video dubbing pipeline."""

import asyncio
import sys
from pathlib import Path

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent / "packages"))

from ekho_api.config import EkhoAPIConfig
from ekho_api.orchestrator_v2 import SegmentedDubbingOrchestrator


async def test_video_dubbing():
    """Test complete video dubbing pipeline."""
    print("=" * 70)
    print("  EKHO Video Dubbing Test (Complete Pipeline)")
    print("=" * 70)
    print()

    # Check for video file
    video_path = input("Enter path to video file (or press Enter to cancel): ").strip()

    if not video_path:
        print("\n❌ No video file provided. Exiting.")
        return

    video_path = Path(video_path)

    if not video_path.exists():
        print(f"\n❌ Video file not found: {video_path}")
        return

    if video_path.suffix.lower() not in [".mp4", ".avi", ".mov", ".mkv"]:
        print(f"\n❌ Invalid video format: {video_path.suffix}")
        print("Supported formats: .mp4, .avi, .mov, .mkv")
        return

    print(f"\n✅ Video file found: {video_path.name}")
    print(f"   Size: {video_path.stat().st_size / 1024 / 1024:.2f} MB")
    print()

    # Get language parameters
    source_lang = input("Source language code (default: en): ").strip() or "en"
    target_lang = input("Target language code (default: fr): ").strip() or "fr"

    print()
    print(f"Translation: {source_lang} → {target_lang}")
    print()

    # Output path
    output_path = video_path.parent / f"{video_path.stem}_dubbed_{target_lang}{video_path.suffix}"
    print(f"Output will be saved to: {output_path}")
    print()

    # Initialize orchestrator
    print("Initializing orchestrator...")
    config = EkhoAPIConfig()
    orchestrator = SegmentedDubbingOrchestrator(config)

    # Check service health
    print("\nChecking service health...")
    health = await orchestrator.health_check()

    all_healthy = True
    for service, status in health.items():
        status_emoji = "✅" if status["status"] == "healthy" else "❌"
        print(f"  {status_emoji} {service}: {status['status']}")
        if status["status"] != "healthy":
            all_healthy = False

    if not all_healthy:
        print("\n❌ Some services are not healthy. Please check the logs.")
        await orchestrator.close()
        return

    print("\n✅ All services ready!")
    print()

    # Confirm before starting
    confirm = input("Start dubbing? (y/n): ").strip().lower()
    if confirm != "y":
        print("Dubbing cancelled.")
        await orchestrator.close()
        return

    print()
    print("=" * 70)
    print("  Starting Video Dubbing Pipeline")
    print("=" * 70)
    print()

    try:
        # Run dubbing pipeline
        result = await orchestrator.dub_video_segmented(
            video_path=video_path,
            output_path=output_path,
            source_lang=source_lang,
            target_lang=target_lang,
        )

        print()
        print("=" * 70)
        print("  ✅ Video Dubbing SUCCESSFUL!")
        print("=" * 70)
        print()
        print(f"Dubbed video saved to: {result}")
        print(f"File size: {result.stat().st_size / 1024 / 1024:.2f} MB")
        print()

    except Exception as e:
        print()
        print("=" * 70)
        print("  ❌ Video Dubbing FAILED")
        print("=" * 70)
        print()
        print(f"Error: {e}")
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
        asyncio.run(test_video_dubbing())
    except KeyboardInterrupt:
        print("\n\n❌ Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback

        traceback.print_exc()
