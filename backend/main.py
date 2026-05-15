from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.transcription import transcription_router
from pathlib import Path
from starlette.responses import Response
import logging
from dotenv import load_dotenv
import os

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

app = FastAPI(
    title="Medical Conversation Transcriber",
    description="AI-powered multilingual medical transcription and summarization API.",
    version="1.0.0",
)


@app.on_event("startup")
async def validate_environment() -> None:
    if not os.getenv("OPENAI_API_KEY"):
        logging.getLogger(__name__).error("OPENAI_API_KEY is missing. Add it to .env before running requests.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcription_router, prefix="/api")

_REPO_ROOT = Path(__file__).resolve().parents[1]
_FRONTEND_DIST = _REPO_ROOT / "dist"
_FRONTEND_INDEX = _FRONTEND_DIST / "index.html"

if _FRONTEND_DIST.exists() and _FRONTEND_INDEX.exists():
    _assets_dir = _FRONTEND_DIST / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")

    @app.get("/", include_in_schema=False)
    async def frontend_root():
        return FileResponse(str(_FRONTEND_INDEX))

    @app.get("/{full_path:path}", include_in_schema=False)
    async def frontend_files_or_spa(full_path: str):
        # Let API routes behave normally.
        if full_path.startswith("api/") or full_path == "api":
            return Response(status_code=404)

        candidate = (_FRONTEND_DIST / full_path).resolve()
        if _FRONTEND_DIST.resolve() in candidate.parents and candidate.is_file():
            return FileResponse(str(candidate))

        return FileResponse(str(_FRONTEND_INDEX))
else:
    @app.get("/")
    async def root():
        return {"message": "Medical transcription backend is running."}
