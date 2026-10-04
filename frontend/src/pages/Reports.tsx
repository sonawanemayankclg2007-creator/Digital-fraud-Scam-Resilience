import React, { useState, useEffect } from 'react';
import { Flag, Send, AlertCircle, CheckCircle2, Clock, ShieldCheck, Check } from 'lucide-react';
import { api } from '../services/api';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [reportType, setReportType] = useState('INVESTMENT_SCAM');
  const [targetId, setTargetId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await api.getReports();
      setReports(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.trim().length < 10) return;

    setLoading(true);
    try {
      await api.submitReport({
        report_type: reportType,
        account_id: targetId.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        description: description.trim(),
        evidence: evidence.trim() || undefined
      });

      setSuccess('Report submitted successfully! It is now in the analyst moderation queue.');
      setDescription('');
      setTargetId('');
      setPhoneNumber('');
      setEvidence('');
      fetchReports();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st.toUpperCase()) {
      case 'VERIFIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">VERIFIED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">UNDER REVIEW</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700">REJECTED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">PENDING</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Flag className="text-red-400 w-6 h-6" />
          Community Fraud Reporting
        </h1>
        <p className="text-xs text-slate-400">
          Crowdsourced vigilance: Report suspicious phone numbers, UPI identifiers, messages, or unverified investment groups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl h-fit">
          <h3 className="text-sm font-bold text-white">Lodge a New Complaint</h3>

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Check size={14} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Incident Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60"
            >
              <option value="INVESTMENT_SCAM">Investment Scam (Guaranteed Returns)</option>
              <option value="PHONE">Suspicious Phone Number</option>
              <option value="ACCOUNT">Suspicious UPI / Bank Account</option>
              <option value="SCAM_MESSAGE">Phishing / Social Engineering Message</option>
              <option value="PHISHING">Fake Regulatory Impersonation</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Phone Number (Optional)</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+919876543210"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Account or UPI ID (Optional)</label>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="e.g. suspect@okhdfcbank"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Incident Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Explain what happened (e.g. caller offered 40% returns and pressured for instant UPI payment)..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Evidence / Link (Optional)</label>
            <input
              type="text"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="WhatsApp chat link, Telegram handle, screenshot notes"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span>Submitting...</span> : <><Send size={14} /><span>Submit Report to Registry</span></>}
          </button>
        </form>

        {/* Community Registry List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Community Registry Reports</h3>
            <span className="text-xs text-slate-400">{reports.length} Reports Logged</span>
          </div>

          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{r.report_type.replace(/_/g, ' ')}</span>
                    {getStatusBadge(r.status)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{r.description}</p>

                {(r.account_id || r.phone_number) && (
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                    {r.phone_number && (
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        Phone: <strong className="text-slate-200">{r.phone_number}</strong>
                      </span>
                    )}
                    {r.account_id && (
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        Account: <strong className="text-slate-200">{r.account_id}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
