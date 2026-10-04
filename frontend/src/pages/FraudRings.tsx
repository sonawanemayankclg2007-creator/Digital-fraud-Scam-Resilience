import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Network, AlertOctagon, Share2, Layers, ShieldAlert, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const FraudRings: React.FC = () => {
  const [rings, setRings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRings = async () => {
    try {
      setLoading(true);
      const res = await api.getFraudRings();
      setRings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRings();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Network className="text-purple-400 w-6 h-6" />
          Fraud Rings & Coordinating Hub Detection
        </h1>
        <p className="text-xs text-slate-400">
          Automated discovery of weakly connected fraud clusters, circular laundering loops, and coordinating aggregator accounts.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Analyzing graph topology and weakly connected components...
        </div>
      ) : rings.length > 0 ? (
        <div className="space-y-4">
          {rings.map((ring, idx) => (
            <div
              key={ring.ring_id || idx}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-5 hover:border-purple-500/40 transition-all shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      {ring.ring_id}
                    </span>
                    <h3 className="text-sm font-bold text-white">{ring.network_name}</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Coordinated transfer pattern detected across {ring.total_accounts} connected counterparties
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Network Risk</div>
                    <div className="text-base font-black text-red-400">{ring.risk_score} / 100</div>
                  </div>
                  <RiskBadge level={ring.risk_level} size="md" />
                </div>
              </div>

              {/* Cluster Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-white">{ring.total_accounts}</div>
                  <div className="text-[11px] text-slate-400">Connected Accounts</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-red-400">{ring.suspicious_accounts_count}</div>
                  <div className="text-[11px] text-slate-400">Suspicious Accounts</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-cyan-400 font-mono">
                    ₹{ring.total_volume.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-slate-400">Total Layered Volume</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className={`text-xs font-bold mt-1 ${ring.has_circular_flow ? 'text-purple-400' : 'text-slate-400'}`}>
                    {ring.has_circular_flow ? 'DETECTED' : 'NONE'}
                  </div>
                  <div className="text-[11px] text-slate-400">Circular Fund Loops</div>
                </div>
              </div>

              {/* Coordinating Account Spotlight */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider flex items-center gap-1.5">
                    <UserCheck size={14} className="text-purple-400" />
                    Potential Coordinating Account (Central Hub):
                  </span>
                  <div className="font-mono text-sm font-bold text-white">{ring.potential_coordinator}</div>
                  <p className="text-[11px] text-purple-200/80">
                    Identified based on betweenness centrality and fund aggregation routing.
                  </p>
                </div>

                <Link
                  to={`/fraud-network?focal=${encodeURIComponent(ring.potential_coordinator)}`}
                  className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Share2 size={13} />
                  <span>Inspect Cluster in Graph</span>
                </Link>
              </div>

              {/* Member Accounts Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Identified Participants:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ring.accounts.map((acc: string, aIdx: number) => {
                    const isSusp = ring.suspicious_accounts.includes(acc);
                    return (
                      <span
                        key={aIdx}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                          isSusp
                            ? 'bg-red-950/40 border-red-500/40 text-red-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        {acc}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-800">
                🛡️ Classification: Potential coordinating account based on network patterns. Not a legal declaration of criminal guilt.
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 rounded-2xl border border-slate-800 bg-slate-900/40">
          No coordinated multi-tier fraud rings detected in current ledger window.
        </div>
      )}
    </div>
  );
};
