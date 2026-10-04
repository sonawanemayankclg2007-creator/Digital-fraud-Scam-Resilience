from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.alert import Alert
from backend.app.models.user import User
from backend.app.schemas.alert import AlertCreate, AlertResponse
from backend.app.api.deps import get_current_user_optional

router = APIRouter(prefix="/alerts", tags=["Safety Alerts"])

@router.post("/create", response_model=AlertResponse)
def create_alert(
    payload: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    alert = Alert(
        user_id=current_user.id if current_user else payload.user_id,
        risk_score=payload.risk_score,
        alert_type=payload.alert_type,
        message=payload.message,
        status="ACTIVE",
        created_at=datetime.now(timezone.utc)
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.get("", response_model=list[AlertResponse])
def get_alerts(limit: int = 50, db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(limit).all()
    return alerts

@router.patch("/{id}/dismiss", response_model=AlertResponse)
def dismiss_alert(id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.status = "DISMISSED"
    db.commit()
    db.refresh(alert)
    return alert
