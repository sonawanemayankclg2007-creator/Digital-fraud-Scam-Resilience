from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class TransactionCreate(BaseModel):
    sender_account: str
    receiver_account: str
    amount: float = Field(..., gt=0)
    status: Optional[str] = "COMPLETED"

class TransactionAnalyzeRequest(BaseModel):
    sender_account: str
    receiver_account: str
    amount: float = Field(..., gt=0)

class TransactionRiskResult(BaseModel):
    sender_account: str
    receiver_account: str
    amount: float
    risk_score: int
    risk_level: str # SAFE, CAUTION, SUSPICIOUS, HIGH_RISK
    signals: List[str]
    explanation: str
    recommendation: str
    rapid_transfer_detected: bool
    unusual_amount_detected: bool
    circular_flow_detected: bool
    potential_mule_involved: bool

class TransactionResponse(BaseModel):
    id: int
    sender_account: str
    receiver_account: str
    amount: float
    timestamp: datetime
    status: str
    risk_score: float

    class Config:
        from_attributes = True
