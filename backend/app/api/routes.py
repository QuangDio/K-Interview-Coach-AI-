from fastapi import APIRouter, File, UploadFile

from app.models.schemas import EvaluationRequest, EvaluationResponse, TranscriptionResponse
from app.services.evaluation_service import evaluate_answer
from app.services.transcription_service import transcribe_audio

router = APIRouter()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(file: UploadFile = File(...)) -> TranscriptionResponse:
    transcript = await transcribe_audio(file)
    return TranscriptionResponse(transcript=transcript)


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate(payload: EvaluationRequest) -> EvaluationResponse:
    return await evaluate_answer(payload)
