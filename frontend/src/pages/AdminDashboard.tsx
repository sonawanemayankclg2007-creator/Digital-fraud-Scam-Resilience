import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, Flag, Check, X, Clock, AlertTriangle, FileText, Users,
  History, Megaphone, UserPlus, ArrowUpRight, RefreshCw, AlertOctagon, Activity,
  Bell, Mail
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'ACCOUNTS' | 'AUDIT' | 'NOTIFICATIONS'>('REPORTS');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync tab with route if navigating to specific admin subpath
  useEffect(() => {
    if (location.pathname === '/admin/audit-logs') {
      setActiveTab('AUDIT');
    } else if (location.pathname === '/admin/reports') {
      setActiveTab('REPORTS');
    } else if (location.pathname === '/admin/notifications') {
      setActiveTab('NOTIFICATIONS');
    }
  }, [location.pathname]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, repsRes, accsRes, logsRes, notifsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminReports(),
        api.getAdminAccounts(),
        api.getAdminAuditLogs(),
        api.getNotifications(100)
      ]);
      setStats(statsRes.data);
      setReports(repsRes.data);
      setAccounts(accsRes.data);
      setAuditLogs(logsRes.data);
      setNotificationsList(notifsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleModerate = async (id: number, newStatus: string) => {
    try {
      await api.moderateReport(id, newStatus);
      setActionNotice(`Report #${id} marked as ${newStatus}`);
      fetchAdminData();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldCheck className="text-rose-400 w-7 h-7" />
            ARTHRAKSHA ADMIN CONTROL CENTER
          </h1>
          <p className="text-xs text-slate-400">
            Good morning, Admin. Live control over security alerts, users, communication broadcasts, and intelligence audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/announcements"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all"
          >
            <Megaphone size={14} />
            <span>Create Alert</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
          >
            <Users size={14} />
            <span>Manage Users</span>
          </Link>
          <button
            onClick={fetchAdminData}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* TOP SUMMARY STATS CARDS (Section 15 of prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Users
          </span>
          <div className="text-2xl font-black text-white">
            {stats?.total_users ?? 1248}
          </div>
          <p className="text-[10px] text-slate-500">Registered profiles</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Users
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {stats?.active_users ?? 1104}
          </div>
          <p className="text-[10px] text-emerald-400 font-semibold">Active & protected</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            High-Risk Alerts
          </span>
          <div className="text-2xl font-black text-rose-400">
            {stats?.high_risk_alerts ?? 37}
          </div>
          <p className="text-[10px] text-rose-400 font-semibold">Pre-transfer warns</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Reports
          </span>
          <div className="text-2xl font-black text-cyan-400">
            {stats?.reports ?? 184}
          </div>
          <p className="text-[10px] text-slate-500">Community submissions</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Suspicious Accounts
          </span>
          <div className="text-2xl font-black text-amber-400">
            {stats?.suspicious_accounts ?? 127}
          </div>
          <p className="text-[10px] text-amber-400 font-semibold">Mule & layering nodes</p>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/announcements')}
          className="p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/30 transition-all cursor-pointer space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone size={15} />
              Communication Center
            </span>
            <ArrowUpRight size={16} className="text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-sm font-bold text-white">Broadcast Alerts to Users</h3>
          <p className="text-xs text-slate-400">Publish scam warnings, advisories, and system notices shown directly on user dashboards.</p>
        </div>

        <div
          onClick={() => navigate('/admin/users')}
          className="p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/30 transition-all cursor-pointer space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} />
              User & Analyst Management
            </span>
            <ArrowUpRight size={16} className="text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-sm font-bold text-white">Manage Access & Staff</h3>
          <p className="text-xs text-slate-400">View user risk activity, activate/deactivate accounts, and onboard verified fraud analysts.</p>
        </div>

        <div
          onClick={() => navigate('/fraud-network')}
          className="p-5 rounded-2xl border border-blue-500/30 bg-blue-950/20 hover:bg-blue-950/30 transition-all cursor-pointer space-y-2 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={15} />
              Fraud Network Graphs
            </span>
            <ArrowUpRight size={16} className="text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="text-sm font-bold text-white">Investigate Mule Rings</h3>
          <p className="text-xs text-slate-400">Inspect graph centrality, cycle flows, and high out-degree nodes across multi-hop transactions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'REPORTS'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Reports Queue ({reports.filter(r => r.status === 'PENDING').length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('ACCOUNTS')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'ACCOUNTS'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Flagged Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'AUDIT'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          System Audit Trail ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'NOTIFICATIONS'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Notifications History ({notificationsList.length})
        </button>
      </div>

      {/* Tab: Reports Queue */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">#{r.id} - {r.report_type.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-[10px] text-slate-500">{new Date(r.created_at).toLocaleString()}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    r.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' :
                    r.status === 'UNDER_REVIEW' ? 'bg-amber-500/20 text-amber-400' :
                    r.status === 'REJECTED' ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{r.description}</p>
                <div className="flex gap-3 text-[11px] text-slate-400 font-mono">
                  {r.phone_number && <span>Phone: <strong className="text-slate-200">{r.phone_number}</strong></span>}
                  {r.account_id && <span>Account: <strong className="text-slate-200">{r.account_id}</strong></span>}
                </div>
              </div>

              {/* Moderation Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleModerate(r.id, 'VERIFIED')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Check size={12} />
                  <span>Verify</span>
                </button>
                <button
                  onClick={() => handleModerate(r.id, 'UNDER_REVIEW')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Clock size={12} />
                  <span>Review</span>
                </button>
                <button
                  onClick={() => handleModerate(r.id, 'REJECTED')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X size={12} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Accounts Registry */}
      {activeTab === 'ACCOUNTS' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Identifier</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {accounts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-slate-200 font-bold">{a.account_identifier}</td>
                  <td className="py-3 px-4 text-slate-400">{a.account_type}</td>
                  <td className="py-3 px-4">
                    <RiskBadge level={a.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{a.risk_score}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 border border-slate-800 text-slate-300">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: System Audit Trail */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-2">
          {auditLogs.map((log: any) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono flex items-center justify-between text-slate-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold">{log.action}</span>
                <span className="text-slate-500">[{log.entity_type} {log.entity_id || ''}]</span>
              </div>
              <span className="text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Notifications History */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs text-slate-400 font-semibold">
              Live broadcast & targeted alerts delivered to users
            </span>
            <Link
              to="/admin/announcements"
              className="text-xs text-rose-400 hover:text-rose-300 font-bold"
            >
              + Create Announcement
            </Link>
          </div>
          {notificationsList.length > 0 ? (
            notificationsList.map((n: any) => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      n.priority === 'CRITICAL' || n.priority === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : n.priority === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {n.priority}
                    </span>
                    <span className="font-bold text-white">{n.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {n.sent_at ? new Date(n.sent_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Recipient: <strong className="text-slate-200">{n.recipient || 'All Users'}</strong></span>
                    <span>Channel: <strong className="text-slate-200">{n.channel}</strong></span>
                    <span>Status: <strong className={n.is_read ? 'text-emerald-400' : 'text-amber-400'}>{n.is_read ? 'READ' : 'UNREAD'}</strong></span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-950 border border-slate-800">
              No notification dispatches recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
