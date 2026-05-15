import logging
from pathlib import Path
from typing import Optional

from backend.services.openai_client import get_openai_client

logger = logging.getLogger(__name__)


def transcribe_audio(file_path: str, language: Optional[str] = None) -> str:
    """Transcribe audio using OpenAI gpt-4o-mini-transcribe."""
    target = Path(file_path)
    if not target.exists():
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    client = get_openai_client()

    with target.open("rb") as audio_stream:
        response = client.audio.transcriptions.create(
            model="gpt-4o-mini-transcribe",
            file=audio_stream,
            language=language or None,
        )

    transcript = (response.text or "").strip()
    logger.info("openai transcription produced %s characters", len(transcript))
    return transcript
