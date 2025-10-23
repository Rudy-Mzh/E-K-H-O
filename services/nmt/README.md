# NMT Service (Neural Machine Translation)

Neural Machine Translation service for contextual translation between languages.

## Features

- **Helsinki-NLP models** (open-source, high quality)
- **Multiple language pairs** (EN→FR, FR→EN, and more)
- **Contextual translation** preserving meaning
- **Batch translation** support
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
uvicorn nmt.api:app --reload --port 8002

# Production mode
uvicorn nmt.api:app --host 0.0.0.0 --port 8002 --workers 4
```

### API Endpoints

**POST /translate**
- Translate text between languages
- Returns translation with confidence score

**GET /health**
- Health check endpoint

**GET /supported-pairs**
- List supported language pairs

## Configuration

Environment variables:
- `NMT_MODEL_NAME`: Translation model (default: "Helsinki-NLP/opus-mt-en-fr")
- `NMT_DEVICE`: Device to use ("cpu" or "cuda", default: auto-detect)
- `NMT_MAX_LENGTH`: Maximum translation length (default: 512)

## Supported Language Pairs

- **EN → FR**: English to French (default)
- **FR → EN**: French to English
- **EN → ES**: English to Spanish
- **EN → DE**: English to German
- And many more via Helsinki-NLP models

**Note:** For MVP, we focus on EN→FR for video dubbing.
