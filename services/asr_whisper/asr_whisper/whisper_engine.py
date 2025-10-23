"""Whisper transcription engine - isolated business logic."""

import logging
from pathlib import Path
from typing import Any

import whisper
from asr_whisper.config import WhisperConfig, get_device

from ekho_core.models import TimeRange, TranscriptionResult, Word

logger = logging.getLogger(__name__)


class WhisperEngine:
    """Whisper transcription engine."""

    def __init__(self, config: WhisperConfig):
        """
        Initialize Whisper engine.

        Args:
            config: WhisperConfig instance
        """
        self.config = config
        self.device = get_device(config)
        self.model = None
        logger.info(
            f"Initializing WhisperEngine with model={config.model_name}, device={self.device}"
        )

    def load_model(self) -> None:
        """Load Whisper model into memory."""
        if self.model is not None:
            logger.info("Model already loaded")
            return

        logger.info(f"Loading Whisper model: {self.config.model_name}")
        try:
            self.model = whisper.load_model(
                name=self.config.model_name,
                device=self.device,
                download_root=(
                    str(self.config.model_cache_dir) if self.config.model_cache_dir else None
                ),
            )
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def transcribe(
        self, audio_path: str | Path, language: str | None = None
    ) -> TranscriptionResult:
        """
        Transcribe audio file using Whisper.

        Args:
            audio_path: Path to audio file
            language: Optional language code (e.g., 'en', 'fr')

        Returns:
            TranscriptionResult with word-level timestamps

        Raises:
            RuntimeError: If model not loaded
            FileNotFoundError: If audio file doesn't exist
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        audio_path = Path(audio_path)
        if not audio_path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        logger.info(f"Transcribing: {audio_path}")

        # Use provided language or config default
        lang = language or self.config.language

        # Transcribe with Whisper
        result = self.model.transcribe(
            str(audio_path),
            language=lang,
            task=self.config.task,
            word_timestamps=self.config.word_timestamps,
            beam_size=self.config.beam_size,
            best_of=self.config.best_of,
            temperature=self.config.temperature,
        )

        # Extract text and language
        text = result["text"].strip()
        detected_language = result.get("language", lang or "unknown")

        logger.info(f"Transcription complete: {len(text)} chars, language={detected_language}")

        # Extract word-level timestamps
        words = self._extract_words(result)

        return TranscriptionResult(
            text=text,
            language=detected_language,
            words=words,
            confidence=None,  # Whisper doesn't provide overall confidence
        )

    def _extract_words(self, whisper_result: dict[str, Any]) -> list[Word]:
        """
        Extract word-level timestamps from Whisper result.

        Args:
            whisper_result: Raw result from Whisper

        Returns:
            List of Word objects with timestamps
        """
        words = []

        # Whisper returns segments with word timestamps
        for segment in whisper_result.get("segments", []):
            segment_words = segment.get("words", [])

            for word_info in segment_words:
                word_text = word_info.get("word", "").strip()
                start = word_info.get("start", 0.0)
                end = word_info.get("end", 0.0)
                probability = word_info.get("probability")

                if word_text:  # Skip empty words
                    words.append(
                        Word(
                            text=word_text,
                            time_range=TimeRange(start=start, end=end),
                            confidence=probability,
                        )
                    )

        logger.info(f"Extracted {len(words)} words with timestamps")
        return words

    def unload_model(self) -> None:
        """Unload model from memory."""
        if self.model is not None:
            logger.info("Unloading Whisper model")
            del self.model
            self.model = None

            # Force garbage collection
            import gc

            gc.collect()

            # Clear CUDA cache if available
            try:
                import torch

                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
            except ImportError:
                pass
