import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, MessageSquareWarning, Award, PhoneCall,
  CreditCard, ArrowLeftRight, Share2, Network, Flag,
  BellRing, ShieldCheck, Lock, Sliders, LineChart,
  Megaphone, Users, UserCheck, ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentUser: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const { t } = useTranslation();
  const role = currentUser?.role || 'USER';

  // Navigation sets customized by Role
  const userItems = [
    { to: '/dashboard', label: t('nav.dashboard', 'Safety Home'), icon: LayoutDashboard },
    { to: '/scam-checker', label: t('nav.scamChecker', 'Check Message'), icon: MessageSquareWarning, badge: 'AI' },
    { to: '/phone-checker', label: t('nav.phoneChecker', 'Check Phone'), icon: PhoneCall },
    { to: '/account-checker', label: t('nav.accountChecker', 'Check Account / UPI'), icon: CreditCard },
    { to: '/transaction-analysis', label: t('nav.transactions', 'Check Transaction'), icon: ArrowLeftRight },
    { to: '/claim-checker', label: t('nav.claimChecker', 'Check Claim'), icon: Award },
    { to: '/alerts', label: t('nav.alerts', 'Safety Updates'), icon: BellRing },
    { to: '/reports', label: t('nav.communityReports', 'Report a Scam'), icon: Flag },
  ];

  const analystItems = [
    { to: '/analyst', label: t('nav.analyst', 'Investigation Hub'), icon: LineChart, badge: 'Active' },
    { to: '/fraud-network', label: t('nav.fraudNetwork', 'Network Graph'), icon: Share2, badge: 'Graph' },
    { to: '/fraud-rings', label: t('nav.fraudRings', 'Fraud Rings & Mules'), icon: Network },
    { to: '/reports', label: t('nav.communityReports', 'Reports Queue'), icon: Flag },
    { to: '/transaction-analysis', label: t('nav.transactions', 'Transaction Explorer'), icon: ArrowLeftRight },
    { to: '/account-checker', label: t('nav.accountChecker', 'Account Registry'), icon: CreditCard },
    { to: '/phone-checker', label: t('nav.phoneChecker', 'Phone Risk Lookup'), icon: PhoneCall },
  ];

  const adminItems = [
    { to: '/admin', label: 'Dashboard', icon: ShieldCheck, badge: 'Admin' },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/analysts', label: 'Analysts', icon: UserCheck },
    { to: '/admin/reports', label: 'Reports', icon: ShieldAlert },
    { to: '/fraud-network', label: 'Fraud Networks', icon: Share2 },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone, badge: 'Broadcast' },
    { to: '/admin/notifications', label: 'Notifications', icon: BellRing },
    { to: '/transaction-analysis', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/analyst', label: 'Analytics', icon: LineChart },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: Lock },
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: Sliders },
  ];

  // Footer items without duplicate Settings for ADMIN
  const footerItems = role === 'ADMIN'
    ? [{ to: '/privacy', label: t('nav.privacy', 'Privacy & Trust'), icon: Lock }]
    : [
        { to: '/privacy', label: t('nav.privacy', 'Privacy & Trust'), icon: Lock },
        { to: '/settings', label: t('nav.settings', 'Settings'), icon: Sliders },
      ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-800 bg-slate-950/70 p-4 min-h-[calc(100vh-4rem)]">
      {/* Role Title Section */}
      <div className="space-y-1 mb-2">
        <div className="px-3 pb-2 text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center justify-between">
          <span>{role === 'ADMIN' ? 'Admin Portal' : role === 'ANALYST' ? 'Analyst Studio' : 'User Protection'}</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
            role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
            role === 'ANALYST' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {role}
          </span>
        </div>

        {/* Dynamic Nav based on role */}
        {(role === 'ADMIN' ? adminItems : role === 'ANALYST' ? analystItems : userItems).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? role === 'ADMIN'
                      ? 'bg-rose-600/15 text-rose-300 border border-rose-500/30'
                      : role === 'ANALYST'
                      ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30'
                      : 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                  role === 'ADMIN' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  role === 'ANALYST' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                  'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer System Links */}
      <div className="mt-auto pt-6 border-t border-slate-800/80 space-y-1">
        {footerItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`
              }
            >
              <Icon size={15} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="px-3 pt-3 text-[10px] text-slate-500">
          <p className="font-bold">ARTHRAKSHA v2.0</p>
          <p className="text-emerald-400 font-medium">Fintech & Scam Resilience</p>
        </div>
      </div>
    </aside>
  );
};
