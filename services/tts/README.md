# TTS Service (Text-to-Speech with Voice Cloning)

Text-to-Speech service with voice cloning capabilities for natural dubbing.

## Features

- **Dual TTS Engines** with easy switching:
  - **Coqui TTS (XTTS-v2)**: High-quality voice cloning with 6+ seconds of audio
  - **OpenVoice**: Fast voice cloning with tone/emotion control
- **Voice cloning** from reference audio (optimal: 1 minute)
- **Multilingual support** (EN, FR, ES, DE, etc.)
- **Prosody preservation** for natural speech
- **REST API** with FastAPI

## Installation

```bash
# Install dependencies
pip install -e .
```

## Usage

### Start the service

```bash
# Development mode
uvicorn tts.api:app --reload --port 8003

# Production mode
uvicorn tts.api:app --host 0.0.0.0 --port 8003 --workers 2
```

### API Endpoints

**POST /synthesize**
- Generate speech from text
- Optional: provide reference audio for voice cloning

**POST /clone-voice**
- Train/calibrate voice cloning from reference audio
- Returns voice_id for future synthesis

**GET /health**
- Health check endpoint

**GET /engines**
- List available TTS engines

**POST /switch-engine**
- Switch between Coqui and OpenVoice engines

## Configuration

Environment variables:
- `TTS_ENGINE`: TTS engine to use ("coqui" or "openvoice", default: "coqui")
- `TTS_DEVICE`: Device to use ("cpu" or "cuda", default: auto-detect)
- `TTS_MODEL`: Model name for Coqui (default: "tts_models/multilingual/multi-dataset/xtts_v2")

## Voice Cloning Workflow

**For 1-minute test videos (your use case):**

1. **Extract reference audio** (1 minute from original video)
2. **Clone voice** using `/clone-voice` endpoint
3. **Synthesize French** using `/synthesize` with cloned voice
4. **Replace audio** in video

The 1-minute reference provides excellent cloning quality!

## Engine Comparison

### Coqui TTS (XTTS-v2)
- ✅ Excellent quality (near ElevenLabs)
- ✅ Requires 6+ seconds (1 min = perfect)
- ✅ 17 languages
- ⚠️ Slower (2-3x realtime on CPU)

### OpenVoice
- ✅ Fast generation
- ✅ Good emotion/tone control
- ✅ Multilingual
- ⚠️ Slightly less natural than Coqui

**Recommendation:** Start with **Coqui** for best quality, switch to **OpenVoice** if speed is priority.
