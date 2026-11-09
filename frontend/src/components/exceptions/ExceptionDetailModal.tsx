import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, Sparkles, UserCheck, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { ExceptionItem } from '../../types';
import { usePlacement } from '../../context/PlacementContext';
import { Button } from '../ui/Button';

interface ExceptionDetailModalProps {
  exception: ExceptionItem | null;
  onClose: () => void;
}

export const ExceptionDetailModal: React.FC<ExceptionDetailModalProps> = ({ exception, onClose }) => {
  const navigate = useNavigate();
  const { approveExceptionRecommendation, updateExceptionStatus } = usePlacement();

  if (!exception) return null;

  const handleApprove = () => {
    approveExceptionRecommendation(exception.id);
    onClose();
  };

  const handleIgnore = () => {
    updateExceptionStatus(exception.id, 'ignored');
    onClose();
  };

  const handleNavigateAction = () => {
    onClose();
    if (exception.actionRoute) {
      navigate(exception.actionRoute);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-150 text-[#14213D]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-200 text-[#14213D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg font-bold text-xs shadow-xs ${
                exception.severity === 'critical'
                  ? 'bg-red-50 text-red-600'
                  : exception.severity === 'warning'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-[#2563EB]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14213D] tracking-tight">AI Exception Review &amp; Resolution</h3>
              <p className="text-xs text-[#64748B]">Category: {exception.category.toUpperCase()} &bull; ID: {exception.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#64748B] hover:text-[#14213D] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Issue Overview Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span
                className={`font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  exception.severity === 'critical'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : exception.severity === 'warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                }`}
              >
                {exception.severity} SEVERITY
              </span>
              <span className="text-[#64748B] font-semibold">{exception.timestamp}</span>
            </div>
            <h4 className="text-base font-bold text-[#14213D]">{exception.title}</h4>
            <p className="text-[#64748B] leading-relaxed font-medium">{exception.description}</p>
            <div className="pt-1 text-[11px] text-[#64748B]">
              Affected Entity: <span className="font-bold text-[#14213D]">{exception.affectedEntity}</span>
            </div>
          </div>

          {/* AI RECOMMENDATION BOX */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <span className="text-xs font-bold text-[#2563EB] uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2563EB]" /> AI Recommended Resolution
              </span>
              <span className="text-[10px] font-bold text-[#2563EB] bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                Verified Optimal
              </span>
            </div>

            <p className="text-xs font-bold text-[#14213D] leading-relaxed">{exception.aiRecommendation}</p>

            {/* Suggested Action Verification Indicators */}
            <div className="p-3 bg-white rounded-lg border border-blue-100 space-y-2 text-xs">
              <span className="font-semibold text-[#64748B] block">Proposed Operation Details:</span>
              <p className="font-bold text-[#2563EB]">{exception.suggestedActionText}</p>
              <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-bold text-emerald-700">
                {exception.candidateAvailable !== false && <span>✓ Candidate available</span>}
                {exception.panelAvailable !== false && <span>✓ Panel available</span>}
                {exception.roomAvailable !== false && <span>✓ Room available</span>}
              </div>
            </div>

            {/* MANDATORY HUMAN-IN-THE-LOOP CONTROL NOTICE */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>AI Recommendation — Requires Placement Officer approval before applying changes.</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-amber-100 px-2 py-0.5 rounded text-amber-800">
                Human Oversight Required
              </span>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={handleIgnore}>
              Ignore Exception
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                icon={<ExternalLink className="w-3.5 h-3.5" />}
                onClick={handleNavigateAction}
              >
                Go to Associated Workflow
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Check className="w-3.5 h-3.5" />}
                onClick={handleApprove}
              >
                Approve Recommendation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
