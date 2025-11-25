# ARCHITECTURE EKHO - MVP

## 📐 Vue d'ensemble

EKHO est une plateforme de traduction vidéo en temps réel utilisant une architecture microservices.

## 🏗️ Structure du projet

```
E-K-H-O/
│
├── 📄 EKHO_fichier_de_lancement_V1.py    ← POINT D'ENTRÉE PRINCIPAL
├── 📄 CLAUDE.md                           ← Documentation pour Claude
├── 📄 README.md                           ← Documentation projet
├── 📄 ARCHITECTURE.md                     ← Ce fichier
├── 📄 pyproject.toml                      ← Config Python projet
│
├── 📁 packages/                           ← PACKAGES PARTAGÉS
│   ├── ekho_core/                         ← Utilitaires communs
│   │   ├── ekho_core/
│   │   │   ├── __init__.py
│   │   │   ├── audio.py                   ← Extraction/combinaison audio
│   │   │   ├── config.py                  ← Config de base
│   │   │   ├── models.py                  ← Modèles de données
│   │   │   └── utils.py                   ← Utilitaires génériques
│   │   └── pyproject.toml
│   │
│   └── ekho_api/                          ← Orchestrateur pipeline
│       ├── ekho_api/
│       │   ├── __init__.py
│       │   ├── config.py                  ← Config orchestrateur
│       │   └── orchestrator_v2.py         ← PIPELINE PRINCIPAL ⭐
│       └── pyproject.toml
│
├── 📁 services/                           ← MICROSERVICES (SILOS)
│   ├── asr_whisper/                       ← Speech-to-Text (Whisper)
│   │   ├── asr_whisper/
│   │   │   ├── __init__.py
│   │   │   ├── api.py                     ← API FastAPI
│   │   │   ├── config.py                  ← Config ASR
│   │   │   └── whisper_engine.py          ← Moteur Whisper
│   │   └── pyproject.toml
│   │
│   ├── vad/                               ← Voice Activity Detection
│   │   ├── vad/
│   │   │   ├── __init__.py
│   │   │   ├── api.py                     ← API FastAPI
│   │   │   ├── config.py                  ← Config VAD
│   │   │   └── segmentation_engine.py     ← Détection pauses
│   │   └── pyproject.toml
│   │
│   ├── llm/                               ← Traduction AI (Gemini)
│   │   ├── llm/
│   │   │   ├── __init__.py
│   │   │   ├── api.py                     ← API FastAPI
│   │   │   ├── config.py                  ← Config LLM
│   │   │   └── gemini_engine.py           ← Moteur Gemini
│   │   └── pyproject.toml
│   │
│   └── tts/                               ← Text-to-Speech (Coqui)
│       ├── tts/
│       │   ├── __init__.py
│       │   ├── api.py                     ← API FastAPI
│       │   ├── config.py                  ← Config TTS
│       │   ├── base_engine.py             ← Interface TTS
│       │   ├── coqui_engine.py            ← Moteur Coqui ⭐
│       │   └── engine_factory.py          ← Factory pattern
│       └── pyproject.toml
│
├── 📁 scripts/                            ← SCRIPTS UTILITAIRES
│   ├── start_all_services.sh              ← Démarrer tous les services
│   └── stop_all_services.sh               ← Arrêter tous les services
│
└── 📁 tests/                              ← Tests unitaires
    └── test_cli.py
```

## 🎯 Principes d'architecture

### 1. Séparation par SILOS (Microservices)

Chaque service est **indépendant** et communique via **API REST** :

- **ASR** (port 8001) : Automatic Speech Recognition - Transcription audio → texte
- **VAD** (port 8004) : Voice Activity Detection - Détection des pauses dans l'audio
- **LLM** (port 8005) : Large Language Model - Traduction contextuelle intelligente
- **TTS** (port 8003) : Text-to-Speech - Synthèse vocale

### 2. Packages PARTAGÉS

- **ekho_core** : Fonctions utilitaires réutilisables (manipulation audio, configuration)
- **ekho_api** : Orchestrateur qui coordonne les 4 microservices

### 3. Point d'entrée UNIQUE

`EKHO_fichier_de_lancement_V1.py` = Script principal pour lancer une traduction vidéo complète

## 🚀 Utilisation

### Démarrage des services

```bash
cd /path/to/E-K-H-O
./scripts/start_all_services.sh
```

Attend 45 secondes pour le chargement du modèle TTS.

### Lancement d'une traduction

```bash
.venv/bin/python EKHO_fichier_de_lancement_V1.py
```

### Arrêt des services

```bash
./scripts/stop_all_services.sh
```

## 🔄 Flux de traduction vidéo

1. **Extraction audio** : Extraire l'audio de la vidéo source
2. **Segmentation VAD** : Détecter les pauses pour découper l'audio en segments
3. **Transcription ASR** : Transcrire chaque segment audio en texte (langue source)
4. **Analyse contexte LLM** : Analyser le contexte global de la transcription complète
5. **Traduction LLM** : Traduire chaque segment avec le contexte global (langue cible)
6. **Synthèse TTS** : Générer l'audio traduit pour chaque segment
7. **Assemblage** : Assembler les segments audio aux timestamps originaux
8. **Combinaison** : Combiner l'audio traduit avec la vidéo originale

## ✅ Avantages de cette architecture

- ✅ **Claire** : 1 fichier = 1 responsabilité
- ✅ **Modulaire** : Chaque service peut être modifié indépendamment
- ✅ **Testable** : Chaque service peut être testé séparément
- ✅ **Maintenable** : Facile de trouver où corriger un bug
- ✅ **Scalable** : Facile d'ajouter de nouveaux services

## 🔧 Technologies utilisées

- **Python 3.13** : Langage principal (services ASR, VAD, LLM)
- **Python 3.11** : Service TTS (compatibilité Coqui)
- **FastAPI** : Framework API REST pour chaque service
- **Whisper** : Modèle de transcription audio (OpenAI)
- **Gemini 2.0 Flash** : Modèle de traduction (Google)
- **Coqui TTS** : Moteur de synthèse vocale
- **FFmpeg** : Manipulation audio/vidéo

## 📊 Ports des services

| Service | Port | Description |
|---------|------|-------------|
| ASR | 8001 | Transcription audio |
| TTS | 8003 | Synthèse vocale |
| VAD | 8004 | Détection de pauses |
| LLM | 8005 | Traduction contextuelle |

## 🐛 Debugging

Logs disponibles dans `/tmp/` :
- `/tmp/ekho_asr.log` - Logs ASR
- `/tmp/ekho_vad.log` - Logs VAD
- `/tmp/ekho_llm.log` - Logs LLM
- `/tmp/ekho_tts_coqui.log` - Logs TTS

Commande pour suivre les logs en temps réel :
```bash
tail -f /tmp/ekho_*.log
```
