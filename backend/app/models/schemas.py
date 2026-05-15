from pydantic import BaseModel, Field


class TranscriptionResponse(BaseModel):
    transcript: str


class EvaluationRequest(BaseModel):
    question_text: str = Field(..., min_length=1)
    expected_signal: str = ""
    transcript_text: str = Field(..., min_length=1)
    target_style: str = "global_startup"
    role_title: str = "Frontend Developer"


class EvaluationResponse(BaseModel):
    overall_score: int
    relevance_score: int
    structure_score: int
    english_clarity_score: int
    culture_fit_score: int
    summary: str
    strengths: list[str]
    issues: list[str]
    improved_answer: str
    culture_tip: str
