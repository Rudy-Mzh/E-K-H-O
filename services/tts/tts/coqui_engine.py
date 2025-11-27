"""Coqui TTS (XTTS-v2) engine implementation."""

import logging
from pathlib import Path

from TTS.api import TTS
from tts.base_engine import BaseTTSEngine
from tts.config import TTSConfig, get_device

logger = logging.getLogger(__name__)


class CoquiTTSEngine(BaseTTSEngine):
    """Coqui TTS engine with XTTS-v2 using default speakers (NO voice cloning)."""

    def __init__(self, config: TTSConfig):
        """
        Initialize Coqui TTS engine.

        Args:
            config: TTSConfig instance
        """
        self.config = config
        self.device = get_device(config)
        self.model = None
        logger.info(f"Initializing Coqui TTS engine on device={self.device}")

    def load_model(self) -> None:
        """Load Coqui TTS model into memory."""
        if self.model is not None:
            logger.info("Coqui model already loaded")
            return

        logger.info(f"Loading Coqui TTS model: {self.config.coqui_model}")
        try:
            self.model = TTS(
                model_name=self.config.coqui_model,
                progress_bar=False,
                gpu=(self.device == "cuda"),
            )
            logger.info("Coqui TTS model loaded successfully")

        except Exception as e:
            logger.error(f"Failed to load Coqui model: {e}")
            raise

    def synthesize(
        self,
        text: str,
        output_path: str | Path,
        reference_audio: str | Path | None = None,
        language: str = "fr",
        speaker_gender: str = "male",
    ) -> Path:
        """
        Synthesize speech from text using Coqui TTS with gender-matched speaker.

        Args:
            text: Text to synthesize
            output_path: Path for output audio file
            reference_audio: IGNORED - kept for API compatibility only
            language: Target language code
            speaker_gender: Speaker gender ("male" or "female")

        Returns:
            Path to generated audio file

        Raises:
            RuntimeError: If model not loaded
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        output_path = Path(output_path)

        logger.info(
            f"Synthesizing with Coqui: {len(text)} chars, language={language}, gender={speaker_gender}"
        )

        try:
            # Select speaker based on gender (XTTS-v2 built-in speakers)
            # Male speakers: Dionisio Schuyler, Andrew Chipper, Badr Odhiambo, Craig Gutsy, etc.
            # Female speakers: Claribel Dervla, Daisy Studious, Gracie Wise, Ana Florence, etc.

            if speaker_gender.lower() == "female":
                default_speaker = "Claribel Dervla"  # Female voice
            else:
                default_speaker = "Dionisio Schuyler"  # Male voice

            logger.info(
                f"Synthesizing with Coqui XTTS-v2 speaker: {default_speaker} ({speaker_gender})"
            )
            self.model.tts_to_file(
                text=text,
                file_path=str(output_path),
                language=language,
                speaker=default_speaker,
                # Optimized parameters for quality:
                temperature=0.75,
                length_penalty=1.0,
                repetition_penalty=5.0,
                top_k=50,
                top_p=0.85,
                speed=1.0,
            )

            logger.info(f"Speech synthesized successfully: {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"Synthesis failed: {e}", exc_info=True)
            raise

    def unload_model(self) -> None:
        """Unload model from memory."""
        if self.model is not None:
            logger.info("Unloading Coqui TTS model")
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

    @property
    def name(self) -> str:
        """Get engine name."""
        return "coqui"
