# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EKHO is an innovative real-time conversational voice translation platform integrating AI for fluid and natural multilingual communication. The project aims to enable instant interaction between people speaking different languages.

## Repository Structure

This is a monorepo organized into distinct functional areas:

- `apps/` - User-facing applications
  - `cli/` - Command-line interface
  - `web/` - Web application
- `packages/` - Shared Python packages
  - `ekho_core/` - Core functionality shared across services
  - `ekho_api/` - API client/server shared code
- `services/` - Microservices for specific capabilities
  - `asr_whisper/` - Automatic Speech Recognition (Whisper-based)
  - `nmt/` - Neural Machine Translation
  - `tts/` - Text-to-Speech synthesis
- `infra/` - Infrastructure configuration
  - `docker/` - Docker configurations
  - `compose/` - Docker Compose orchestration files
- `tests/` - Test suite
- `docs/` - Documentation
- `scripts/` - Utility scripts

## Development Commands

### Python Environment Setup
```bash
# Create and activate virtual environment
python3.13 -m venv .venv
source .venv/bin/activate  # On macOS/Linux

# Install dependencies
python -m pip install -U pip wheel
pip install pytest black ruff isort
```

### Code Quality

**Linting:**
```bash
# Run all linters (as in CI)
ruff check .
black --check .
isort --check-only .

# Auto-fix issues
ruff check . --fix
black .
isort .
```

**Pre-commit hooks:**
```bash
# Install hooks (first time only)
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

The pre-commit hooks enforce:
- `black` - Code formatting (100 char line length)
- `ruff` - Linting (E, F, I, UP, B rules)
- `isort` - Import sorting (black-compatible profile)
- Basic file hygiene (trailing whitespace, end-of-file, merge conflicts)

### Testing

**Run all tests:**
```bash
pytest -q
```

**Run specific test file:**
```bash
pytest tests/test_cli.py -q
```

**Run with verbose output:**
```bash
pytest -v
```

## Code Style Configuration

Target Python version: **3.13**

Key configurations (from `pyproject.toml`):
- Line length: 100 characters
- Black formatting with py313 target
- Ruff linting with select rules: E (pycodestyle errors), F (pyflakes), I (isort), UP (pyupgrade), B (bugbear)
- E501 (line too long) is ignored in favor of Black's formatting

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci-python.yml`) runs on:
- All pull requests
- Pushes to `main` branch

CI pipeline:
1. Sets up Python 3.13
2. Installs dependencies (pytest, black, ruff, isort)
3. Runs linting checks (ruff, black, isort)
4. Runs test suite with pytest

All linting and tests must pass before merging.

## Architecture Notes

### Service-Oriented Design
The project follows a microservices architecture with three specialized services:
- **ASR (Whisper)**: Converts speech to text
- **NMT**: Translates text between languages
- **TTS**: Converts text back to speech

### Shared Packages
Common functionality is extracted into reusable packages (`ekho_core`, `ekho_api`) to avoid duplication across services and applications.

### Infrastructure
Docker and Docker Compose configurations are organized under `infra/` for containerized deployment and orchestration.
