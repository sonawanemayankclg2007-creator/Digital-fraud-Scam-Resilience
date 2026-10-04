import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', className = '' }) => {
  const normLevel = (level || 'SAFE').toUpperCase();

  const styles = {
    SAFE: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: ShieldCheck,
      label: 'SAFE'
    },
    CAUTION: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      label: 'CAUTION'
    },
    SUSPICIOUS: {
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      icon: ShieldAlert,
      label: 'SUSPICIOUS'
    },
    HIGH_RISK: {
      bg: 'bg-red-500/15 text-red-400 border-red-500/40 glow-danger',
      icon: AlertOctagon,
      label: 'HIGH RISK'
    }
  };

  const current = styles[normLevel as keyof typeof styles] || styles.SAFE;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs font-semibold',
    lg: 'px-4 py-1.5 text-sm font-bold'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${current.bg} ${sizeClasses[size]} ${className}`}
    >
      <Icon size={iconSizes[size]} className="shrink-0" />
      <span>{current.label}</span>
    </span>
  );
};
