import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.account import Account
from backend.app.models.transaction import Transaction
from backend.app.models.fraud_report import FraudReport
from backend.app.models.risk_assessment import RiskAssessment
from backend.app.schemas.account import (
    AccountCheckRequest, AccountRiskResponse,
    AccountResponse, AccountTransactionItem
)
from backend.app.services.graph_service import graph_fraud_service
from backend.app.services.risk_service import risk_engine
from backend.app.utils.masking import mask_account_identifier

router = APIRouter(prefix="/account", tags=["Account Risk Intelligence"])

@router.post("/check", response_model=AccountRiskResponse)
def check_account_risk(payload: AccountCheckRequest, db: Session = Depends(get_db)):
    raw_id = payload.account_identifier.strip()
    
    # Fetch all transactions to form intelligence graph
    all_txs = db.query(Transaction).all()
    tx_list = [
        {"sender_account": t.sender_account, "receiver_account": t.receiver_account, "amount": t.amount}
        for t in all_txs
    ]
    G = graph_fraud_service.build_directed_graph(tx_list)
    
    in_deg = G.in_degree(raw_id) if G.has_node(raw_id) else 0
    out_deg = G.out_degree(raw_id) if G.has_node(raw_id) else 0
    in_vol = G.nodes[raw_id]["in_volume"] if G.has_node(raw_id) else 0.0
    out_vol = G.nodes[raw_id]["out_volume"] if G.has_node(raw_id) else 0.0

    mules = graph_fraud_service.analyze_potential_mules(G)
    is_mule = raw_id in mules
    mule_indicators = mules[raw_id]["indicators"] if is_mule else []

    # Check community reports for this account
    reports = db.query(FraudReport).filter(FraudReport.account_id == raw_id).all()
    verified_reports = [r for r in reports if r.status in ["VERIFIED", "UNDER_REVIEW"]]

    # Collect signals
    active_signals = []
    if is_mule:
        active_signals.append("known_mule_pattern")
        active_signals.append("high_incoming_outgoing_ratio")
    if in_deg + out_deg >= 4:
        active_signals.append("high_velocity")
    if in_vol > 150000 or out_vol > 150000:
        active_signals.append("unusual_amount")
    if len(reports) >= 2 or len(verified_reports) >= 1:
        active_signals.append("multiple_user_reports")

    # Check cycles
    cycles = graph_fraud_service.detect_cycles(G)
    for c in cycles:
        if raw_id in c:
            active_signals.append("circular_money_flow")
            break

    # Look up registered account entity
    account_obj = db.query(Account).filter(Account.account_identifier == raw_id).first()
    if account_obj:
        if account_obj.risk_score >= 70:
            active_signals.append("suspicious_graph_cluster")
        account_type = account_obj.account_type
    else:
        account_type = "UPI" if "@" in raw_id else "BANK_ACCOUNT"

    score, level = risk_engine.calculate_score(active_signals)
    if is_mule:
        score = max(score, 82)
        level = risk_engine.get_risk_level(score)

    explanation = risk_engine.generate_friendly_explanation(active_signals, entity_type="account")
    rec = risk_engine.get_recommendation(level)

    # Persist or update account in DB
    if not account_obj:
        account_obj = Account(
            account_identifier=raw_id,
            account_type=account_type,
            risk_score=float(score),
            risk_level=level,
            status="FLAGGED" if score >= 80 else "ACTIVE",
            created_at=datetime.now(timezone.utc)
        )
        db.add(account_obj)
        db.commit()
    else:
        account_obj.risk_score = float(score)
        account_obj.risk_level = level
        db.commit()

    return {
        "account_identifier": raw_id,
        "masked_identifier": mask_account_identifier(raw_id),
        "account_type": account_type,
        "risk_score": score,
        "risk_level": level,
        "signals": active_signals,
        "explanation": explanation,
        "potential_mule": is_mule,
        "mule_indicators": mule_indicators,
        "in_degree": in_deg,
        "out_degree": out_deg,
        "total_received": in_vol,
        "total_sent": out_vol,
        "transaction_count": in_deg + out_deg,
        "recommended_action": rec,
        "disclaimer": "Risk indicators detected based on network behavior. Not a definitive legal or criminal finding."
    }

@router.get("/{account_id}", response_model=AccountResponse)
def get_account_by_id(account_id: str, db: Session = Depends(get_db)):
    account = db.query(Account).filter(
        (Account.account_identifier == account_id) | (Account.id == (int(account_id) if account_id.isdigit() else -1))
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found.")
    return account

@router.get("/{account_id}/transactions", response_model=list[AccountTransactionItem])
def get_account_transactions(account_id: str, db: Session = Depends(get_db)):
    txs = db.query(Transaction).filter(
        (Transaction.sender_account == account_id) | (Transaction.receiver_account == account_id)
    ).order_by(Transaction.timestamp.desc()).limit(50).all()
    return txs
