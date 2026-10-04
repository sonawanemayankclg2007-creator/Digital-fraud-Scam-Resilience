from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NotificationSendRequest(BaseModel):
    user_id: Optional[int] = None
    channel: str = Field(..., description="DASHBOARD, SMS, WHATSAPP, PUSH, EMAIL")
    recipient: str = Field(..., description="Phone number, Email, or user ID")
    title: Optional[str] = "Safety Alert"
    message: str = Field(..., min_length=5)
    notification_type: Optional[str] = "SAFETY_ALERT"
    priority: Optional[str] = "HIGH"
    language: Optional[str] = "en"

class NotificationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    announcement_id: Optional[int] = None
    channel: str
    recipient: str
    title: Optional[str] = "Safety Alert"
    message: str
    notification_type: Optional[str] = "SAFETY_ALERT"
    priority: Optional[str] = "HIGH"
    is_read: bool = False
    read_at: Optional[datetime] = None
    status: str
    provider_response: Optional[str] = None
    sent_at: datetime

    class Config:
        from_attributes = True

class NotificationReadResponse(BaseModel):
    id: int
    is_read: bool
    read_at: Optional[datetime] = None

class UnreadCountResponse(BaseModel):
    unread_count: int
