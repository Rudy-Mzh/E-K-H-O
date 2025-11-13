"""Gemini LLM engine for contextual translation."""

import logging

import google.generativeai as genai
from llm.config import LLMConfig

logger = logging.getLogger(__name__)


class GeminiEngine:
    """Gemini LLM engine for contextual, natural translation."""

    def __init__(self, config: LLMConfig):
        """
        Initialize Gemini engine.

        Args:
            config: LLMConfig instance
        """
        self.config = config
        self.model = None
        logger.info(f"Initializing Gemini engine with model={config.gemini_model}")

    def load_model(self) -> None:
        """Configure Gemini API."""
        if not self.config.gemini_api_key:
            raise ValueError("GEMINI_API_KEY not configured")

        logger.info("Configuring Gemini API...")
        try:
            genai.configure(api_key=self.config.gemini_api_key)
            self.model = genai.GenerativeModel(self.config.gemini_model)
            logger.info("Gemini API configured successfully")

        except Exception as e:
            logger.error(f"Failed to configure Gemini: {e}")
            raise

    def analyze_context(self, full_transcript: str, source_lang: str, target_lang: str) -> str:
        """
        Analyze full transcript to extract context.

        Args:
            full_transcript: Complete transcription of video
            source_lang: Source language code
            target_lang: Target language code

        Returns:
            Context description

        Raises:
            RuntimeError: If model not loaded
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        logger.info(f"Analyzing context for {len(full_transcript)} chars")

        prompt = f"""Analyze this video transcript and provide a detailed context for translation.

Language: {source_lang} → {target_lang}

Transcript:
{full_transcript}

Provide:
1. Subject/Topic (e.g., "Warhammer painting tutorial")
2. Tone (e.g., "pedagogical, friendly")
3. Target audience (e.g., "hobbyists, beginners")
4. Specific vocabulary to preserve
5. Style notes for translation

Context Analysis:"""

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=self.config.temperature,
                    max_output_tokens=1024,
                ),
            )

            context = response.text
            logger.info(f"Context analysis complete: {len(context)} chars")
            return context

        except Exception as e:
            logger.error(f"Context analysis failed: {e}", exc_info=True)
            raise

    def translate_segment(
        self,
        text: str,
        context: str,
        source_lang: str,
        target_lang: str,
        target_duration: float,
    ) -> str:
        """
        Translate a segment with context awareness and timing constraint.

        Args:
            text: Text segment to translate
            context: Global context from analyze_context()
            source_lang: Source language code
            target_lang: Target language code
            target_duration: Target duration in seconds for audio

        Returns:
            Translated text optimized for target duration

        Raises:
            RuntimeError: If model not loaded
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        logger.info(
            f"Translating segment: {len(text)} chars, target duration={target_duration:.1f}s"
        )

        prompt = f"""Translate this text segment for video dubbing with strict timing constraints.

CONTEXT:
{context}

SOURCE LANGUAGE: {source_lang}
TARGET LANGUAGE: {target_lang}
ORIGINAL TEXT: "{text}"
TARGET DURATION: ~{target_duration:.1f} seconds

REQUIREMENTS:
1. Translation must match the original duration (±10%)
2. Preserve meaning and natural flow
3. Use context-appropriate vocabulary
4. Sound natural when spoken aloud
5. Maintain tone from context

IMPORTANT: Provide ONLY the final translated text in {target_lang}, without any explanations, options, or additional formatting. Just the translation itself.

Translation:"""

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=self.config.temperature,
                    max_output_tokens=self.config.max_tokens,
                ),
            )

            translated_text = response.text.strip()
            logger.info(f"Translation complete: {len(translated_text)} chars")
            return translated_text

        except Exception as e:
            logger.error(f"Translation failed: {e}", exc_info=True)
            raise

    def unload_model(self) -> None:
        """Unload model (cleanup)."""
        logger.info("Unloading Gemini model")
        self.model = None
