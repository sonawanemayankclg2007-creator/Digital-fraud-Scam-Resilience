import React, { useState, useEffect } from 'react';
import {
  Megaphone, Plus, Trash2, CheckCircle, AlertTriangle, Clock,
  Eye, RefreshCw, X, Send, Sparkles, AlertOctagon, Check
} from 'lucide-react';
import { api } from '../services/api';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewModal, setPreviewModal] = useState<any | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('SCAM_WARNING');
  const [priority, setPriority] = useState('HIGH');
  const [targetAudience, setTargetAudience] = useState('ALL_USERS');
  const [targetUserIds, setTargetUserIds] = useState('');
  const [language, setLanguage] = useState('en');
  const [expiresAt, setExpiresAt] = useState('');
  const [sendExternal, setSendExternal] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAnnouncements(50);
      setAnnouncements(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      let userIdsList: number[] | undefined = undefined;
      if (targetAudience === 'SPECIFIC_USERS' && targetUserIds.trim()) {
        userIdsList = targetUserIds
          .split(',')
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id));
      }

      await api.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        alert_type: alertType,
        priority: priority,
        target_audience: targetAudience,
        target_user_ids: userIdsList,
        language: language,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        send_external: sendExternal && (priority === 'HIGH' || priority === 'CRITICAL'),
      });

      setActionNotice(`Announcement "${title}" published successfully! Sent to user dashboards.`);
      setShowCreateModal(false);
      resetForm();
      fetchAnnouncements();
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.toggleAnnouncementStatus(id, !currentStatus);
      setActionNotice(`Announcement #${id} status updated.`);
      fetchAnnouncements();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to permanently delete announcement #${id}?`)) {
      return;
    }
    try {
      await api.deleteAnnouncement(id);
      setActionNotice(`Announcement #${id} deleted.`);
      fetchAnnouncements();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setAlertType('SCAM_WARNING');
    setPriority('HIGH');
    setTargetAudience('ALL_USERS');
    setTargetUserIds('');
    setLanguage('en');
    setExpiresAt('');
    setSendExternal(false);
  };

  const getPriorityBadge = (p: string) => {
    const val = (p || '').toUpperCase();
    if (val === 'CRITICAL' || val === 'HIGH') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">HIGH</span>;
    }
    if (val === 'MEDIUM') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">MEDIUM</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">LOW</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="text-rose-400 w-6 h-6" />
            Communication Center
          </h1>
          <p className="text-xs text-slate-400">
            Publish official fraud warnings, safety advisories, and system notifications directly to user dashboards.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>+ Create Announcement</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Announcements Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Published Announcements ({announcements.length})
          </h3>
          <button
            onClick={fetchAnnouncements}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Title & Message</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-white leading-snug">{ann.title}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{ann.message}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {ann.alert_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getPriorityBadge(ann.priority)}
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono text-slate-300">
                      {ann.target_audience === 'ALL_USERS' ? 'All Users' : 'Targeted'}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-slate-400 font-mono">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ann.is_active
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {ann.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewModal(ann)}
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-blue-400 hover:bg-slate-800 transition-colors"
                          title="Preview details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(ann.id, ann.is_active)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            ann.is_active
                              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {ann.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
                          title="Delete announcement"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    No announcements created yet. Click "+ Create Announcement" to broadcast to users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-rose-400" />
                <h3 className="text-base font-bold text-white">Create Safety Announcement</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., New Investment Scam Alert"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Users are advised to be cautious of messages promising guaranteed returns. Verify the sender and payment destination before transferring money."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2.5 px-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {/* Alert Type & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Alert Type
                  </label>
                  <div className="space-y-1 text-xs">
                    {[
                      { val: 'GENERAL', label: 'General' },
                      { val: 'SAFETY_ALERT', label: 'Safety Alert' },
                      { val: 'SCAM_WARNING', label: 'Scam Warning' },
                      { val: 'SYSTEM_NOTICE', label: 'System Notice' },
                      { val: 'EMERGENCY', label: 'Emergency' },
                    ].map((t) => (
                      <label key={t.val} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                        <input
                          type="radio"
                          name="alertType"
                          value={t.val}
                          checked={alertType === t.val}
                          onChange={(e) => setAlertType(e.target.value)}
                          className="text-rose-500 focus:ring-rose-500"
                        />
                        <span>{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Priority
                  </label>
                  <div className="space-y-1 text-xs">
                    {[
                      { val: 'LOW', label: 'Low', color: 'text-blue-400' },
                      { val: 'MEDIUM', label: 'Medium', color: 'text-amber-400' },
                      { val: 'HIGH', label: 'High', color: 'text-orange-400' },
                      { val: 'CRITICAL', label: 'Critical', color: 'text-rose-400' },
                    ].map((p) => (
                      <label key={p.val} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                        <input
                          type="radio"
                          name="priority"
                          value={p.val}
                          checked={priority === p.val}
                          onChange={(e) => setPriority(e.target.value)}
                          className="text-rose-500 focus:ring-rose-500"
                        />
                        <span className={p.color}>{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Audience & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Send To
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-slate-200"
                  >
                    <option value="ALL_USERS">All Users (Broadcast)</option>
                    <option value="SPECIFIC_USERS">Selected Users (Targeted)</option>
                  </select>

                  {targetAudience === 'SPECIFIC_USERS' && (
                    <input
                      type="text"
                      value={targetUserIds}
                      onChange={(e) => setTargetUserIds(e.target.value)}
                      placeholder="Comma-separated user IDs (e.g. 1, 3, 5)"
                      className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-slate-200"
                    />
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-slate-200"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="gu">ગુજરાતી (Gujarati)</option>
                  </select>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Expiry Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 py-2 px-3 text-xs text-slate-200"
                />
              </div>

              {/* External Alert Option for Critical / High */}
              {(priority === 'HIGH' || priority === 'CRITICAL') && (
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-rose-300 block">External Multi-Channel Dispatch</span>
                    <span className="text-[10px] text-slate-400">
                      Dispatches SMS / WhatsApp / Push / Email to users with verified notification consent.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendExternal}
                    onChange={(e) => setSendExternal(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Live Preview Section */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/90 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Live User Dashboard Preview
                </span>
                <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/20 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-rose-400 uppercase">
                      ⚠️ {alertType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-500">Just Now</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{title || 'Your announcement title here'}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {message || 'Your announcement message content will appear in this preview.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Publishing...' : 'Publish Alert'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PREVIEW MODAL */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                {getPriorityBadge(previewModal.priority)}
                <h3 className="text-base font-bold text-white">{previewModal.title}</h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Created {new Date(previewModal.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setPreviewModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {previewModal.message}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <div>Type: <strong className="text-slate-200">{previewModal.alert_type}</strong></div>
              <div>Audience: <strong className="text-slate-200">{previewModal.target_audience}</strong></div>
              <div>Language: <strong className="text-slate-200">{previewModal.language}</strong></div>
              <div>Expires: <strong className="text-slate-200">{previewModal.expires_at ? new Date(previewModal.expires_at).toLocaleDateString() : 'Never'}</strong></div>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setPreviewModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
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
