from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from backend.app.core.database import Base

class FraudReport(Base):
    __tablename__ = "fraud_reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, nullable=True)
    account_id = Column(String(100), nullable=True)
    phone_number = Column(String(30), nullable=True)
    report_type = Column(String(50), nullable=False) # PHONE, ACCOUNT, SCAM_MESSAGE, INVESTMENT_SCAM, PHISHING
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    status = Column(String(30), default="PENDING", nullable=False) # PENDING, UNDER_REVIEW, VERIFIED, REJECTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
