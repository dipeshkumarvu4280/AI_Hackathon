import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, icon }) => {
  return (
    <div className="relative p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-r from-white via-[#F8FAFC] to-[#E8F0FE]/60 text-[#14213D] shadow-xs border border-[#CBD5E1]/80 mb-4 sm:mb-6 overflow-hidden">
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          {icon && (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5 [&>*]:text-white [&>*]:w-5 [&>*]:h-5">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#14213D] tracking-tight leading-snug flex items-center gap-2 break-words-safe">
              <span>{title}</span>
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed mt-1 max-w-3xl break-words-safe">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">{action}</div>}
      </div>
    </div>
  );
};
