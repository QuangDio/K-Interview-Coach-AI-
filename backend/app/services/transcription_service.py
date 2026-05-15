from tempfile import NamedTemporaryFile

from fastapi import UploadFile
from openai import OpenAI

from app.core.config import settings


async def transcribe_audio(file: UploadFile) -> str:
    if not settings.openai_api_key:
        return "Transcription API is not configured. Add OPENAI_API_KEY to .env."

    suffix = f".{file.filename.split('.')[-1]}" if file.filename and "." in file.filename else ".webm"
    contents = await file.read()

    with NamedTemporaryFile(delete=True, suffix=suffix) as temp_file:
        temp_file.write(contents)
        temp_file.flush()

        client = OpenAI(api_key=settings.openai_api_key)
        with open(temp_file.name, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model=settings.openai_transcribe_model,
                file=audio_file,
            )

    return transcription.text
