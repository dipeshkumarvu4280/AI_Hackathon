import React from 'react';
import { X, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';

export const ToastContainer: React.FC = () => {
  const { toastsList, dismissToast } = usePlacement();

  if (toastsList.length === 0) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-5 left-3 right-3 sm:left-auto sm:right-5 z-50 flex flex-col gap-2 max-w-sm w-auto sm:w-full pointer-events-none">
      {toastsList.map((toast) => (
        <div
          key={toast.id}
          className={`p-3.5 rounded-xl bg-white text-[#14213D] shadow-lg flex items-center justify-between gap-3 pointer-events-auto border border-slate-200 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'error'
              ? 'border-l-4 border-l-red-500'
              : toast.type === 'warning'
              ? 'border-l-4 border-l-amber-500'
              : 'border-l-4 border-l-[#2563EB]'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
