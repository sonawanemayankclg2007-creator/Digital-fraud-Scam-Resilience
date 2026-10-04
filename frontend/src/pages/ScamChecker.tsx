import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquareWarning, Send, Sparkles, AlertCircle,
  RotateCcw, ShieldCheck, Check
} from 'lucide-react';
import { api } from '../services/api';
import { WarningCard } from '../components/WarningCard';

export const ScamChecker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleMessages = [
    {
      label: 'Primary Demo (Guaranteed 40%)',
      lang: 'en',
      text: 'Congratulations! You have been selected for an exclusive investment opportunity. Invest ₹10,000 today and receive guaranteed 40% returns. Limited slots available. Send payment immediately to paytm-invest99@okhdfcbank.'
    },
    {
      label: 'Hindi Stock Advisory Scam',
      lang: 'hi',
      text: 'नमस्ते! आपको विशेष शेयर बाजार निवेश योजना के लिए चुना गया है। ₹5,000 जमा करें और 15 दिनों में ₹15,000 गारंटीड रिटर्न पाएं। केवल 3 सीटें बाकी हैं। तुरंत भुगतान करें।'
    },
    {
      label: 'Gujarati Govt Scheme Trap',
      lang: 'gu',
      text: 'અભિનંદન! સરકારી માન્યતા પ્રાપ્ત રોકાણ યોજના. દર મહિને 35% નિશ્ચિત નફો. આજે જ ₹10,000 મોકલો. ખાતા નંબર: paytm-invest99@okhdfcbank.'
    },
    {
      label: 'Benign Bank Alert (Safe)',
      lang: 'en',
      text: 'Dear Customer, your electricity bill of Rs. 840 is due on 12th Oct. Please pay via your registered electricity board portal. Do not share OTP with anyone.'
    }
  ];

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || messageText;
    if (!text || text.trim().length < 5) {
      setError('Please paste or type a message to analyze (minimum 5 characters).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.analyzeScam({
        message_text: text,
        language: i18n.language || 'en'
      });
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Analysis failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: any) => {
    setMessageText(sample.text);
    if (sample.lang !== i18n.language) {
      i18n.changeLanguage(sample.lang);
    }
    handleAnalyze(sample.text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquareWarning className="text-blue-400 w-6 h-6" />
          Scam Message Checker
        </h1>
        <p className="text-xs text-slate-400">
          Paste any suspicious SMS, WhatsApp message, Telegram tip, or email before transferring money.
        </p>
      </div>

      {/* 1-Click Samples Bar */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className="text-cyan-400" />
          Instant Evaluation Samples:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleMessages.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(sample)}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-all hover:border-blue-500/40 cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 shadow-xl">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Paste SMS, WhatsApp message, Telegram tip, or investment offer here..."
          rows={5}
          className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 transition-all resize-y"
        />

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setMessageText('');
              setResult(null);
              setError(null);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1 px-2.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Signals...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Analyze Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Result Card */}
      {result && (
        <div className="animate-fadeIn">
          <WarningCard
            score={result.risk_score}
            level={result.risk_level}
            scamType={result.scam_type}
            signals={result.warning_signals || []}
            explanation={result.explanation}
            recommendation={result.recommended_action}
            confidence={result.confidence}
            language={i18n.language || 'en'}
          />
        </div>
      )}
    </div>
  );
};
