from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from backend.app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    risk_score = Column(Float, nullable=False)
    alert_type = Column(String(50), nullable=False) # SCAM_MESSAGE, ACCOUNT_RISK, TRANSACTION_ANOMALY, FRAUD_RING
    message = Column(Text, nullable=False)
    status = Column(String(30), default="ACTIVE", nullable=False) # ACTIVE, ACKNOWLEDGED, DISMISSED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
