"""Coqui TTS (XTTS-v2) engine implementation."""

import logging
from pathlib import Path

from TTS.api import TTS
from tts.base_engine import BaseTTSEngine
from tts.config import TTSConfig, get_device

logger = logging.getLogger(__name__)


class CoquiTTSEngine(BaseTTSEngine):
    """Coqui TTS engine with XTTS-v2 for voice cloning."""

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
    ) -> Path:
        """
        Synthesize speech from text using Coqui TTS.

        Args:
            text: Text to synthesize
            output_path: Path for output audio file
            reference_audio: Reference audio for voice cloning (required for XTTS-v2)
            language: Target language code

        Returns:
            Path to generated audio file

        Raises:
            RuntimeError: If model not loaded
            ValueError: If reference_audio is missing for voice cloning
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        if reference_audio is None:
            raise ValueError("Coqui XTTS-v2 requires reference_audio for voice cloning")

        output_path = Path(output_path)
        reference_audio = Path(reference_audio)

        if not reference_audio.exists():
            raise FileNotFoundError(f"Reference audio not found: {reference_audio}")

        logger.info(
            f"Synthesizing with Coqui: {len(text)} chars, "
            f"language={language}, reference={reference_audio.name}"
        )

        try:
            # Generate speech with voice cloning and optimized parameters
            logger.info("Synthesizing with optimized Coqui XTTS-v2 parameters")
            self.model.tts_to_file(
                text=text,
                file_path=str(output_path),
                speaker_wav=str(reference_audio),
                language=language,
                # Optimized parameters for best voice cloning quality:
                temperature=0.75,  # Lower = more stable, higher = more expressive
                length_penalty=1.0,  # Consistent speech speed
                repetition_penalty=5.0,  # Avoid repetitions
                top_k=50,  # Limit vocabulary for more natural speech
                top_p=0.85,  # Nucleus sampling for better quality
                speed=1.0,  # Natural speed
            )

            logger.info(f"Speech synthesized successfully with optimized parameters: {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"Synthesis failed: {e}", exc_info=True)
            raise

    def clone_voice(self, reference_audio: str | Path, voice_id: str) -> str:
        """
        Clone voice from reference audio.

        For Coqui XTTS-v2, we simply validate and cache the reference audio.
        The actual cloning happens during synthesis.

        Args:
            reference_audio: Path to reference audio file
            voice_id: Identifier for the cloned voice

        Returns:
            Voice ID (path to cached reference audio)

        Raises:
            FileNotFoundError: If reference audio doesn't exist
            ValueError: If reference audio is too short
        """
        reference_audio = Path(reference_audio)

        if not reference_audio.exists():
            raise FileNotFoundError(f"Reference audio not found: {reference_audio}")

        # Check duration (basic validation)
        try:
            import librosa

            audio, sr = librosa.load(str(reference_audio), sr=None)
            duration = len(audio) / sr

            if duration < self.config.min_reference_duration:
                raise ValueError(
                    f"Reference audio too short: {duration:.1f}s "
                    f"(minimum: {self.config.min_reference_duration}s)"
                )

            logger.info(f"Voice cloning reference validated: {duration:.1f}s")

            # Cache the reference audio
            self.config.voice_cache_dir.mkdir(parents=True, exist_ok=True)
            cached_path = self.config.voice_cache_dir / f"{voice_id}.wav"

            # Copy to cache
            import shutil

            shutil.copy2(reference_audio, cached_path)

            logger.info(f"Voice cached: {voice_id} → {cached_path}")
            return str(cached_path)

        except ImportError:
            logger.warning("librosa not available, skipping duration check")
            return str(reference_audio)

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
