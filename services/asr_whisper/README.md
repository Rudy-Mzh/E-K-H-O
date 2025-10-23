# ASR Whisper Service

Automatic Speech Recognition service using OpenAI's Whisper model.

## Features

- **Local Whisper model** (no API keys required)
- **Word-level timestamps** for precise synchronization
- **Multiple model sizes** (tiny, base, small, medium, large)
- **Language detection** and forced language options
- **REST API** with FastAPI

## Installation

```bash
# Install dependencies
pip install -e .

# Or with requirements.txt
pip install -r requirements.txt
```

## Usage

### Start the service

```bash
# Development mode
uvicorn asr_whisper.api:app --reload --port 8001

# Production mode
uvicorn asr_whisper.api:app --host 0.0.0.0 --port 8001 --workers 4
```

### API Endpoints

**POST /transcribe**
- Upload audio file
- Returns transcription with word-level timestamps

**GET /health**
- Health check endpoint

**GET /models**
- List available Whisper models

## Configuration

Environment variables:
- `WHISPER_MODEL`: Model size (default: "base")
- `WHISPER_DEVICE`: Device to use ("cpu" or "cuda", default: auto-detect)
- `WHISPER_COMPUTE_TYPE`: Computation type (default: "float32")

## Models

- **tiny**: Fastest, least accurate (~1GB RAM)
- **base**: Good balance for testing (~1GB RAM)
- **small**: Better accuracy (~2GB RAM)
- **medium**: High accuracy (~5GB RAM)
- **large**: Best accuracy (~10GB RAM)

**Recommendation for MVP: base or small**
