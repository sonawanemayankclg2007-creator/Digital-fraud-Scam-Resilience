from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.translation_service import translation_service

router = APIRouter(prefix="/translate", tags=["Translation"])

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "hi" # hi, gu, en

class TranslateResponse(BaseModel):
    original_text: str
    translated_text: str
    target_language: str

@router.post("", response_model=TranslateResponse)
async def translate_text(payload: TranslateRequest):
    translated = await translation_service.translate_text(
        text=payload.text,
        target_language=payload.target_language
    )
    return TranslateResponse(
        original_text=payload.text,
        translated_text=translated,
        target_language=payload.target_language
    )
