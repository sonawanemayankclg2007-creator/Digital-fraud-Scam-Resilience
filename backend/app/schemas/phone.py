from pydantic import BaseModel
from typing import List, Optional

class PhoneCheckRequest(BaseModel):
    phone_number: str

class PhoneRiskResponse(BaseModel):
    phone_number: str
    masked_phone: str
    risk_level: str # SAFE, CAUTION, SUSPICIOUS, HIGH_RISK
    risk_score: int
    total_reports: int
    investment_scam_reports: int
    payment_scam_reports: int
    phishing_reports: int
    associated_reports: int
    warning_signals: List[str]
    recommendation: str
    disclaimer: str = "Potentially suspicious based on community reports and risk indicators detected. Not a definitive legal finding."
