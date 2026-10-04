from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from backend.app.core.database import Base

class AdminAnnouncement(Base):
    __tablename__ = "admin_announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    alert_type = Column(String(50), default="SAFETY_ALERT", nullable=False) # GENERAL, SAFETY_ALERT, SCAM_WARNING, SYSTEM_NOTICE, EMERGENCY
    priority = Column(String(20), default="HIGH", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    target_type = Column(String(50), default="ALL_USERS", nullable=False) # ALL_USERS, SPECIFIC_USERS
    target_user_ids = Column(Text, nullable=True) # JSON array of IDs e.g. "[3, 4]"
    language = Column(String(10), default="en", nullable=False) # en, hi, gu
    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
