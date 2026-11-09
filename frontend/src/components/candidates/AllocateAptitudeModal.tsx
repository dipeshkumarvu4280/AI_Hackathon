import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, X, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/Button';
import { apiService } from '../../services/api';
import { usePlacement } from '../../context/PlacementContext';

interface AllocateAptitudeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    student_name?: string;
    studentName?: string;
    company_name?: string;
    companyName?: string;
    job_title?: string;
    roleTitle?: string;
    drive_id?: string;
    driveId?: string;
    student_id?: string;
    studentId?: string;
  } | null;
  onSuccess?: (res: any) => void;
}

export const AllocateAptitudeModal: React.FC<AllocateAptitudeModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onSuccess,
}) => {
  const { triggerToast } = usePlacement();
  const [title, setTitle] = useState('Aptitude Assessment');
  const [scheduledAt, setScheduledAt] = useState('');
  const [deadline, setDeadline] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !candidate) return null;

  const studentName = candidate.student_name || candidate.studentName || 'Student Candidate';
  const companyName = candidate.company_name || candidate.companyName || 'Company';
  const jobTitle = candidate.job_title || candidate.roleTitle || 'Placement Role';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        application_id: candidate.id,
        drive_id: candidate.drive_id || candidate.driveId,
        student_id: candidate.student_id || candidate.studentId,
        round_type: 'APTITUDE',
        title: title.trim() || 'Aptitude Assessment',
        scheduled_at: scheduledAt || undefined,
        deadline: deadline || undefined,
        duration_minutes: Number(durationMinutes) || 30,
      };

      const result = await apiService.allocateAptitude(payload);
      triggerToast(`Allocated Aptitude Round to ${studentName}! Notification dispatched.`, 'success');
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to allocate aptitude round:', err);
      const detail = err?.response?.data?.detail || err?.message || 'Failed to allocate aptitude round.';
      setErrorMsg(detail);
      triggerToast(detail, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden text-[#14213D] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14213D]">Allocate Aptitude Round</h3>
              <p className="text-xs text-[#64748B]">{studentName} &bull; {companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#14213D] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Target Candidate &amp; Placement Role</span>
            <p className="text-xs font-bold text-[#14213D]">{studentName}</p>
            <p className="text-xs text-[#2563EB]">{jobTitle} at {companyName}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider block">
              Round Type
            </label>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              APTITUDE
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider block">
              Assessment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aptitude Assessment"
              className="w-full text-xs p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#2563EB]" /> Scheduled Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider block flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-600" /> Deadline (Optional)
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider block">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] font-bold"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-500 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Allocating...' : 'Confirm Aptitude Allocation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
