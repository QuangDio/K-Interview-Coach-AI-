# K-Interview Coach AI

AI interview practice web app for English interviews and Korean company culture preparation.

## Features

- Home page and interview setup flow
- AI-style interview room
- Microphone recording and browser live transcript
- Camera preview with movement feedback
- 100-point rubric report
- Suggested improved answers
- Practice history stored in the browser
- FastAPI backend scaffold for transcription and answer evaluation

## Run Frontend

```bat
start-local-server.bat
```

Open:

```text
http://localhost:5173/
```

## Run Backend

```bat
start-backend-server.bat
```

Copy `.env.example` to `.env` and set `OPENAI_API_KEY` before using real AI APIs.
