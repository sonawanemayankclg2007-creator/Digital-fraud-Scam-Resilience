from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
from backend.app.core.database import get_db
from backend.app.models.fraud_report import FraudReport
from backend.app.models.account import Account
from backend.app.models.fraud_network import FraudNetwork
from backend.app.models.notification import Notification
from backend.app.models.audit_log import AuditLog
from backend.app.models.transaction import Transaction
from backend.app.models.user import User
from backend.app.schemas.report import ReportResponse, ReportStatusUpdate
from backend.app.schemas.account import AccountResponse
from backend.app.schemas.notification import NotificationResponse
from backend.app.schemas.auth import UserStatusUpdate, AnalystCreate
from backend.app.services.graph_service import graph_fraud_service
from backend.app.core.security import hash_password
from backend.app.api.deps import get_current_user_optional, require_role, get_current_user

router = APIRouter(prefix="/admin", tags=["Admin & Analyst Moderation"])

def mask_phone(phone: str | None) -> str | None:
    if not phone:
        return None
    phone_clean = phone.strip()
    if len(phone_clean) >= 10:
        return phone_clean[:3] + "******" + phone_clean[-4:]
    return "******"

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_user: User = Depends(require_role(["ADMIN"]))):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    high_risk_alerts = db.query(Notification).filter(Notification.priority.in_(["HIGH", "CRITICAL"])).count()
    reports = db.query(FraudReport).count()
    suspicious_accounts = db.query(Account).filter(Account.risk_score >= 0.7).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "high_risk_alerts": high_risk_alerts,
        "reports": reports,
        "suspicious_accounts": suspicious_accounts
    }

@router.get("/users")
def get_admin_users(
    query: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    q = db.query(User)
    if role and role.upper() != "ALL":
        q = q.filter(User.role == role.upper())
    if status and status.upper() != "ALL":
        if status.upper() == "ACTIVE":
            q = q.filter(User.is_active == True)
        elif status.upper() == "INACTIVE":
            q = q.filter(User.is_active == False)
    
    users = q.order_by(User.created_at.desc()).all()
    
    if query:
        query_lower = query.lower()
        users = [u for u in users if query_lower in u.name.lower() or query_lower in u.email.lower()]

    result = []
    for u in users:
        report_count = db.query(FraudReport).filter(FraudReport.user_id == u.id).count()
        alerts_count = db.query(Notification).filter(Notification.user_id == u.id).count()
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": mask_phone(u.phone),
            "role": u.role,
            "status": "ACTIVE" if u.is_active else "INACTIVE",
            "is_active": u.is_active,
            "language": u.language,
            "reports_submitted": report_count,
            "alerts_received": alerts_count,
            "joined": u.created_at.isoformat() if u.created_at else None,
            "last_active": u.last_active_at.isoformat() if u.last_active_at else None,
        })
    return result

@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    status_payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot alter your own status.")

    target.is_active = status_payload.is_active
    db.commit()

    # Audit log
    action_name = "USER_ACTIVATED" if status_payload.is_active else "USER_DEACTIVATED"
    db.add(AuditLog(
        user_id=current_user.id,
        action=action_name,
        entity_type="USER",
        entity_id=str(target.id),
        timestamp=datetime.now(timezone.utc)
    ))
    db.commit()

    return {"id": target.id, "is_active": target.is_active, "status": "ACTIVE" if target.is_active else "INACTIVE"}

@router.post("/analysts", status_code=status.HTTP_201_CREATED)
def create_analyst_account(
    payload: AnalystCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    analyst = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role="ANALYST",
        language="en",
        notification_consent=True,
        is_active=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(analyst)
    db.commit()
    db.refresh(analyst)

    # Audit log
    db.add(AuditLog(
        user_id=current_user.id,
        action="ANALYST_CREATED",
        entity_type="USER",
        entity_id=str(analyst.id),
        timestamp=datetime.now(timezone.utc)
    ))
    db.commit()

    return {
        "id": analyst.id,
        "name": analyst.name,
        "email": analyst.email,
        "role": analyst.role,
        "status": "ACTIVE",
        "message": "Analyst account created successfully."
    }

@router.patch("/analysts/{analyst_id}/status")
def toggle_analyst_status(
    analyst_id: int,
    status_payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    analyst = db.query(User).filter(User.id == analyst_id, User.role == "ANALYST").first()
    if not analyst:
        raise HTTPException(status_code=404, detail="Analyst not found.")
    
    analyst.is_active = status_payload.is_active
    db.commit()

    action_name = "ANALYST_ACTIVATED" if status_payload.is_active else "ANALYST_DEACTIVATED"
    db.add(AuditLog(
        user_id=current_user.id,
        action=action_name,
        entity_type="USER",
        entity_id=str(analyst.id),
        timestamp=datetime.now(timezone.utc)
    ))
    db.commit()

    return {"id": analyst.id, "is_active": analyst.is_active, "status": "ACTIVE" if analyst.is_active else "INACTIVE"}

@router.get("/reports", response_model=list[ReportResponse])
def get_all_reports_for_admin(db: Session = Depends(get_db), current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))):
    return db.query(FraudReport).order_by(FraudReport.created_at.desc()).all()

@router.patch("/reports/{id}", response_model=ReportResponse)
def moderate_report(
    id: int,
    status_update: ReportStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))
):
    report = db.query(FraudReport).filter(FraudReport.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    
    new_status = status_update.status.upper()
    if new_status not in ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status.")

    report.status = new_status
    db.commit()
    db.refresh(report)

    # Log audit
    audit = AuditLog(
        user_id=current_user.id if current_user else None,
        action=f"REPORT_MODERATED_TO_{new_status}",
        entity_type="FRAUD_REPORT",
        entity_id=str(report.id),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()

    return report

@router.get("/accounts", response_model=list[AccountResponse])
def get_all_accounts(db: Session = Depends(get_db), current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))):
    return db.query(Account).order_by(Account.risk_score.desc()).all()

@router.get("/networks")
def get_admin_networks(db: Session = Depends(get_db), current_user: User = Depends(require_role(["ADMIN", "ANALYST"]))):
    txs = db.query(Transaction).order_by(Transaction.timestamp.desc()).limit(300).all()
    tx_dicts = [
        {"sender_account": t.sender_account, "receiver_account": t.receiver_account, "amount": t.amount}
        for t in txs
    ]
    G = graph_fraud_service.build_directed_graph(tx_dicts)
    rings = graph_fraud_service.detect_fraud_rings(G)
    return rings

@router.get("/notifications", response_model=list[NotificationResponse])
def get_all_notifications(db: Session = Depends(get_db), current_user: User = Depends(require_role(["ADMIN"]))):
    return db.query(Notification).order_by(Notification.sent_at.desc()).limit(100).all()

@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(require_role(["ADMIN"]))):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "timestamp": l.timestamp.isoformat() if l.timestamp else ""
        }
        for l in logs
    ]

