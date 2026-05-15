import logging

from backend.services.openai_client import get_openai_client

logger = logging.getLogger(__name__)


def translate_text(text: str, source_language: str | None = None) -> str:
    """Translate transcript text to English using OpenAI gpt-4.1-mini."""
    normalized = (text or "").strip()
    if not normalized:
        return ""

    client = get_openai_client()
    language_hint = source_language or "auto-detect"

    response = client.responses.create(
        model="gpt-4.1-mini",
        temperature=0,
        input=[
            {
                "role": "system",
                "content": (
                    "You are a medical conversation translator. Translate user text to natural English. "
                    "Preserve medical meaning, numbers, medication names, and speaker intent. "
                    "Return only translated text."
                ),
            },
            {
                "role": "user",
                "content": f"Source language hint: {language_hint}\n\nText:\n{normalized}",
            },
        ],
    )

    translated = (response.output_text or "").strip()
    logger.info("openai translation produced %s characters", len(translated))
    return translated or normalized
