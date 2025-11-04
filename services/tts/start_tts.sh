#!/bin/bash
# Script de démarrage du service TTS avec Python 3.11 et Coqui TTS

# Chemin absolu vers le répertoire du service TTS
TTS_DIR="/Users/rudymezoughi/Documents/Documents - MacBook Pro de RUDY - 1/2. Projet Polyglotte/Dossier MVP Rangement/EKHO VS CODE GITHUB/E-K-H-O/services/tts"

cd "$TTS_DIR"

# Utiliser l'environnement Python 3.11 avec Coqui TTS
"$TTS_DIR/.venv-3.11/bin/python" -m tts.api
