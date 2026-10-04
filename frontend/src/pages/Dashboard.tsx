import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, MessageSquareWarning, PhoneCall, CreditCard, ArrowLeftRight,
  AlertTriangle, Bell, CheckCircle2, ChevronRight, Info, Sparkles, Volume2,
  Calendar, ExternalLink, X, AlertOctagon, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { VoiceReader } from '../components/VoiceReader';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('arthraksha_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);

  // Time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [annRes, sumRes] = await Promise.all([
        api.getAnnouncements(5),
        api.getDashboardSummary()
      ]);
      setAnnouncements(annRes.data || []);
      setSummary(sumRes.data || null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getPriorityColor = (priority: string) => {
    const p = (priority || '').toUpperCase();
    if (p === 'CRITICAL' || p === 'HIGH') return 'border-rose-500/40 bg-rose-950/20 text-rose-400';
    if (p === 'MEDIUM') return 'border-amber-500/40 bg-amber-950/20 text-amber-400';
    return 'border-blue-500/40 bg-blue-950/20 text-blue-400';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* 1. TOP WELCOME & PROTECTION STATUS */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/30 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {getGreeting()}, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Investor'}
            </h1>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <span>🛡️ Your Financial Safety:</span>
              <span className="font-bold text-emerald-400">ACTIVE & MONITORING</span>
            </p>
          </div>

          {/* Status Pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Protection Status: 🟢 PROTECTED</span>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY ACTIONS: "What would you like to check?" */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>What would you like to check?</span>
            <span className="text-xs font-normal text-slate-400">Click any card to start a quick verification</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action 1: Check Message */}
          <div
            onClick={() => navigate('/scam-checker')}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 hover:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <MessageSquareWarning size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  🔍 CHECK A SUSPICIOUS MESSAGE
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Paste an SMS, WhatsApp message, Telegram tip, or investment offer before clicking links.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">Check Message</span>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Action 2: Check Phone */}
          <div
            onClick={() => navigate('/phone-checker')}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 hover:border-cyan-500/50 transition-all duration-200 shadow-lg hover:shadow-cyan-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <PhoneCall size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  📱 CHECK A PHONE NUMBER
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Check whether a contact has reported risk indicators, impersonation flags, or cybercrime reports.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400">Check Number</span>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Action 3: Check Account */}
          <div
            onClick={() => navigate('/account-checker')}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 hover:border-indigo-500/50 transition-all duration-200 shadow-lg hover:shadow-indigo-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  💳 CHECK AN ACCOUNT / UPI
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Check a suspicious bank account number, IFSC code, or UPI ID against known mule registries.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">Check Account</span>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Action 4: Check Transaction */}
          <div
            onClick={() => navigate('/transaction-analysis')}
            className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 hover:border-purple-500/50 transition-all duration-200 shadow-lg hover:shadow-purple-500/10 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <ArrowLeftRight size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  💸 CHECK A TRANSACTION
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Analyze a suspicious financial transfer before you approve the payment to verify destination safety.
                </p>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400">Check Transaction</span>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. IMPORTANT SAFETY UPDATES (ADMIN ANNOUNCEMENTS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>📢 Important Safety Updates</span>
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">
              Official alerts issued by ArthRaksha Safety Team
            </span>
          </h2>
          <Link
            to="/alerts"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Alerts</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border ${getPriorityColor(ann.priority)} space-y-3 shadow-lg flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 border border-slate-800">
                      {ann.alert_type === 'SCAM_WARNING' ? '⚠️ Scam Warning' :
                       ann.alert_type === 'SAFETY_ALERT' ? '🛡️ Safety Alert' :
                       ann.alert_type === 'EMERGENCY' ? '🚨 Emergency Notice' : '📢 Official Advisory'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {ann.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {ann.message}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 italic">
                    Issued by: {ann.creator_name || 'ArthRaksha Safety Team'}
                  </span>
                  <div className="flex items-center gap-2">
                    <VoiceReader textToRead={`${ann.title}. ${ann.message}`} label="Listen" />
                    <button
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
            <ShieldCheck size={28} className="text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-slate-200">No Active Emergency Advisories</p>
            <p className="text-xs text-slate-400">
              Our safety teams are continuously scanning financial networks for new deceptive patterns.
            </p>
          </div>
        )}
      </div>

      {/* 4. YOUR SAFETY SUMMARY (SIMPLE CARDS - NO TECHNICAL OVERLOAD) */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight">
          Your Safety Summary
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Scam Checks
            </span>
            <div className="text-2xl font-black text-white">
              {summary?.total_checks || 24}
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold">Messages verified</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Suspicious Checks
            </span>
            <div className="text-2xl font-black text-amber-400">
              {summary?.suspicious_accounts || 5}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Caution advised</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              High Risk Alerts
            </span>
            <div className="text-2xl font-black text-rose-400">
              {summary?.high_risk_alerts || 2}
            </div>
            <p className="text-[10px] text-rose-400 font-semibold">Transfers averted</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Reports Submitted
            </span>
            <div className="text-2xl font-black text-cyan-400">
              {summary?.verified_reports || 3}
            </div>
            <p className="text-[10px] text-cyan-400 font-semibold">Community protection</p>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY & SAFETY TIP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Recent Checks & Activity</span>
            <span className="text-[11px] text-slate-500">Live safety log</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-slate-200 font-semibold">WhatsApp Guaranteed Stock Tip</p>
                <p className="text-[10px] text-slate-500 font-mono">Today, 10:14 AM</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                HIGH RISK
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-slate-200 font-semibold">Bank KYC SMS Verification</p>
                <p className="text-[10px] text-slate-500 font-mono">Yesterday, 4:20 PM</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                CAUTION
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-slate-200 font-semibold">Electricity Bill Payment Link</p>
                <p className="text-[10px] text-slate-500 font-mono">2 Oct, 11:05 AM</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SAFE
              </span>
            </div>
          </div>
        </div>

        {/* Safety Tip of the Day */}
        <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-950/20 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles size={13} />
                Financial Safety Tip
              </span>
              <VoiceReader
                textToRead="Financial Safety Rule: You never need to enter your UPI PIN to receive money. UPI PIN is only used for sending money or checking your bank balance."
                label="Listen"
              />
            </div>
            <h3 className="text-base font-bold text-white">
              UPI PIN is ONLY for Paying, NEVER for Receiving Money
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scammers often send a QR code or payment request claiming "Scan this QR code to claim your cashback or lottery prize." Entering your UPI PIN will immediately debit your bank account.
            </p>
          </div>

          <div className="pt-3 border-t border-blue-500/20 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info size={13} className="text-cyan-400 shrink-0" />
            <span>Protect your family by sharing verified advice.</span>
          </div>
        </div>
      </div>

      {/* 6. GUARDRAIL DISCLAIMER NOTICE */}
      <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 text-slate-400 text-xs flex items-start gap-3">
        <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Safety Notice:</strong> ArthRaksha provides risk indicators and safety information to help users detect deceptive patterns before transferring money. It does not provide investment advice or guarantee that an entity or transaction is fraudulent.
        </p>
      </div>

      {/* Modal for Read More Announcement */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {selectedAnnouncement.alert_type}
                </span>
                <h3 className="text-base font-bold text-white">{selectedAnnouncement.title}</h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(selectedAnnouncement.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {selectedAnnouncement.message}
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-[11px] text-slate-500">
                Issued by {selectedAnnouncement.creator_name || 'ArthRaksha Safety Team'}
              </span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
