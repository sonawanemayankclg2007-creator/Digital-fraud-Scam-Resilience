import React from 'react';

interface RiskScoreGaugeProps {
  score: number;
  level: string;
  size?: number;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, level, size = 120 }) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColor = (lvl: string) => {
    switch (lvl.toUpperCase()) {
      case 'SAFE':
        return '#22c55e';
      case 'CAUTION':
        return '#f59e0b';
      case 'SUSPICIOUS':
        return '#f97316';
      case 'HIGH_RISK':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  const strokeColor = getColor(level);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress indicator */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-white">{clampedScore}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">/ 100</span>
      </div>
    </div>
  );
};
