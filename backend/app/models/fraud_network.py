from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from backend.app.core.database import Base

class FraudNetwork(Base):
    __tablename__ = "fraud_networks"

    id = Column(Integer, primary_key=True, index=True)
    network_name = Column(String(100), nullable=False)
    risk_score = Column(Float, default=0.0, nullable=False)
    account_count = Column(Integer, default=0, nullable=False)
    suspicious_account_count = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
