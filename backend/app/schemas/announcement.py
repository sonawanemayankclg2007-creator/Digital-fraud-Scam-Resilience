from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10)
    alert_type: Optional[str] = "SAFETY_ALERT" # GENERAL, SAFETY_ALERT, SCAM_WARNING, SYSTEM_NOTICE, EMERGENCY
    priority: Optional[str] = "HIGH" # LOW, MEDIUM, HIGH, CRITICAL
    target_type: Optional[str] = "ALL_USERS" # ALL_USERS, SPECIFIC_USERS
    target_audience: Optional[str] = None
    target_user_ids: Optional[List[int]] = None
    language: Optional[str] = "en"
    expires_at: Optional[datetime] = None
    send_external: Optional[bool] = False # Optional SMS/WhatsApp dispatch if high priority

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    alert_type: Optional[str] = None
    priority: Optional[str] = None
    target_type: Optional[str] = None
    target_user_ids: Optional[List[int]] = None
    language: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None

class AnnouncementStatusUpdate(BaseModel):
    is_active: bool

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    message: str
    alert_type: str
    priority: str
    target_type: str
    target_user_ids: Optional[str] = None
    language: str
    created_by: Optional[int] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True

class AnnouncementSendRequest(BaseModel):
    send_external: Optional[bool] = False
    target_user_ids: Optional[List[int]] = None

class AnnouncementRecipientsRequest(BaseModel):
    recipient_user_ids: List[int]
    notify_immediately: Optional[bool] = True

