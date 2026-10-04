from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from backend.app.core.database import get_db
from backend.app.models.transaction import Transaction
from backend.app.services.graph_service import graph_fraud_service

router = APIRouter(prefix="/network", tags=["Fraud Network Analysis"])

def _fetch_all_tx_dicts(db: Session, limit: int = 300) -> List[Dict[str, Any]]:
    txs = db.query(Transaction).order_by(Transaction.timestamp.desc()).limit(limit).all()
    return [
        {
            "sender_account": t.sender_account,
            "receiver_account": t.receiver_account,
            "amount": t.amount,
            "timestamp": t.timestamp.isoformat() if t.timestamp else "",
            "risk_score": t.risk_score
        }
        for t in txs
    ]

@router.get("/full-graph")
def get_full_network_graph(
    min_amount: float = Query(0.0, description="Filter edges by minimum transaction amount"),
    limit: int = Query(250, description="Max transactions to include"),
    db: Session = Depends(get_db)
):
    tx_dicts = _fetch_all_tx_dicts(db, limit=limit)
    if min_amount > 0:
        tx_dicts = [t for t in tx_dicts if t["amount"] >= min_amount]
    return graph_fraud_service.get_account_subgraph_data(tx_dicts)

@router.get("/rings")
def get_fraud_rings(db: Session = Depends(get_db)):
    tx_dicts = _fetch_all_tx_dicts(db, limit=300)
    G = graph_fraud_service.build_directed_graph(tx_dicts)
    rings = graph_fraud_service.detect_fraud_rings(G)
    return rings

@router.get("/{account_id}")
def get_account_subgraph(
    account_id: str,
    hops: int = Query(2, ge=1, le=4),
    db: Session = Depends(get_db)
):
    tx_dicts = _fetch_all_tx_dicts(db, limit=300)
    return graph_fraud_service.get_account_subgraph_data(tx_dicts, focal_account=account_id, max_hops=hops)

@router.get("/{account_id}/clusters")
def get_account_clusters(account_id: str, db: Session = Depends(get_db)):
    tx_dicts = _fetch_all_tx_dicts(db, limit=300)
    G = graph_fraud_service.build_directed_graph(tx_dicts)
    all_rings = graph_fraud_service.detect_fraud_rings(G)
    
    # Filter rings containing account_id
    matching_rings = [r for r in all_rings if account_id in r.get("accounts", [])]
    return {
        "account_id": account_id,
        "matching_clusters_count": len(matching_rings),
        "clusters": matching_rings
    }

@router.get("/{account_id}/risk")
def get_account_network_risk(account_id: str, db: Session = Depends(get_db)):
    tx_dicts = _fetch_all_tx_dicts(db, limit=300)
    G = graph_fraud_service.build_directed_graph(tx_dicts)
    mules = graph_fraud_service.analyze_potential_mules(G)
    cycles = graph_fraud_service.detect_cycles(G)
    
    in_deg = G.in_degree(account_id) if G.has_node(account_id) else 0
    out_deg = G.out_degree(account_id) if G.has_node(account_id) else 0
    
    is_in_cycle = any(account_id in c for c in cycles)
    is_mule = account_id in mules

    controller_score = min(100, int((in_deg * 12) + (out_deg * 15) + (25 if is_in_cycle else 0)))
    
    return {
        "account_id": account_id,
        "in_degree": in_deg,
        "out_degree": out_deg,
        "is_potential_mule": is_mule,
        "mule_details": mules.get(account_id, {}),
        "is_in_circular_flow": is_in_cycle,
        "network_controller_risk_score": controller_score,
        "controller_classification": "Potential network coordinator based on network patterns." if controller_score >= 65 else "Standard Counterparty",
        "disclaimer": "Graph metrics are heuristics intended for risk assessment only."
    }
