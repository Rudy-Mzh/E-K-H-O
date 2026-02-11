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

    def diarize_audio(self, audio_path: str | Path) -> dict:
        """
        Identify and label different speakers in audio using pyannote.audio.

        Args:
            audio_path: Path to audio file

        Returns:
            Dictionary with speaker information:
            {
                "speakers": {
                    0: {"gender": "male", "speech_duration": 145.3},
                    1: {"gender": "female", "speech_duration": 132.1},
                },
                "timeline": [
                    {"start": 0.0, "end": 5.2, "speaker_id": 0},
                    {"start": 5.2, "end": 12.3, "speaker_id": 1},
                    ...
                ],
                "num_speakers": 2
            }

        Raises:
            RuntimeError: If HuggingFace token not configured
            Exception: If diarization fails
        """
        audio_path = Path(audio_path)
        logger.info(f"Diarizing audio: {audio_path.name}")

        if not self.config.huggingface_token:
            raise RuntimeError(
                "HUGGINGFACE_TOKEN not configured. " "Set it in .env file or environment variable."
            )

        try:
            from pyannote.audio import Pipeline

            # Load diarization pipeline
            logger.info(f"Loading diarization model: {self.config.diarization_model}")
            pipeline = Pipeline.from_pretrained(
                self.config.diarization_model, token=self.config.huggingface_token
            )

            # Move to appropriate device
            if self.device != "cpu":
                pipeline.to(torch.device(self.device))

            # Apply diarization
            logger.info("Running speaker diarization...")
            diarization = pipeline(str(audio_path))

            # Extract speaker timeline with gender detection per speaker
            speakers = {}
            timeline = []
            speaker_map = {}  # Map speaker labels to IDs

            # Iterate over diarization results (pyannote.audio 4.0)
            # Note: in v4.0, pipeline returns DiarizeOutput, need to access .speaker_diarization
            annotation = (
                diarization.speaker_diarization
                if hasattr(diarization, "speaker_diarization")
                else diarization
            )

            for turn, _, speaker_label in annotation.itertracks(yield_label=True):
                # Map speaker label to numeric ID
                if speaker_label not in speaker_map:
                    speaker_map[speaker_label] = len(speaker_map)

                speaker_id = speaker_map[speaker_label]

                if speaker_id not in speakers:
                    # Detect gender for this specific speaker
                    logger.info(
                        f"Detecting gender for speaker {speaker_id} (label: {speaker_label}) "
                        f"(segment {turn.start:.1f}s-{turn.end:.1f}s)"
                    )
                    speakers[speaker_id] = {
                        "gender": self._detect_speaker_gender_from_segment(
                            audio_path, turn.start, turn.end
                        ),
                        "speech_duration": 0.0,
                    }

                speakers[speaker_id]["speech_duration"] += turn.end - turn.start

                timeline.append({"start": turn.start, "end": turn.end, "speaker_id": speaker_id})

            logger.info(
                f"Diarization complete: {len(speakers)} speakers detected, "
                f"{len(timeline)} turns"
            )

            return {
                "speakers": speakers,
                "timeline": sorted(timeline, key=lambda x: x["start"]),
                "num_speakers": len(speakers),
            }

        except ImportError as e:
            logger.error(f"pyannote.audio not installed: {e}")
            raise RuntimeError(
                "pyannote.audio required for diarization. "
                "Install with: pip install pyannote.audio"
            ) from e
        except Exception as e:
            logger.error(f"Diarization failed: {e}", exc_info=True)
            raise

    def _detect_speaker_gender_from_segment(
        self, audio_path: Path, start: float, end: float
    ) -> str:
        """
        Detect speaker gender using multiple acoustic features.

        Uses a voting system with:
        - F0 (pitch): primary indicator (filtered to voice range)
        - Spectral centroid: women have brighter voices
        - Spectral bandwidth and MFCCs for additional analysis

        Args:
            audio_path: Path to audio file
            start: Segment start time in seconds
            end: Segment end time in seconds

        Returns:
            "male" or "female" based on multi-feature analysis
        """
        try:
            import librosa
            import numpy as np
            from scipy import signal

            # Load segment (use first 10 seconds max for speed)
            duration = min(end - start, 10.0)
            y, sr = librosa.load(str(audio_path), sr=None, offset=start, duration=duration)

            # Apply high-pass filter to remove low-frequency noise/music (< 80 Hz)
            sos = signal.butter(5, 80, "hp", fs=sr, output="sos")
            y_filtered = signal.sosfilt(sos, y)

            votes_female = 0
            votes_male = 0

            # Feature 1: Fundamental frequency (F0) using pyin on filtered audio
            f0, voiced_flag, _ = librosa.pyin(
                y_filtered,
                fmin=80,  # Minimum human voice pitch
                fmax=400,  # Maximum human voice pitch
                sr=sr,
            )
            f0_voiced = f0[voiced_flag]

            # Filter out outliers (keep only typical speech range 80-350 Hz)
            f0_voiced = f0_voiced[(f0_voiced >= 80) & (f0_voiced <= 350)]

            median_pitch = 0
            if len(f0_voiced) > 10:  # Need enough samples
                median_pitch = np.nanmedian(f0_voiced)
                # Thresholds for gender classification:
                # - Definitely male: < 140 Hz
                # - Ambiguous zone: 140-180 Hz
                # - Definitely female: > 180 Hz
                if median_pitch < 140:
                    votes_male += 2
                elif median_pitch > 180:
                    votes_female += 2
                elif median_pitch < 160:
                    votes_male += 1
                else:
                    votes_female += 1

                # Feature 2: F0 variance (women have more pitch variation)
                f0_std = np.nanstd(f0_voiced)
                f0_cv = f0_std / median_pitch if median_pitch > 0 else 0
                if f0_cv > 0.15:  # Higher relative variation = female
                    votes_female += 1
                else:
                    votes_male += 1
            else:
                logger.warning("Insufficient pitch data, using spectral features only")

            # Feature 3: Spectral centroid (brightness) on filtered audio
            spectral_centroid = librosa.feature.spectral_centroid(y=y_filtered, sr=sr)
            mean_centroid = np.mean(spectral_centroid)
            if mean_centroid > 2000:
                votes_female += 1
            elif mean_centroid < 1600:
                votes_male += 1

            # Feature 4: Spectral bandwidth (spread of frequencies)
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y_filtered, sr=sr)
            mean_bandwidth = np.mean(spectral_bandwidth)
            if mean_bandwidth > 1800:
                votes_female += 1
            else:
                votes_male += 1

            # Feature 5: MFCC-based analysis (formant approximation)
            mfccs = librosa.feature.mfcc(y=y_filtered, sr=sr, n_mfcc=13)
            mfcc2_mean = np.mean(mfccs[2])
            if mfcc2_mean > 0:  # Higher = shorter vocal tract = female
                votes_female += 1
            else:
                votes_male += 1

            # Determine gender by voting
            gender = "female" if votes_female > votes_male else "male"

            logger.info(
                f"Gender detection: {gender} "
                f"(pitch={median_pitch:.1f}Hz, centroid={mean_centroid:.0f}Hz, "
                f"bandwidth={mean_bandwidth:.0f}Hz, votes: male={votes_male}, female={votes_female})"
            )
            return gender

        except ImportError:
            logger.warning("librosa not available, defaulting to male")
            return "male"
        except Exception as e:
            logger.error(f"Gender detection failed: {e}, defaulting to male")
            return "male"

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
