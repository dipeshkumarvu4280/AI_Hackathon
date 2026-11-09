import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Sparkles, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChecklistItem {
  key: string;
  label: string;
  completed: boolean;
  weight?: number;
}

interface ProfileCompletionWidgetProps {
  completion: number;
  isComplete: boolean;
  missingRequirements?: string[];
  checklist?: ChecklistItem[];
  compact?: boolean;
  showCTA?: boolean;
}

export const ProfileCompletionWidget: React.FC<ProfileCompletionWidgetProps> = ({
  completion,
  isComplete,
  missingRequirements = [],
  checklist = [],
  compact = false,
  showCTA = true,
}) => {
  const navigate = useNavigate();
  const clampedCompletion = Math.min(100, Math.max(0, completion || 0));

  const defaultChecklist: ChecklistItem[] = [
    { key: 'resume', label: 'Resume Upload & AI Analysis', completed: isComplete || clampedCompletion >= 25 },
    { key: 'skills', label: 'Verified Technical Skills', completed: isComplete || clampedCompletion >= 50 },
    { key: 'education', label: 'Academic & Education Details', completed: isComplete || clampedCompletion >= 75 },
    { key: 'projects', label: 'Projects & Experience', completed: isComplete || clampedCompletion >= 100 },
  ];

  const items = checklist.length > 0 ? checklist : defaultChecklist;

  if (compact) {
    return (
      <div className={`p-4 rounded-2xl border ${isComplete ? 'bg-emerald-50/60 border-emerald-200/80' : 'bg-amber-50/60 border-amber-200/80'} text-[#14213D]`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#14213D]">
                  {isComplete ? 'Profile Complete (Ready to Apply)' : `Profile Incomplete (${clampedCompletion}%)`}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isComplete ? 'Eligible' : 'Gated'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {isComplete
                  ? 'All placement criteria verified. You can submit drive applications.'
                  : 'Upload your resume to extract verified skills and unlock drive applications.'}
              </p>
            </div>
          </div>
          {!isComplete && showCTA && (
            <Button
              variant="primary"
              size="sm"
              className="shrink-0 text-xs py-1.5 px-3 bg-[#2563EB] hover:bg-[#1D4ED8]"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() => navigate('/student/resume')}
            >
              Complete Profile
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4 sm:space-y-5 text-[#14213D]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${isComplete ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {isComplete ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
              {isComplete ? 'Placement Eligible' : 'Application Submission Gated'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#14213D]">
            {isComplete ? 'Profile Complete & Placement Verified' : 'Complete Your Placement Profile'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xl font-medium leading-relaxed">
            {isComplete
              ? 'Your profile contains verified skills and academic credentials extracted from your resume. You are eligible to apply for active placement drives.'
              : 'PlaceMind requires an uploaded resume and verified technical skills before you can register for campus placement drives.'}
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3.5 sm:gap-4 shrink-0 shadow-xs self-start md:self-auto">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
            <svg className="w-14 h-14 sm:w-16 sm:h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="5" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke={isComplete ? '#0D9488' : '#2563EB'}
                strokeWidth="5"
                fill="transparent"
                strokeDasharray="163"
                strokeDashoffset={163 - (163 * clampedCompletion) / 100}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute text-xs sm:text-sm font-black text-[#14213D]">
              {clampedCompletion}%
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-[#14213D] block">Profile Completion</span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 block">
              {isComplete ? 'All Requirements Met' : `${clampedCompletion}% completed`}
            </span>
            {!isComplete && (
              <Button
                variant="outline"
                size="sm"
                className="mt-1.5 text-[10px] sm:text-[11px] py-1 bg-white border-slate-200 text-[#2563EB] hover:bg-slate-50"
                icon={<ArrowRight className="w-3 h-3" />}
                onClick={() => navigate('/student/resume')}
              >
                Upload Resume
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Checklist */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {items.map((item) => (
            <div
              key={item.key}
              className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${item.completed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className={item.completed ? 'text-slate-800 break-words-safe font-semibold' : 'text-slate-500 break-words-safe font-medium'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
