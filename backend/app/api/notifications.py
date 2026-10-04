from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.notification import Notification
from backend.app.models.user import User
from backend.app.schemas.notification import (
    NotificationSendRequest,
    NotificationResponse,
    NotificationReadResponse,
    UnreadCountResponse
)
from backend.app.services.notification_service import notification_orchestrator
from backend.app.api.deps import get_current_user_optional, get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/send")
async def send_notification(
    payload: NotificationSendRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else payload.user_id
    result = await notification_orchestrator.send_security_alert(
        db=db,
        channel=payload.channel,
        recipient=payload.recipient,
        user_id=user_id,
        risk_level=payload.priority or "HIGH",
        custom_reason=payload.message,
        language=payload.language or "en"
    )
    return result

@router.get("", response_model=list[NotificationResponse])
def get_notification_history(
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    query = db.query(Notification)
    if current_user:
        query = query.filter(
            (Notification.user_id == current_user.id) | (Notification.user_id == None)
        )
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    return query.order_by(Notification.sent_at.desc()).limit(limit).all()

@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    query = db.query(Notification).filter(Notification.is_read == False)
    if current_user:
        query = query.filter(
            (Notification.user_id == current_user.id) | (Notification.user_id == None)
        )
    count = query.count()
    return {"unread_count": count}

@router.patch("/{notification_id}/read", response_model=NotificationReadResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    
    notif.is_read = True
    notif.read_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(notif)
    return {"id": notif.id, "is_read": notif.is_read, "read_at": notif.read_at}

@router.patch("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    query = db.query(Notification).filter(Notification.is_read == False)
    if current_user:
        query = query.filter(
            (Notification.user_id == current_user.id) | (Notification.user_id == None)
        )
    
    now = datetime.now(timezone.utc)
    updated_count = query.update(
        {Notification.is_read: True, Notification.read_at: now},
        synchronize_session="fetch"
    )
    db.commit()
    return {"status": "success", "marked_read": updated_count}

