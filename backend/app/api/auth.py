from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.models.user import User
from backend.app.models.audit_log import AuditLog
from backend.app.schemas.auth import UserRegister, UserLogin, Token, UserResponse, UserUpdate
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Validate confirm password if provided
    if user_in.confirm_password and user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Check for existing email
    existing = db.query(User).filter(User.email.ilike(user_in.email.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # CRITICAL SECURITY RULE: Public registration strictly creates USER role only.
    # Never accept or trust a role parameter from the client during registration!
    role = "USER"

    hashed_pw = hash_password(user_in.password)
    now = datetime.now(timezone.utc)
    user = User(
        name=user_in.name.strip(),
        email=user_in.email.strip().lower(),
        phone=user_in.phone.strip() if user_in.phone else None,
        password_hash=hashed_pw,
        role=role,
        language=user_in.language or "en",
        notification_consent=True,
        is_active=True,
        last_active_at=now,
        created_at=now
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTRATION",
        entity_type="USER",
        entity_id=str(user.id),
        timestamp=now
    )
    db.add(audit)
    db.commit()

    token_str = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "language": user.language,
            "phone": user.phone,
            "notification_consent": user.notification_consent,
            "is_active": user.is_active
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(login_data.email.strip())).first()
    
    # Secure check: do not enumerate accounts
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator."
        )

    now = datetime.now(timezone.utc)
    user.last_active_at = now
    db.commit()

    token_str = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})

    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="USER",
        entity_id=str(user.id),
        timestamp=now
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token_str,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "language": user.language,
            "phone": user.phone,
            "notification_consent": user.notification_consent,
            "is_active": user.is_active
        }
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    audit = AuditLog(
        user_id=current_user.id,
        action="USER_LOGOUT",
        entity_type="USER",
        entity_id=str(current_user.id),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()
    return {"message": "Logged out successfully."}

def build_user_response(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "language": user.language,
        "notification_consent": user.notification_consent,
        "is_active": user.is_active,
        "last_active_at": user.last_active_at,
        "created_at": user.created_at,
        "notification_preferences": {
            "dashboard": True,
            "sms": bool(user.phone and user.notification_consent),
            "whatsapp": bool(user.phone and user.notification_consent),
            "email": bool(user.notification_consent)
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return build_user_response(current_user)

@router.patch("/me", response_model=UserResponse)
def update_me(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.name is not None:
        current_user.name = update_data.name.strip()
    if update_data.phone is not None:
        current_user.phone = update_data.phone.strip()
    if update_data.language is not None:
        current_user.language = update_data.language
    if update_data.notification_consent is not None:
        current_user.notification_consent = update_data.notification_consent

    db.commit()
    db.refresh(current_user)
    return build_user_response(current_user)
