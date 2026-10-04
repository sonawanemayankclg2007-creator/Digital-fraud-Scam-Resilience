import React from 'react';
import { Lock, ShieldCheck, EyeOff, FileText, CheckCircle2, AlertOctagon } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="text-emerald-400 w-6 h-6" />
          Privacy Center & Ethical Guardrails
        </h1>
        <p className="text-xs text-slate-400">
          ARTHRAKSHA is built on the philosophy of privacy-by-design for Indian public good fintech security.
        </p>
      </div>

      {/* Core Privacy Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <EyeOff size={18} />
            <span>Zero Credential Retention Pledge</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The platform strictly prohibits and filters out passwords, OTPs, PINs, and CVVs. If a user pastes an OTP in a message, it is scrubbed in memory before any model or database sees it.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Lock size={18} />
            <span>Identifier Masking by Default</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Phone numbers and bank accounts are automatically masked in user-facing dashboards (e.g., <code className="text-cyan-300">98******10</code>) to prevent accidental data leakage or doxxing.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <FileText size={18} />
            <span>No Autonomous Message Scraping</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ARTHRAKSHA never reads background private SMS, WhatsApp, or device chats. Only text explicitly pasted by the user for inspection is analyzed.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertOctagon size={18} />
            <span>Responsible Heuristics Policy</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The system clearly informs users that scores are risk indicators rather than definitive legal verdicts of fraud, upholding due process and preventing false stigmatization.
          </p>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h3 className="text-sm font-bold text-white">DPDP Act & Regulatory Alignment</h3>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Digital Personal Data Protection (DPDP) Act 2023 compliance architecture.</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Explicit user consent verified before dispatching security SMS/WhatsApp notifications.</span>
          </div>
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>Transparent explainability: Every risk score details exact triggers.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
