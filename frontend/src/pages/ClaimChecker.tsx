import React, { useState } from 'react';
import { Award, AlertOctagon, CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { VoiceReader } from '../components/VoiceReader';

export const ClaimChecker: React.FC = () => {
  const [claimText, setClaimText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sampleClaims = [
    "Guaranteed 30% monthly return on small-cap fund investments.",
    "Double your money in 15 days with our algorithmic AI bot.",
    "Government-approved cryptocurrency platform with zero market risk.",
    "Exclusive pre-IPO allocation: Only 5 seats remaining for VIP members."
  ];

  const handleCheck = async (textToCheck?: string) => {
    const text = textToCheck || claimText;
    if (!text || text.trim().length < 4) return;
    setLoading(true);
    try {
      const res = await api.checkClaim({ claim_text: text });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadClaim = (c: string) => {
    setClaimText(c);
    handleCheck(c);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="text-amber-400 w-6 h-6" />
          Investment Claim Checker
        </h1>
        <p className="text-xs text-slate-400">
          Verify dubious financial claims, astronomical returns, or fake regulatory endorsements before investing.
        </p>
      </div>

      {/* Preset Claim Samples */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Common Scam Claims in India:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sampleClaims.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => loadClaim(c)}
              className="text-left p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 transition-all hover:border-amber-500/40 cursor-pointer"
            >
              "{c}"
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
        <input
          type="text"
          value={claimText}
          onChange={(e) => setClaimText(e.target.value)}
          placeholder="Enter claim (e.g. 'Guaranteed 25% return monthly', 'Double money in 30 days')..."
          className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/60"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleCheck()}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Analyzing Claim...</span>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Evaluate Claim</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-4">
              <RiskScoreGauge score={result.risk_score} level={result.risk_level} size={100} />
              <div>
                <RiskBadge level={result.risk_level} size="lg" />
                <h3 className="text-sm font-bold text-white mt-1.5">{result.claim_type}</h3>
              </div>
            </div>
            <VoiceReader
              textToRead={`${result.risk_level}. ${result.explanation}. Recommendation: ${result.recommended_action}`}
            />
          </div>

          {/* Unrealistic Factors */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-slate-400">Unrealistic Factors & Red Flags</h4>
            <div className="space-y-1.5">
              {(result.unrealistic_factors || result.warning_signals || []).map((factor: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-red-300 p-2.5 rounded-lg bg-red-950/20 border border-red-500/20">
                  <AlertTriangle size={15} className="shrink-0 text-red-400 mt-0.5" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-slate-100 font-semibold block mb-1">Risk Evaluation:</strong>
            {result.explanation}
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200">
            <strong className="block mb-1 text-blue-300 font-bold uppercase tracking-wider">Recommended Safety Action:</strong>
            {result.recommended_action}
          </div>

          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-[11px] text-amber-400/90 text-center font-medium">
            ⚠️ {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
