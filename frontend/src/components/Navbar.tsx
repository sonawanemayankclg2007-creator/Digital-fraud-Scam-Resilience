import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, Bell, LogOut, CheckCheck, AlertCircle, Info, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { api } from '../services/api';

interface NavbarProps {
  onOpenDemo: () => void;
  currentUser: any;
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemo,
  currentUser,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifData = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        api.getUnreadNotificationCount(),
        api.getNotifications(10)
      ]);
      setUnreadCount(countRes.data?.unread_count || 0);
      setNotifications(listRes.data || []);
    } catch (e) {
      // Fallback if not authenticated or offline
    }
  };

  useEffect(() => {
    fetchNotifData();
    const interval = setInterval(fetchNotifData, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenNotification = async (notif: any) => {
    setSelectedNotif(notif);
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getPriorityBadge = (priority: string, type?: string) => {
    const p = (priority || '').toUpperCase();
    if (p === 'CRITICAL' || p === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          High Priority
        </span>
      );
    }
    if (p === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Safety Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        System Notice
      </span>
    );
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return `${diffMins} min ago`;
    }
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-white">ARTHRAKSHA</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  PROTECTED
                </span>
              </div>
              <p className="text-[10px] tracking-wide text-slate-400 hidden sm:block">
                "Detect. Explain. Warn. Protect."
              </p>
            </div>
          </Link>
        </div>

        {/* Center Navigation Links (User Perspective) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <Link to="/dashboard" className="hover:text-blue-400 transition-colors">
            Dashboard
          </Link>
          <Link to="/alerts" className="hover:text-blue-400 transition-colors">
            Safety Updates
          </Link>
          <Link to="/privacy" className="hover:text-blue-400 transition-colors">
            Privacy & Trust
          </Link>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* 1-Click Demo Scenario Launcher */}
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            title="Launch 15-Step Evaluator Scenario"
          >
            <Sparkles size={13} className="text-cyan-300 animate-pulse" />
            <span className="hidden sm:inline">Scenario Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Notification Bell with Unread Badge */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="navbar-notification-bell"
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                if (!showNotifDropdown) fetchNotifData();
              }}
              className="relative p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Important Safety Notifications"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-md shadow-rose-500/50 animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Center Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl p-4 space-y-3 z-50 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Notification Center</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={13} />
                      <span>Mark all as read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/50">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleOpenNotification(n)}
                        className={`pt-2 pb-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                          !n.is_read
                            ? 'bg-slate-800/60 hover:bg-slate-800/90 font-medium'
                            : 'hover:bg-slate-950/40 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          {getPriorityBadge(n.priority, n.notification_type)}
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatRelativeTime(n.sent_at)}
                          </span>
                        </div>
                        <h4 className={`text-xs ${!n.is_read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                          {n.title || 'Safety Notice'}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No notifications right now. You are safe and protected.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info & Logout */}
          {currentUser ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-200">{currentUser.name}</div>
                <div className="flex items-center justify-end gap-1.5">
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : currentUser.role === 'ANALYST'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Full Notification Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                {getPriorityBadge(selectedNotif.priority, selectedNotif.notification_type)}
                <h3 className="text-base font-bold text-white">{selectedNotif.title || 'Safety Alert'}</h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(selectedNotif.sent_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {selectedNotif.message}
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-[11px] text-slate-500">Issued by ArthRaksha Safety Team</span>
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
