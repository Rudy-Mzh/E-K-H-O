"""Translation engine - isolated business logic."""

import logging
import re

from ekho_core.models import TranslationResult
from nmt.config import NMTConfig, get_device, get_model_for_pair
from transformers import MarianMTModel, MarianTokenizer

logger = logging.getLogger(__name__)


def post_process_translation(text: str, target_lang: str) -> str:
    """
    Post-process translated text for more natural, concise output.

    Args:
        text: Translated text to post-process
        target_lang: Target language code

    Returns:
        Post-processed text
    """
    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Fix common issues with French translations
    if target_lang == "fr":
        # Fix spacing before punctuation (French typography)
        text = re.sub(r"\s+([?!:;])", r"\1", text)
        text = re.sub(r"([?!:;])", r" \1", text)
        text = re.sub(r"\s+([.,])", r"\1", text)

        # Remove redundant words that make translation longer
        # (Common in literal translations)
        text = re.sub(r"\bainsi que\b", "et", text)  # "ainsi que" → "et"
        text = re.sub(r"\bafin de\b", "pour", text)  # "afin de" → "pour"
        text = re.sub(r"\ben ce qui concerne\b", "pour", text)

    # Remove duplicate punctuation
    text = re.sub(r"([.!?])\1+", r"\1", text)

    # Ensure sentence starts with capital letter
    if text and not text[0].isupper():
        text = text[0].upper() + text[1:]

    return text


class TranslationEngine:
    """Neural Machine Translation engine using Helsinki-NLP models."""

    def __init__(self, config: NMTConfig):
        """
        Initialize Translation engine.

        Args:
            config: NMTConfig instance
        """
        self.config = config
        self.device = get_device(config)
        self.model = None
        self.tokenizer = None
        self.current_model_name = None
        logger.info(f"Initializing TranslationEngine on device={self.device}")

    def load_model(self, model_name: str | None = None) -> None:
        """
        Load translation model and tokenizer.

        Args:
            model_name: Optional model name to load (defaults to config)
        """
        model_name = model_name or self.config.model_name

        # Check if model is already loaded
        if self.current_model_name == model_name and self.model is not None:
            logger.info(f"Model {model_name} already loaded")
            return

        logger.info(f"Loading translation model: {model_name}")
        try:
            # Load tokenizer
            self.tokenizer = MarianTokenizer.from_pretrained(
                model_name,
                cache_dir=(
                    str(self.config.model_cache_dir) if self.config.model_cache_dir else None
                ),
            )

            # Load model
            self.model = MarianMTModel.from_pretrained(
                model_name,
                cache_dir=(
                    str(self.config.model_cache_dir) if self.config.model_cache_dir else None
                ),
            )

            # Move model to device
            self.model.to(self.device)
            self.model.eval()  # Set to evaluation mode

            self.current_model_name = model_name
            logger.info(f"Model loaded successfully: {model_name}")

        except Exception as e:
            logger.error(f"Failed to load model {model_name}: {e}")
            raise

    def translate(
        self, text: str, source_lang: str = "en", target_lang: str = "fr"
    ) -> TranslationResult:
        """
        Translate text from source language to target language.

        Args:
            text: Text to translate
            source_lang: Source language code (e.g., 'en')
            target_lang: Target language code (e.g., 'fr')

        Returns:
            TranslationResult with translated text

        Raises:
            RuntimeError: If model not loaded
            ValueError: If language pair not supported
        """
        if self.model is None or self.tokenizer is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        # Get appropriate model for language pair
        required_model = get_model_for_pair(source_lang, target_lang)

        # Load correct model if different from current
        if self.current_model_name != required_model:
            logger.info(f"Switching model from {self.current_model_name} to {required_model}")
            self.load_model(required_model)

        logger.info(f"Translating text ({len(text)} chars): {source_lang} → {target_lang}")

        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=self.config.max_length,
            )

            # Move inputs to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # Generate translation with optimized parameters for natural, contextual output
            translated_tokens = self.model.generate(
                **inputs,
                max_length=self.config.max_length,
                num_beams=self.config.num_beams,
                temperature=self.config.temperature,
                do_sample=self.config.do_sample,
                top_k=self.config.top_k,
                top_p=self.config.top_p,
                repetition_penalty=self.config.repetition_penalty,
                length_penalty=self.config.length_penalty,
                early_stopping=True,  # Stop when all beams finish
                no_repeat_ngram_size=3,  # Avoid repeating 3-grams
            )

            # Decode translation
            translated_text = self.tokenizer.decode(translated_tokens[0], skip_special_tokens=True)

            # Post-process for more natural, concise output
            translated_text = post_process_translation(translated_text, target_lang)

            logger.info(f"Translation complete: {len(translated_text)} chars")

            return TranslationResult(
                source_text=text,
                translated_text=translated_text,
                source_language=source_lang,
                target_language=target_lang,
                confidence=None,  # Helsinki-NLP models don't provide confidence scores
            )

        except Exception as e:
            logger.error(f"Translation failed: {e}", exc_info=True)
            raise

    def translate_batch(
        self, texts: list[str], source_lang: str = "en", target_lang: str = "fr"
    ) -> list[TranslationResult]:
        """
        Translate multiple texts in a batch (more efficient).

        Args:
            texts: List of texts to translate
            source_lang: Source language code
            target_lang: Target language code

        Returns:
            List of TranslationResult objects

        Raises:
            RuntimeError: If model not loaded
            ValueError: If language pair not supported or batch too large
        """
        if self.model is None or self.tokenizer is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        if len(texts) > self.config.max_batch_size:
            raise ValueError(
                f"Batch size {len(texts)} exceeds maximum {self.config.max_batch_size}"
            )

        # Get appropriate model for language pair
        required_model = get_model_for_pair(source_lang, target_lang)

        # Load correct model if different from current
        if self.current_model_name != required_model:
            self.load_model(required_model)

        logger.info(f"Translating batch of {len(texts)} texts: {source_lang} → {target_lang}")

        try:
            # Tokenize all inputs
            inputs = self.tokenizer(
                texts,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=self.config.max_length,
            )

            # Move inputs to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # Generate translations with optimized parameters
            translated_tokens = self.model.generate(
                **inputs,
                max_length=self.config.max_length,
                num_beams=self.config.num_beams,
                temperature=self.config.temperature,
                do_sample=self.config.do_sample,
                top_k=self.config.top_k,
                top_p=self.config.top_p,
                repetition_penalty=self.config.repetition_penalty,
                length_penalty=self.config.length_penalty,
                early_stopping=True,
                no_repeat_ngram_size=3,
            )

            # Decode all translations
            results = []
            for i, tokens in enumerate(translated_tokens):
                translated_text = self.tokenizer.decode(tokens, skip_special_tokens=True)
                # Post-process for more natural output
                translated_text = post_process_translation(translated_text, target_lang)
                results.append(
                    TranslationResult(
                        source_text=texts[i],
                        translated_text=translated_text,
                        source_language=source_lang,
                        target_language=target_lang,
                        confidence=None,
                    )
                )

            logger.info(f"Batch translation complete: {len(results)} translations")
            return results

        except Exception as e:
            logger.error(f"Batch translation failed: {e}", exc_info=True)
            raise

    def unload_model(self) -> None:
        """Unload model from memory."""
        if self.model is not None:
            logger.info("Unloading translation model")
            del self.model
            del self.tokenizer
            self.model = None
            self.tokenizer = None
            self.current_model_name = None

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
