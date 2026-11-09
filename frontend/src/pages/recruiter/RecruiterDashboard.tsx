import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Filter,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  UserCheck,
  UserX,
  FileText,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Briefcase,
  Layers,
  RefreshCw,
  Send,
  User,
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import {
  PlacementDrive,
  RecruitmentRound,
  CandidateRoundDetail,
  DriveRecruiterDashboardData,
} from '../../types';
import { CreateDriveModal } from '../../components/companies/CreateDriveModal';
import { CreateOfferModal } from '../../components/offers/CreateOfferModal';

// Modern Corporate Office Skyscraper SVG Illustration for Welcome Banner
const CorporateIllustration: React.FC = () => (
  <svg
    className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 drop-shadow-md select-none pointer-events-none"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft subtle glow behind buildings */}
    <circle cx="110" cy="110" r="75" fill="#DDD6FE" fillOpacity="0.5" />

    {/* Background Tower */}
    <rect x="110" y="35" width="55" height="135" rx="3" fill="#64748B" />
    <rect x="115" y="42" width="10" height="8" rx="1" fill="#93C5FD" fillOpacity="0.8" />
    <rect x="130" y="42" width="10" height="8" rx="1" fill="#93C5FD" fillOpacity="0.8" />
    <rect x="145" y="42" width="10" height="8" rx="1" fill="#93C5FD" fillOpacity="0.8" />
    <rect x="115" y="56" width="10" height="8" rx="1" fill="#BFDBFE" />
    <rect x="130" y="56" width="10" height="8" rx="1" fill="#BFDBFE" />
    <rect x="145" y="56" width="10" height="8" rx="1" fill="#BFDBFE" />
    <rect x="115" y="70" width="10" height="8" rx="1" fill="#DBEAFE" />
    <rect x="130" y="70" width="10" height="8" rx="1" fill="#DBEAFE" />
    <rect x="145" y="70" width="10" height="8" rx="1" fill="#DBEAFE" />

    {/* Foreground Main Glass Tower */}
    <rect x="45" y="55" width="60" height="115" rx="3" fill="#1E293B" />
    <rect x="52" y="65" width="12" height="10" rx="1.5" fill="#38BDF8" fillOpacity="0.9" />
    <rect x="69" y="65" width="12" height="10" rx="1.5" fill="#38BDF8" fillOpacity="0.9" />
    <rect x="86" y="65" width="12" height="10" rx="1.5" fill="#38BDF8" fillOpacity="0.9" />
    <rect x="52" y="82" width="12" height="10" rx="1.5" fill="#7DD3FC" />
    <rect x="69" y="82" width="12" height="10" rx="1.5" fill="#7DD3FC" />
    <rect x="86" y="82" width="12" height="10" rx="1.5" fill="#7DD3FC" />
    <rect x="52" y="99" width="12" height="10" rx="1.5" fill="#BAE6FD" />
    <rect x="69" y="99" width="12" height="10" rx="1.5" fill="#BAE6FD" />
    <rect x="86" y="99" width="12" height="10" rx="1.5" fill="#BAE6FD" />
    <rect x="52" y="116" width="12" height="10" rx="1.5" fill="#E0F2FE" />
    <rect x="69" y="116" width="12" height="10" rx="1.5" fill="#E0F2FE" />
    <rect x="86" y="116" width="12" height="10" rx="1.5" fill="#E0F2FE" />

    {/* Small Side Building */}
    <rect x="15" y="95" width="30" height="75" rx="2" fill="#475569" />
    <rect x="20" y="105" width="8" height="7" rx="1" fill="#93C5FD" />
    <rect x="32" y="105" width="8" height="7" rx="1" fill="#93C5FD" />
    <rect x="20" y="118" width="8" height="7" rx="1" fill="#93C5FD" />
    <rect x="32" y="118" width="8" height="7" rx="1" fill="#93C5FD" />

    {/* Trees at the Base */}
    <circle cx="28" cy="168" r="9" fill="#10B981" />
    <circle cx="40" cy="166" r="11" fill="#059669" />
    <circle cx="160" cy="168" r="10" fill="#10B981" />
    <circle cx="172" cy="167" r="8" fill="#047857" />
  </svg>
);

