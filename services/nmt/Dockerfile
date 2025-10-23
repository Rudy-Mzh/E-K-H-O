# Dockerfile for NMT Service
FROM python:3.13-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -e .

# Copy application code
COPY nmt/ ./nmt/

# Create directory for model cache
RUN mkdir -p /models

# Set environment variables
ENV NMT_MODEL_NAME=Helsinki-NLP/opus-mt-en-fr \
    NMT_DEVICE=cpu \
    NMT_MODEL_CACHE_DIR=/models \
    PYTHONUNBUFFERED=1

# Expose service port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8002/health')"

# Run the service
CMD ["uvicorn", "nmt.api:app", "--host", "0.0.0.0", "--port", "8002"]
