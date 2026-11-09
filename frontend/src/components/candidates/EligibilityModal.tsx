import React, { useState } from 'react';
import { CheckCircle2, XCircle, Search, Filter, X, ShieldCheck } from 'lucide-react';
import { PlacementDrive, Student } from '../../types';
import { usePlacement } from '../../context/PlacementContext';

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  drive: PlacementDrive;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({ isOpen, onClose, drive }) => {
  const { students, checkEligibility } = usePlacement();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'eligible' | 'ineligible'>('all');

  if (!isOpen) return null;

  const fullRoster: Student[] = students;

  const evaluatedList = fullRoster.map((student) => {
    const result = checkEligibility(student, drive);
    return {
      student,
      eligible: result.eligible,
      reason: result.reason,
    };
  });

  const filtered = evaluatedList.filter((item) => {
    const matchesSearch =
      item.student.name.toLowerCase().includes(search.toLowerCase()) ||
      item.student.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'eligible' && item.eligible) ||
      (filterType === 'ineligible' && !item.eligible);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-150 text-[#14213D]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-200 text-[#14213D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14213D] tracking-tight">Eligibility Verification Rule Engine</h3>
              <p className="text-xs text-[#64748B]">
                {drive.companyName} &bull; {drive.roleTitle}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#64748B] hover:text-[#14213D] hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Drive Requirements Overview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Minimum CGPA</span>
              <div className="text-sm font-bold text-[#14213D] mt-0.5">{drive.minCgpa}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Eligible Branches</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {drive.eligibleBranches.map((b) => (
                  <span key={b} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-[#14213D] border border-slate-200">
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Required Skills</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {drive.requiredSkills.map((s) => (
                  <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ELIGIBILITY SUMMARY KPI BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-[#64748B]">Total Candidates</span>
              <div className="text-2xl font-bold text-[#14213D] mt-1">428</div>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-700">Eligible</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">286</div>
            </div>
            <div className="p-3.5 bg-red-50 rounded-xl border border-red-200">
              <span className="text-xs font-semibold text-red-700">Not Eligible</span>
              <div className="text-2xl font-bold text-red-700 mt-1">142</div>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-xs font-semibold text-[#2563EB]">Eligibility Rate</span>
              <div className="text-2xl font-bold text-[#2563EB] mt-1">66.8%</div>
            </div>
          </div>

          {/* Progress Bar Visualizer */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-1">
              <span>Roster Evaluation Breakdown</span>
              <span>286 Eligible / 142 Ineligible</span>
            </div>
            <div className="w-full h-3 bg-red-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: '66.8%' }} />
              <div className="bg-red-500 h-full transition-all" style={{ width: '33.2%' }} />
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search evaluated candidate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 text-[#14213D] placeholder-[#94A3B8] rounded-lg focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-[#2563EB] text-white' : 'bg-white text-[#64748B] border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({evaluatedList.length})
              </button>
              <button
                onClick={() => setFilterType('eligible')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'eligible' ? 'bg-emerald-600 text-white' : 'bg-white text-[#64748B] border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Eligible ({evaluatedList.filter((e) => e.eligible).length})
              </button>
              <button
                onClick={() => setFilterType('ineligible')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterType === 'ineligible' ? 'bg-red-600 text-white' : 'bg-white text-[#64748B] border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Ineligible ({evaluatedList.filter((e) => !e.eligible).length})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs text-[#14213D] border-collapse">
              <thead className="bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Candidate</th>
                  <th className="px-4 py-2.5">Branch</th>
                  <th className="px-4 py-2.5">CGPA</th>
                  <th className="px-4 py-2.5">Verification Result</th>
                  <th className="px-4 py-2.5">Rule Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(({ student, eligible, reason }) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 align-middle font-bold text-[#14213D]">
                      {student.name}
                      <span className="text-[#64748B] font-medium text-[11px] block">{student.rollNumber}</span>
                    </td>
                    <td className="px-4 py-3 align-middle font-medium text-[#64748B]">{student.branch}</td>
                    <td className="px-4 py-3 align-middle font-bold text-[#14213D]">{student.cgpa}</td>
                    <td className="px-4 py-3 align-middle">
                      {eligible ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Eligible ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-red-600" /> Not Eligible ✕
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle text-xs">
                      {eligible ? (
                        <span className="text-emerald-700 font-medium">All eligibility rules satisfied</span>
                      ) : (
                        <span className="text-red-700 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {reason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
