from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from backend.app.core.database import Base

class PhoneReport(Base):
    __tablename__ = "phone_reports"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(30), index=True, nullable=False)
    report_type = Column(String(50), default="INVESTMENT_SCAM", nullable=False)
    description = Column(Text, nullable=True)
    report_count = Column(Integer, default=1, nullable=False)
    risk_score = Column(Float, default=50.0, nullable=False)
    verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
