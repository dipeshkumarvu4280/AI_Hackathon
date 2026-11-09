import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendType?: 'neutral' | 'positive' | 'warning' | 'negative';
  subtitle?: string;
  accent?: 'blue' | 'cyan' | 'teal' | 'violet' | 'emerald' | 'amber' | 'indigo';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendType = 'neutral',
  subtitle,
  accent = 'blue',
  onClick,
  className = '',
}) => {
  const trendColors = {
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    negative: 'bg-red-50 text-red-700 border-red-200',
  };

  const accentBadges = {
    blue: 'bg-blue-50 text-[#2563EB] border border-blue-100',
    cyan: 'bg-teal-50 text-[#0D9488] border border-teal-100',
    teal: 'bg-teal-50 text-[#0D9488] border border-teal-100',
    violet: 'bg-violet-50 text-violet-700 border border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  };

  return (
    <Card
      onClick={onClick}
      className={`p-4 sm:p-5 relative overflow-hidden bg-white border-[#CBD5E1]/80 shadow-xs text-[#14213D] transition-all group ${
        onClick
          ? 'cursor-pointer hover:bg-slate-50/80 hover:border-blue-400/80 hover:shadow-md hover:-translate-y-1 active:translate-y-0 duration-200 ease-in-out motion-reduce:transform-none'
          : 'hover:border-slate-300'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-[#475569] uppercase tracking-wider block group-hover:text-[#2563EB] transition-colors truncate">
              {label}
            </span>
            {onClick && (
              <span className="text-[10px] font-bold text-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                Details →
              </span>
            )}
          </div>
          <div className="mt-1.5 sm:mt-2 flex flex-wrap items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14213D]">{value}</span>
            {trend && (
              <span className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold border ${trendColors[trendType]}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[10px] sm:text-[11px] text-[#64748B] font-medium block mt-1 truncate">{subtitle}</span>
          )}
        </div>

        <div className={`p-2.5 sm:p-3 rounded-xl ${accentBadges[accent]} shrink-0 group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
