# Dockerfile for ASR Whisper Service
FROM python:3.13-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -e .

# Copy application code
COPY asr_whisper/ ./asr_whisper/

# Create directory for model cache
RUN mkdir -p /models

# Set environment variables
ENV WHISPER_MODEL=base \
    WHISPER_DEVICE=cpu \
    WHISPER_MODEL_CACHE_DIR=/models \
    PYTHONUNBUFFERED=1

# Expose service port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8001/health')"

# Run the service
CMD ["uvicorn", "asr_whisper.api:app", "--host", "0.0.0.0", "--port", "8001"]
