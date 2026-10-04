from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.phone_report import PhoneReport
from backend.app.models.fraud_report import FraudReport
from backend.app.schemas.phone import PhoneCheckRequest, PhoneRiskResponse
from backend.app.utils.validators import normalize_phone_number
from backend.app.utils.masking import mask_phone_number
from backend.app.services.risk_service import risk_engine

router = APIRouter(prefix="/phone", tags=["Phone Risk Intelligence"])

@router.post("/check", response_model=PhoneRiskResponse)
def check_phone_risk(payload: PhoneCheckRequest, db: Session = Depends(get_db)):
    phone_normalized = normalize_phone_number(payload.phone_number)
    
    # Query PhoneReport table
    phone_rep = db.query(PhoneReport).filter(PhoneReport.phone_number == phone_normalized).first()
    
    # Query community FraudReport table
    community_reps = db.query(FraudReport).filter(FraudReport.phone_number == phone_normalized).all()

    total_rep_count = (phone_rep.report_count if phone_rep else 0) + len(community_reps)
    inv_scams = sum(1 for r in community_reps if r.report_type in ["INVESTMENT_SCAM", "SCAM_MESSAGE"])
    pay_scams = sum(1 for r in community_reps if r.report_type in ["ACCOUNT", "PHONE"])
    phish_scams = sum(1 for r in community_reps if r.report_type == "PHISHING")
    
    if phone_rep:
        if phone_rep.report_type == "INVESTMENT_SCAM":
            inv_scams += phone_rep.report_count
        else:
            pay_scams += phone_rep.report_count

    assoc_reports = max(0, total_rep_count - 1)

    # Risk signals
    active_signals = []
    if total_rep_count >= 5:
        active_signals.append("multiple_user_reports")
        active_signals.append("scam_language_indicators")
    elif total_rep_count >= 2:
        active_signals.append("multiple_user_reports")

    score, level = risk_engine.calculate_score(active_signals)
    if total_rep_count >= 5:
        score = max(score, 78)
        level = "HIGH_RISK" if score >= 81 else "SUSPICIOUS"
    elif total_rep_count >= 1:
        score = max(score, 45)
        level = "CAUTION" if score <= 60 else "SUSPICIOUS"
    else:
        score = 15
        level = "SAFE"

    warning_signals = []
    if total_rep_count > 0:
        warning_signals.append(f"Reported {total_rep_count} times in the community resilience registry")
    if inv_scams > 0:
        warning_signals.append(f"{inv_scams} reports linked to unverified investment solicitations")
    if pay_scams > 0:
        warning_signals.append(f"{pay_scams} reports linked to urgent payment demands")
    if not warning_signals:
        warning_signals.append("No active community scam complaints lodged against this number.")

    rec = "Do not transfer money or share sensitive financial information until the contact is independently verified."
    if level == "SAFE":
        rec = "Standard caution: Always independently confirm the identity of unknown callers before sharing financial information."

    return {
        "phone_number": phone_normalized,
        "masked_phone": mask_phone_number(phone_normalized),
        "risk_level": level,
        "risk_score": score,
        "total_reports": total_rep_count,
        "investment_scam_reports": inv_scams,
        "payment_scam_reports": pay_scams,
        "phishing_reports": phish_scams,
        "associated_reports": assoc_reports,
        "warning_signals": warning_signals,
        "recommendation": rec,
        "disclaimer": "Potentially suspicious based on community reports and risk indicators detected. Not a definitive legal finding."
    }
