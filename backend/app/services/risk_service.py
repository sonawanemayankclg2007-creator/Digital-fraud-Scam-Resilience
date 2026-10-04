from typing import List, Dict, Any, Tuple

class RiskEngine:
    """
    Transparent Deterministic Risk Engine for ARTHRAKSHA.
    Evaluates rule-based signals, graph intelligence, transaction velocity,
    and user reports to compute an explainable score between 0 and 100.
    """

    THRESHOLDS = {
        "SAFE": (0, 30),
        "CAUTION": (31, 60),
        "SUSPICIOUS": (61, 80),
        "HIGH_RISK": (81, 100)
    }

    WEIGHTS = {
        "unusual_amount": 15,
        "rapid_fund_movement": 15,
        "high_velocity": 10,
        "high_incoming_outgoing_ratio": 10,
        "suspicious_graph_cluster": 15,
        "circular_money_flow": 10,
        "multiple_user_reports": 15,
        "scam_language_indicators": 10,
        "known_mule_pattern": 15,
        "unregistered_high_volume": 10
    }

    @classmethod
    def get_risk_level(cls, score: float) -> str:
        score_val = max(0, min(100, int(round(score))))
        if score_val <= 30:
            return "SAFE"
        elif score_val <= 60:
            return "CAUTION"
        elif score_val <= 80:
            return "SUSPICIOUS"
        else:
            return "HIGH_RISK"

    @classmethod
    def calculate_score(cls, active_signals: List[str]) -> Tuple[int, str]:
        total_score = 0
        for signal in active_signals:
            total_score += cls.WEIGHTS.get(signal, 10)
        
        # Clamp to 100
        score = min(100, total_score)
        level = cls.get_risk_level(score)
        return score, level

    @classmethod
    def generate_friendly_explanation(cls, active_signals: List[str], entity_type: str = "account") -> str:
        explanations = []
        if "scam_language_indicators" in active_signals:
            explanations.append("The message contains high-pressure tactics or guarantees of abnormal financial returns.")
        if "unusual_amount" in active_signals:
            explanations.append("The transaction value significantly deviates from typical baseline behavior.")
        if "rapid_fund_movement" in active_signals:
            explanations.append("Funds are being redirected almost immediately upon receipt, a hallmark of transit or intermediate accounts.")
        if "high_velocity" in active_signals:
            explanations.append("A sudden surge in transaction volume was observed over a brief timeframe.")
        if "high_incoming_outgoing_ratio" in active_signals:
            explanations.append("The account receives money from multiple disparate senders and quickly funnels it to centralized receivers.")
        if "suspicious_graph_cluster" in active_signals:
            explanations.append("The account is tightly connected to an identified cluster with elevated risk flags.")
        if "circular_money_flow" in active_signals:
            explanations.append("Money appears to cycle back towards originating or affiliated accounts, suggesting artificial layering.")
        if "multiple_user_reports" in active_signals:
            explanations.append("Multiple community members have reported this identifier for deceptive or unverified payment requests.")
        if "known_mule_pattern" in active_signals:
            explanations.append("Network flow behavior closely matches intermediate money-transit (mule) routing patterns.")

        if not explanations:
            return "No anomalous or suspicious indicators detected. Normal activity observed."
        return " ".join(explanations)

    @classmethod
    def get_recommendation(cls, risk_level: str) -> str:
        if risk_level == "HIGH_RISK":
            return "Do not transfer money or share OTP/PIN. Verify the recipient's legitimacy through official banking channels before proceeding."
        elif risk_level == "SUSPICIOUS":
            return "Exercise caution. Confirm the recipient's identity independently and avoid making urgent or unverified transfers."
        elif risk_level == "CAUTION":
            return "Verify payment details carefully. Ensure you know the beneficiary personally or through legitimate business channels."
        else:
            return "Standard safety practices apply. Never share your bank passwords, UPI PIN, or OTP with anyone."

risk_engine = RiskEngine()
