from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from backend.app.core.database import Base

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False) # MESSAGE, ACCOUNT, PHONE, TRANSACTION, CLAIM
    entity_id = Column(String(100), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False) # SAFE, CAUTION, SUSPICIOUS, HIGH_RISK
    signals = Column(Text, nullable=True) # JSON encoded list of detected signals
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
