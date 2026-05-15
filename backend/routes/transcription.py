from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from backend.services.transcription_service import transcribe_audio
from backend.services.translation_service import translate_text
from backend.services.patient_content_service import extract_patient_content
from backend.services.summary_service import summarize_text
from backend.utils.file_handler import save_upload_file_tmp, remove_file
import logging
import traceback

logger = logging.getLogger(__name__)

transcription_router = APIRouter()

@transcription_router.get("/health")
async def health_check():
    return {"status": "ok"}


@transcription_router.post("/transcribe")
async def transcribe_endpoint(
    audio_file: UploadFile = File(...),
    language: str = Form(None),
    mode: str = Form("translate"),
):
    temp_path = None
    logger.info(
        "transcribe request received: filename=%s content_type=%s language=%s mode=%s",
        audio_file.filename,
        audio_file.content_type,
        language,
        mode,
    )
    try:
        if not audio_file.filename:
            raise HTTPException(status_code=400, detail="No audio filename provided.")

        normalized_mode = (mode or "translate").strip().lower()
        if normalized_mode not in {"transcribe", "translate"}:
            raise HTTPException(status_code=400, detail="Invalid mode. Use 'transcribe' or 'translate'.")

        normalized_language = (language or "").strip().lower() or None

        temp_path = await save_upload_file_tmp(audio_file)
        logger.info("uploaded file saved: path=%s", temp_path)

        logger.info("transcription started")
        original_transcript = transcribe_audio(temp_path, language=normalized_language)
        logger.info("transcription completed")

        logger.info("translation started")
        translated_transcript = (
            translate_text(original_transcript, source_language=normalized_language)
            if normalized_mode == "translate"
            else original_transcript
        )
        logger.info("translation completed")

        logger.info("patient-content extraction started")
        patient_transcript = extract_patient_content(translated_transcript)
        logger.info("patient-content extraction completed")

        logger.info("summary started")
        summary = summarize_text(patient_transcript)
        logger.info("summary completed")

        return JSONResponse(
            status_code=200,
            content={
                "original_transcript": original_transcript,
                "translated_transcript": translated_transcript,
                "patient_transcript": patient_transcript,
                "summary": summary,
            },
        )
    except HTTPException as exc:
        logger.warning("transcribe request failed with HTTPException: %s", exc.detail)
        raise exc
    except Exception as exc:
        logger.error("transcribe pipeline failed: %s", exc)
        logger.error("traceback:\n%s", traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"error": "Unable to process audio", "detail": str(exc)},
        )
    finally:
        try:
            await audio_file.close()
        except Exception:
            pass
        if temp_path:
            remove_file(temp_path)
