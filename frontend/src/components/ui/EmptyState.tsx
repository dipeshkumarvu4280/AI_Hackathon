import React from 'react';
import { Layers } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Layers className="w-6 h-6 text-[#2563EB]" />,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-white space-y-3 my-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 shadow-xs flex items-center justify-center mx-auto text-[#2563EB]">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#14213D]">{title}</h4>
        <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-0.5 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
