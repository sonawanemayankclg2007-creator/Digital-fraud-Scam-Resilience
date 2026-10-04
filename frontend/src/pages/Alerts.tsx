import React, { useState, useEffect } from 'react';
import { BellRing, Send, ShieldAlert, CheckCircle2, History, AlertTriangle, MessageSquare, Smartphone, Mail, Check } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { VoiceReader } from '../components/VoiceReader';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [channel, setChannel] = useState<'SMS' | 'WHATSAPP' | 'PUSH' | 'EMAIL'>('SMS');
  const [recipient, setRecipient] = useState('+919876543210');
  const [message, setMessage] = useState('Suspicious guaranteed investment solicitation detected. Do not transfer funds.');
  const [lang, setLang] = useState('en');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [alertsRes, notifsRes] = await Promise.all([
        api.getAlerts(30),
        api.getNotifications(30)
      ]);
      setAlerts(alertsRes.data);
      setNotifications(notifsRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api.sendNotification({
        channel,
        recipient: recipient.trim(),
        message: message.trim(),
        language: lang
      });
      setSendSuccess(`Alert dispatched via ${channel}! Response: ${res.data.status}`);
      fetchData();
      setTimeout(() => setSendSuccess(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BellRing className="text-blue-400 w-6 h-6" />
          Alerts & Multi-Channel Notification Center
        </h1>
        <p className="text-xs text-slate-400">
          Proactive pre-transaction warnings dispatched across DLT-compliant SMS, verified WhatsApp, Push, and Email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual / Simulated Dispatcher */}
        <form onSubmit={handleSendNotification} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 shadow-xl h-fit">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Send size={15} className="text-blue-400" />
            Dispatch Security Alert
          </h3>

          {sendSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Check size={14} className="shrink-0" />
              <span>{sendSuccess}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Channel</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['SMS', 'WHATSAPP', 'PUSH', 'EMAIL'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => {
                    setChannel(ch);
                    if (ch === 'EMAIL') setRecipient('investor@arthraksha.in');
                    else if (ch === 'PUSH') setRecipient('fcm_token_device_9941');
                    else setRecipient('+919876543210');
                  }}
                  className={`py-2 px-2.5 rounded-xl border font-bold transition-all text-center ${
                    channel === ch
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
              Recipient ({channel === 'EMAIL' ? 'Email' : channel === 'PUSH' ? 'Device Token' : 'Phone'})
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Preferred Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Alert Advisory Context</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60"
              required
            />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400">
            🛡️ DLT Guarantee: Passwords, OTPs, CVVs, and account credentials are strictly scrubbed prior to dispatch.
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {sending ? <span>Dispatching...</span> : <><Send size={14} /><span>Dispatch Alert</span></>}
          </button>
        </form>

        {/* Live Notification Audit Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              Notification Delivery Audit Log
            </h3>
            <span className="text-xs text-slate-400">{notifications.length} Logs</span>
          </div>

          <div className="space-y-2.5">
            {notifications.map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 text-[10px]">
                      {n.channel}
                    </span>
                    <span className="font-mono text-slate-300 text-xs font-semibold">{n.recipient}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {n.status}
                  </span>
                </div>

                <p className="text-slate-300 font-sans leading-relaxed whitespace-pre-line">{n.message}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                  <span>Provider: MSG91 / Firebase / Resend</span>
                  <span>{new Date(n.sent_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
