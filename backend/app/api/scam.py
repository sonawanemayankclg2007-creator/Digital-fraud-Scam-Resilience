import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.scam_message import ScamMessage
from backend.app.models.risk_assessment import RiskAssessment
from backend.app.models.user import User
from backend.app.schemas.scam import (
    ScamAnalyzeRequest, ScamAnalyzeResponse,
    ClaimCheckRequest, ClaimCheckResponse
)
from backend.app.services.gemini_service import gemini_ai_service
from backend.app.api.deps import get_current_user_optional

router = APIRouter(prefix="/scam", tags=["Scam Analysis"])

@router.post("/analyze", response_model=ScamAnalyzeResponse)
async def analyze_message(
    payload: ScamAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    result = await gemini_ai_service.analyze_scam_message(
        payload.message_text,
        language=payload.language or "en"
    )

    user_id = current_user.id if current_user else None

    # Persist in scam_messages table
    scam_rec = ScamMessage(
        user_id=user_id,
        message_text=payload.message_text[:1000],
        language=payload.language or "en",
        scam_type=result.get("scam_type", "Unknown"),
        risk_score=float(result.get("risk_score", 0)),
        risk_level=result.get("risk_level", "SAFE"),
        ai_explanation=result.get("explanation", ""),
        created_at=datetime.now(timezone.utc)
    )
    db.add(scam_rec)
    db.commit()
    db.refresh(scam_rec)

    # Persist in risk_assessments
    risk_assessment = RiskAssessment(
        entity_type="MESSAGE",
        entity_id=str(scam_rec.id),
        risk_score=float(result.get("risk_score", 0)),
        risk_level=result.get("risk_level", "SAFE"),
        signals=json.dumps(result.get("warning_signals", [])),
        explanation=result.get("explanation", ""),
        created_at=datetime.now(timezone.utc)
    )
    db.add(risk_assessment)
    db.commit()

    return result

@router.post("/claim-check", response_model=ClaimCheckResponse)
async def check_investment_claim(
    payload: ClaimCheckRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    result = await gemini_ai_service.analyze_investment_claim(
        payload.claim_text,
        language=payload.language or "en"
    )

    # Persist in risk_assessments
    risk_assessment = RiskAssessment(
        entity_type="CLAIM",
        entity_id=payload.claim_text[:50],
        risk_score=float(result.get("risk_score", 0)),
        risk_level=result.get("risk_level", "SAFE"),
        signals=json.dumps(result.get("warning_signals", [])),
        explanation=result.get("explanation", ""),
        created_at=datetime.now(timezone.utc)
    )
    db.add(risk_assessment)
    db.commit()

    return result
