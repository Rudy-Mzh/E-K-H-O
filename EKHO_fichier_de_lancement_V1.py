"""Automated test script for video dubbing with new pipeline."""

import argparse
import asyncio
import sys
from datetime import datetime
from pathlib import Path

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent / "packages" / "ekho_api"))

from ekho_api.config import EkhoAPIConfig
from ekho_api.orchestrator_v2 import SegmentedDubbingOrchestrator


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="EKHO Video Dubbing Pipeline")
    parser.add_argument("video", help="Path to input video file")
    parser.add_argument("--source-lang", "-s", default="en", help="Source language (default: en)")
    parser.add_argument("--target-lang", "-t", default="fr", help="Target language (default: fr)")
    parser.add_argument(
        "--output-dir", "-o", default="/Users/rudymezoughi/Desktop", help="Output directory"
    )
    return parser.parse_args()


async def test_video_dubbing_auto(
    video_path: Path, output_dir: Path, source_lang: str, target_lang: str
):
    """Test complete video dubbing pipeline automatically."""
    print("=" * 70)
    print("  EKHO Video Dubbing Test - Automated (New Pipeline)")
    print("=" * 70)
    print()

    # Generate output filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"EKHO_NEW_PIPELINE_{timestamp}_dubbed_{target_lang}.mp4"
    output_path = output_dir / output_filename

    print(f"📹 Video source: {video_path.name}")
    print(f"   Size: {video_path.stat().st_size / 1024 / 1024:.2f} MB")
    print()
    print(f"🌍 Translation: {source_lang.upper()} → {target_lang.upper()}")
    print("   Speaker: Male (homme)")
    print()
    print(f"💾 Output: {output_path.name}")
    print()

    # Initialize orchestrator
    print("🔧 Initializing orchestrator...")
    config = EkhoAPIConfig()
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
    print("=" * 70)
    print("  🚀 Starting Video Dubbing Pipeline")
    print("=" * 70)
    print()

    try:
        # Run dubbing pipeline
        print("⏳ Processing video... This may take several minutes.")
        print()

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
        print("📹 Dubbed video saved to:")
        print(f"   {result}")
        print()
        print(f"📊 File size: {result.stat().st_size / 1024 / 1024:.2f} MB")
        print()
        print("🎬 You can now watch the dubbed video!")
        print()

    except Exception as e:
        print()
        print("=" * 70)
        print("  ❌ Video Dubbing FAILED")
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
        args = parse_args()
        video_path = Path(args.video)
        output_dir = Path(args.output_dir)

        if not video_path.exists():
            print(f"❌ Video file not found: {video_path}")
            sys.exit(1)

        asyncio.run(
            test_video_dubbing_auto(video_path, output_dir, args.source_lang, args.target_lang)
        )
    except KeyboardInterrupt:
        print("\n\n❌ Interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback

        traceback.print_exc()
