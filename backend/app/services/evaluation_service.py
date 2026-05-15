import json

from openai import OpenAI

from app.core.config import settings
from app.models.schemas import EvaluationRequest, EvaluationResponse


async def evaluate_answer(payload: EvaluationRequest) -> EvaluationResponse:
    if settings.openai_api_key:
        return evaluate_with_openai(payload)
    return evaluate_locally(payload)


def evaluate_with_openai(payload: EvaluationRequest) -> EvaluationResponse:
    client = OpenAI(api_key=settings.openai_api_key)
    prompt = {
        "role": payload.role_title,
        "target_style": payload.target_style,
        "question": payload.question_text,
        "expected_signal": payload.expected_signal,
        "answer": payload.transcript_text,
    }

    response = client.responses.create(
        model=settings.openai_text_model,
        input=[
            {
                "role": "system",
                "content": (
                    "You are an interview coach. Return strict JSON with keys: "
                    "overall_score, relevance_score, structure_score, english_clarity_score, "
                    "culture_fit_score, summary, strengths, issues, improved_answer, culture_tip. "
                    "Scores are integers from 1 to 10 except overall_score from 0 to 100."
                ),
            },
            {"role": "user", "content": json.dumps(prompt)},
        ],
    )

    data = json.loads(response.output_text)
    return EvaluationResponse(**data)


def evaluate_locally(payload: EvaluationRequest) -> EvaluationResponse:
    text = payload.transcript_text.strip()
    words = [word for word in text.split() if word]
    lower = text.lower()
    has_result = any(token in lower for token in ["result", "impact", "improved", "delivered", "%"])
    has_structure = any(token in lower for token in ["situation", "task", "action", "result", "because", "then"])
    enough_detail = len(words) >= 45

    relevance = 8 if enough_detail else 5
    structure = 8 if has_structure else 5
    clarity = 8 if 45 <= len(words) <= 160 else 6
    culture = 8 if has_result else 6
    overall = round(((relevance + structure + clarity + culture) / 40) * 100)

    issues = []
    if not enough_detail:
        issues.append("Answer is too short for a senior interview.")
    if not has_structure:
        issues.append("Use a clearer STAR structure.")
    if not has_result:
        issues.append("Add a measurable result or business impact.")

    return EvaluationResponse(
        overall_score=overall,
        relevance_score=relevance,
        structure_score=structure,
        english_clarity_score=clarity,
        culture_fit_score=culture,
        summary="Local fallback evaluation. Add OPENAI_API_KEY for deeper AI feedback.",
        strengths=["Answer is present and can be reviewed."],
        issues=issues or ["No major local rule issue detected."],
        improved_answer=(
            "Start with context, state your responsibility, describe two concrete actions, "
            "and close with a measurable result."
        ),
        culture_tip="Keep the answer concise, respectful, and specific to the role.",
    )
