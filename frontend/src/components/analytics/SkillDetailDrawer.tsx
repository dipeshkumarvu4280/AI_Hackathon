import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Building2, Users, ArrowRight, BarChart2, ShieldAlert } from 'lucide-react';
import { SkillGap } from '../../types';
import { Button } from '../ui/Button';

interface SkillDetailDrawerProps {
  skillGap: SkillGap | null;
  onClose: () => void;
}

export const SkillDetailDrawer: React.FC<SkillDetailDrawerProps> = ({ skillGap, onClose }) => {
  const navigate = useNavigate();

  if (!skillGap) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white text-[#14213D] h-full p-4 sm:p-6 shadow-2xl overflow-y-auto space-y-4 sm:space-y-6 border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200 font-bold text-xs shadow-xs shrink-0">
              <BarChart2 className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#14213D] truncate">{skillGap.skill} Skill Gap Analysis</h3>
              <p className="text-[11px] sm:text-xs text-[#64748B] truncate">Industry demand vs campus proficiency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-[#64748B] hover:text-[#14213D] hover:bg-slate-100 transition-colors cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Recruiter Demand</span>
            <div className="text-xl font-bold text-[#2563EB] mt-0.5">{skillGap.industryDemand}%</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-[#64748B] uppercase">Student Skill</span>
            <div className="text-xl font-bold text-[#14213D] mt-0.5">{skillGap.studentProficiency}%</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase">Campus Deficit</span>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{skillGap.gapPercent}%</div>
          </div>
        </div>

        {/* AFFECTED STUDENTS COUNTER */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#14213D] block">Students Needing Improvement</span>
            <span className="text-[11px] text-[#64748B] font-medium">Targeted workshop roster</span>
          </div>
          <span className="text-2xl font-bold text-[#2563EB]">{skillGap.affectedCount} Students</span>
        </div>

        {/* RELATED PLACEMENT DRIVES */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#14213D] flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#2563EB]" /> Linked Active Placement Drives
          </span>
          <div className="space-y-1.5">
            {skillGap.relatedDrives.map((d) => (
              <div key={d} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14213D]">{d}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">Required Skill</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI RECOMMENDATION BOX */}
        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2 text-xs">
          <span className="font-bold text-[#2563EB] uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#2563EB]" /> AI Workshop Recommendation
          </span>
          <p className="text-[#14213D] font-medium leading-relaxed">{skillGap.recommendation}</p>
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-2">
          <Button
            variant="primary"
            className="w-full justify-center"
            icon={<Users className="w-4 h-4" />}
            onClick={() => {
              onClose();
              navigate('/candidates');
            }}
          >
            View Affected Student Roster
          </Button>
        </div>
      </div>
    </div>
  );
};
