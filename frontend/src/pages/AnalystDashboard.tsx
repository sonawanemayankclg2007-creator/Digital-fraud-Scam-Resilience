import React, { useState, useEffect } from 'react';
import { LineChart, Search, Network, Share2, AlertTriangle, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const AnalystDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('paytm-invest99@okhdfcbank');
  const [accountRisk, setAccountRisk] = useState<any>(null);
  const [clusters, setClusters] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleInvestigate = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const [riskRes, clustersRes] = await Promise.all([
        api.getAccountNetworkRisk(searchQuery.trim()),
        api.getAccountClusters(searchQuery.trim())
      ]);
      setAccountRisk(riskRes.data);
      setClusters(clustersRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleInvestigate();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <LineChart className="text-purple-400 w-6 h-6" />
          Fraud Analyst Forensic Studio
        </h1>
        <p className="text-xs text-slate-400">
          In-depth forensic inspection of counterparty degree distributions, circular flow cycles, and coordinator probabilities.
        </p>
      </div>

      {/* Forensic Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search account identifier or UPI VPA for deep forensic analysis..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 py-3.5 pl-4 pr-32 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/60"
          />
          <button
            onClick={handleInvestigate}
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? <span>Investigating...</span> : <><Search size={14} /><span>Investigate</span></>}
          </button>
        </div>
      </div>

      {/* Forensic Intelligence Panels */}
      {accountRisk && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Node Risk Metrics */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white">Centrality & Degree Metrics</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">In-Degree (Counterparties):</span>
                <span className="font-mono font-bold text-emerald-400">{accountRisk.in_degree}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Out-Degree (Dispersals):</span>
                <span className="font-mono font-bold text-orange-400">{accountRisk.out_degree}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Circular Flow Cycle:</span>
                <span className="font-mono font-bold text-purple-400">
                  {accountRisk.is_in_circular_flow ? 'DETECTED' : 'CLEAR'}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Potential Transit Mule:</span>
                <span className="font-mono font-bold text-red-400">
                  {accountRisk.is_potential_mule ? 'YES' : 'NO'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
              <strong className="block mb-1 text-purple-300 font-bold uppercase tracking-wider">
                Coordinator Score: {accountRisk.network_controller_risk_score} / 100
              </strong>
              {accountRisk.controller_classification}
            </div>

            <a
              href={`/fraud-network?focal=${encodeURIComponent(accountRisk.account_id)}`}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all block text-center"
            >
              <Share2 size={13} />
              <span>Launch Subgraph Visualizer</span>
            </a>
          </div>

          {/* Linked Fraud Clusters */}
          <div className="md:col-span-2 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-white">Associated Coordinated Clusters</h3>

            {clusters?.clusters?.length > 0 ? (
              <div className="space-y-3">
                {clusters.clusters.map((c: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{c.network_name}</span>
                      <RiskBadge level={c.risk_level} size="sm" />
                    </div>
                    <p className="text-slate-400">
                      Coordinated network linking {c.total_accounts} accounts with ₹{c.total_volume.toLocaleString('en-IN')} total flow.
                    </p>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-purple-300">
                      Key Aggregator Node: <strong>{c.potential_coordinator}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-950 border border-slate-800">
                This account is not part of any multi-hop coordinated cluster.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
