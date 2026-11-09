import React from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { CandidateMatch } from '../../types';
import { MatchScore } from '../ui/MatchScore';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateMatch[];
}

export const CandidateComparisonModal: React.FC<CandidateComparisonModalProps> = ({
  isOpen,
  onClose,
  candidates,
}) => {
  if (!isOpen || candidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-150 text-[#14213D]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-200 text-[#14213D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200 font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14213D] tracking-tight">Side-by-Side Candidate Comparison</h3>
              <p className="text-xs text-[#64748B]">Comparing {candidates.length} candidates for drive requirements</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#64748B] hover:text-[#14213D] hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-x-auto">
          <div className={`grid gap-4 ${candidates.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {candidates.map((c) => (
              <div key={c.studentId} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                {/* Profile Header */}
                <div className="text-center pb-3 border-b border-slate-200 space-y-2">
                  <img
                    src={c.studentAvatar}
                    alt={c.studentName}
                    className="w-14 h-14 rounded-full mx-auto object-cover border-2 border-[#2563EB] shadow-md"
                  />
                  <div>
                    <h4 className="text-base font-bold text-[#14213D]">{c.studentName}</h4>
                    <p className="text-xs text-[#64748B] font-semibold">{c.branch} &bull; CGPA: {c.cgpa}</p>
                  </div>
                  <MatchScore score={c.matchScore} />
                </div>

                {/* Matched Skills */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Matched Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {c.matchedSkills.map((s) => (
                      <span key={s} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Skill Gaps</span>
                  <div className="flex flex-wrap gap-1">
                    {c.missingSkills.length > 0 ? (
                      c.missingSkills.map((s) => (
                        <span key={s} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          ✕ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold">None (Full Skill Match)</span>
                    )}
                  </div>
                </div>

                {/* Relevant Projects */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">Relevant Projects</span>
                  {c.relevantProjects.length > 0 ? (
                    <ul className="text-xs text-[#64748B] space-y-1 font-medium">
                      {c.relevantProjects.map((p) => (
                        <li key={p.name} className="p-2 rounded bg-white border border-slate-200 leading-snug">
                          <span className="font-bold text-[#14213D]">{p.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-[#64748B]">No matching projects listed</span>
                  )}
                </div>

                {/* AI Recommendation */}
                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#2563EB] uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#2563EB]" /> AI Recommendation
                  </span>
                  <p className="text-[#14213D] leading-relaxed text-[11px] font-medium">{c.aiRecommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
