from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertCreate(BaseModel):
    user_id: Optional[int] = None
    risk_score: float
    alert_type: str
    message: str

class AlertResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    risk_score: float
    alert_type: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
