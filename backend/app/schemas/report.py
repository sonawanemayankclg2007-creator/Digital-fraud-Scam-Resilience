from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    report_type: str = Field(..., description="PHONE, ACCOUNT, SCAM_MESSAGE, INVESTMENT_SCAM, PHISHING")
    account_id: Optional[str] = None
    phone_number: Optional[str] = None
    description: str = Field(..., min_length=10)
    evidence: Optional[str] = None

class ReportStatusUpdate(BaseModel):
    status: str = Field(..., description="PENDING, UNDER_REVIEW, VERIFIED, REJECTED")

class ReportResponse(BaseModel):
    id: int
    reporter_id: Optional[int] = None
    account_id: Optional[str] = None
    phone_number: Optional[str] = None
    report_type: str
    description: str
    evidence: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
