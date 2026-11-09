import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search drives, candidates, or panels...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all text-[#14213D] placeholder:text-slate-400 shadow-xs"
        {...props}
      />
    </div>
  );
};
