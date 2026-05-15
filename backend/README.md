# K-Interview Coach AI Backend

FastAPI backend scaffold for the interview coach.

## Setup

```powershell
cd backend
python -m pip install -r requirements.txt
copy ..\.env.example ..\.env
```

Then add your `OPENAI_API_KEY` to `..\.env`.

## Run

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

## API

- `GET /health`
- `POST /api/transcribe`
- `POST /api/evaluate`

The services include local fallback behavior so the API shape can be tested before wiring a paid AI key.
