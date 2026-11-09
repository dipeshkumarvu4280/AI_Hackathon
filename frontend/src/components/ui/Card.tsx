import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover3d?: boolean;
  level?: 1 | 2;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover3d = true,
  level = 1,
}) => {
  const levelClass =
    level === 1
      ? 'bg-white border-[#CBD5E1]/80 text-[#14213D] shadow-xs'
      : 'bg-[#F8FAFC] border-slate-200 text-[#14213D] shadow-2xs';

  return (
    <div
      onClick={onClick}
      className={`${levelClass} rounded-2xl border ${
        hover3d ? 'card-3d-surface' : 'transition-all'
      } ${
        onClick
          ? 'cursor-pointer hover:border-blue-400/80 hover:shadow-md hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out motion-reduce:transform-none'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`p-4 sm:p-5 pb-2.5 sm:pb-3 border-b border-slate-100 bg-[#F8FAFC]/60 rounded-t-2xl ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <h3 className={`text-sm sm:text-base font-bold text-[#1E293B] tracking-tight ${className}`}>{children}</h3>;

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-4 sm:p-5 text-[#334155] ${className}`}>{children}</div>;
