from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.fraud_report import FraudReport
from backend.app.models.user import User
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.report import ReportCreate, ReportResponse
from backend.app.api.deps import get_current_user_optional
from backend.app.utils.validators import normalize_phone_number

router = APIRouter(prefix="/reports", tags=["Community Reporting"])

@router.post("", response_model=ReportResponse)
def submit_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    phone_norm = normalize_phone_number(report_in.phone_number) if report_in.phone_number else None
    
    report = FraudReport(
        reporter_id=current_user.id if current_user else None,
        account_id=report_in.account_id.strip() if report_in.account_id else None,
        phone_number=phone_norm,
        report_type=report_in.report_type.upper(),
        description=report_in.description.strip(),
        evidence=report_in.evidence.strip() if report_in.evidence else None,
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Log audit
    audit = AuditLog(
        user_id=current_user.id if current_user else None,
        action="REPORT_SUBMITTED",
        entity_type="FRAUD_REPORT",
        entity_id=str(report.id),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()

    return report

@router.get("", response_model=list[ReportResponse])
def list_reports(
    report_type: str | None = None,
    status_filter: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(FraudReport)
    if report_type:
        query = query.filter(FraudReport.report_type == report_type.upper())
    if status_filter:
        query = query.filter(FraudReport.status == status_filter.upper())
    return query.order_by(FraudReport.created_at.desc()).limit(limit).all()

@router.get("/{id}", response_model=ReportResponse)
def get_report(id: int, db: Session = Depends(get_db)):
    report = db.query(FraudReport).filter(FraudReport.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    return report
