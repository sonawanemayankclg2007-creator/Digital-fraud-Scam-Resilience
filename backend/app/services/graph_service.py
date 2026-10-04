from typing import List, Dict, Any, Optional, Set
import networkx as nx
from backend.app.services.risk_service import risk_engine

class GraphFraudService:
    """
    Advanced NetworkX Graph Fraud Analyzer for ARTHRAKSHA.
    Analyzes directed fund flows (sender -> receiver) to uncover:
    - Suspicious money routing & circular fund cycles
    - Potential mule accounts (pass-through transit nodes)
    - Fraud rings & coordinated clusters
    - Potential network controllers / coordinating hubs
    """

    @classmethod
    def build_directed_graph(cls, transactions: List[Dict[str, Any]]) -> nx.DiGraph:
        G = nx.DiGraph()
        for tx in transactions:
            sender = tx["sender_account"]
            receiver = tx["receiver_account"]
            amount = float(tx.get("amount", 0.0))
            
            # Add nodes if not present
            if not G.has_node(sender):
                G.add_node(sender, in_volume=0.0, out_volume=0.0, tx_count=0)
            if not G.has_node(receiver):
                G.add_node(receiver, in_volume=0.0, out_volume=0.0, tx_count=0)

            # Update volumes
            G.nodes[sender]["out_volume"] += amount
            G.nodes[sender]["tx_count"] += 1
            G.nodes[receiver]["in_volume"] += amount
            G.nodes[receiver]["tx_count"] += 1

            if G.has_edge(sender, receiver):
                G[sender][receiver]["weight"] += amount
                G[sender][receiver]["count"] += 1
            else:
                G.add_edge(sender, receiver, weight=amount, count=1)

        return G

    @classmethod
    def detect_cycles(cls, G: nx.DiGraph) -> List[List[str]]:
        """Detect circular money-flow patterns (e.g. A -> B -> C -> A)"""
        try:
            cycles = list(nx.simple_cycles(G))
            # Filter cycles of length >= 2
            return [c for c in cycles if len(c) >= 2][:10]
        except Exception:
            return []

    @classmethod
    def analyze_potential_mules(cls, G: nx.DiGraph) -> Dict[str, Dict[str, Any]]:
        """
        Identify accounts demonstrating potential mule-account transit patterns:
        - Fan-in from multiple sources and rapid forwarding to common destinations
        - High in-degree and high out-degree
        - Balanced incoming vs outgoing volume (funds don't stay long)
        """
        mule_candidates = {}
        for node in G.nodes():
            in_deg = G.in_degree(node)
            out_deg = G.out_degree(node)
            in_vol = G.nodes[node]["in_volume"]
            out_vol = G.nodes[node]["out_volume"]

            indicators = []
            is_potential_mule = False

            # Pattern 1: Transit node (receives from >= 2, sends to >= 1)
            if in_deg >= 2 and out_deg >= 1:
                ratio = out_vol / in_vol if in_vol > 0 else 0
                if 0.70 <= ratio <= 1.30 and in_vol > 5000:
                    is_potential_mule = True
                    indicators.append("High pass-through volume ratio (~close to 100% of received funds routed out)")

            # Pattern 2: High fan-in aggregation with immediate dispersion
            if in_deg >= 3:
                indicators.append(f"Receives funds from {in_deg} distinct counterparties")

            if out_deg >= 3:
                indicators.append(f"Disperses funds across {out_deg} outgoing destinations")

            if len(indicators) >= 2:
                is_potential_mule = True

            if is_potential_mule:
                mule_candidates[node] = {
                    "is_potential_mule": True,
                    "indicators": indicators,
                    "in_degree": in_deg,
                    "out_degree": out_deg,
                    "in_volume": in_vol,
                    "out_volume": out_vol
                }

        return mule_candidates

    @classmethod
    def detect_fraud_rings(cls, G: nx.DiGraph) -> List[Dict[str, Any]]:
        """
        Identifies weakly connected components that exhibit high risk, multi-hop layering,
        or circular transfers, and pinpoints potential coordinating accounts.
        """
        rings = []
        # Find weakly connected components
        components = list(nx.weakly_connected_components(G))
        
        # Centrality metrics
        try:
            betweenness = nx.betweenness_centrality(G)
        except Exception:
            betweenness = {n: 0.0 for n in G.nodes()}

        mules = cls.analyze_potential_mules(G)
        cycles = cls.detect_cycles(G)
        cycle_nodes: Set[str] = set()
        for cycle in cycles:
            cycle_nodes.update(cycle)

        for idx, comp in enumerate(components):
            if len(comp) < 3:
                continue

            subG = G.subgraph(comp)
            total_volume = sum(d["weight"] for u, v, d in subG.edges(data=True))
            
            # Find suspicious accounts in this cluster
            suspicious_accounts = []
            for node in comp:
                if node in mules or node in cycle_nodes:
                    suspicious_accounts.append(node)

            # Determine potential network coordinator based on highest betweenness or degree
            sorted_nodes = sorted(
                comp,
                key=lambda n: (subG.in_degree(n) + subG.out_degree(n), betweenness.get(n, 0)),
                reverse=True
            )
            top_node = sorted_nodes[0] if sorted_nodes else "Unknown"
            
            # Calculate ring risk score
            ring_score = 40
            if suspicious_accounts:
                ring_score += min(35, len(suspicious_accounts) * 10)
            if any(n in cycle_nodes for n in comp):
                ring_score += 15
            if len(comp) >= 5:
                ring_score += 10
            ring_score = min(98, ring_score)

            rings.append({
                "ring_id": f"RING-{idx + 1:03d}",
                "network_name": f"Identified Cluster #{idx + 1}",
                "total_accounts": len(comp),
                "suspicious_accounts_count": len(suspicious_accounts),
                "suspicious_accounts": suspicious_accounts,
                "total_volume": total_volume,
                "risk_score": ring_score,
                "risk_level": risk_engine.get_risk_level(ring_score),
                "potential_coordinator": top_node,
                "has_circular_flow": any(n in cycle_nodes for n in comp),
                "accounts": list(comp)
            })

        return sorted(rings, key=lambda x: x["risk_score"], reverse=True)

    @classmethod
    def get_account_subgraph_data(
        cls,
        transactions: List[Dict[str, Any]],
        focal_account: Optional[str] = None,
        max_hops: int = 2
    ) -> Dict[str, Any]:
        """
        Formats network graph into nodes and edges ready for interactive visualization.
        Compatible with React Flow and graph renderers.
        """
        G = cls.build_directed_graph(transactions)
        mules = cls.analyze_potential_mules(G)
        cycles = cls.detect_cycles(G)
        cycle_nodes: Set[str] = set()
        for c in cycles:
            cycle_nodes.update(c)

        # If focal_account is specified, extract ego subgraph
        if focal_account and G.has_node(focal_account):
            sub_nodes = {focal_account}
            current_level = {focal_account}
            for _ in range(max_hops):
                next_level = set()
                for n in current_level:
                    next_level.update(G.predecessors(n))
                    next_level.update(G.successors(n))
                sub_nodes.update(next_level)
                current_level = next_level
            viewG = G.subgraph(sub_nodes)
        else:
            viewG = G

        # Build nodes
        nodes = []
        for node in viewG.nodes():
            in_deg = viewG.in_degree(node)
            out_deg = viewG.out_degree(node)
            in_vol = viewG.nodes[node].get("in_volume", 0.0)
            out_vol = viewG.nodes[node].get("out_volume", 0.0)
            is_mule = node in mules
            is_cyclic = node in cycle_nodes
            is_focal = (node == focal_account)

            # Node risk calculation
            active_signals = []
            if is_mule:
                active_signals.append("known_mule_pattern")
                active_signals.append("high_incoming_outgoing_ratio")
            if is_cyclic:
                active_signals.append("circular_money_flow")
            if in_deg + out_deg >= 4:
                active_signals.append("high_velocity")
            if in_vol > 100000 or out_vol > 100000:
                active_signals.append("unusual_amount")

            score, level = risk_engine.calculate_score(active_signals)
            if is_mule or is_cyclic:
                score = max(score, 75)
                level = risk_engine.get_risk_level(score)

            nodes.append({
                "id": str(node),
                "label": str(node),
                "in_degree": in_deg,
                "out_degree": out_deg,
                "in_volume": in_vol,
                "out_volume": out_vol,
                "is_mule": is_mule,
                "is_cyclic": is_cyclic,
                "is_focal": is_focal,
                "risk_score": score,
                "risk_level": level,
                "signals": active_signals
            })

        # Build edges
        edges = []
        for u, v, data in viewG.edges(data=True):
            amount = data.get("weight", 0.0)
            count = data.get("count", 1)
            is_cyclic_edge = (u in cycle_nodes and v in cycle_nodes)
            edges.append({
                "id": f"e_{u}_{v}",
                "source": str(u),
                "target": str(v),
                "amount": amount,
                "count": count,
                "is_cyclic": is_cyclic_edge
            })

        return {
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "cycles_detected": len(cycles),
            "mules_detected": len(mules)
        }

graph_fraud_service = GraphFraudService()
