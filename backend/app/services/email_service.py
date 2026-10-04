from typing import Dict, Any
import httpx
from backend.app.core.config import settings

class ResendEmailService:
    """
    Resend API Email notification service.
    In DEMO_MODE, simulates transactional email dispatch.
    """

    @classmethod
    async def send_email(cls, recipient: str, subject: str, html_content: str) -> Dict[str, Any]:
        if settings.DEMO_MODE or not settings.RESEND_API_KEY:
            return {
                "status": "SIMULATED_DEMO",
                "provider": "RESEND_EMAIL",
                "id": f"email_demo_resend_{recipient.split('@')[0]}",
                "recipient": recipient,
                "subject": subject,
                "delivery_status": "DELIVERED",
                "demo_notice": "DEMO_MODE is active. Transactional security email generated and simulated."
            }

        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "from": "ARTHRAKSHA Security <alerts@arthraksha.in>",
            "to": [recipient],
            "subject": subject,
            "html": html_content
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            return {
                "status": "SENT" if resp.status_code == 200 else "FAILED",
                "response": resp.text
            }

email_service = ResendEmailService()
