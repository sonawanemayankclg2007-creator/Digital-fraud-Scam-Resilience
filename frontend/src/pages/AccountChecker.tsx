import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Search, Share2, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { VoiceReader } from '../components/VoiceReader';

export const AccountChecker: React.FC = () => {
  const [accountInput, setAccountInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sampleAccounts = [
    { label: 'Primary Demo Target (paytm-invest99@okhdfcbank)', id: 'paytm-invest99@okhdfcbank' },
    { label: 'Intermediate Mule (transit_mule_1@axis)', id: 'transit_mule_1@axis' },
    { label: 'Ring Controller (crypto_aggregator_x@ybl)', id: 'crypto_aggregator_x@ybl' },
    { label: 'Legitimate Account (ramesh.investor@okhdfcbank)', id: 'ramesh.investor@okhdfcbank' },
  ];

  const handleCheck = async (accId?: string) => {
    const id = accId || accountInput;
    if (!id || id.trim().length < 4) return;

    setLoading(true);
    try {
      const res = await api.checkAccount(id.trim());
      setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (id: string) => {
    setAccountInput(id);
    handleCheck(id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="text-blue-400 w-6 h-6" />
          Account & UPI Risk Checker
        </h1>
        <p className="text-xs text-slate-400">
          Analyze transaction velocity, multi-hop routing, and mule behavior before transferring money.
        </p>
      </div>

      {/* Preset Samples */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Quick Test Identifiers:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleAccounts.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(s.id)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-mono transition-all hover:border-blue-500/40 cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <div className="relative">
          <input
            type="text"
            value={accountInput}
            onChange={(e) => setAccountInput(e.target.value)}
            placeholder="Enter UPI ID (e.g. name@okhdfcbank) or Bank Account..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 py-3.5 pl-4 pr-32 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 font-mono"
          />
          <button
            type="button"
            onClick={() => handleCheck()}
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span>Analyzing...</span> : <><Search size={14} /><span>Analyze</span></>}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-4">
              <RiskScoreGauge score={result.risk_score} level={result.risk_level} size={100} />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  ACCOUNT RISK PROFILE
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <RiskBadge level={result.risk_level} size="lg" />
                  <span className="font-mono text-sm font-bold text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                    {result.masked_identifier}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{result.account_type}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <VoiceReader
                textToRead={`${result.risk_level}. Account ${result.masked_identifier}. ${result.explanation}. Recommended action: ${result.recommended_action}`}
              />
              <Link
                to={`/fraud-network?focal=${encodeURIComponent(result.account_identifier)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold transition-all"
              >
                <Share2 size={14} />
                <span>View in Graph</span>
              </Link>
            </div>
          </div>

          {/* Flow Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-white flex items-center justify-center gap-1">
                <ArrowDownLeft size={16} className="text-emerald-400" />
                {result.in_degree}
              </div>
              <div className="text-[11px] text-slate-400">Incoming Senders</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-white flex items-center justify-center gap-1">
                <ArrowUpRight size={16} className="text-orange-400" />
                {result.out_degree}
              </div>
              <div className="text-[11px] text-slate-400">Outgoing Receivers</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-lg font-black text-cyan-400">
                ₹{result.total_received.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400">Total Inflow</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-lg font-black text-purple-400">
                ₹{result.total_sent.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400">Total Outflow</div>
            </div>
          </div>

          {/* Potential Mule Indicator */}
          {result.potential_mule && (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                <AlertTriangle size={15} />
                POTENTIAL MULE-ACCOUNT BEHAVIOR DETECTED
              </div>
              <div className="space-y-1">
                {result.mule_indicators.map((ind: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-red-300">
                    <CheckCircle2 size={13} className="text-red-400 shrink-0" />
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signals */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-slate-400">Active Network Signals</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(result.signals || []).map((s: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-red-400 shrink-0" />
                  <span>{s.replace(/_/g, ' ').toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100 font-semibold block mb-1">Behavioral Analysis:</strong>
            {result.explanation}
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200">
            <strong className="block mb-1 text-blue-300 font-bold uppercase tracking-wider">Recommended Safety Action:</strong>
            {result.recommended_action}
          </div>

          <div className="text-[11px] text-slate-500 italic">
            🛡️ {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
