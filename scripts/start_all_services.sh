#!/bin/bash
# Start all EKHO services (ASR, VAD, LLM, TTS)

set -e

EKHO_DIR="/Users/rudymezoughi/Documents/Documents - MacBook Pro de RUDY - 1/2. Projet Polyglotte/Dossier MVP Rangement/EKHO VS CODE GITHUB/E-K-H-O"
cd "$EKHO_DIR"

echo "======================================================================"
echo "  Starting EKHO Services"
echo "======================================================================"

# Stop any existing services
echo "Stopping existing services..."
pkill -f "asr_whisper.api" 2>/dev/null || true
pkill -f "vad.api" 2>/dev/null || true
pkill -f "llm.api" 2>/dev/null || true
pkill -f "tts.api" 2>/dev/null || true
sleep 2

# Start ASR Service (Python 3.13)
echo "Starting ASR service (port 8001)..."
cd "$EKHO_DIR/services/asr_whisper"
nohup "$EKHO_DIR/.venv/bin/python" -m asr_whisper.api > /tmp/ekho_asr.log 2>&1 &
ASR_PID=$!
echo "  → ASR PID: $ASR_PID"

# Start VAD Service (Python 3.13)
echo "Starting VAD service (port 8004)..."
cd "$EKHO_DIR/services/vad"
nohup "$EKHO_DIR/.venv/bin/python" -m vad.api > /tmp/ekho_vad.log 2>&1 &
VAD_PID=$!
echo "  → VAD PID: $VAD_PID"

# Start LLM Service (Python 3.13)
echo "Starting LLM service (port 8005)..."
cd "$EKHO_DIR/services/llm"
nohup "$EKHO_DIR/.venv/bin/python" -m llm.api > /tmp/ekho_llm.log 2>&1 &
LLM_PID=$!
echo "  → LLM PID: $LLM_PID"

# Start TTS Service (Python 3.11 - Isolated for Coqui)
echo "Starting TTS service (port 8003) [Python 3.11]..."
cd "$EKHO_DIR/services/tts"
nohup "$EKHO_DIR/services/tts/.venv-3.11/bin/python" -m tts.api > /tmp/ekho_tts_coqui.log 2>&1 &
TTS_PID=$!
echo "  → TTS PID: $TTS_PID"

cd "$EKHO_DIR"

# Wait for services to initialize
echo "Waiting for services to initialize (45s for TTS model loading)..."
sleep 45

echo "======================================================================"
echo "  ✅ All EKHO Services Started!"
echo "======================================================================"
echo ""
echo "Service URLs:"
echo "  • ASR (Whisper): http://localhost:8001"
echo "  • VAD (Pause Detection): http://localhost:8004"
echo "  • LLM (Gemini): http://localhost:8005"
echo "  • TTS (Coqui): http://localhost:8003"
echo ""
echo "Process IDs:"
echo "  • ASR: $ASR_PID"
echo "  • VAD: $VAD_PID"
echo "  • LLM: $LLM_PID"
echo "  • TTS: $TTS_PID"
echo ""
echo "Logs:"
echo "  • tail -f /tmp/ekho_asr.log"
echo "  • tail -f /tmp/ekho_vad.log"
echo "  • tail -f /tmp/ekho_llm.log"
echo "  • tail -f /tmp/ekho_tts_coqui.log"
echo ""
echo "To run a video dubbing:"
echo "  .venv/bin/python EKHO_fichier_de_lancement_V1.py"
echo ""
echo "To stop all services:"
echo "  ./scripts/stop_all_services.sh"
echo "======================================================================"
