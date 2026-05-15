import logging

from backend.services.openai_client import get_openai_client

logger = logging.getLogger(__name__)


def summarize_text(text: str) -> str:
    """Summarize patient-focused transcript using OpenAI gpt-4.1-mini."""
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
                    "You are an AI symptom intake assistant. "
                    "Create a concise, clinically useful summary in plain English using ONLY patient-reported content. "
                    "Use exactly these 3 sections in order and labels: "
                    "Chief Complaint, Clinical Notes, Recommendation. "
                    "In Clinical Notes include: symptoms, duration/timeline, severity, and medications if present. "
                    "Do not include doctor speech. Do not invent facts. Keep it concise."
                ),
            },
            {"role": "user", "content": normalized},
        ],
    )

    summary = (response.output_text or "").strip()
    logger.info("openai summary produced %s characters", len(summary))
    return summary or "Summary could not be generated."
