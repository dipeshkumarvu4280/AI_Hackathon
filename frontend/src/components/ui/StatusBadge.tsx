import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  const styles: Record<string, string> = {
    eligible: 'bg-teal-50 text-teal-700 border-teal-200',
    applied: 'bg-blue-50 text-blue-700 border-blue-200',
    shortlisted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    interview: 'bg-amber-50 text-amber-700 border-amber-200',
    scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
    selected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    ongoing: 'bg-blue-50 text-blue-700 border-blue-200',
    in_session: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
    upcoming: 'bg-slate-50 text-slate-700 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_announcement: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
    pending_approval: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
    announced: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    changes_requested: 'bg-purple-50 text-purple-700 border-purple-200',
    request_changes: 'bg-purple-50 text-purple-700 border-purple-200',
    draft: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const currentStyle = styles[normalized] || 'bg-slate-50 text-slate-700 border-slate-200';

  const formatText = (text: string) => {
    const lower = text.toLowerCase();
    if (lower === 'pending_announcement' || lower === 'pending_approval') return 'Pending Approval';
    if (lower === 'announced') return 'Announced';
    if (lower === 'changes_requested') return 'Changes Requested';
    return text.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-wide ${currentStyle}`}>
      {formatText(status)}
    </span>
  );
};
