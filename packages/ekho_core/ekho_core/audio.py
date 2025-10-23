"""Audio processing utilities."""

import logging
from pathlib import Path

import ffmpeg
from pydub import AudioSegment as PydubAudioSegment

from ekho_core.models import AudioSegment, TimeRange

logger = logging.getLogger(__name__)


def extract_audio_from_video(
    video_path: str | Path,
    output_path: str | Path | None = None,
    sample_rate: int = 16000,
    channels: int = 1,
) -> Path:
    """
    Extract audio from video file using ffmpeg.

    Args:
        video_path: Path to input video file
        output_path: Path for output audio file (default: video_name.wav)
        sample_rate: Target sample rate in Hz (default: 16000 for Whisper)
        channels: Number of audio channels (default: 1 for mono)

    Returns:
        Path to extracted audio file

    Raises:
        FileNotFoundError: If video file doesn't exist
        ffmpeg.Error: If ffmpeg processing fails
    """
    video_path = Path(video_path)
    if not video_path.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    if output_path is None:
        output_path = video_path.with_suffix(".wav")
    else:
        output_path = Path(output_path)

    logger.info(f"Extracting audio from {video_path} to {output_path}")

    try:
        stream = ffmpeg.input(str(video_path))
        stream = ffmpeg.output(
            stream.audio,
            str(output_path),
            acodec="pcm_s16le",
            ar=sample_rate,
            ac=channels,
        )
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)
        logger.info(f"Successfully extracted audio to {output_path}")
        return output_path

    except ffmpeg.Error as e:
        logger.error(f"FFmpeg error: {e.stderr.decode() if e.stderr else str(e)}")
        raise


def load_audio(
    audio_path: str | Path, start_time: float | None = None, end_time: float | None = None
) -> AudioSegment:
    """
    Load audio file and return AudioSegment model.

    Args:
        audio_path: Path to audio file
        start_time: Optional start time in seconds to load from
        end_time: Optional end time in seconds to load until

    Returns:
        AudioSegment with metadata

    Raises:
        FileNotFoundError: If audio file doesn't exist
    """
    audio_path = Path(audio_path)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    logger.info(f"Loading audio from {audio_path}")

    # Load using pydub
    audio = PydubAudioSegment.from_file(str(audio_path))

    # Extract segment if times specified
    if start_time is not None or end_time is not None:
        start_ms = int(start_time * 1000) if start_time else 0
        end_ms = int(end_time * 1000) if end_time else len(audio)
        audio = audio[start_ms:end_ms]

    time_range = None
    if start_time is not None and end_time is not None:
        time_range = TimeRange(start=start_time, end=end_time)

    return AudioSegment(
        audio_path=str(audio_path),
        time_range=time_range,
        sample_rate=audio.frame_rate,
        channels=audio.channels,
        duration=len(audio) / 1000.0,  # Convert ms to seconds
    )


def save_audio(
    audio: PydubAudioSegment,
    output_path: str | Path,
    format: str = "wav",
    sample_rate: int | None = None,
) -> Path:
    """
    Save pydub AudioSegment to file.

    Args:
        audio: Pydub AudioSegment object
        output_path: Path for output file
        format: Audio format (wav, mp3, etc.)
        sample_rate: Optional target sample rate (resamples if different)

    Returns:
        Path to saved audio file
    """
    output_path = Path(output_path)
    logger.info(f"Saving audio to {output_path}")

    # Resample if needed
    if sample_rate and audio.frame_rate != sample_rate:
        logger.info(f"Resampling from {audio.frame_rate}Hz to {sample_rate}Hz")
        audio = audio.set_frame_rate(sample_rate)

    audio.export(str(output_path), format=format)
    logger.info(f"Successfully saved audio to {output_path}")
    return output_path


def combine_audio_video(
    video_path: str | Path, audio_path: str | Path, output_path: str | Path
) -> Path:
    """
    Combine video with new audio track (for final dubbing).

    Args:
        video_path: Path to original video file
        audio_path: Path to new audio file
        output_path: Path for output video file

    Returns:
        Path to output video with new audio

    Raises:
        FileNotFoundError: If video or audio file doesn't exist
        ffmpeg.Error: If ffmpeg processing fails
    """
    video_path = Path(video_path)
    audio_path = Path(audio_path)
    output_path = Path(output_path)

    if not video_path.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    logger.info(f"Combining {video_path} with audio {audio_path} -> {output_path}")

    try:
        video_stream = ffmpeg.input(str(video_path)).video
        audio_stream = ffmpeg.input(str(audio_path)).audio

        stream = ffmpeg.output(
            video_stream,
            audio_stream,
            str(output_path),
            vcodec="copy",  # Copy video without re-encoding
            acodec="aac",  # Encode audio as AAC
            strict="experimental",
        )

        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)
        logger.info(f"Successfully created dubbed video: {output_path}")
        return output_path

    except ffmpeg.Error as e:
        logger.error(f"FFmpeg error: {e.stderr.decode() if e.stderr else str(e)}")
        raise
