import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm transition-all animate-fadeIn cursor-default overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[92vh] flex flex-col my-auto overflow-hidden border border-slate-200 transition-all text-[#14213D]`}>
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 bg-[#F8FAFC] shrink-0">
          <h3 className="text-sm sm:text-base font-bold text-[#14213D] tracking-tight truncate pr-2">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB] shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 text-[#334155] overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
};
