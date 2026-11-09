import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Target,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { apiService } from '../../services/api';

interface CompanySkillGapModalProps {
  opportunityId: string | null;
  onClose: () => void;
}

export const CompanySkillGapModal: React.FC<CompanySkillGapModalProps> = ({
  opportunityId,
  onClose,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (opportunityId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opportunityId, onClose]);

  // Fetch opportunity specific skill gap analysis
  useEffect(() => {
    if (!opportunityId) return;
    let isMounted = true;
    const fetchSkillGap = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.getOpportunitySkillGap(opportunityId);
        if (isMounted) setData(res);
      } catch (err: any) {
        if (isMounted) setError(err.response?.data?.detail || 'Failed to load skill gap analysis');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSkillGap();
    return () => {
      isMounted = false;
    };
  }, [opportunityId]);

  if (!opportunityId) return null;

  const matchedSkills: string[] = data?.skills_you_have || [];
  const missingSkills: string[] = data?.skills_you_need || [];
  const studentAllSkills: string[] = data?.student_all_skills || matchedSkills;
  const isEligible = data?.is_eligible ?? false;
  const matchScore = data?.match_score ?? 0;

  // Combine matched and missing for complete required skills list
  const requiredSkills = Array.from(new Set([...matchedSkills, ...missingSkills]));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xl text-[#14213D] my-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 bg-[#F8FAFC] border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
              <Target className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#14213D] truncate">
                {data ? `${data.company} — Skill Gap Analysis` : 'Loading Skill Gap...'}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#64748B] font-medium truncate">
                {data ? `${data.role} • ${data.source_label}` : 'Target Opportunity Breakdown'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 min-h-0 text-[#334155]">
          {loading ? (
            <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3 text-[#64748B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
              <p className="text-xs font-semibold">Comparing your resume against company requirements...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Top Summary Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isEligible
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isEligible ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#14213D]">
                        {isEligible ? 'Eligible for this Opportunity' : 'Not Currently Eligible'}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isEligible
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {matchScore}% Match
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] font-medium mt-0.5">
                      {isEligible
                        ? 'Your extracted resume skills satisfy the core requirements for this position.'
                        : missingSkills.length > 0
                        ? 'Required skills are missing from your resume profile for this role.'
                        : 'Review eligibility details below to prepare for this opportunity.'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold text-[#64748B]">Required Skills Match</div>
                  <div className="text-lg font-bold text-[#14213D]">{data.match_fraction}</div>
                </div>
              </div>

              {/* Ineligibility Reason Banner */}
              {!isEligible && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs space-y-1">
                  <div className="font-bold text-red-700 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Why you're not eligible:
                  </div>
                  <p className="text-red-800 text-[11px] leading-relaxed">
                    {missingSkills.length > 0
                      ? `Required technical skills missing: ${missingSkills.join(', ')}.`
                      : 'Academic or branch criteria listed below are not satisfied.'}
                  </p>
                </div>
              )}

              {/* Skills Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Your Skills (Extracted from Resume) */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Your Skills (Resume Extracted)
                  </div>
                  {studentAllSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {studentAllSkills.map((skill: string, idx: number) => {
                        const isMatch = matchedSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
                        return (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${
                              isMatch
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {skill}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic pt-1">
                      Upload your resume in the Resume Analyzer to populate your skills.
                    </p>
                  )}
                </div>

                {/* Required Skills (Role Requirements) */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#14213D]">
                    <BookOpen className="w-4 h-4 text-[#2563EB]" />
                    Required Skills ({requiredSkills.length})
                  </div>
                  {requiredSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {requiredSkills.map((skill: string, idx: number) => {
                        const isSatisfied = matchedSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
                        return (
                          <span
                            key={idx}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${
                              isSatisfied
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {isSatisfied ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-600" />
                            )}
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700 font-medium pt-1">
                      General eligibility requirements apply.
                    </p>
                  )}
                </div>
              </div>

              {/* Missing Skills Highlight */}
              {missingSkills.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <XCircle className="w-4 h-4 text-amber-600" />
                    Missing Skills to Acquire ({missingSkills.length})
                  </div>
                  <ul className="space-y-1.5 pt-1">
                    {missingSkills.map((skill: string, idx: number) => (
                      <li key={idx} className="text-xs text-amber-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <strong className="font-semibold">{skill}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Academic & Non-Skill Criteria */}
              {data.source_type === 'college' && data.non_skill_criteria && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="text-xs font-bold text-[#14213D] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#2563EB]" />
                    Academic &amp; Eligibility Criteria
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {data.non_skill_criteria.min_cgpa?.required && (
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between font-medium ${
                          data.non_skill_criteria.min_cgpa.satisfied
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                      >
                        <span>Min CGPA: {data.non_skill_criteria.min_cgpa.required}</span>
                        <span>{data.non_skill_criteria.min_cgpa.satisfied ? '✓ Pass' : '✗ Unmet'}</span>
                      </div>
                    )}
                    {data.non_skill_criteria.eligible_branches?.required?.length > 0 && (
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between font-medium ${
                          data.non_skill_criteria.eligible_branches.satisfied
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                      >
                        <span>Branch: {data.non_skill_criteria.eligible_branches.student}</span>
                        <span>{data.non_skill_criteria.eligible_branches.satisfied ? '✓ Eligible' : '✗ Ineligible'}</span>
                      </div>
                    )}
                    {data.non_skill_criteria.graduation_year?.required && (
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between font-medium ${
                          data.non_skill_criteria.graduation_year.satisfied
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                      >
                        <span>Batch: {data.non_skill_criteria.graduation_year.required}</span>
                        <span>{data.non_skill_criteria.graduation_year.satisfied ? '✓ Valid' : '✗ Unmet'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actionable Learning Roadmap Steps */}
              {data.roadmap_steps && data.roadmap_steps.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#14213D]">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Actionable Roadmap to Become Eligible
                  </div>
                  <div className="space-y-2">
                    {data.roadmap_steps.map((step: any) => (
                      <div
                        key={step.step}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-[#2563EB] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {step.step}
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <div className="font-bold text-[#14213D] flex items-center gap-2">
                            <span>Learn {step.skill}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                step.importance === 'Mandatory'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {step.importance}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#64748B] font-normal">{step.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between p-4 bg-[#F8FAFC] border-t border-slate-100">
          <span className="text-xs text-[#64748B]">PlaceMind Placement Intelligence</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