export const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerToast, refreshAllData } = usePlacement();

  // Drives state
  const [recruiterDrives, setRecruiterDrives] = useState<PlacementDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [loadingDrives, setLoadingDrives] = useState<boolean>(true);
  const [isSubmittingDrive, setIsSubmittingDrive] = useState<boolean>(false);

  // Dashboard Data for Selected Drive
  const [dashboardData, setDashboardData] = useState<DriveRecruiterDashboardData | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);
  const [metricsError, setMetricsError] = useState<boolean>(false);

  // Modal States
  const [isCreateDriveOpen, setIsCreateDriveOpen] = useState<boolean>(false);
  const [driveToEdit, setDriveToEdit] = useState<PlacementDrive | null>(null);
  const [activeRoundModal, setActiveRoundModal] = useState<RecruitmentRound | null>(null);
  const [isConfigureRoundsOpen, setIsConfigureRoundsOpen] = useState<boolean>(false);
  const [selectedCandidateForOffer, setSelectedCandidateForOffer] = useState<any | null>(null);

  // Configure Round Form Inputs
  const [newRoundName, setNewRoundName] = useState<string>('');
  const [newRoundType, setNewRoundType] = useState<string>('Technical');
  const [newRoundOrder, setNewRoundOrder] = useState<number>(1);
  const [newRoundIsFinal, setNewRoundIsFinal] = useState<boolean>(false);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);

  // Action Loading State per Application ID
  const [actionLoadingAppId, setActionLoadingAppId] = useState<string | null>(null);
  const errorToastShownDriveIdRef = useRef<string | null>(null);

  const recruiterName = user?.name || 'Recruiter';

  // Fetch placement drives belonging to currently authenticated recruiter
  const loadRecruiterDrives = async () => {
    setLoadingDrives(true);
    try {
      let drivesList: PlacementDrive[] = [];
      try {
        drivesList = await apiService.getMyRecruiterDrives();
      } catch (err) {
        console.warn('getMyRecruiterDrives failed, fallback to getDrives', err);
      }

      if (!drivesList || drivesList.length === 0) {
        const allDrives = await apiService.getDrives();
        if (user) {
          drivesList = allDrives.filter(
            (d) =>
              d.recruiter_id === user.id ||
              (d as any).createdBy === user.id ||
              (user.email && d.recruiter_email === user.email) ||
              (user.companyId && d.companyId === user.companyId)
          );
        }
      }

      setRecruiterDrives(drivesList);

      if (drivesList.length > 0) {
        setSelectedDriveId((prev) => {
          if (prev && drivesList.some((d) => d.id === prev)) return prev;
          return drivesList[0].id;
        });
      } else {
        setSelectedDriveId('');
        setDashboardData(null);
      }
    } catch (error) {
      console.error('Failed to load recruiter drives:', error);
      triggerToast('Failed to load company placement drives.', 'error');
    } finally {
      setLoadingDrives(false);
    }
  };

  // Load pipeline metrics & rounds for selected drive
  const loadDriveMetrics = async (driveId: string) => {
    if (!driveId || driveId === 'undefined' || driveId === 'null') {
      setDashboardData(null);
      setMetricsError(false);
      return;
    }

    setLoadingMetrics(true);
    setMetricsError(false);
    try {
      const data = await apiService.getDriveRecruiterMetrics(driveId);
      setDashboardData(data);
      setMetricsError(false);
      errorToastShownDriveIdRef.current = null;
    } catch (error: any) {
      console.error('Pipeline Metrics Error', {
        driveId,
        status: error?.response?.status,
        response: error?.response?.data,
      });

      setMetricsError(true);
      if (errorToastShownDriveIdRef.current !== driveId) {
        errorToastShownDriveIdRef.current = driveId;
        triggerToast('Could not load drive pipeline metrics. Please click retry.', 'error');
      }
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadRecruiterDrives();
  }, []);

  useEffect(() => {
    if (selectedDriveId && selectedDriveId !== 'undefined') {
      loadDriveMetrics(selectedDriveId);
    } else {
      setDashboardData(null);
      setMetricsError(false);
    }
  }, [selectedDriveId]);

  // Handle Candidate Round Action (PASS, REJECT, FINAL_SELECT)
  const handleCandidateAction = async (
    applicationId: string,
    action: 'PASS' | 'REJECT' | 'FINAL_SELECT',
    roundId: string,
    candidateName: string
  ) => {
    setActionLoadingAppId(applicationId);
    try {
      await apiService.executeRoundAction(applicationId, action, roundId);

      let actionText = 'passed to next round';
      if (action === 'REJECT') actionText = 'rejected';
      if (action === 'FINAL_SELECT') actionText = 'finally selected';

      triggerToast(`${candidateName} ${actionText} successfully!`, 'success');

      if (selectedDriveId) {
        const freshData = await apiService.getDriveRecruiterMetrics(selectedDriveId);
        setDashboardData(freshData);
        if (activeRoundModal) {
          const updatedRound = freshData.rounds.find((r) => r.id === activeRoundModal.id);
          if (updatedRound) setActiveRoundModal(updatedRound);
        }
      }
      refreshAllData();
    } catch (error: any) {
      console.error('Round evaluation failed:', error);
      triggerToast(error?.response?.data?.detail || 'Failed to update candidate status.', 'error');
    } finally {
      setActionLoadingAppId(null);
    }
  };

  // Add / Edit Round in Selected Drive
  const handleSaveRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriveId || !newRoundName.trim()) return;

    try {
      if (editingRoundId) {
        await apiService.updateDriveRound(selectedDriveId, editingRoundId, {
          name: newRoundName,
          round_type: newRoundType,
          order: newRoundOrder,
          is_final: newRoundIsFinal,
        });
        triggerToast(`Round '${newRoundName}' updated.`, 'success');
      } else {
        await apiService.createDriveRound(selectedDriveId, {
          name: newRoundName,
          round_type: newRoundType,
          order: newRoundOrder,
          is_final: newRoundIsFinal,
        });
        triggerToast(`Round '${newRoundName}' added to drive.`, 'success');
      }

      setNewRoundName('');
      setEditingRoundId(null);
      loadDriveMetrics(selectedDriveId);
    } catch (error) {
      triggerToast('Failed to save recruitment round.', 'error');
    }
  };

  // Delete Round
  const handleDeleteRound = async (roundId: string) => {
    if (!selectedDriveId) return;
    try {
      await apiService.deleteDriveRound(selectedDriveId, roundId);
      triggerToast('Recruitment round removed.', 'info');
      loadDriveMetrics(selectedDriveId);
    } catch (error: any) {
      triggerToast(error?.response?.data?.detail || 'Failed to delete round.', 'error');
    }
  };

  const selectedDrive = recruiterDrives.find((d) => d.id === selectedDriveId);

  const handleSubmitDriveToOfficer = async () => {
    if (!selectedDriveId) return;
    setIsSubmittingDrive(true);
    try {
      await apiService.submitDriveToOfficer(selectedDriveId);
      triggerToast('Drive successfully submitted to Placement Officer for review!', 'success');
      await loadRecruiterDrives();
    } catch (err: any) {
      triggerToast(err?.response?.data?.detail || 'Failed to submit drive to officer.', 'error');
    } finally {
      setIsSubmittingDrive(false);
    }
  };

  const totalApplicantsCount = dashboardData?.metrics?.registeredCount || 0;
  const shortlistedCount = dashboardData?.metrics?.shortlistedCount || 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-[#14213D]">
      {/* 1. WELCOME HERO SECTION (Matching placemind-dashboard-reference.png) */}
      <div className="relative rounded-3xl bg-gradient-to-r from-violet-50/90 via-[#F8FAFC] to-white border border-[#CBD5E1]/90 p-6 sm:p-8 md:p-10 overflow-hidden shadow-xs">
        {/* Soft background curve accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#14213D] tracking-tight">
              Welcome back, {recruiterName}!
            </h1>
            <p className="text-sm sm:text-base text-[#475569] font-medium leading-relaxed">
              Manage your placement drives and find the right talent.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  setDriveToEdit(null);
                  setIsCreateDriveOpen(true);
                }}
                className="px-5 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Build Your Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {selectedDrive && (
                <span className="px-3 py-1 rounded-full bg-white border border-purple-200 text-slate-700 text-xs font-semibold">
                  {selectedDrive.companyName} &bull; {selectedDrive.roleTitle}
                </span>
              )}
            </div>
          </div>

          {/* Right Corporate Illustration */}
          <div className="flex justify-center md:justify-end shrink-0">
            <CorporateIllustration />
          </div>
        </div>
      </div>

      {/* 2. THREE KEY METRIC CARDS (Matching placemind-dashboard-reference.png) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Card 1: Active Drives */}
        <div
          onClick={() => {
            setDriveToEdit(null);
            setIsCreateDriveOpen(true);
          }}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-purple-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] shadow-xs group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              Active Drives
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {recruiterDrives.length}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-[#7C3AED] transition-colors">
            <span>Create Drive</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Applications */}
        <div
          onClick={() => navigate('/recruiter/candidates')}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-emerald-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              Applications
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {totalApplicantsCount}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-emerald-600 transition-colors">
            <span>View Applications</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Shortlisted */}
        <div
          onClick={() => {
            if (dashboardData?.rounds?.[0]) {
              setActiveRoundModal(dashboardData.rounds[0]);
            }
          }}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-amber-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shadow-xs group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              Shortlisted
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {shortlistedCount}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-amber-600 transition-colors">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. RECENT DRIVES & QUICK ACTIONS ROW (Matching placemind-dashboard-reference.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Your Recent Drives */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#CBD5E1]/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-black text-[#14213D]">
              Your Recent Drives
            </h2>
            <button
              onClick={() => navigate('/recruiter/drives')}
              className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* If no drives, display reference empty state with Post a Drive button */}
          {!loadingDrives && recruiterDrives.length === 0 ? (
            <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                <Briefcase className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-[#14213D]">
                  No drives posted yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Create a placement drive to get started.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsCreateDriveOpen(true)}
                  className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Post a Drive
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Drive selector pill bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#7C3AED]" />
                  <span className="text-xs font-bold text-slate-600">Active Pipeline:</span>
                  <select
                    value={selectedDriveId}
                    onChange={(e) => setSelectedDriveId(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-bold text-[#14213D] rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer max-w-[260px] truncate"
                  >
                    {recruiterDrives.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.companyName} — {d.roleTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {selectedDrive && (
                    <button
                      onClick={() => {
                        setDriveToEdit(selectedDrive);
                        setIsCreateDriveOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Drive</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Drives List */}
              <div className="divide-y divide-slate-100">
                {recruiterDrives.slice(0, 4).map((d) => {
                  const isSelected = d.id === selectedDriveId;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDriveId(d.id)}
                      className={`py-3.5 px-3 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isSelected ? 'bg-purple-50/50 border border-purple-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-[#7C3AED] flex items-center justify-center font-bold text-xs shrink-0">
                          {d.companyName ? d.companyName[0] : 'C'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#14213D] truncate">{d.roleTitle}</h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{d.companyName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                            (d.status || '').toUpperCase() === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : (d.status || '').toUpperCase() === 'SUBMITTED_TO_OFFICER'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {d.status || 'Active'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <h2 className="text-base sm:text-lg font-black text-[#14213D] pb-3 border-b border-slate-100">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => {
                setDriveToEdit(null);
                setIsCreateDriveOpen(true);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold flex items-center justify-start gap-3 shadow-xs transition-all cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-base">
                +
              </span>
              <span>Post a New Drive</span>
            </button>

            <button
              onClick={() => navigate('/recruiter/candidates')}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold flex items-center justify-start gap-3 shadow-xs transition-all cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <span>View Applications</span>
            </button>

            <button
              onClick={() => navigate('/recruiter/drives')}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs sm:text-sm font-bold flex items-center justify-start gap-3 shadow-xs transition-all cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              <span>Manage Company Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. PRESERVED EXISTING RECRUITER PIPELINE & EVALUATION SECTIONS */}
      {selectedDriveId && (
        <div className="space-y-6">
          {/* Drive Pipeline Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#14213D]">
                  Recruitment Rounds &amp; Screening Pipeline
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#7C3AED] border border-purple-200">
                  {selectedDrive?.roleTitle || 'Selected Drive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure screening stages, review candidates in each round, and record candidate evaluations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfigureRoundsOpen(true)}
                className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Configure Rounds</span>
              </button>
            </div>
          </div>

          {/* Rounds Cards Grid */}
          {dashboardData && dashboardData.rounds && dashboardData.rounds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dashboardData.rounds.map((round) => (
                <div
                  key={round.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Round {round.order} &bull; {round.round_type}
                      </span>
                      {round.is_final && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Final Round
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#14213D]">{round.name}</h4>
                    <p className="text-xs text-slate-500">
                      {round.candidates?.length || 0} candidate(s) currently in this round.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveRoundModal(round)}
                      className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Review Candidates</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-[#14213D]">No recruitment rounds configured yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add Aptitude, Technical, and HR interview stages to organize candidate screening.
              </p>
              <button
                onClick={() => setIsConfigureRoundsOpen(true)}
                className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                + Add First Round
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CONFIGURE ROUNDS */}
      {isConfigureRoundsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 sm:p-7 space-y-5 text-[#14213D]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-[#14213D]">Configure Drive Rounds</h3>
              </div>
              <button
                onClick={() => {
                  setIsConfigureRoundsOpen(false);
                  setEditingRoundId(null);
                  setNewRoundName('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Existing Rounds List */}
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {dashboardData?.rounds?.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-[#14213D] block">{r.name}</span>
                    <span className="text-[11px] text-slate-500">
                      Round {r.order} &bull; {r.round_type} {r.is_final ? '(Final)' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingRoundId(r.id);
                        setNewRoundName(r.name);
                        setNewRoundType(r.round_type);
                        setNewRoundOrder(r.order);
                        setNewRoundIsFinal(r.is_final);
                      }}
                      className="text-slate-500 hover:text-[#7C3AED] p-1 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRound(r.id)}
                      className="text-slate-500 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add / Edit Form */}
            <form onSubmit={handleSaveRound} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3 text-xs">
              <h4 className="font-bold text-[#14213D]">
                {editingRoundId ? 'Edit Round Details' : 'Add New Round'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Round Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoundName}
                    onChange={(e) => setNewRoundName(e.target.value)}
                    placeholder="e.g. Technical Interview Round 1"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Round Type
                  </label>
                  <select
                    value={newRoundType}
                    onChange={(e) => setNewRoundType(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Aptitude">Aptitude</option>
                    <option value="Technical">Technical</option>
                    <option value="Coding">Coding</option>
                    <option value="HR">HR Interview</option>
                    <option value="Managerial">Managerial</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newRoundOrder}
                    onChange={(e) => setNewRoundOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_final_round"
                  checked={newRoundIsFinal}
                  onChange={(e) => setNewRoundIsFinal(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="is_final_round" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Is this the final selection round?
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                {editingRoundId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoundId(null);
                      setNewRoundName('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  {editingRoundId ? 'Update Round' : 'Save Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CANDIDATE EVALUATION IN ROUND */}
      {activeRoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 p-6 sm:p-7 space-y-4 text-[#14213D]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#14213D]">{activeRoundModal.name}</h3>
                <p className="text-xs text-slate-500">
                  Round {activeRoundModal.order} &bull; {activeRoundModal.round_type}
                </p>
              </div>
              <button
                onClick={() => setActiveRoundModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2.5">
              {!activeRoundModal.candidates || activeRoundModal.candidates.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No candidates currently in this round.
                </div>
              ) : (
                activeRoundModal.candidates.map((c) => (
                  <div
                    key={c.application_id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#14213D] block">{c.student_name || 'Candidate'}</span>
                      <span className="text-[11px] text-slate-500">
                        {c.branch} &bull; CGPA: {c.cgpa} &bull; Roll: {c.rollNumber || 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={actionLoadingAppId === c.application_id}
                        onClick={() =>
                          handleCandidateAction(c.application_id, 'PASS', activeRoundModal.id, c.student_name)
                        }
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Pass Round
                      </button>
                      <button
                        disabled={actionLoadingAppId === c.application_id}
                        onClick={() =>
                          handleCandidateAction(c.application_id, 'REJECT', activeRoundModal.id, c.student_name)
                        }
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Reject
                      </button>
                      {activeRoundModal.is_final && (
                        <button
                          disabled={actionLoadingAppId === c.application_id}
                          onClick={() => {
                            setSelectedCandidateForOffer(c);
                            setActiveRoundModal(null);
                          }}
                          className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Extend Offer
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveRoundModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DRIVE MODAL */}
      {isCreateDriveOpen && (
        <CreateDriveModal
          isOpen={isCreateDriveOpen}
          onClose={() => {
            setIsCreateDriveOpen(false);
            setDriveToEdit(null);
          }}
          initialDrive={driveToEdit}
          onDriveCreated={() => {
            setIsCreateDriveOpen(false);
            setDriveToEdit(null);
            loadRecruiterDrives();
          }}
        />
      )}

      {/* EXTEND OFFER MODAL */}
      {selectedCandidateForOffer && (
        <CreateOfferModal
          isOpen={Boolean(selectedCandidateForOffer)}
          candidate={selectedCandidateForOffer}
          onClose={() => setSelectedCandidateForOffer(null)}
          onOfferIssued={() => {
            setSelectedCandidateForOffer(null);
            triggerToast('Job offer extended successfully!', 'success');
            if (selectedDriveId) loadDriveMetrics(selectedDriveId);
          }}
        />
      )}
    </div>
  );
};
