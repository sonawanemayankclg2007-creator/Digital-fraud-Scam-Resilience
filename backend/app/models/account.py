from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from backend.app.core.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_identifier = Column(String(100), unique=True, index=True, nullable=False) # e.g. UPI ID or bank account
    account_type = Column(String(50), default="UPI", nullable=False) # UPI, BANK_ACCOUNT, WALLET
    risk_score = Column(Float, default=0.0, nullable=False)
    risk_level = Column(String(20), default="SAFE", nullable=False) # SAFE, CAUTION, SUSPICIOUS, HIGH_RISK
    status = Column(String(30), default="ACTIVE", nullable=False) # ACTIVE, FLAGGED, FROZEN, UNDER_MONITORING
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
