from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from backend.app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    announcement_id = Column(Integer, nullable=True, index=True)
    channel = Column(String(30), default="DASHBOARD", nullable=False) # DASHBOARD, SMS, WHATSAPP, PUSH, EMAIL
    recipient = Column(String(150), default="dashboard", nullable=False)
    title = Column(String(200), default="Safety Alert", nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="SAFETY_ALERT", nullable=False) # SAFETY_ALERT, SCAM_WARNING, SYSTEM_NOTICE, GENERAL, EMERGENCY
    priority = Column(String(20), default="HIGH", nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime, nullable=True)
    status = Column(String(30), default="DELIVERED", nullable=False) # DELIVERED, SENT, SIMULATED_DEMO, FAILED, QUEUED
    provider_response = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
