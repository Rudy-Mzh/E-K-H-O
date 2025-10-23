# Dockerfile for EKHO API Orchestrator
FROM python:3.13-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy ekho_core first (dependency)
COPY ../ekho_core /app/ekho_core
RUN pip install --no-cache-dir -e /app/ekho_core

# Copy requirements and install
COPY pyproject.toml ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -e .

# Copy application code
COPY ekho_api/ ./ekho_api/

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose service port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the service
CMD ["uvicorn", "ekho_api.api:app", "--host", "0.0.0.0", "--port", "8000"]
