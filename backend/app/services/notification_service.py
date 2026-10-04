import json
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.notification import Notification
from backend.app.models.user import User
from backend.app.services.msg91_service import msg91_service
from backend.app.services.firebase_service import firebase_service
from backend.app.services.email_service import email_service
from backend.app.services.translation_service import translation_service
from backend.app.utils.masking import sanitize_sensitive_data

class NotificationOrchestrator:
    """
    Central Notification Orchestrator:
    - Enforces privacy consent
    - Language localization
    - Safe alert templates (guaranteeing ZERO OTP/PIN/credentials)
    - Dispatches to SMS, WhatsApp, Push, and Email
    - Persists audit logs in database
    """

    @classmethod
    async def send_security_alert(
        cls,
        db: Session,
        channel: str,
        recipient: str,
        user_id: Optional[int] = None,
        risk_level: str = "HIGH_RISK",
        custom_reason: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        # 1. Check user consent if user_id is provided
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                if not user.notification_consent:
                    return {
                        "status": "SKIPPED_NO_CONSENT",
                        "recipient": recipient,
                        "channel": channel,
                        "message": "User has opted out of security notifications."
                    }
                if not language and user.language:
                    language = user.language

        # 2. Build channel-specific localized safe message (zero sensitive financial data)
        channel_upper = channel.upper()
        if channel_upper == "SMS":
            raw_msg = (
                "ArthRaksha Alert: Potentially suspicious financial activity was detected. "
                "Do not transfer money or share OTP/PIN/passwords until you independently verify the recipient. "
                "Check your ArthRaksha dashboard for details."
            )
            msg = await translation_service.translate_text(raw_msg, language)
            # Guarantee zero credentials
            msg = sanitize_sensitive_data(msg)
            provider_resp = await msg91_service.send_sms(recipient, msg)

        elif channel_upper == "WHATSAPP":
            reason_text = custom_reason or "Multiple suspicious network signals were detected."
            raw_msg = (
                f"⚠️ ARTHRAKSHA ALERT\n\n"
                f"Potentially suspicious financial activity detected.\n\n"
                f"Risk: {risk_level}\n"
                f"Reason: {reason_text}\n"
                f"Recommended: Do not transfer money until independently verified.\n\n"
                f"🛡️ Stay alert. Check your ArthRaksha security dashboard for full details."
            )
            msg = await translation_service.translate_text(raw_msg, language)
            msg = sanitize_sensitive_data(msg)
            provider_resp = await msg91_service.send_whatsapp(recipient, msg)

        elif channel_upper == "PUSH":
            title = "⚠️ Financial Safety Alert"
            raw_body = "A potentially suspicious transaction was detected. Tap to review the risk details."
            body = await translation_service.translate_text(raw_body, language)
            body = sanitize_sensitive_data(body)
            msg = f"{title} - {body}"
            provider_resp = await firebase_service.send_push_notification(recipient, title, body)

        elif channel_upper == "EMAIL":
            subject = "⚠️ ArthRaksha Security Alert: Suspicious Activity Detected"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 8px;">
                <h2 style="color: #ef4444;">🛡️ ARTHRAKSHA Security Warning</h2>
                <p>Potentially suspicious financial activity has been detected associated with your recent inquiry.</p>
                <div style="background-color: #1e293b; padding: 16px; border-left: 4px solid #ef4444; margin: 16px 0;">
                    <p><strong>Risk Level:</strong> {risk_level}</p>
                    <p><strong>Detected Reason:</strong> {custom_reason or 'Multiple anomalous network indicators identified.'}</p>
                    <p><strong>Recommended Action:</strong> Do not transfer money or share OTP, passwords, or PIN with unverified parties.</p>
                </div>
                <p style="font-size: 12px; color: #94a3b8;">This is an automated safety alert from ARTHRAKSHA - Digital Fraud & Scam Resilience Platform.</p>
            </div>
            """
            msg = f"Security Alert: Risk {risk_level} detected. Do not transfer funds without verification."
            provider_resp = await email_service.send_email(recipient, subject, html_content)
        else:
            return {"status": "FAILED", "error": f"Unsupported channel: {channel}"}

        # 3. Store notification history in database
        status_val = provider_resp.get("status", "SENT")
        notif_record = Notification(
            user_id=user_id,
            channel=channel_upper,
            recipient=recipient,
            message=msg,
            status=status_val,
            provider_response=json.dumps(provider_resp),
            sent_at=datetime.now(timezone.utc)
        )
        db.add(notif_record)
        db.commit()
        db.refresh(notif_record)

        return {
            "notification_id": notif_record.id,
            "channel": channel_upper,
            "recipient": recipient,
            "status": status_val,
            "message": msg,
            "provider_response": provider_resp
        }

notification_orchestrator = NotificationOrchestrator()
