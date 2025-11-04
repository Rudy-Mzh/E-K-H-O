"""Audio processing utilities."""

import logging
from pathlib import Path

import ffmpeg

# Note: pydub requires pyaudioop which is not available in Python 3.13
# Commenting out pydub-related functions for now
# from pydub import AudioSegment as PydubAudioSegment
# from ekho_core.models import AudioSegment, TimeRange

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


# Note: Commenting out pydub-dependent functions (not used in main pipeline)
# def load_audio(
#     audio_path: str | Path, start_time: float | None = None, end_time: float | None = None
# ) -> AudioSegment:
#     """Load audio file and return AudioSegment model."""
#     pass
#
# def save_audio(
#     audio: PydubAudioSegment,
#     output_path: str | Path,
#     format: str = "wav",
#     sample_rate: int | None = None,
# ) -> Path:
#     """Save pydub AudioSegment to file."""
#     pass


def extract_voice_sample_for_cloning(
    audio_path: str | Path,
    output_path: str | Path | None = None,
    start_time: float = 0.0,
    duration: float = 15.0,
) -> Path:
    """
    Extract optimal voice sample for cloning from audio file.

    For best voice cloning with Coqui XTTS-v2:
    - Use 6-30 seconds of clean speech
    - Prefer the beginning where speaker introduces themselves
    - Avoid music, background noise, or multiple speakers

    Args:
        audio_path: Path to source audio file
        output_path: Path for output sample (default: audio_path_sample.wav)
        start_time: Start time in seconds (default: 0.0)
        duration: Duration in seconds (default: 15.0, optimal for XTTS-v2)

    Returns:
        Path to extracted voice sample

    Raises:
        FileNotFoundError: If audio file doesn't exist
        ffmpeg.Error: If ffmpeg processing fails
    """
    audio_path = Path(audio_path)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    if output_path is None:
        output_path = audio_path.parent / f"{audio_path.stem}_voice_sample.wav"
    else:
        output_path = Path(output_path)

    logger.info(
        f"Extracting voice sample for cloning: {start_time}s-{start_time+duration}s "
        f"from {audio_path.name}"
    )

    try:
        stream = ffmpeg.input(str(audio_path), ss=start_time, t=duration)
        stream = ffmpeg.output(
            stream.audio,
            str(output_path),
            acodec="pcm_s16le",
            ar=22050,  # 22kHz is optimal for XTTS-v2
            ac=1,  # mono
            af="loudnorm",  # Normalize loudness for better cloning
        )
        ffmpeg.run(stream, overwrite_output=True, capture_stdout=True, capture_stderr=True)
        logger.info(f"Voice sample extracted: {output_path}")
        return output_path

    except ffmpeg.Error as e:
        logger.error(f"FFmpeg error: {e.stderr.decode() if e.stderr else str(e)}")
        raise


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
