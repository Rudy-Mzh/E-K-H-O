# Dockerfile for TTS Service
FROM python:3.13-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -e .

# Copy application code
COPY tts/ ./tts/

# Create directories for caching
RUN mkdir -p /models /voices

# Set environment variables
ENV TTS_ENGINE=coqui \
    TTS_DEVICE=cpu \
    TTS_MODEL_CACHE_DIR=/models \
    TTS_VOICE_CACHE_DIR=/voices \
    PYTHONUNBUFFERED=1

# Expose service port
EXPOSE 8003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8003/health')"

# Run the service
CMD ["uvicorn", "tts.api:app", "--host", "0.0.0.0", "--port", "8003"]
