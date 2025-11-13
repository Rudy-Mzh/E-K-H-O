"""Test script for the segmented dubbing translation pipeline (without TTS)."""

import asyncio
import sys
from pathlib import Path

import httpx

# Add packages to path
sys.path.insert(0, str(Path(__file__).parent / "packages"))


async def test_translation_pipeline():
    """Test VAD, ASR, and LLM services for translation."""
    print("=" * 70)
    print("  EKHO Translation Pipeline Test (VAD + ASR + LLM)")
    print("=" * 70)
    print()

    client = httpx.AsyncClient(timeout=60.0)

    # Step 1: Check service health
    print("Step 1: Checking service health...")
    services = {
        "VAD": "http://localhost:8004/health",
        "ASR": "http://localhost:8001/health",
        "LLM": "http://localhost:8005/health",
    }

    all_healthy = True
    for name, url in services.items():
        try:
            response = await client.get(url)
            status = response.json()
            print(f"  ✅ {name}: {status}")
        except Exception as e:
            print(f"  ❌ {name}: FAILED - {e}")
            all_healthy = False

    if not all_healthy:
        print("\n❌ Not all services are healthy. Aborting test.")
        await client.aclose()
        return

    print("\n✅ All services are healthy!")
    print()

    # Step 2: Test with mock text data (simulating ASR output)
    print("Step 2: Testing translation with mock transcript...")

    # Mock transcript in English
    mock_transcript = (
        "Hello everyone! Welcome to this amazing demonstration. "
        "Today we're going to explore the future of voice translation."
    )
    print(f"  Mock transcript: '{mock_transcript}'")
    print()

    # Step 3: Analyze context with LLM
    print("Step 3: Analyzing context with LLM...")
    try:
        response = await client.post(
            "http://localhost:8005/analyze-context",
            json={
                "transcript": mock_transcript,
                "source_lang": "en",
                "target_lang": "fr",
            },
        )
        response.raise_for_status()
        context_result = response.json()
        context = context_result["context"]
        print(f"  ✅ Context analyzed ({len(context)} chars)")
        print(f"  Context: {context[:200]}...")
        print()
    except Exception as e:
        print(f"  ❌ Context analysis failed: {e}")
        await client.aclose()
        return

    # Step 4: Translate segments with context
    print("Step 4: Translating segments with context...")
    segments = [
        {"text": "Hello everyone! Welcome to this amazing demonstration.", "duration": 3.5},
        {
            "text": "Today we're going to explore the future of voice translation.",
            "duration": 4.2,
        },
    ]

    translated_segments = []
    for i, segment in enumerate(segments):
        print(f"  Translating segment {i+1}/{len(segments)}...")
        try:
            response = await client.post(
                "http://localhost:8005/translate",
                json={
                    "text": segment["text"],
                    "context": context,
                    "source_lang": "en",
                    "target_lang": "fr",
                    "target_duration": segment["duration"],
                },
            )
            response.raise_for_status()
            result = response.json()
            translated_text = result["translated_text"]
            translated_segments.append(translated_text)
            print(f"    Original: {segment['text']}")
            print(f"    Translated: {translated_text}")
            print()
        except Exception as e:
            print(f"    ❌ Translation failed: {e}")
            await client.aclose()
            return

    # Final results
    print("=" * 70)
    print("  ✅ Translation Pipeline Test SUCCESSFUL!")
    print("=" * 70)
    print()
    print("Summary:")
    print("  • Source language: English")
    print("  • Target language: French")
    print(f"  • Segments translated: {len(translated_segments)}")
    print()
    print("Translated segments:")
    for i, translation in enumerate(translated_segments, 1):
        print(f"  {i}. {translation}")
    print()

    await client.aclose()


if __name__ == "__main__":
    asyncio.run(test_translation_pipeline())
