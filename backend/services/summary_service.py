import logging

from backend.services.openai_client import get_openai_client

logger = logging.getLogger(__name__)


def summarize_text(text: str) -> str:
    """Summarize translated transcript using OpenAI gpt-4.1-mini."""
    normalized = (text or "").strip()
    if not normalized:
        return "No transcription available to summarize."

    client = get_openai_client()

    response = client.responses.create(
        model="gpt-4.1-mini",
        temperature=0.2,
        input=[
            {
                "role": "system",
                "content": (
                    "You are a medical scribe assistant. Create a concise, clinically useful summary in plain English. "
                    "Use 3 sections exactly: Chief complaint, Clinical notes, Plan. "
                    "Do not invent facts. Keep it brief and clear."
                ),
            },
            {"role": "user", "content": normalized},
        ],
    )

    summary = (response.output_text or "").strip()
    logger.info("openai summary produced %s characters", len(summary))
    return summary or "Summary could not be generated."
