#!/usr/bin/env python3
"""Simple CLI for EKHO video dubbing."""

import sys
from pathlib import Path

import httpx


def dub_video(
    video_path: str,
    source_lang: str = "en",
    target_lang: str = "fr",
    api_url: str = "http://localhost:8000",
):
    """
    Dub a video using EKHO API.

    Args:
        video_path: Path to input video
        source_lang: Source language code
        target_lang: Target language code
        api_url: EKHO API URL
    """
    video_path = Path(video_path)

    if not video_path.exists():
        print(f"Error: Video file not found: {video_path}")
        return 1

    print("🎬 EKHO Video Dubbing")
    print(f"Input: {video_path.name}")
    print(f"Language: {source_lang} → {target_lang}")
    print(f"API: {api_url}")
    print()

    try:
        with httpx.Client(timeout=600.0) as client:
            # Upload and dub video
            print("⏳ Uploading video and starting dubbing pipeline...")

            with open(video_path, "rb") as f:
                files = {"file": (video_path.name, f, "video/mp4")}
                data = {"source_lang": source_lang, "target_lang": target_lang}

                response = client.post(f"{api_url}/dub-video", files=files, data=data)
                response.raise_for_status()

            # Save output video
            output_path = video_path.parent / f"dubbed_{target_lang}_{video_path.name}"
            with open(output_path, "wb") as f:
                f.write(response.content)

            print("✅ Dubbing complete!")
            print(f"Output: {output_path}")
            return 0

    except httpx.ConnectError:
        print(f"❌ Error: Could not connect to EKHO API at {api_url}")
        print("Make sure all services are running:")
        print("  - ASR Whisper: http://localhost:8001")
        print("  - NMT: http://localhost:8002")
        print("  - TTS: http://localhost:8003")
        print("  - EKHO API: http://localhost:8000")
        return 1

    except httpx.HTTPError as e:
        print(f"❌ HTTP Error: {e}")
        return 1

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


def check_services(api_url: str = "http://localhost:8000"):
    """Check status of all EKHO services."""
    print("🔍 Checking EKHO services...")
    print()

    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(f"{api_url}/health")
            response.raise_for_status()

            data = response.json()
            services = data.get("services", {})

            for name, info in services.items():
                status = info.get("status", "unknown")
                emoji = "✅" if status == "healthy" else "❌"
                print(f"{emoji} {name.upper()}: {status} ({info.get('url')})")

            print()
            print(f"Overall status: {data.get('status', 'unknown')}")
            return 0

    except Exception as e:
        print(f"❌ Could not check services: {e}")
        return 1


def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2:
        print("EKHO Video Dubbing CLI")
        print()
        print("Usage:")
        print("  python ekho_cli.py <command> [args]")
        print()
        print("Commands:")
        print("  dub <video_file> [source_lang] [target_lang]")
        print("      Dub a video (default: en → fr)")
        print()
        print("  status")
        print("      Check status of all services")
        print()
        print("Examples:")
        print("  python ekho_cli.py dub myvideo.mp4")
        print("  python ekho_cli.py dub myvideo.mp4 en fr")
        print("  python ekho_cli.py status")
        return 1

    command = sys.argv[1]

    if command == "dub":
        if len(sys.argv) < 3:
            print("Error: Video file required")
            print("Usage: python ekho_cli.py dub <video_file> [source_lang] [target_lang]")
            return 1

        video_path = sys.argv[2]
        source_lang = sys.argv[3] if len(sys.argv) > 3 else "en"
        target_lang = sys.argv[4] if len(sys.argv) > 4 else "fr"

        return dub_video(video_path, source_lang, target_lang)

    elif command == "status":
        return check_services()

    else:
        print(f"Unknown command: {command}")
        print("Run without arguments for help")
        return 1


if __name__ == "__main__":
    sys.exit(main())
