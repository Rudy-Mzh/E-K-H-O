"""OpenAI LLM engine for contextual translation."""

import json
import logging
import re

from openai import OpenAI

from llm.config import LLMConfig

logger = logging.getLogger(__name__)


class OpenAIEngine:
    """OpenAI LLM engine for contextual, natural translation."""

    def __init__(self, config: LLMConfig):
        """
        Initialize OpenAI engine.

        Args:
            config: LLMConfig instance
        """
        self.config = config
        self.client = None
        logger.info(f"Initializing OpenAI engine with model={config.openai_model}")

    def load_model(self) -> None:
        """Configure OpenAI API client."""
        if not self.config.openai_api_key:
            raise ValueError("OPENAI_API_KEY not configured")

        logger.info("Configuring OpenAI API...")
        try:
            self.client = OpenAI(api_key=self.config.openai_api_key)
            logger.info("OpenAI API configured successfully")

        except Exception as e:
            logger.error(f"Failed to configure OpenAI: {e}")
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
            RuntimeError: If client not initialized
        """
        if self.client is None:
            raise RuntimeError("Client not initialized. Call load_model() first.")

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
            response = self.client.chat.completions.create(
                model=self.config.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.config.temperature,
                max_tokens=1024,
            )

            context = response.choices[0].message.content
            logger.info(f"Context analysis complete: {len(context)} chars")
            return context

        except Exception as e:
            logger.error(f"Context analysis failed: {e}", exc_info=True)
            raise

    def analyze_deep_context(
        self, full_transcript: str, source_lang: str, target_lang: str
    ) -> dict:
        """
        Deep contextual analysis for professional translation (Phase 1).

        Args:
            full_transcript: Complete transcription of video
            source_lang: Source language code
            target_lang: Target language code

        Returns:
            Structured context as dict

        Raises:
            RuntimeError: If client not initialized
        """
        if self.client is None:
            raise RuntimeError("Client not initialized. Call load_model() first.")

        logger.info(f"Deep context analysis for {len(full_transcript)} chars")

        prompt = f"""Analyse approfondie de ce contenu vidéo pour traduction professionnelle de haute qualité.

LANGUE: {source_lang} → {target_lang}

TRANSCRIPTION COMPLÈTE:
{full_transcript}

MISSION: Extraire tous les éléments critiques pour une traduction contextuelle optimale.

FOURNIR (format JSON structuré):
{{
  "subject": {{
    "main_topic": "Sujet principal détaillé",
    "sub_themes": ["sous-thème 1", "sous-thème 2"],
    "author_intent": "Intention de l'auteur"
  }},
  "narrative_arc": {{
    "structure": "Introduction / Développement / Conclusion",
    "key_points": ["point clé 1 avec timing approximatif", "point clé 2"],
    "emotional_moments": ["moment émotionnel fort 1", "moment 2"]
  }},
  "glossary": {{
    "technical_terms": {{"terme1": "traduction recommandée", "terme2": "traduction"}},
    "recurring_terms": {{"terme récurrent": "traduction cohérente"}},
    "proper_nouns": ["Nom propre 1", "Nom propre 2"]
  }},
  "tone_style": {{
    "register": "formel / informel / technique / conversationnel",
    "dominant_emotion": "émotion principale",
    "style": "pédagogique / informatif / divertissant / etc."
  }},
  "attention_points": {{
    "wordplay": ["jeu de mots 1"],
    "cultural_references": ["référence culturelle nécessitant adaptation"],
    "idioms": ["expression idiomatique"],
    "difficult_concepts": ["concept difficile à traduire"]
  }},
  "target_audience": {{
    "demographic": "Profil démographique",
    "knowledge_level": "Niveau de connaissance supposé",
    "expectations": "Attentes du public"
  }}
}}

IMPORTANT: Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après."""

        try:
            response = self.client.chat.completions.create(
                model=self.config.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,  # Lower temperature for structured output
                max_tokens=2048,
            )

            response_text = response.choices[0].message.content.strip()

            # Try to extract JSON if wrapped in markdown code blocks
            json_match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)

            context_data = json.loads(response_text)
            logger.info("Deep context analysis complete (structured)")
            return context_data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON context: {e}")
            logger.error(f"Response text: {response_text}")
            return {"raw_analysis": response_text}

        except Exception as e:
            logger.error(f"Deep context analysis failed: {e}", exc_info=True)
            raise

    def translate_global(
        self,
        full_transcript: str,
        deep_context: dict,
        source_lang: str,
        target_lang: str,
    ) -> str:
        """
        Global translation with pause markers (Phase 2).

        Args:
            full_transcript: Complete transcription to translate
            deep_context: Structured context from analyze_deep_context()
            source_lang: Source language code
            target_lang: Target language code

        Returns:
            Translated text with [PAUSE] markers

        Raises:
            RuntimeError: If client not initialized
        """
        if self.client is None:
            raise RuntimeError("Client not initialized. Call load_model() first.")

        logger.info(f"Global translation: {len(full_transcript)} chars")

        context_str = json.dumps(deep_context, ensure_ascii=False, indent=2)

        prompt = f"""Traduction professionnelle de haute qualité pour doublage vidéo.

CONTEXTE ENRICHI:
{context_str}

LANGUE: {source_lang} → {target_lang}

TRANSCRIPTION À TRADUIRE:
{full_transcript}

INSTRUCTIONS:
1. Utiliser le glossaire terminologique pour assurer la cohérence
2. Respecter rigoureusement le ton et style identifiés
3. Adapter les références culturelles selon le public cible
4. Insérer [PAUSE] aux pauses naturelles du discours (fin de phrases, respirations)
5. Privilégier la fluidité, l'impact émotionnel et le naturel sur la littéralité stricte
6. Longueur cible: ±15% de l'original (acceptable)
7. Sonner naturel à l'oral, pas écrit

IMPORTANT: Fournir UNIQUEMENT la traduction finale en {target_lang} avec les marqueurs [PAUSE], sans explications ni formatage additionnel.

TRADUCTION AVEC MARQUEURS [PAUSE]:"""

        try:
            response = self.client.chat.completions.create(
                model=self.config.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.config.temperature,
                max_tokens=16384,  # Increased for long videos (5+ minutes)
            )

            translated_text = response.choices[0].message.content.strip()
            logger.info(
                f"Global translation complete: {len(translated_text)} chars, "
                f"{translated_text.count('[PAUSE]')} pauses"
            )
            return translated_text

        except Exception as e:
            logger.error(f"Global translation failed: {e}", exc_info=True)
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
            RuntimeError: If client not initialized
        """
        if self.client is None:
            raise RuntimeError("Client not initialized. Call load_model() first.")

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
            response = self.client.chat.completions.create(
                model=self.config.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
            )

            translated_text = response.choices[0].message.content.strip()
            logger.info(f"Translation complete: {len(translated_text)} chars")
            return translated_text

        except Exception as e:
            logger.error(f"Translation failed: {e}", exc_info=True)
            raise

    def unload_model(self) -> None:
        """Unload model (cleanup)."""
        logger.info("Unloading OpenAI client")
        self.client = None
