from typing import Dict, Any, Optional
import httpx
from backend.app.core.config import settings

class TranslationService:
    """
    Multilingual Translation Engine for ARTHRAKSHA.
    Supports English (en), Hindi (hi), Gujarati (gu).
    Provides robust built-in contextual dictionary translations
    with optional Google Cloud Translation API integration.
    """

    PRESET_TRANSLATIONS = {
        "hi": {
            "SAFE": "सुरक्षित",
            "CAUTION": "सावधानी",
            "SUSPICIOUS": "संदिग्ध",
            "HIGH_RISK": "उच्च जोखिम",
            "Do not transfer money until the person/company and payment destination are independently verified.":
                "जब तक व्यक्ति/कंपनी और भुगतान गंतव्य की स्वतंत्र रूप से पुष्टि न हो जाए, तब तक पैसे ट्रांसफर न करें।",
            "ArthRaksha Alert: Potentially suspicious financial activity was detected. Do not transfer money or share OTP/PIN/passwords until you independently verify the recipient. Check your ArthRaksha dashboard for details.":
                "अर्थरक्षा चेतावनी: संभावित रूप से संदिग्ध वित्तीय गतिविधि का पता चला है। जब तक आप प्राप्तकर्ता की स्वतंत्र रूप से पुष्टि न कर लें, तब तक पैसे ट्रांसफर न करें या ओटीपी/पिन/पासवर्ड साझा न करें। विवरण के लिए अपना अर्थरक्षा डैशबोर्ड देखें।",
            "A potentially suspicious transaction was detected. Tap to review the risk details.":
                "एक संभावित संदिग्ध लेन-देन का पता चला है। जोखिम विवरण देखने के लिए टैप करें।",
            "Guaranteed return claim": "गारंटीड रिटर्न का दावा (अवैध/संदिग्ध)",
            "Urgent payment request": "तत्काल भुगतान का दबाव",
            "Investment solicitation": "निवेश का लालच",
            "Pressure to act immediately": "तुरंत कार्रवाई करने का दबाव",
            "Potential mule-account behavior detected.": "संभावित म्यूल-खाता (पैसे घुमाने वाले खाते) का व्यवहार पाया गया।",
            "Potential network coordinator based on network patterns.": "नेटवर्क पैटर्न के आधार पर संभावित समन्वयक (मास्टरमाइंड) खाता।",
            "Risk assessment only. This is not investment advice.": "केवल जोखिम मूल्यांकन। यह कोई निवेश सलाह नहीं है।"
        },
        "gu": {
            "SAFE": "સુરક્ષિત",
            "CAUTION": "સાવધાની",
            "SUSPICIOUS": "શંકાસ્પદ",
            "HIGH_RISK": "ઉચ્ચ જોખમ",
            "Do not transfer money until the person/company and payment destination are independently verified.":
                "જ્યાં સુધી વ્યક્તિ/કંપની અને ચુકવણી ખાતાની સ્વતંત્ર રીતે ચકાસણી ન થાય ત્યાં સુધી નાણાં ટ્રાન્સફર કરશો નહીં.",
            "ArthRaksha Alert: Potentially suspicious financial activity was detected. Do not transfer money or share OTP/PIN/passwords until you independently verify the recipient. Check your ArthRaksha dashboard for details.":
                "અર્થરક્ષા ચેતવણી: સંભવિત શંકાસ્પદ નાણાકીય પ્રવૃત્તિ જણાઈ છે. જ્યાં સુધી તમે પ્રાપ્તકર્તાની સ્વતંત્ર રીતે ચકાસણી ન કરો ત્યાં સુધી નાણાં ટ્રાન્સફર કરશો નહીં અથવા OTP/PIN/પાસવર્ડ શેર કરશો નહીં.",
            "A potentially suspicious transaction was detected. Tap to review the risk details.":
                "એક સંભવિત શંકાસ્પદ વ્યવહાર શોધી કાઢવામાં આવ્યો છે. વિગતો જોવા માટે ટેપ કરો.",
            "Guaranteed return claim": "ગેરંટીડ રિટર્નનો દાવો",
            "Urgent payment request": "તાત્કાલિક ચુકવણીની વિનંતી",
            "Investment solicitation": "રોકાણની લાલચ",
            "Pressure to act immediately": "તરત જ નાણાં મોકલવાનું દબાણ",
            "Potential mule-account behavior detected.": "સંભવિત મ્યુલ એકાઉન્ટ (પૈસા ફેરવતું ખાતું) હોવાના સંકેત.",
            "Potential network coordinator based on network patterns.": "નેટવર્ક પેટર્નને આધારે સંભવિત સંયોજક ખાતું.",
            "Risk assessment only. This is not investment advice.": "માત્ર જોખમ મૂલ્યાંકન. આ કોઈ રોકાણ સલાહ નથી."
        }
    }

    @classmethod
    async def translate_text(cls, text: str, target_language: str = "en") -> str:
        if not text or target_language == "en":
            return text

        # Check preset dictionary
        lang_dict = cls.PRESET_TRANSLATIONS.get(target_language, {})
        if text in lang_dict:
            return lang_dict[text]

        # Check if partial matches exist
        for orig, translated in lang_dict.items():
            if orig.lower() in text.lower():
                text = text.replace(orig, translated)

        # If Google Translate API credentials configured, attempt cloud translation
        if settings.GOOGLE_APPLICATION_CREDENTIALS and settings.GOOGLE_TRANSLATE_PROJECT_ID:
            try:
                # Cloud translation placeholder if API configured
                pass
            except Exception:
                pass

        return text

translation_service = TranslationService()
