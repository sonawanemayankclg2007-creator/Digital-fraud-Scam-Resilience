from pydantic import BaseModel
from typing import List, Dict, Any

class StatCard(BaseModel):
    title: str
    value: Any
    change: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class RiskDistributionItem(BaseModel):
    name: str # Safe, Caution, Suspicious, High Risk
    value: int
    color: str

class TrendPoint(BaseModel):
    date: str
    scam_checks: int
    high_risk_alerts: int
    blocked_attempts: int

class ScamCategoryItem(BaseModel):
    category: str
    count: int
    percentage: float

class DashboardSummary(BaseModel):
    protection_status: str
    total_checks: int
    high_risk_alerts: int
    suspicious_accounts: int
    reports_submitted: int
    safe_transactions_value: float
    intercepted_potential_loss: float
    risk_distribution: List[RiskDistributionItem]
    trend_data: List[TrendPoint]
    scam_categories: List[ScamCategoryItem]
