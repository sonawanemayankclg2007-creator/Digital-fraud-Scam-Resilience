import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, CheckCircle2, AlertOctagon, Sparkles, MessageSquareWarning,
  CreditCard, Share2, Globe, Lock, ArrowRight, PhoneCall, Zap
} from 'lucide-react';

interface LandingProps {
  onOpenDemo: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onOpenDemo }) => {
  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold shadow-sm">
          <Sparkles size={14} className="text-cyan-400" />
          <span>SANGYAN Track A — Digital Fraud & Scam Resilience</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          ARTHRAKSHA
          <span className="block text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent mt-2">
            "Detect. Explain. Warn. Protect."
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An AI-powered financial scam resilience platform helping people identify suspicious messages,
          fake investment claims, phone numbers, accounts, and money-flow networks{' '}
          <strong className="text-blue-400 font-bold underline decoration-blue-500/50 underline-offset-4">
            before money changes hands
          </strong>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/scam-checker"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 hover:scale-105"
          >
            <MessageSquareWarning size={16} />
            <span>Check a Scam Message</span>
          </Link>

          <Link
            to="/account-checker"
            className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm transition-all flex items-center gap-2 hover:scale-105"
          >
            <CreditCard size={16} />
            <span>Check an Account / UPI</span>
          </Link>

          <button
            onClick={onOpenDemo}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 hover:scale-105 cursor-pointer"
          >
            <Sparkles size={16} className="text-cyan-300" />
            <span>Primary Demo Scenario</span>
          </button>
        </div>
      </section>

      {/* Primary Value Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Zap size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Pre-Transaction Detection</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Most security systems act after money is stolen. ARTHRAKSHA analyzes suspicious SMS, WhatsApp messages,
            and VPAs before the user confirms a bank or UPI transfer.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Share2 size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Graph Fraud & Mule Intelligence</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Uncovers multi-hop money laundering, transit mule chains, circular fund movement, and coordinating
            controllers through NetworkX-powered directed graph analysis.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Globe size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Bharat-First Usability & Voice</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multilingual support across English, Hindi, and Gujarati with built-in voice accessibility (TTS)
            designed specifically for Tier-2/Tier-3 citizens and first-time investors.
          </p>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">How ARTHRAKSHA Protects You</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            A privacy-first pipeline fusing Google Gemini AI, deterministic rule heuristics, and network graph topology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="text-blue-400 font-extrabold text-sm">1. Input Ingestion</div>
            <p className="text-xs text-slate-300">User pastes suspicious message, phone number, or UPI identifier.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="text-indigo-400 font-extrabold text-sm">2. Multi-Engine Analysis</div>
            <p className="text-xs text-slate-300">Evaluated against AI signals, deterministic rules, and network graphs.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="text-amber-400 font-extrabold text-sm">3. Transparent Score</div>
            <p className="text-xs text-slate-300">0-100 risk score generated with clear 'Why Flagged?' explainability.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="text-emerald-400 font-extrabold text-sm">4. Proactive Alert</div>
            <p className="text-xs text-slate-300">Multilingual SMS/WhatsApp/Push warning prevents irreversible loss.</p>
          </div>
        </div>
      </section>

      {/* Strict Privacy & Guardrails Section */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/30 to-indigo-950/20 border border-blue-500/20 space-y-4">
        <div className="flex items-center gap-3">
          <Lock className="text-blue-400 w-6 h-6" />
          <h3 className="text-base font-bold text-white">Trust, Privacy & Guardrails Compliance</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            ✓ <strong>Zero Credential Retention:</strong> Never collects or stores OTPs, passwords, or PINs.
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            ✓ <strong>No Financial Advice:</strong> Does not predict stocks or recommend investments.
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            ✓ <strong>Privacy Masking:</strong> Sensitive identifiers masked automatically (e.g. 98******10).
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            ✓ <strong>Non-Definitive Heuristics:</strong> Transparently communicates probabilistic risk.
          </div>
        </div>
      </section>
    </div>
  );
};
