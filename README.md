# Medical Conversation Transcriber (English + Tamil)

A full-stack AI web application for clinical conversation capture. Doctors can record or upload consultation audio, transcribe multilingual speech, translate to English, and generate a concise medical summary.

## Project Overview

This project solves a real clinical workflow problem:

- Capture doctor-patient audio in browser
- Convert speech to text using OpenAI speech model
- Translate transcript to English for standardized review
- Generate structured medical notes for faster follow-up

The app is integrated as a single localhost experience and runs at `http://localhost:8000`.

## Architecture

- Frontend: React + Vite
- Backend: FastAPI
- AI APIs: OpenAI

Data flow:

1. Audio is recorded/uploaded from frontend
2. `POST /api/transcribe` receives file in FastAPI
3. Backend calls OpenAI transcription (`gpt-4o-mini-transcribe`)
4. Backend calls OpenAI translation (`gpt-4.1-mini`)
5. Backend calls OpenAI summarization (`gpt-4.1-mini`)
6. JSON response is rendered in transcript/summary panels

## Tech Stack

### Frontend

- React 18
- Axios
- Vite

### Backend

- FastAPI
- Uvicorn
- python-dotenv
- OpenAI Python SDK

## Folder Structure

```text
F:\Translation_AI
+- .env
+- .gitignore
+- package.json
+- README.md
+- backend
¦  +- main.py
¦  +- requirements.txt
¦  +- routes
¦  ¦  +- transcription.py
¦  +- services
¦  ¦  +- openai_client.py
¦  ¦  +- transcription_service.py
¦  ¦  +- translation_service.py
¦  ¦  +- summary_service.py
¦  +- utils
¦     +- file_handler.py
+- src
¦  +- App.jsx
¦  +- index.css
¦  +- components
¦  ¦  +- Recorder.jsx
¦  ¦  +- Transcript.jsx
¦  ¦  +- Summary.jsx
¦  ¦  +- Loader.jsx
¦  +- services
¦     +- api.js
+- scripts
   +- kill-port.ps1
   +- port-info.ps1
```

## Environment Variables

Create `.env` in project root:

```env
OPENAI_API_KEY=your_openai_api_key
```

Security:

- `.env` is excluded from Git via `.gitignore`
- Backend validates key presence at startup and logs if missing

## Setup Instructions

### 1. Backend dependencies

```powershell
cd F:\Translation_AI
.\.venv\Scripts\python -m pip install -r .\backend\requirements.txt
```

### 2. Frontend dependencies

```powershell
cd F:\Translation_AI
npm install
```

## Run Commands

### Single integrated app (recommended)

```powershell
cd F:\Translation_AI
npm run start
```

Open: `http://localhost:8000`

### Development mode (frontend + backend)

```powershell
cd F:\Translation_AI
npm run dev
```

## API Contract

### Endpoint

- `POST /api/transcribe`

### Request

- `multipart/form-data`
- fields:
  - `audio_file` (required)
  - `language` (optional, example `ta`, `en`, `hi`)
  - `mode` (`transcribe` or `translate`)

### Response

```json
{
  "original_transcript": "...",
  "translated_transcript": "...",
  "summary": "..."
}
```

## UI/UX Highlights

- High-contrast dark AI dashboard style
- Responsive two-panel layout
- Minimal upload surface with modern SaaS styling
- Toast notifications for success/failure
- Stage-based loading messages:
  - Transcribing audio...
  - Generating summary...
- Transcript formatting with speaker labels (`Doctor`, `Patient`)
- Summary formatting sections:
  - Chief Complaint
  - Clinical Notes
  - Recommendation
- Footer: "Powered by OpenAI APIs"

## Assignment Requirement Mapping

- Record, pause, resume, stop: implemented
- Multilingual speech-to-text: implemented via OpenAI
- Translation support: implemented
- Summary generation: implemented
- Web app delivery: implemented
- Integrated localhost app: implemented at `:8000`

## Screenshots

Add screenshots in submission package:

- `screenshots/dashboard.png`
- `screenshots/transcript-summary-output.png`
- `screenshots/api-success-response.png`

## Runtime Validation Checklist

- `npm run start` launches successfully
- Backend health check passes: `GET /api/health`
- Upload processes audio and returns 200 response
- Browser shows no blocking runtime errors
- Backend logs show clean stage progression:
  - transcription started/completed
  - translation started/completed
  - summary started/completed

## FINAL PROJECT REVIEW

### Completed Features

- End-to-end multilingual medical conversation pipeline
- OpenAI transcription, translation, and summarization
- Recording + upload workflow in browser
- Structured transcript and summary rendering
- Error handling, loading states, and success notifications

### Final Architecture

- React frontend (single-page dashboard)
- FastAPI backend (API + static serving)
- OpenAI API integration through dedicated service layer

### APIs Used

- `gpt-4o-mini-transcribe` (speech to text)
- `gpt-4.1-mini` (translation)
- `gpt-4.1-mini` (medical summary generation)

### Submission Readiness

This project now matches assignment goals with production-like structure, clear separation of concerns, polished UX, environment safety, and professional documentation.

## FFmpeg Setup (Deployment)

This repository does **not** bundle FFmpeg binaries, so it stays GitHub-safe and lightweight.

- Current OpenAI-based pipeline does not require local FFmpeg for server-side transcription.
- If your environment needs audio preprocessing in the future, install FFmpeg at system level:
  - Windows: `choco install ffmpeg -y` (Admin shell)
  - Linux (Render/Ubuntu): `apt-get update && apt-get install -y ffmpeg`
  - macOS: `brew install ffmpeg`
