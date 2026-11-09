import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'brand' | 'violet' | 'emerald' | 'cyan' | 'teal' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary:
      'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-[#2563EB] shadow-xs',
    brand:
      'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-[#2563EB] shadow-xs',
    violet:
      'bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 shadow-xs',
    emerald:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-xs',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-xs',
    cyan:
      'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-xs',
    teal:
      'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-xs',
    secondary:
      'bg-[#E8F0FE] text-[#2563EB] hover:bg-[#DBEAFE] border border-blue-200 focus:ring-[#2563EB]',
    outline:
      'bg-white text-[#1E293B] border border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-[#2563EB] shadow-xs',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-[#14213D] focus:ring-[#2563EB] shadow-none hover:shadow-none',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-xs',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs font-bold gap-2',
    lg: 'px-5 py-2.5 text-sm font-bold gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
