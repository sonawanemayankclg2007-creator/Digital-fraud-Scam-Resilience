import json
import re
from typing import Dict, Any, List
import httpx
from backend.app.core.config import settings
from backend.app.services.risk_service import risk_engine

class GeminiAIService:
    """
    AI-Powered Scam & Investment Claim Analyzer using Google Gemini API.
    Includes a deterministic fallback engine for 100% offline & API-free reliability.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL or "gemini-1.5-flash"

    async def analyze_scam_message(self, message_text: str, language: str = "en") -> Dict[str, Any]:
        """
        Analyzes a pasted SMS, WhatsApp message, Telegram-style message, or email.
        """
        # 1. Try Gemini AI if API key is present
        if self.api_key and self.api_key.strip():
            try:
                ai_result = await self._call_gemini_for_message(message_text, language)
                if ai_result:
                    return ai_result
            except Exception as e:
                print(f"[ARTHRAKSHA AI] Notice: Gemini API call failed ({e}), falling back to deterministic engine.")

        # 2. Resilient Deterministic Rule-Based Fallback Engine
        return self._deterministic_scam_analysis(message_text, language)

    async def analyze_investment_claim(self, claim_text: str, language: str = "en") -> Dict[str, Any]:
        """
        Analyzes investment claims such as 'Guaranteed 30% monthly return', 'Double your money in 15 days'.
        """
        if self.api_key and self.api_key.strip():
            try:
                ai_result = await self._call_gemini_for_claim(claim_text, language)
                if ai_result:
                    return ai_result
            except Exception as e:
                print(f"[ARTHRAKSHA AI] Notice: Gemini API call failed for claim ({e}), using fallback rules.")

        return self._deterministic_claim_analysis(claim_text, language)

    async def _call_gemini_for_message(self, text: str, language: str) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        system_instruction = (
            "You are ARTHRAKSHA, an expert Indian investor safety & financial scam resilience AI platform. "
            "Analyze the given message for fraud signals: guaranteed returns, false urgency, high pressure, "
            "impersonation of SEBI/RBI/Banks, payment solicitation, phishing links, or requests for OTP/PIN. "
            "Respond ONLY with a valid JSON object matching this schema:\n"
            "{\n"
            '  "risk_score": <integer 0-100>,\n'
            '  "risk_level": "SAFE" | "CAUTION" | "SUSPICIOUS" | "HIGH_RISK",\n'
            '  "scam_type": "<e.g. Investment Scam | Phishing | Impersonation | Lottery / Advance Fee>",\n'
            '  "warning_signals": ["signal 1", "signal 2"],\n'
            '  "explanation": "<clear, compassionate explanation in plain non-technical language>",\n'
            '  "recommended_action": "<actionable preventive recommendation>",\n'
            '  "confidence": <float 0.0-1.0>\n'
            "}"
        )

        prompt = f"Analyze this message received in {language}:\n\n\"\"\"\n{text}\n\"\"\""

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": system_instruction},
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(raw_text)
            else:
                raise Exception(f"Gemini API status {resp.status_code}: {resp.text}")

    async def _call_gemini_for_claim(self, claim_text: str, language: str) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        system_instruction = (
            "You are ARTHRAKSHA. Analyze this financial or investment claim for unrealistic promises, "
            "fake government or SEBI approvals, impossible annualized returns, or Ponzi schemes. "
            "Always include the disclaimer: 'Risk assessment only. This is not investment advice.' "
            "Respond ONLY with a valid JSON object matching:\n"
            "{\n"
            '  "risk_score": <integer 0-100>,\n'
            '  "risk_level": "SAFE" | "CAUTION" | "SUSPICIOUS" | "HIGH_RISK",\n'
            '  "claim_type": "<e.g. Guaranteed Return Scam | Multi-Level Marketing | Fake IPO Allocation>",\n'
            '  "warning_signals": ["signal 1", "signal 2"],\n'
            '  "unrealistic_factors": ["factor 1", "factor 2"],\n'
            '  "explanation": "<plain-language user-friendly explanation>",\n'
            '  "recommended_action": "<preventive advice>",\n'
            '  "confidence": <float 0.0-1.0>\n'
            "}"
        )

        prompt = f"Analyze this investment claim:\n\n\"\"\"\n{claim_text}\n\"\"\""

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": system_instruction},
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(raw_text)
            else:
                raise Exception(f"Gemini API status {resp.status_code}: {resp.text}")

    def _deterministic_scam_analysis(self, text: str, language: str) -> Dict[str, Any]:
        """
        High-precision deterministic rule engine adhering to Section 10 & 45.
        """
        lower = text.lower()
        signals = []
        score = 15

        # Guaranteed returns pattern
        if re.search(r"(guarantee|guaranteed|pakka|nischit|garanti|100% return|fixed return|daily return|monthly return)", lower):
            signals.append("Guaranteed return claim (Regulated financial instruments cannot guarantee speculative returns)")
            score += 30

        # Unrealistic numbers / percentage
        if re.search(r"(\b[2-9]\d%|\b\d{3}%|double|triple|2x|3x|5x|10x|dosh|paisa double)", lower):
            signals.append("Unrealistically high return promise over a short duration")
            score += 25

        # False Urgency & Pressure
        if re.search(r"(urgent|immediately|hurry|today only|last chance|limited slots|within 1 hour|before 12|turant|jaldi)", lower):
            signals.append("High-pressure urgency designed to bypass critical thinking")
            score += 20

        # Investment solicitation & payment request
        if re.search(r"(invest|send payment|transfer|deposit|pay now|upi id|gpay|phonepe|send rs|₹\d+|rs\.?\s*\d+)", lower):
            signals.append("Immediate upfront payment solicitation")
            score += 15

        # Authority impersonation
        if re.search(r"(sebi|rbi|government approved|sarkari|customs|income tax|police|cbi|ed)", lower):
            signals.append("Suspicious citation of regulatory or government authority")
            score += 20

        # Credentials / OTP / PIN request
        if re.search(r"(otp|pin|password|cvv|bank account details|pan card|aadhaar)", lower):
            signals.append("Dangerous solicitation of sensitive authentication credentials")
            score += 35

        # Phishing links
        if re.search(r"(https?://|bit\.ly|t\.me|wa\.me|tinyurl|\.xyz|\.top|\.online)", lower):
            signals.append("External link or unverified messaging group redirect")
            score += 15

        score = min(98, score)
        level = risk_engine.get_risk_level(score)

        if not signals:
            return {
                "risk_score": 18,
                "risk_level": "SAFE",
                "scam_type": "Standard Communication",
                "warning_signals": [],
                "explanation": "No overt scam or high-pressure financial solicitation markers detected in the provided message.",
                "recommended_action": "Standard caution: Always independently verify identity before transferring money.",
                "confidence": 0.88,
                "disclaimer": "Risk assessment only. This is not investment advice."
            }

        scam_type = "Investment Scam"
        if "sensitive authentication credentials" in " ".join(signals):
            scam_type = "Credential Harvesting / Phishing"
        elif "regulatory or government" in " ".join(signals):
            scam_type = "Impersonation Scam"
        elif "External link" in " ".join(signals):
            scam_type = "Malicious Link / Telegram Group Trap"

        explanation = (
            f"This message was flagged as {level} because it exhibits typical social-engineering patterns: "
            f"{'; '.join(signals[:3])}. Legitimate financial institutions and SEBI-registered advisors never guarantee "
            f"abnormal returns nor pressure you into immediate irreversible transfers."
        )

        recommended_action = (
            "Do not transfer money or share passwords, OTP, or UPI PIN until the person, entity, "
            "and payment destination are independently verified through official channels."
        )

        return {
            "risk_score": score,
            "risk_level": level,
            "scam_type": scam_type,
            "warning_signals": signals,
            "explanation": explanation,
            "recommended_action": recommended_action,
            "confidence": 0.94,
            "disclaimer": "Risk assessment only. This is not investment advice."
        }

    def _deterministic_claim_analysis(self, text: str, language: str) -> Dict[str, Any]:
        lower = text.lower()
        signals = []
        unrealistic_factors = []
        score = 20

        if re.search(r"(guarantee|guaranteed|sure-shot|nischit|pakka)", lower):
            signals.append("Guaranteed return declaration")
            unrealistic_factors.append("Market investments always involve risk; guaranteed gains indicate fraudulent claims.")
            score += 30

        if re.search(r"(\b[2-9]\d%|double|triple|15 days|30 days|daily|monthly)", lower):
            signals.append("Mathematically unsustainable rate of return")
            unrealistic_factors.append("Promised yields exceed benchmark market rates by over 500%.")
            score += 30

        if re.search(r"(government approved|sebi approved|rbi certified|zero risk)", lower):
            signals.append("Misleading regulatory endorsement or 'zero risk' myth")
            unrealistic_factors.append("Regulators never approve guaranteed high-yield investment schemes.")
            score += 25

        if re.search(r"(slots remaining|exclusive|vip only|today only)", lower):
            signals.append("Artificial scarcity & psychological urgency")
            score += 15

        score = min(98, score)
        level = risk_engine.get_risk_level(score)

        return {
            "risk_score": score,
            "risk_level": level,
            "claim_type": "High-Yield Guaranteed Return Claim" if score > 50 else "General Financial Statement",
            "warning_signals": signals or ["No obvious deceptive markers detected."],
            "unrealistic_factors": unrealistic_factors or ["Return profile appears within standard market parameters."],
            "explanation": f"Claim evaluated as {level}. Guaranteed or astronomical returns without risk are typical hallmarks of Ponzi or fraudulent investment schemes.",
            "recommended_action": "Avoid committing funds. Verify SEBI registration status at sebi.gov.in before any investment.",
            "confidence": 0.92,
            "disclaimer": "Risk assessment only. This is not investment advice."
        }

gemini_ai_service = GeminiAIService()
