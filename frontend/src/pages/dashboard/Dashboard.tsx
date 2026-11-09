import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  UserCheck,
  Calendar,
  AlertCircle,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Building2,
  ChevronRight,
  BarChart2,
  Bot,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Award,
  Layers,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { AlertCard } from '../../components/ui/AlertCard';
import { KpiDetailModal } from '../../components/dashboard/KpiDetailModal';
import { usePlacement } from '../../context/PlacementContext';
import { apiService } from '../../services/api';

// Institutional Shield with Laurel Wreath SVG Illustration
const InstitutionalShieldIllustration: React.FC = () => (
  <svg
    className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 drop-shadow-md select-none pointer-events-none"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft ambient glow behind shield */}
    <circle cx="100" cy="100" r="75" fill="#CCFBF1" fillOpacity="0.6" />

    {/* Left Laurel Branch */}
    <path
      d="M55 125 C45 105 45 75 65 55"
      stroke="#14B8A6"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path d="M52 115 C42 115 42 108 52 110" fill="#2DD4BF" />
    <path d="M48 100 C38 100 38 93 48 95" fill="#2DD4BF" />
    <path d="M48 85 C38 85 40 78 50 82" fill="#2DD4BF" />
    <path d="M54 70 C46 68 50 60 58 66" fill="#2DD4BF" />
    <path d="M64 57 C58 52 64 46 70 52" fill="#2DD4BF" />

    {/* Right Laurel Branch */}
    <path
      d="M145 125 C155 105 155 75 135 55"
      stroke="#14B8A6"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path d="M148 115 C158 115 158 108 148 110" fill="#2DD4BF" />
    <path d="M152 100 C162 100 162 93 152 95" fill="#2DD4BF" />
    <path d="M152 85 C162 85 160 78 150 82" fill="#2DD4BF" />
    <path d="M146 70 C154 68 150 60 142 66" fill="#2DD4BF" />
    <path d="M136 57 C142 52 136 46 130 52" fill="#2DD4BF" />

    {/* Main Institutional Shield */}
    <path
      d="M100 48 L142 66 C142 110 120 138 100 152 C80 138 58 110 58 66 L100 48 Z"
      fill="#0D9488"
    />
    <path
      d="M100 54 L136 70 C136 106 117 132 100 144 C83 132 64 106 64 70 L100 54 Z"
      fill="#0F766E"
    />

    {/* Center Verified Checkmark */}
    <path
      d="M84 98 L95 109 L118 84"
      stroke="#FFFFFF"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    drives,
    students,
    candidatePool,
    candidateStats,
    interviewsList,
    availabilitySlots,
    exceptionsList,
    agentActivities,
    checkEligibility,
    refreshAllData,
    triggerToast,
  } = usePlacement();

  const [selectedKpi, setSelectedKpi] = useState<
    'active_drives' | 'eligible_students' | 'shortlisted_candidates' | 'interviews_today' | 'pending_actions' | null
  >(null);

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillAnalytics, setSkillAnalytics] = useState<any>(null);

  const loadDashboardData = async (isManual: boolean = false) => {
    if (isManual) setRefreshing(true);
    setError(null);

    try {
      await refreshAllData();
      const skillRes = await apiService.getAnalyticsSummary().catch(() => null);
      if (skillRes) setSkillAnalytics(skillRes);

      if (isManual) {
        triggerToast('Dashboard metrics refreshed from live portal sections', 'success');
      }
    } catch (err: any) {
      console.error('Dashboard load error:', err);
      setError('An error occurred while connecting to database.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    apiService
      .getAnalyticsSummary()
      .then((res) => {
        if (res) setSkillAnalytics(res);
      })
      .catch(() => {});
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayHuman = useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase(),
    []
  );

  // 1. ACTIVE DRIVES
  const activeDrivesList = useMemo(() => {
    const excluded = ['draft', 'rejected', 'expired', 'closed', 'cancelled'];
    return drives.filter((d) => {
      const st = (d.status || 'open').toLowerCase();
      if (excluded.includes(st)) return false;
      if (d.deadline && d.deadline.includes('-') && d.deadline.length >= 10) {
        if (d.deadline.slice(0, 10) < todayStr) return false;
      }
      return true;
    });
  }, [drives, todayStr]);

  // 2. ELIGIBLE STUDENTS
  const eligibleStudentsCount = useMemo(() => {
    if (activeDrivesList.length === 0) return 0;
    return students.filter((s) => activeDrivesList.some((d) => checkEligibility(s, d).eligible)).length;
  }, [students, activeDrivesList, checkEligibility]);

  // 3. SHORTLISTED CANDIDATES
  const shortlistedCandidatesCount = useMemo(() => {
    const SHORTLISTED_STAGES = [
      'SHORTLISTED',
      'APTITUDE_ALLOCATED',
      'APTITUDE_ASSIGNED',
      'APTITUDE_IN_PROGRESS',
      'APTITUDE_QUALIFIED',
      'TECHNICAL_ROUND_PENDING',
      'TECHNICAL_ALLOCATED',
      'TECHNICAL_IN_PROGRESS',
      'TECHNICAL_QUALIFIED',
      'INTERVIEW_PENDING',
      'HR_INTERVIEW_PENDING',
      'HR_INTERVIEW_ALLOCATED',
      'INTERVIEW_READY',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'INTERVIEWED',
      'SELECTED',
      'FINAL_SELECTED',
      'OFFER_EXTENDED',
      'OFFER_ACCEPTED',
      'JOINED',
      'PLACED',
    ];
    const poolShort = candidatePool.filter(
      (c) =>
        SHORTLISTED_STAGES.includes((c.status || '').toUpperCase()) ||
        SHORTLISTED_STAGES.includes((c.stage || '').toUpperCase())
    ).length;
    return poolShort > 0 ? poolShort : candidateStats?.shortlisted || 0;
  }, [candidatePool, candidateStats]);

  // 4. FINAL SELECTIONS
  const finalSelectionsCount = useMemo(() => {
    const SELECTED_STAGES = ['SELECTED', 'FINAL_SELECTED', 'PLACED', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'JOINED'];
    return (
      candidateStats?.selected ??
      candidatePool.filter(
        (c) =>
          SELECTED_STAGES.includes((c.status || '').toUpperCase()) ||
          SELECTED_STAGES.includes((c.stage || '').toUpperCase())
      ).length
    );
  }, [candidatePool, candidateStats]);

  // 5. SCHEDULED INTERVIEWS
  const scheduledInterviewsCount = useMemo(() => {
    return interviewsList.filter((i) => (i.status || '').toLowerCase() !== 'cancelled').length;
  }, [interviewsList]);

  // 6. UPCOMING INTERVIEWS LIST
  const upcomingInterviewsList = useMemo(() => {
    return interviewsList.filter((i) => (i.status || '').toLowerCase() !== 'cancelled');
  }, [interviewsList]);

  // Dynamic Pipeline Progression
  const pipelineData = useMemo(() => {
    return [
      { stage: 'Registered', count: students.length, fill: '#64748B' },
      { stage: 'Eligible', count: eligibleStudentsCount, fill: '#2563EB' },
      { stage: 'Applied', count: candidatePool.length, fill: '#0D9488' },
      { stage: 'Shortlisted', count: shortlistedCandidatesCount, fill: '#7C3AED' },
      { stage: 'Interview', count: scheduledInterviewsCount, fill: '#F59E0B' },
      { stage: 'Selected', count: finalSelectionsCount, fill: '#10B981' },
    ];
  }, [
    students.length,
    eligibleStudentsCount,
    candidatePool.length,
    shortlistedCandidatesCount,
    scheduledInterviewsCount,
    finalSelectionsCount,
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-[#14213D]">
      {/* 1. WELCOME HERO SECTION (Matching placemind-dashboard-reference.png bottom) */}
      <div className="relative rounded-3xl bg-gradient-to-r from-teal-50/90 via-[#F8FAFC] to-white border border-[#CBD5E1]/90 p-6 sm:p-8 md:p-10 overflow-hidden shadow-xs">
        {/* Soft background curve accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#14213D] tracking-tight">
              Welcome back, Placement Officer!
            </h1>
            <p className="text-sm sm:text-base text-[#475569] font-medium leading-relaxed">
              Oversee campus placements and manage drives efficiently.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => navigate('/admin/companies')}
                className="px-5 py-2 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Ensure Fair &amp; Smooth Placements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => loadDashboardData(true)}
                disabled={refreshing}
                className="px-3 py-1.5 rounded-full bg-white border border-teal-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#0D9488] ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Live Sync'}</span>
              </button>
            </div>
          </div>

          {/* Right Institutional Shield Illustration */}
          <div className="flex justify-center md:justify-end shrink-0">
            <InstitutionalShieldIllustration />
          </div>
        </div>
      </div>

      {/* 2. FOUR KEY METRIC CARDS (Matching placemind-dashboard-reference.png bottom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {/* Card 1: Total Drives */}
        <div
          onClick={() => navigate('/admin/companies')}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-xs group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              Total Drives
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {drives.length}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-[#2563EB] transition-colors">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Total Applications */}
        <div
          onClick={() => navigate('/admin/candidates')}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-purple-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] shadow-xs group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              Total Applications
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {candidatePool.length}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-[#7C3AED] transition-colors">
            <span>View Applications</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Scheduled Interviews */}
        <div
          onClick={() => navigate('/admin/interviews')}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-teal-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0D9488] shadow-xs group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              Scheduled Interviews
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {scheduledInterviewsCount}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-[#0D9488] transition-colors">
            <span>View Schedule</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Final Selections */}
        <div
          onClick={() => navigate('/admin/analytics')}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-amber-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-xs group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              Final Selections
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {finalSelectionsCount}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-amber-600 transition-colors">
            <span>View Report</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. UPCOMING INTERVIEWS & QUICK ACTIONS (Matching placemind-dashboard-reference.png bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upcoming Interviews */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#CBD5E1]/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-black text-[#14213D]">
              Upcoming Interviews
            </h2>
            <button
              onClick={() => navigate('/admin/interviews')}
              className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingInterviewsList.length === 0 ? (
            <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-[#14213D]">
                  No upcoming interviews
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Schedule interviews for active drives.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingInterviewsList.slice(0, 4).map((item: any) => (
                <div
                  key={item.id || item.interview_id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0D9488] shrink-0 font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#14213D] truncate">
                        {item.company_name || item.companyName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {item.student_name || item.studentName || item.candidateName} &bull; {item.job_title || item.roleTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                      {item.date} {item.timeSlot ? `• ${item.timeSlot}` : ''}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {item.room_name || item.roomName || 'Main Room'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#CBD5E1]/90 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-black text-[#14213D] pb-3 border-b border-slate-100">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            <button
              onClick={() => navigate('/admin/companies')}
              className="w-full py-3 px-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Manage Drives</span>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="w-full py-3 px-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs"
            >
              <BarChart2 className="w-4 h-4 text-slate-600" />
              <span>View Reports</span>
            </button>

            <button
              onClick={() => navigate('/admin/interviews')}
              className="w-full py-3 px-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>Schedule Interviews</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. PRESERVED PLACEMENT OPERATIONS OVERVIEW & PIPELINE PROGRESSION */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#CBD5E1]/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#14213D] flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#2563EB]" />
              <span>Placement Operations Pipeline</span>
            </h3>
            <p className="text-xs text-[#475569] font-medium mt-0.5">
              Live funnel progression across campus recruitment evaluation stages
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/candidates')}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Candidate Pool</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {pipelineData.map((item: any, idx: number) => {
            const baseCount = pipelineData[0]?.count || 1;
            const conversionRate = baseCount > 0 ? Math.round((item.count / baseCount) * 100) : 0;
            return (
              <div
                key={item.stage}
                onClick={() => navigate('/admin/candidates')}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.stage}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white text-slate-600 border border-slate-200">
                    S{idx + 1}
                  </span>
                </div>

                <div className="text-2xl font-black text-[#14213D]">{item.count}</div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(0, conversionRate))}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Detail Drilldown Modal */}
      <KpiDetailModal
        isOpen={!!selectedKpi}
        kpiKey={selectedKpi}
        onClose={() => setSelectedKpi(null)}
        onActionResolved={() => loadDashboardData(true)}
      />
    </div>
  );
};
