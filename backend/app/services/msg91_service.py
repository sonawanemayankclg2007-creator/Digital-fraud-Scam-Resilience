from typing import Dict, Any
import httpx
from backend.app.core.config import settings

class MSG91Service:
    """
    MSG91 SMS and WhatsApp API integration (DLT-compliant).
    In DEMO_MODE, safely simulates delivery with realistic provider acknowledgment.
    """

    @classmethod
    async def send_sms(cls, phone_number: str, message: str) -> Dict[str, Any]:
        if settings.DEMO_MODE or not settings.MSG91_AUTH_KEY:
            # Simulated provider response
            return {
                "status": "SIMULATED_DEMO",
                "provider": "MSG91_SMS",
                "message_id": f"msg91_demo_{phone_number[-4:]}_tx992",
                "dlt_template_id": settings.MSG91_TEMPLATE_ID or "DLT_ARTHRAKSHA_ALERT_01",
                "sender_id": settings.MSG91_SENDER_ID,
                "recipient": phone_number,
                "delivery_status": "DELIVERED",
                "demo_notice": "DEMO_MODE is active. Real telecom SMS simulated to avoid unnecessary SMS charges."
            }

        url = "https://control.msg91.com/api/v5/flow/"
        headers = {
            "authkey": settings.MSG91_AUTH_KEY,
            "content-type": "application/json"
        }
        payload = {
            "template_id": settings.MSG91_TEMPLATE_ID,
            "sender": settings.MSG91_SENDER_ID,
            "short_url": "0",
            "mobiles": phone_number,
            "var": message
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            return {
                "status": "SENT" if resp.status_code == 200 else "FAILED",
                "status_code": resp.status_code,
                "provider_response": resp.text
            }

    @classmethod
    async def send_whatsapp(cls, phone_number: str, message: str) -> Dict[str, Any]:
        if settings.DEMO_MODE or not settings.MSG91_AUTH_KEY:
            return {
                "status": "SIMULATED_DEMO",
                "provider": "MSG91_WHATSAPP",
                "message_id": f"wa_demo_{phone_number[-4:]}_wa883",
                "recipient": phone_number,
                "delivery_status": "READ",
                "demo_notice": "DEMO_MODE is active. Real WhatsApp message simulated with green tick confirmation."
            }

        url = "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/"
        headers = {
            "authkey": settings.MSG91_AUTH_KEY,
            "content-type": "application/json"
        }
        payload = {
            "integrated_number": settings.MSG91_WHATSAPP_NUMBER or "",
            "content_type": "template",
            "payload": {
                "to": phone_number,
                "type": "template",
                "template": {
                    "name": "arthraksha_fraud_alert",
                    "language": {"code": "en", "policy": "deterministic"},
                    "components": [
                        {
                            "type": "body",
                            "parameters": [{"type": "text", "text": message}]
                        }
                    ]
                }
            }
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            return {
                "status": "SENT" if resp.status_code == 200 else "FAILED",
                "status_code": resp.status_code,
                "provider_response": resp.text
            }

msg91_service = MSG91Service()
