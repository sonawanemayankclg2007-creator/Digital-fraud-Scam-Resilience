import React, { useState } from 'react';
import { Phone, ShieldAlert, AlertTriangle, CheckCircle2, RotateCcw, Search, Flag } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { RiskScoreGauge } from '../components/RiskScoreGauge';
import { VoiceReader } from '../components/VoiceReader';

export const PhoneChecker: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sampleNumbers = [
    { label: 'Primary Demo (+919876543210)', num: '+919876543210' },
    { label: 'Telegram Fake SEBI (+919820011223)', num: '+919820011223' },
    { label: 'Electricity Phishing (+919711223344)', num: '+919711223344' },
    { label: 'Unreported Clean Number (+919811009988)', num: '+919811009988' }
  ];

  const handleCheck = async (numToCheck?: string) => {
    const num = numToCheck || phoneNumber;
    if (!num || num.trim().length < 8) return;

    setLoading(true);
    try {
      const res = await api.checkPhone(num.trim());
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (n: string) => {
    setPhoneNumber(n);
    handleCheck(n);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Phone className="text-blue-400 w-6 h-6" />
          Phone Number Risk Checker
        </h1>
        <p className="text-xs text-slate-400">
          Search the consent-based community report registry to evaluate unverified numbers before responding.
        </p>
      </div>

      {/* Preset Samples */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Registry Demo Numbers:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleNumbers.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(s.num)}
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
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter Indian mobile number (e.g. +919876543210 or 9876543210)..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 py-3.5 pl-4 pr-32 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 font-mono"
          />
          <button
            type="button"
            onClick={() => handleCheck()}
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span>Searching...</span> : <><Search size={14} /><span>Query</span></>}
          </button>
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-4">
              <RiskScoreGauge score={result.risk_score} level={result.risk_level} size={100} />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  PHONE RISK PROFILE
                </span>
                <div className="flex items-center gap-2 mb-1">
                  <RiskBadge level={result.risk_level} size="lg" />
                  <span className="font-mono text-sm font-bold text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                    {result.masked_phone}
                  </span>
                </div>
              </div>
            </div>
            <VoiceReader
              textToRead={`${result.risk_level}. ${result.masked_phone}. ${result.recommendation}`}
            />
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-white">{result.total_reports}</div>
              <div className="text-[11px] text-slate-400">Total Reports</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-red-400">{result.investment_scam_reports}</div>
              <div className="text-[11px] text-slate-400">Investment Scams</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-orange-400">{result.payment_scam_reports}</div>
              <div className="text-[11px] text-slate-400">Payment Scams</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xl font-black text-blue-400">{result.associated_reports}</div>
              <div className="text-[11px] text-slate-400">Associated Reports</div>
            </div>
          </div>

          {/* Signals */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-slate-400">Detected Risk Indicators</h4>
            <div className="space-y-1.5">
              {(result.warning_signals || []).map((sig: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200">
                  <CheckCircle2 size={15} className="text-red-400 shrink-0" />
                  <span>{sig}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200">
            <strong className="block mb-1 text-blue-300 font-bold uppercase tracking-wider">
              Safety Recommendation:
            </strong>
            {result.recommendation}
          </div>

          <div className="text-[11px] text-slate-500 italic">
            🛡️ {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
