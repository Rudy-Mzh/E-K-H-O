#!/bin/bash
# Stop all EKHO services

echo "======================================================================"
echo "  Stopping EKHO Services"
echo "======================================================================"

pkill -f "asr.api" && echo "  ✅ ASR stopped" || echo "  ℹ️  ASR not running"
pkill -f "vad.api" && echo "  ✅ VAD stopped" || echo "  ℹ️  VAD not running"
pkill -f "llm.api" && echo "  ✅ LLM stopped" || echo "  ℹ️  LLM not running"
pkill -f "tts.api" && echo "  ✅ TTS stopped" || echo "  ℹ️  TTS not running"
pkill -f "ekho_api.api" && echo "  ✅ Orchestrator stopped" || echo "  ℹ️  Orchestrator not running"

echo "======================================================================"
echo "  All EKHO services stopped"
echo "======================================================================"
