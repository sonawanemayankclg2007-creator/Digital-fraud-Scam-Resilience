from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from backend.app.core.database import Base

class ScamMessage(Base):
    __tablename__ = "scam_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    message_text = Column(Text, nullable=False)
    language = Column(String(10), default="en", nullable=False)
    scam_type = Column(String(100), default="Unknown", nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False)
    risk_level = Column(String(20), default="SAFE", nullable=False)
    ai_explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
