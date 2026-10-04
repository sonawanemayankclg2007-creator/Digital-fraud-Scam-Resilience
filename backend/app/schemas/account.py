from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AccountCheckRequest(BaseModel):
    account_identifier: str # UPI VPA or account number

class AccountTransactionItem(BaseModel):
    id: int
    sender_account: str
    receiver_account: str
    amount: float
    timestamp: datetime
    status: str
    risk_score: float

    class Config:
        from_attributes = True

class AccountRiskResponse(BaseModel):
    account_identifier: str
    masked_identifier: str
    account_type: str
    risk_score: int
    risk_level: str # SAFE, CAUTION, SUSPICIOUS, HIGH_RISK
    signals: List[str]
    explanation: str
    potential_mule: bool
    mule_indicators: List[str]
    in_degree: int
    out_degree: int
    total_received: float
    total_sent: float
    transaction_count: int
    recommended_action: str
    disclaimer: str = "Risk indicators detected based on network behavior. Not a definitive legal or criminal finding."

class AccountResponse(BaseModel):
    id: int
    account_identifier: str
    account_type: str
    risk_score: float
    risk_level: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
