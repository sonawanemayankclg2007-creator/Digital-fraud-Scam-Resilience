from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    confirm_password: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = "en"
    # Notice: No 'role' parameter allowed here. Backend strictly enforces role=USER!

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    language: str
    notification_consent: bool
    is_active: bool = True
    last_active_at: Optional[datetime] = None
    created_at: datetime

    notification_preferences: Optional[dict] = Field(
        default_factory=lambda: {"dashboard": True, "sms": True, "whatsapp": True, "email": True}
    )

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None
    notification_consent: Optional[bool] = None

class UserStatusUpdate(BaseModel):
    is_active: bool

class AnalystCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
