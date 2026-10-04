from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.app.models.transaction import Transaction
from backend.app.models.account import Account
from backend.app.services.risk_service import risk_engine
from backend.app.services.graph_service import graph_fraud_service

class TransactionService:
    """
    Analyzes transaction risk, velocity, repeated routing, and rapid pass-through fund movement.
    """

    @classmethod
    def analyze_transaction(
        cls,
        db: Session,
        sender_account: str,
        receiver_account: str,
        amount: float
    ) -> Dict[str, Any]:
        signals = []
        rapid_transfer = False
        unusual_amount = False
        circular_flow = False
        potential_mule = False

        # 1. Check amount anomalies
        if amount >= 100000:
            signals.append("unusual_amount")
            unusual_amount = True
        elif amount >= 50000:
            signals.append("unusual_amount")

        # 2. Check sender recent transaction velocity (last 1 hour)
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        recent_txs = db.query(Transaction).filter(
            (Transaction.sender_account == sender_account) | (Transaction.receiver_account == receiver_account),
            Transaction.timestamp >= one_hour_ago
        ).all()

        if len(recent_txs) >= 4:
            signals.append("high_velocity")

        # 3. Check rapid pass-through on receiver (funds recently arrived and now receiver is involved)
        receiver_incoming = db.query(Transaction).filter(
            Transaction.receiver_account == receiver_account,
            Transaction.timestamp >= one_hour_ago
        ).all()
        receiver_outgoing = db.query(Transaction).filter(
            Transaction.sender_account == receiver_account,
            Transaction.timestamp >= one_hour_ago
        ).all()

        if len(receiver_incoming) >= 2 and len(receiver_outgoing) >= 1:
            signals.append("rapid_fund_movement")
            signals.append("high_incoming_outgoing_ratio")
            rapid_transfer = True

        # 4. Check if receiver is flagged as high-risk or known mule in Account table
        receiver_acc = db.query(Account).filter(Account.account_identifier == receiver_account).first()
        if receiver_acc and receiver_acc.risk_score >= 70:
            signals.append("suspicious_graph_cluster")
            potential_mule = True

        # 5. Check network graph for circular loops between sender and receiver
        # Fetch last 50 transactions to build context graph
        recent_all = db.query(Transaction).order_by(Transaction.timestamp.desc()).limit(100).all()
        tx_data = [
            {"sender_account": t.sender_account, "receiver_account": t.receiver_account, "amount": t.amount}
            for t in recent_all
        ]
        # Temporarily include the proposed transaction
        tx_data.append({"sender_account": sender_account, "receiver_account": receiver_account, "amount": amount})
        G = graph_fraud_service.build_directed_graph(tx_data)
        cycles = graph_fraud_service.detect_cycles(G)
        
        for cycle in cycles:
            if sender_account in cycle and receiver_account in cycle:
                signals.append("circular_money_flow")
                circular_flow = True
                break

        mules = graph_fraud_service.analyze_potential_mules(G)
        if receiver_account in mules or sender_account in mules:
            signals.append("known_mule_pattern")
            potential_mule = True

        # Calculate final score
        score, level = risk_engine.calculate_score(signals)
        explanation = risk_engine.generate_friendly_explanation(signals, entity_type="transaction")
        recommendation = risk_engine.get_recommendation(level)

        return {
            "sender_account": sender_account,
            "receiver_account": receiver_account,
            "amount": amount,
            "risk_score": score,
            "risk_level": level,
            "signals": signals,
            "explanation": explanation,
            "recommendation": recommendation,
            "rapid_transfer_detected": rapid_transfer,
            "unusual_amount_detected": unusual_amount,
            "circular_flow_detected": circular_flow,
            "potential_mule_involved": potential_mule
        }

transaction_service = TransactionService()
