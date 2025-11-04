"""Setup script for VAD service."""

from setuptools import find_packages, setup

setup(
    name="ekho-vad",
    version="0.1.0",
    description="Voice Activity Detection service for EKHO - Segments audio by pauses",
    packages=find_packages(),
    python_requires=">=3.11",
    install_requires=[
        "fastapi>=0.115.0",
        "uvicorn[standard]>=0.32.0",
        "pydantic>=2.0",
        "pydantic-settings>=2.0",
        "pyannote.audio>=4.0",
        "torch>=2.0",
        "torchaudio>=2.0",
        "ekho-core>=0.1.0",
    ],
)
