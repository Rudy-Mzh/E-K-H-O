"""Utility functions for EKHO."""

import hashlib
import tempfile
from pathlib import Path


def generate_file_hash(file_path: str | Path) -> str:
    """
    Generate MD5 hash of a file.

    Args:
        file_path: Path to file

    Returns:
        MD5 hash as hex string
    """
    file_path = Path(file_path)
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


def create_temp_file(suffix: str | None = None, prefix: str | None = "ekho_") -> Path:
    """
    Create a temporary file and return its path.

    Args:
        suffix: File extension (e.g., '.wav')
        prefix: Filename prefix

    Returns:
        Path to temporary file
    """
    fd, path = tempfile.mkstemp(suffix=suffix, prefix=prefix)
    # Close file descriptor but keep the file
    import os

    os.close(fd)
    return Path(path)


def format_timestamp(seconds: float) -> str:
    """
    Format seconds as HH:MM:SS.mmm timestamp.

    Args:
        seconds: Time in seconds

    Returns:
        Formatted timestamp string
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"


def parse_timestamp(timestamp: str) -> float:
    """
    Parse HH:MM:SS.mmm timestamp to seconds.

    Args:
        timestamp: Timestamp string

    Returns:
        Time in seconds
    """
    parts = timestamp.split(":")
    if len(parts) != 3:
        raise ValueError(f"Invalid timestamp format: {timestamp}")

    hours = int(parts[0])
    minutes = int(parts[1])
    seconds = float(parts[2])

    return hours * 3600 + minutes * 60 + seconds
