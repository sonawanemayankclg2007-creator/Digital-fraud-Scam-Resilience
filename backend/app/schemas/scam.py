from pydantic import BaseModel, Field
from typing import List, Optional

class ScamAnalyzeRequest(BaseModel):
    message_text: str = Field(..., min_length=3, description="Text of SMS, WhatsApp, Email, or Investment message")
    language: Optional[str] = "en"
    source: Optional[str] = "SMS" # SMS, WHATSAPP, TELEGRAM, EMAIL, OTHER

class ScamAnalyzeResponse(BaseModel):
    risk_score: int
    risk_level: str # SAFE, CAUTION, SUSPICIOUS, HIGH_RISK
    scam_type: str
    warning_signals: List[str]
    explanation: str
    recommended_action: str
    confidence: float
    disclaimer: str = "Risk assessment only. This is not investment advice."

class ClaimCheckRequest(BaseModel):
    claim_text: str = Field(..., min_length=3, description="Financial or investment claim text")
    language: Optional[str] = "en"

class ClaimCheckResponse(BaseModel):
    risk_score: int
    risk_level: str
    claim_type: str
    warning_signals: List[str]
    explanation: str
    recommended_action: str
    confidence: float
    unrealistic_factors: List[str]
    disclaimer: str = "Risk assessment only. This is not investment advice."
