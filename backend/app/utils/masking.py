import re

def mask_phone_number(phone: str) -> str:
    """
    Mask phone number for privacy preservation.
    Example: +919876543210 -> +91 98******10
    9876543210 -> 98******10
    """
    if not phone:
        return ""
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        return f"{digits[:2]}******{digits[-2:]}"
    elif len(digits) > 10:
        country_code = digits[:-10]
        local = digits[-10:]
        return f"+{country_code} {local[:2]}******{local[-2:]}"
    elif len(phone) > 4:
        return f"{phone[:2]}***{phone[-2:]}"
    return "****"

def mask_account_identifier(account_id: str) -> str:
    """
    Mask bank account or UPI ID.
    Example:
    987654321098 -> 98********98
    trade_king99@okhdfcbank -> tr******99@okhdfcbank
    """
    if not account_id:
        return ""
    if "@" in account_id:
        handle, vpa = account_id.split("@", 1)
        if len(handle) <= 3:
            masked_handle = handle[0] + "***"
        else:
            masked_handle = f"{handle[:2]}******{handle[-2:]}"
        return f"{masked_handle}@{vpa}"
    else:
        # Numeric or alphanumeric bank account
        digits = account_id.strip()
        if len(digits) > 4:
            return f"{digits[:2]}{'*' * (len(digits) - 4)}{digits[-2:]}"
        return "****"

def sanitize_sensitive_data(text: str) -> str:
    """
    Strict guardrail: Scrub accidental OTPs or passwords if user pastes them.
    Never persist cleartext OTPs or passwords.
    """
    if not text:
        return ""
    # Redact 4 to 6 digit OTP references
    scrubbed = re.sub(r"(?i)\b(otp|one time password|pin|code)\s*(?:is|:|-)?\s*(\d{4,6})\b", r"\1 [REDACTED_OTP]", text)
    # Redact CVVs
    scrubbed = re.sub(r"(?i)\b(cvv|cvc)\s*(?:is|:|-)?\s*(\d{3,4})\b", r"\1 [REDACTED_CVV]", scrubbed)
    return scrubbed
