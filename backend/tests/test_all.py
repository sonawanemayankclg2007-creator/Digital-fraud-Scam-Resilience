import asyncio
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.database import Base
from backend.app.services.risk_service import risk_engine
from backend.app.services.graph_service import graph_fraud_service
from backend.app.services.gemini_service import gemini_ai_service
from backend.app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from backend.app.utils.masking import mask_phone_number, mask_account_identifier, sanitize_sensitive_data
from backend.app.utils.validators import normalize_phone_number, is_valid_phone

def test_password_hashing():
    pw = "SuperSecure123"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_flow():
    payload = {"sub": "42", "role": "ANALYST"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "42"
    assert decoded["role"] == "ANALYST"

def test_privacy_masking():
    assert mask_phone_number("+919876543210") == "+91 98******10"
    assert mask_phone_number("9876543210") == "98******10"
    assert mask_account_identifier("investor99@okhdfcbank") == "in******99@okhdfcbank"
    assert mask_account_identifier("987654321012") == "98********12"

def test_sanitize_sensitive_credentials():
    raw = "Your bank OTP is 492810. Do not share."
    sanitized = sanitize_sensitive_data(raw)
    assert "492810" not in sanitized
    assert "[REDACTED_OTP]" in sanitized

def test_risk_engine_scoring():
    signals = ["unusual_amount", "rapid_fund_movement", "known_mule_pattern"]
    score, level = risk_engine.calculate_score(signals)
    assert score >= 45
    assert level in ["CAUTION", "SUSPICIOUS", "HIGH_RISK"]
    assert risk_engine.get_risk_level(20) == "SAFE"
    assert risk_engine.get_risk_level(50) == "CAUTION"
    assert risk_engine.get_risk_level(70) == "SUSPICIOUS"
    assert risk_engine.get_risk_level(90) == "HIGH_RISK"

def test_networkx_graph_mule_and_cycles():
    # Construct a cycle: A -> B -> C -> A
    txs = [
        {"sender_account": "A", "receiver_account": "B", "amount": 10000.0},
        {"sender_account": "B", "receiver_account": "C", "amount": 9500.0},
        {"sender_account": "C", "receiver_account": "A", "amount": 9000.0},
    ]
    G = graph_fraud_service.build_directed_graph(txs)
    cycles = graph_fraud_service.detect_cycles(G)
    assert len(cycles) >= 1
    cycle_nodes = set(cycles[0])
    assert {"A", "B", "C"}.issubset(cycle_nodes)

def test_scam_message_deterministic_analysis():
    scam_msg = (
        "Congratulations! You have been selected for an exclusive investment opportunity. "
        "Invest ₹10,000 today and receive guaranteed 40% returns. "
        "Limited slots. Send payment immediately."
    )
    result = asyncio.run(gemini_ai_service.analyze_scam_message(scam_msg))
    assert result["risk_score"] >= 80
    assert result["risk_level"] == "HIGH_RISK"
    assert len(result["warning_signals"]) >= 2
    assert "Guaranteed" in " ".join(result["warning_signals"])

def test_investment_claim_analysis():
    claim = "Guaranteed 30% monthly return. Double your money in 15 days."
    result = asyncio.run(gemini_ai_service.analyze_investment_claim(claim))
    assert result["risk_score"] >= 70
    assert "Risk assessment only. This is not investment advice." in result["disclaimer"]
