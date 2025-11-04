"""Segmentation engine using VAD for pause detection."""

import logging
from pathlib import Path

import torch
import torchaudio
from vad.config import VADConfig, get_device

logger = logging.getLogger(__name__)


class AudioSegment:
    """Represents an audio segment with timing information."""

    def __init__(self, start: float, end: float, audio_path: Path):
        self.start = start  # Start time in seconds
        self.end = end  # End time in seconds
        self.duration = end - start
        self.audio_path = audio_path

    def __repr__(self):
        return f"AudioSegment(start={self.start:.2f}s, end={self.end:.2f}s, duration={self.duration:.2f}s)"


class SegmentationEngine:
    """Segments audio files based on voice activity and pauses."""

    def __init__(self, config: VADConfig):
        """
        Initialize Segmentation engine.

        Args:
            config: VADConfig instance
        """
        self.config = config
        self.device = get_device(config)
        self.pipeline = None
        logger.info(f"Initializing SegmentationEngine on device={self.device}")

    def load_model(self) -> None:
        """Load VAD model."""
        if self.pipeline is not None:
            logger.info("VAD model already loaded")
            return

        logger.info(f"Loading VAD model: {self.config.model_name}")
        try:
            # Note: pyannote/voice-activity-detection requires authentication token
            # For now, we'll use a simpler approach with torchaudio
            logger.info("Using torchaudio-based VAD (no authentication required)")
            self.pipeline = "torchaudio"  # Placeholder
            logger.info("VAD model loaded successfully")

        except Exception as e:
            logger.error(f"Failed to load VAD model: {e}")
            raise

    def segment_audio(self, audio_path: str | Path) -> list[AudioSegment]:
        """
        Segment audio file by detecting pauses.

        Args:
            audio_path: Path to audio file

        Returns:
            List of AudioSegment objects

        Raises:
            RuntimeError: If model not loaded
            FileNotFoundError: If audio file doesn't exist
        """
        if self.pipeline is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        audio_path = Path(audio_path)
        if not audio_path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        logger.info(f"Segmenting audio: {audio_path.name}")

        try:
            # Load audio
            waveform, sample_rate = torchaudio.load(str(audio_path))

            # Convert to mono if stereo
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)

            # Simple energy-based VAD
            segments = self._detect_pauses_energy_based(waveform, sample_rate, audio_path)

            logger.info(f"Segmentation complete: {len(segments)} segments found")
            return segments

        except Exception as e:
            logger.error(f"Segmentation failed: {e}", exc_info=True)
            raise

    def _detect_pauses_energy_based(
        self, waveform: torch.Tensor, sample_rate: int, audio_path: Path
    ) -> list[AudioSegment]:
        """
        Detect pauses using energy-based approach.

        Args:
            waveform: Audio waveform tensor
            sample_rate: Sample rate in Hz
            audio_path: Original audio file path

        Returns:
            List of AudioSegment objects
        """
        # Calculate frame energy
        frame_length = int(0.025 * sample_rate)  # 25ms frames
        hop_length = int(0.010 * sample_rate)  # 10ms hop

        # Compute energy per frame
        energy = []
        for i in range(0, waveform.shape[1] - frame_length, hop_length):
            frame = waveform[:, i : i + frame_length]
            frame_energy = torch.mean(frame**2).item()
            energy.append(frame_energy)

        energy = torch.tensor(energy)

        # Find threshold (use median as baseline)
        threshold = torch.median(energy) * 0.1  # 10% of median energy

        # Find speech regions (energy above threshold)
        is_speech = energy > threshold

        # Find segment boundaries
        segments = []
        in_speech = False
        segment_start = 0

        for i, speech in enumerate(is_speech):
            time = i * hop_length / sample_rate

            if speech and not in_speech:
                # Start of speech segment
                segment_start = time
                in_speech = True

            elif not speech and in_speech:
                # End of speech segment (pause detected)
                segment_end = time

                # Check if pause is long enough
                if i + 1 < len(is_speech):
                    # Look ahead to find pause duration
                    pause_frames = 0
                    for j in range(i, min(i + 100, len(is_speech))):
                        if not is_speech[j]:
                            pause_frames += 1
                        else:
                            break

                    pause_duration = pause_frames * hop_length / sample_rate

                    if pause_duration >= self.config.min_pause_duration:
                        # Long enough pause - create segment
                        duration = segment_end - segment_start
                        if duration >= self.config.min_segment_duration:
                            segments.append(AudioSegment(segment_start, segment_end, audio_path))
                        in_speech = False

        # Add final segment if still in speech
        if in_speech:
            segment_end = len(energy) * hop_length / sample_rate
            duration = segment_end - segment_start
            if duration >= self.config.min_segment_duration:
                segments.append(AudioSegment(segment_start, segment_end, audio_path))

        # Merge segments that are too short or split segments that are too long
        segments = self._post_process_segments(segments)

        return segments

    def _post_process_segments(self, segments: list[AudioSegment]) -> list[AudioSegment]:
        """
        Post-process segments to ensure they meet duration constraints.

        Args:
            segments: List of AudioSegment objects

        Returns:
            Post-processed list of AudioSegment objects
        """
        if not segments:
            return segments

        processed = []

        for segment in segments:
            # If segment is too long, split it
            if segment.duration > self.config.max_segment_duration:
                # Split into smaller segments at max duration
                start = segment.start
                while start < segment.end:
                    end = min(start + self.config.max_segment_duration, segment.end)
                    processed.append(AudioSegment(start, end, segment.audio_path))
                    start = end
            else:
                processed.append(segment)

        return processed

    def unload_model(self) -> None:
        """Unload model from memory."""
        if self.pipeline is not None:
            logger.info("Unloading VAD model")
            self.pipeline = None

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
