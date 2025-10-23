# ekho_api - Orchestrator for Video Dubbing Pipeline

High-level API that orchestrates ASR, NMT, and TTS services for complete video dubbing.

## Features

- **End-to-end video dubbing pipeline**
- **Service orchestration** (ASR → NMT → TTS)
- **Voice cloning workflow** from source video
- **Audio/video synchronization**
- **REST API** for easy integration

## Workflow

```
Input: Video (EN) → Output: Dubbed Video (FR)

1. Extract audio from video
2. Transcribe audio (ASR) → English text + timestamps
3. Translate text (NMT) → French text
4. Clone voice from original audio
5. Synthesize French speech (TTS) with cloned voice
6. Replace audio track in video
7. Return dubbed video
```

## Installation

```bash
pip install -e .
```

## Usage

### Start the orchestrator

```bash
# Development mode
uvicorn ekho_api.api:app --reload --port 8000

# Production mode
uvicorn ekho_api.api:app --host 0.0.0.0 --port 8000 --workers 4
```

### API Endpoints

**POST /dub-video**
- Upload video file
- Returns dubbed video with translated audio

**POST /process-pipeline**
- Process through full ASR → NMT → TTS pipeline
- More control over each step

**GET /health**
- Health check for orchestrator and all services

**GET /services**
- Status of connected services

## Configuration

Environment variables:
- `ASR_SERVICE_URL`: ASR Whisper service URL (default: http://localhost:8001)
- `NMT_SERVICE_URL`: NMT service URL (default: http://localhost:8002)
- `TTS_SERVICE_URL`: TTS service URL (default: http://localhost:8003)

## Requirements

All three services must be running:
- ASR Whisper service on port 8001
- NMT service on port 8002
- TTS service on port 8003
