from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from backend.app.core.database import get_db
from backend.app.models.transaction import Transaction
from backend.app.models.account import Account
from backend.app.schemas.transaction import (
    TransactionCreate, TransactionAnalyzeRequest,
    TransactionRiskResult, TransactionResponse
)
from backend.app.services.transaction_service import transaction_service

router = APIRouter(prefix="/transactions", tags=["Transaction Intelligence"])

@router.post("/analyze", response_model=TransactionRiskResult)
def analyze_transaction_risk(payload: TransactionAnalyzeRequest, db: Session = Depends(get_db)):
    result = transaction_service.analyze_transaction(
        db=db,
        sender_account=payload.sender_account.strip(),
        receiver_account=payload.receiver_account.strip(),
        amount=payload.amount
    )
    return result

@router.get("", response_model=list[TransactionResponse])
def get_transactions(limit: int = 50, skip: int = 0, db: Session = Depends(get_db)):
    txs = db.query(Transaction).order_by(Transaction.timestamp.desc()).offset(skip).limit(limit).all()
    return txs

@router.get("/{id}", response_model=TransactionResponse)
def get_transaction_by_id(id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return tx

@router.post("", response_model=TransactionResponse)
def create_transaction(tx_in: TransactionCreate, db: Session = Depends(get_db)):
    # Run analysis first
    analysis = transaction_service.analyze_transaction(
        db=db,
        sender_account=tx_in.sender_account.strip(),
        receiver_account=tx_in.receiver_account.strip(),
        amount=tx_in.amount
    )

    tx = Transaction(
        sender_account=tx_in.sender_account.strip(),
        receiver_account=tx_in.receiver_account.strip(),
        amount=tx_in.amount,
        status=tx_in.status or "COMPLETED",
        risk_score=float(analysis["risk_score"]),
        timestamp=datetime.now(timezone.utc)
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx
