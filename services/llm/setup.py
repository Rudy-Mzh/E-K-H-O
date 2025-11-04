"""Setup script for LLM service."""

from setuptools import find_packages, setup

setup(
    name="ekho-llm",
    version="0.1.0",
    description="LLM service for EKHO - Contextual translation with Gemini",
    packages=find_packages(),
    python_requires=">=3.11",
    install_requires=[
        "fastapi>=0.115.0",
        "uvicorn[standard]>=0.32.0",
        "pydantic>=2.0",
        "pydantic-settings>=2.0",
        "google-generativeai>=0.8.0",
        "python-dotenv>=1.0.0",
        "ekho-core>=0.1.0",
    ],
)
