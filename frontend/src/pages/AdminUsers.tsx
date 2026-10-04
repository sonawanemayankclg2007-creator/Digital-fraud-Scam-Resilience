import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Filter, ShieldCheck, Check, X,
  RefreshCw, UserCheck, AlertCircle, Lock, Eye, EyeOff
} from 'lucide-react';
import { api } from '../services/api';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Create Analyst Modal
  const [showAnalystModal, setShowAnalystModal] = useState(false);
  const [analystName, setAnalystName] = useState('');
  const [analystEmail, setAnalystEmail] = useState('');
  const [analystPassword, setAnalystPassword] = useState('');
  const [analystPhone, setAnalystPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers({
        query: searchQuery || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleUserStatus = async (user: any) => {
    const newStatus = !user.is_active;
    const confirmMsg = newStatus
      ? `Activate user ${user.name}?`
      : `Deactivate user ${user.name}? They will not be able to log in.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.updateUserStatus(user.id, newStatus);
      setActionNotice(`User ${user.name} has been ${newStatus ? 'activated' : 'deactivated'}.`);
      fetchUsers();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user status.');
    }
  };

  const handleCreateAnalyst = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analystName.trim() || !analystEmail.trim() || !analystPassword) return;

    setSubmitting(true);
    try {
      await api.createAnalyst({
        name: analystName.trim(),
        email: analystEmail.trim(),
        password: analystPassword,
        phone: analystPhone.trim() || undefined
      });

      setActionNotice(`Analyst account created for ${analystName}. Role: ANALYST`);
      setShowAnalystModal(false);
      setAnalystName('');
      setAnalystEmail('');
      setAnalystPassword('');
      setAnalystPhone('');
      fetchUsers();
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create Analyst account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-rose-400 w-6 h-6" />
            User & Analyst Management
          </h1>
          <p className="text-xs text-slate-400">
            Oversee user accounts, risk activities, enforce deactivations, and securely onboard fraud analysts.
          </p>
        </div>

        <button
          onClick={() => setShowAnalystModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          <UserPlus size={16} />
          <span>+ Create Analyst Account</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500 pointer-events-none" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter size={13} />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg bg-slate-950 border border-slate-800 py-1.5 px-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">User</option>
              <option value="ANALYST">Analyst</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg bg-slate-950 border border-slate-800 py-1.5 px-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <button
            onClick={fetchUsers}
            className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Phone (Masked)</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Activity</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {u.phone || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : u.role === 'ANALYST'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.is_active
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      <span>{u.reports_submitted || 0} reports</span> •{' '}
                      <span>{u.alerts_received || 0} alerts</span>
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-400 font-mono">
                      {u.joined ? new Date(u.joined).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          u.is_active
                            ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ANALYST MODAL */}
      {showAnalystModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-purple-400" />
                <h3 className="text-base font-bold text-white">Create Analyst Account</h3>
              </div>
              <button
                onClick={() => setShowAnalystModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnalyst} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Analyst Name *
                </label>
                <input
                  type="text"
                  value={analystName}
                  onChange={(e) => setAnalystName(e.target.value)}
                  placeholder="e.g., Priya Patel"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={analystEmail}
                  onChange={(e) => setAnalystEmail(e.target.value)}
                  placeholder="priya.analyst@arthraksha.in"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={analystPhone}
                  onChange={(e) => setAnalystPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Temporary Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={analystPassword}
                    onChange={(e) => setAnalystPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 pl-3 pr-9 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-[11px] text-purple-300">
                This will automatically assign role <strong>ANALYST</strong> with access to network graph, fraud rings, and investigation queues.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAnalystModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>{submitting ? 'Creating...' : 'Create Analyst'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
