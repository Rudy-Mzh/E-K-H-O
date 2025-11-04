# EKHO Scripts Utilitaires

Scripts pour gérer les services EKHO facilement.

## 🚀 Démarrage Rapide

### Démarrer tous les services
```bash
./scripts/start_all_services.sh
```

Démarre dans l'ordre:
1. ASR (Whisper) sur port 8001
2. NMT (Helsinki-NLP) sur port 8002
3. TTS (Coqui XTTS-v2) sur port 8003 [Python 3.11]
4. Orchestrator (API) sur port 8000

### Arrêter tous les services
```bash
./scripts/stop_all_services.sh
```

## 📝 Logs

Tous les logs sont dans `/tmp/`:

```bash
# Suivre les logs en temps réel
tail -f /tmp/ekho_asr.log
tail -f /tmp/ekho_nmt.log
tail -f /tmp/ekho_tts_coqui.log
tail -f /tmp/ekho_orchestrator.log
```

## 🧪 Test Direct

Pour tester le pipeline complet avec logging détaillé:

```bash
.venv/bin/python test_voice_cloning.py
```

## 🎬 Utilisation CLI

Une fois les services démarrés:

```bash
.venv/bin/python apps/cli/ekho_cli.py dub \
  "/chemin/vers/video.mp4" \
  en \
  fr
```

## 🏗️ Architecture

```
Services (4 processus):
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│ ASR:8001    │  │ NMT:8002    │  │ TTS:8003    │  │ Orch:8000    │
│ Python 3.13 │  │ Python 3.13 │  │ Python 3.11 │  │ Python 3.13  │
│ Whisper     │  │ Helsinki    │  │ Coqui TTS   │  │ FastAPI      │
└─────────────┘  └─────────────┘  └─────────────┘  └──────────────┘
```

**Note:** TTS utilise Python 3.11 isolé (`.venv-3.11`) pour compatibilité Coqui.

## ✨ Optimisations Clonage Vocal

Le pipeline actuel inclut:
- ✅ Extraction sample vocal optimal (15s)
- ✅ Sample rate 22kHz (optimal XTTS-v2)
- ✅ Normalisation loudness
- ✅ Paramètres de synthèse optimisés

Voir `RAPPORT_CLONAGE_VOCAL.md` pour détails complets.
