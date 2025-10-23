# ekho_core

Core utilities and shared components for the EKHO voice translation platform.

## Features

- **Audio Processing**: Extract, convert, and manipulate audio files
- **Video Processing**: Extract audio from video, remux audio tracks
- **Data Models**: Shared Pydantic models for transcriptions, translations, and timing
- **Utilities**: Logging, configuration, and helper functions

## Installation

```bash
pip install -e .
```

## Usage

```python
from ekho_core.audio import extract_audio_from_video, load_audio
from ekho_core.models import AudioSegment, TranscriptionResult

# Extract audio from video
audio_path = extract_audio_from_video("video.mp4")

# Load audio for processing
audio = load_audio(audio_path)
```
