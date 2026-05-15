import shutil
import tempfile
from pathlib import Path
from fastapi import UploadFile


async def save_upload_file_tmp(upload_file: UploadFile) -> str:
    suffix = Path(upload_file.filename).suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        shutil.copyfileobj(upload_file.file, tmp_file)
        return tmp_file.name


def remove_file(path: str) -> None:
    try:
        if Path(path).exists():
            Path(path).unlink()
    except OSError:
        pass
