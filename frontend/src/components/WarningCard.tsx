import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Send, Check } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { RiskScoreGauge } from './RiskScoreGauge';
import { VoiceReader } from './VoiceReader';
import { api } from '../services/api';

interface WarningCardProps {
  score: number;
  level: string;
  scamType?: string;
  signals: string[];
  explanation: string;
  recommendation: string;
  confidence?: number;
  focalAccountOrPhone?: string;
  language?: string;
}

export const WarningCard: React.FC<WarningCardProps> = ({
  score,
  level,
  scamType,
  signals,
  explanation,
  recommendation,
  confidence,
  focalAccountOrPhone,
  language = 'en'
}) => {
  const [sendingAlert, setSendingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const handleSendQuickAlert = async (channel: 'SMS' | 'WHATSAPP') => {
    setSendingAlert(true);
    try {
      const recipient = focalAccountOrPhone && focalAccountOrPhone.startsWith('+')
        ? focalAccountOrPhone
        : '+919876543210';
      
      const res = await api.sendNotification({
        channel,
        recipient,
        message: `${scamType ? `[${scamType}] ` : ''}${explanation.slice(0, 150)}`,
        language
      });
      setAlertSuccess(`${channel} alert dispatched via demo simulation! Check Alerts history.`);
      setTimeout(() => setAlertSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      setAlertSuccess('Alert simulation logged.');
      setTimeout(() => setAlertSuccess(null), 4000);
    } finally {
      setSendingAlert(false);
    }
  };

  const isHigh = level === 'HIGH_RISK';
  const isSuspicious = level === 'SUSPICIOUS';

  return (
    <div
      className={`rounded-2xl border transition-all p-6 ${
        isHigh
          ? 'border-red-500/40 bg-red-950/20 glow-danger'
          : isSuspicious
          ? 'border-orange-500/40 bg-orange-950/20 glow-suspicious'
          : 'border-slate-800 bg-slate-900/60'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <RiskScoreGauge score={score} level={level} size={110} />
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <RiskBadge level={level} size="lg" />
              {scamType && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700">
                  {scamType}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">
              Deterministic heuristic confidence:{' '}
              <span className="text-slate-200 font-semibold">{Math.round((confidence || 0.92) * 100)}%</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <VoiceReader
            textToRead={`${level}. ${explanation}. Recommended Action: ${recommendation}`}
            language={language}
          />

          <button
            onClick={() => handleSendQuickAlert('SMS')}
            disabled={sendingAlert}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
          >
            <Send size={13} className="text-emerald-400" />
            <span>Send SMS Alert</span>
          </button>

          <button
            onClick={() => handleSendQuickAlert('WHATSAPP')}
            disabled={sendingAlert}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition-all"
          >
            <Send size={13} className="text-emerald-400" />
            <span>WhatsApp Alert</span>
          </button>
        </div>
      </div>

      {alertSuccess && (
        <div className="my-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Check size={14} />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* WHY WAS THIS FLAGGED */}
      <div className="mt-6">
        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-amber-400" />
          WHY WAS THIS FLAGGED?
        </h4>

        {signals && signals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {signals.map((sig, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200"
              >
                <CheckCircle2 size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span>{sig}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 mb-4">No critical warning signals detected.</p>
        )}

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm text-slate-300 leading-relaxed mb-6">
          <strong className="text-slate-100 font-semibold block mb-1">Detailed Explanation:</strong>
          {explanation}
        </div>
      </div>

      {/* RECOMMENDED ACTION */}
      <div className="pt-2 border-t border-slate-800/80">
        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-blue-400" />
          RECOMMENDED ACTION
        </h4>
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-sm text-blue-200 leading-relaxed font-medium">
          {recommendation}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-500 italic">
        Risk assessment only. This is not investment advice. ARTHRAKSHA never claims definitive legal guilt.
      </p>
    </div>
  );
};
