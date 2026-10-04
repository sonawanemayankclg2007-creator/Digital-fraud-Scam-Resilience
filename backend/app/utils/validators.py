import re

def normalize_phone_number(phone: str) -> str:
    """
    Standardize Indian phone number to +91XXXXXXXXXX format.
    """
    if not phone:
        return ""
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        return f"+91{digits}"
    elif len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    elif len(digits) == 11 and digits.startswith("0"):
        return f"+91{digits[1:]}"
    elif len(digits) > 10:
        return f"+{digits}"
    return phone.strip()

def is_valid_phone(phone: str) -> bool:
    normalized = normalize_phone_number(phone)
    # Check +91 followed by 10 digits
    return bool(re.match(r"^\+91[6-9]\d{9}$", normalized)) or bool(re.match(r"^\+\d{10,15}$", normalized))

def is_valid_upi_or_account(identifier: str) -> bool:
    if not identifier:
        return False
    identifier = identifier.strip()
    # Check UPI format or account alphanumeric
    if "@" in identifier:
        return bool(re.match(r"^[\w\.\-]+@[\w\-]+$", identifier))
    # Bank account digits
    return bool(re.match(r"^[a-zA-Z0-9]{6,26}$", identifier))
