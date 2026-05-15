import logging
import re

from backend.services.openai_client import get_openai_client

logger = logging.getLogger(__name__)


def _normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def _fallback_patient_content(text: str) -> str:
    """Fallback filter when speaker separation is uncertain."""
    normalized = _normalize_whitespace(text)
    if not normalized:
        return ""

    symptom_keywords = (
        "pain", "fever", "cough", "cold", "vomit", "nausea", "weak", "dizzy", "headache",
        "stomach", "breath", "chest", "sugar", "bp", "pressure", "tablet", "medicine",
        "days", "weeks", "months", "since", "severe", "mild", "unable", "sleep", "appetite"
    )

    sentences = re.split(r"(?<=[.!?])\s+", normalized)
    picked = []
    for sentence in sentences:
        line = sentence.strip()
        if not line:
            continue
        lower = line.lower()
        if lower.startswith("doctor:"):
            continue
        if any(keyword in lower for keyword in symptom_keywords):
            picked.append(line)

    if not picked:
        return normalized
    return " ".join(picked)


def extract_patient_content(text: str) -> str:
    """Extract only patient speech/content from full conversation transcript."""
    normalized = _normalize_whitespace(text)
    if not normalized:
        return ""

    client = get_openai_client()
    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            temperature=0,
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are a clinical intake assistant. "
                        "From a doctor-patient transcript, extract ONLY what the patient says. "
                        "Exclude doctor questions/advice. "
                        "Preserve symptom details, timeline, severity, medications, and relevant history. "
                        "Return plain English text only, no bullets, no labels."
                    ),
                },
                {
                    "role": "user",
                    "content": normalized,
                },
            ],
        )
        extracted = _normalize_whitespace(response.output_text)
        if extracted:
            logger.info("patient-content extraction produced %s characters", len(extracted))
            return extracted
    except Exception as exc:
        logger.warning("patient-content extraction failed, using fallback: %s", exc)

    fallback = _fallback_patient_content(normalized)
    logger.info("patient-content fallback produced %s characters", len(fallback))
    return fallback
