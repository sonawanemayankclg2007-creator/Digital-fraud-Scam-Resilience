import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.announcement import AdminAnnouncement
from backend.app.models.notification import Notification
from backend.app.models.user import User
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.announcement import (
    AnnouncementCreate, AnnouncementUpdate,
    AnnouncementStatusUpdate, AnnouncementResponse,
    AnnouncementSendRequest, AnnouncementRecipientsRequest
)
from backend.app.api.deps import get_current_user, require_role, get_current_user_optional
from backend.app.services.notification_service import notification_orchestrator

router = APIRouter(tags=["Announcements & Safety Updates"])

# -------------------------------------------------------------
# User facing endpoint: Active announcements for User Dashboard
# -------------------------------------------------------------
@router.get("/announcements", response_model=List[AnnouncementResponse])
def get_active_announcements_for_user(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    now = datetime.now(timezone.utc)
    query = db.query(AdminAnnouncement).filter(
        AdminAnnouncement.is_active == True,
        (AdminAnnouncement.expires_at == None) | (AdminAnnouncement.expires_at > now)
    )

    all_active = query.order_by(AdminAnnouncement.created_at.desc()).limit(20).all()
    
    # Filter based on target_type
    user_id = current_user.id if current_user else None
    filtered = []
    for item in all_active:
        if item.target_type == "ALL_USERS":
            filtered.append(item)
        elif user_id and item.target_user_ids:
            try:
                allowed_ids = json.loads(item.target_user_ids)
                if user_id in allowed_ids:
                    filtered.append(item)
            except Exception:
                pass

    return filtered

# -------------------------------------------------------------
# Admin endpoints: Communication Center
# -------------------------------------------------------------
@router.get("/admin/announcements", response_model=List[AnnouncementResponse])
def get_admin_announcements(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    return db.query(AdminAnnouncement).order_by(AdminAnnouncement.created_at.desc()).all()

@router.post("/admin/announcements", response_model=AnnouncementResponse)
async def create_announcement(
    data: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    now = datetime.now(timezone.utc)
    target_ids_json = json.dumps(data.target_user_ids) if data.target_user_ids else None

    target_type_val = data.target_audience or data.target_type or "ALL_USERS"

    announcement = AdminAnnouncement(
        title=data.title.strip(),
        message=data.message.strip(),
        alert_type=data.alert_type or "SAFETY_ALERT",
        priority=data.priority or "HIGH",
        target_type=target_type_val,
        target_user_ids=target_ids_json,
        language=data.language or "en",
        created_by=current_user.id,
        created_at=now,
        expires_at=data.expires_at,
        is_active=True
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    # Automatically create user notification records so the notification bell updates immediately!
    target_users = []
    if target_type_val == "ALL_USERS":
        target_users = db.query(User).filter(User.is_active == True).all()
    elif data.target_user_ids:
        target_users = db.query(User).filter(User.id.in_(data.target_user_ids), User.is_active == True).all()

    for u in target_users:
        notif = Notification(
            user_id=u.id,
            announcement_id=announcement.id,
            channel="DASHBOARD",
            recipient=u.email,
            title=announcement.title,
            message=announcement.message,
            notification_type=announcement.alert_type,
            priority=announcement.priority,
            is_read=False,
            status="DELIVERED",
            sent_at=now
        )
        db.add(notif)

        # Optional external alert dispatch if priority is HIGH/CRITICAL and user consented
        if data.send_external and data.priority in ["HIGH", "CRITICAL"] and u.notification_consent and u.phone:
            try:
                await notification_orchestrator.send_security_alert(
                    db=db,
                    channel="WHATSAPP" if u.phone else "SMS",
                    recipient=u.phone,
                    user_id=u.id,
                    risk_level="HIGH_RISK",
                    custom_reason=f"[{announcement.title}] {announcement.message[:120]}",
                    language=u.language or "en"
                )
            except Exception as e:
                print(f"[ARTHRAKSHA ALERT DISPATCH ERROR] {e}")

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="ANNOUNCEMENT_PUBLISHED",
        entity_type="ANNOUNCEMENT",
        entity_id=str(announcement.id),
        timestamp=now
    )
    db.add(audit)
    db.commit()

    return announcement

@router.get("/admin/announcements/{id}", response_model=AnnouncementResponse)
def get_announcement_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    item = db.query(AdminAnnouncement).filter(AdminAnnouncement.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    return item

@router.put("/admin/announcements/{id}", response_model=AnnouncementResponse)
def update_announcement(
    id: int,
    data: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    item = db.query(AdminAnnouncement).filter(AdminAnnouncement.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    if data.title is not None:
        item.title = data.title.strip()
    if data.message is not None:
        item.message = data.message.strip()
    if data.alert_type is not None:
        item.alert_type = data.alert_type
    if data.priority is not None:
        item.priority = data.priority
    if data.target_type is not None:
        item.target_type = data.target_type
    if data.target_user_ids is not None:
        item.target_user_ids = json.dumps(data.target_user_ids)
    if data.language is not None:
        item.language = data.language
    if data.expires_at is not None:
        item.expires_at = data.expires_at
    if data.is_active is not None:
        item.is_active = data.is_active

    db.commit()
    db.refresh(item)
    return item

@router.patch("/admin/announcements/{id}/status", response_model=AnnouncementResponse)
def toggle_announcement_status(
    id: int,
    status_update: AnnouncementStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    item = db.query(AdminAnnouncement).filter(AdminAnnouncement.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    item.is_active = status_update.is_active
    db.commit()
    db.refresh(item)
    return item

@router.delete("/admin/announcements/{id}")
def delete_announcement(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    item = db.query(AdminAnnouncement).filter(AdminAnnouncement.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    # Remove associated unread notification records
    db.query(Notification).filter(Notification.announcement_id == id).delete()
    db.delete(item)

    audit = AuditLog(
        user_id=current_user.id,
        action="ANNOUNCEMENT_DELETED",
        entity_type="ANNOUNCEMENT",
        entity_id=str(id),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()

    return {"message": "Announcement deleted successfully."}

@router.post("/admin/announcements/{id}/send")
async def send_announcement(
    id: int,
    payload: AnnouncementSendRequest = AnnouncementSendRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    announcement = db.query(AdminAnnouncement).filter(AdminAnnouncement.id == id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    now = datetime.now(timezone.utc)
    target_ids = payload.target_user_ids
    if target_ids is None and announcement.target_user_ids:
        try:
            target_ids = json.loads(announcement.target_user_ids)
        except Exception:
            target_ids = None

    if announcement.target_type == "ALL_USERS" and not target_ids:
        target_users = db.query(User).filter(User.is_active == True).all()
    elif target_ids:
        target_users = db.query(User).filter(User.id.in_(target_ids), User.is_active == True).all()
    else:
        target_users = db.query(User).filter(User.is_active == True).all()

    sent_count = 0
    for u in target_users:
        notif = Notification(
            user_id=u.id,
            announcement_id=announcement.id,
            channel="DASHBOARD",
            recipient=u.email,
            title=announcement.title,
            message=announcement.message,
            notification_type=announcement.alert_type,
            priority=announcement.priority,
            is_read=False,
            status="DELIVERED",
            sent_at=now
        )
        db.add(notif)
        sent_count += 1

        if payload.send_external and announcement.priority in ["HIGH", "CRITICAL"] and u.notification_consent and u.phone:
            try:
                await notification_orchestrator.send_security_alert(
                    db=db,
                    channel="WHATSAPP" if u.phone else "SMS",
                    recipient=u.phone,
                    user_id=u.id,
                    risk_level="HIGH_RISK",
                    custom_reason=f"[{announcement.title}] {announcement.message[:120]}",
                    language=u.language or "en"
                )
            except Exception as e:
                print(f"[EXTERNAL ALERT ERROR] {e}")

    audit = AuditLog(
        user_id=current_user.id,
        action="ANNOUNCEMENT_DISPATCHED",
        entity_type="ANNOUNCEMENT",
        entity_id=str(id),
        timestamp=now
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "announcement_id": id,
        "dispatched_count": sent_count,
        "message": f"Announcement dispatched to {sent_count} user(s)."
    }

@router.post("/admin/announcements/{id}/recipients")
async def update_announcement_recipients(
    id: int,
    payload: AnnouncementRecipientsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    announcement = db.query(AdminAnnouncement).filter(AdminAnnouncement.id == id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    announcement.target_type = "SPECIFIC_USERS"
    announcement.target_user_ids = json.dumps(payload.recipient_user_ids)
    db.commit()
    db.refresh(announcement)

    now = datetime.now(timezone.utc)
    if payload.notify_immediately and payload.recipient_user_ids:
        users = db.query(User).filter(User.id.in_(payload.recipient_user_ids), User.is_active == True).all()
        for u in users:
            notif = Notification(
                user_id=u.id,
                announcement_id=announcement.id,
                channel="DASHBOARD",
                recipient=u.email,
                title=announcement.title,
                message=announcement.message,
                notification_type=announcement.alert_type,
                priority=announcement.priority,
                is_read=False,
                status="DELIVERED",
                sent_at=now
            )
            db.add(notif)
        db.commit()

    return {
        "status": "success",
        "announcement_id": id,
        "target_user_ids": payload.recipient_user_ids,
        "message": f"Recipients updated. {len(payload.recipient_user_ids)} recipient(s) targeted."
    }

