import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Briefcase,
  MapPin,
  FileText,
  Send,
  Loader2,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { CompanyLogo } from '../../components/ui/CompanyLogo';
import { useAuth } from '../../context/AuthContext';
import { usePlacement } from '../../context/PlacementContext';
import {
  apiService,
  CommunityItem,
  CommunityMessage,
  CommunityResponseItem,
  PlacementForm,
} from '../../services/api';

const BRANCH_CANONICALS: Record<string, string[]> = {
  CSE: ['CSE', 'CS', 'COMPUTER SCIENCE', 'COMPUTER SCIENCE & ENGINEERING', 'COMPUTER SCIENCE AND ENGINEERING', 'COMPUTER ENGINEERING'],
  IT: ['IT', 'INFORMATION TECHNOLOGY', 'INFO TECH', 'INFORMATION SCIENCE', 'ISE'],
  ECE: ['ECE', 'ELECTRONICS', 'ELECTRONICS & COMMUNICATION', 'ELECTRONICS AND COMMUNICATION', 'ELECTRONICS & COMMUNICATION ENGINEERING', 'ELECTRONICS AND COMMUNICATION ENGINEERING', 'ETC'],
  EE: ['EE', 'EEE', 'ELECTRICAL', 'ELECTRICAL ENGINEERING', 'ELECTRICAL AND ELECTRONICS', 'ELECTRICAL & ELECTRONICS ENGINEERING', 'TECHNICAL / ELECTRICAL ENGINEERING'],
  ME: ['ME', 'MECH', 'MECHANICAL', 'MECHANICAL ENGINEERING'],
  CE: ['CE', 'CIVIL', 'CIVIL ENGINEERING'],
  AIML: ['AI', 'AIML', 'ARTIFICIAL INTELLIGENCE', 'AI & ML', 'AI/ML', 'ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING'],
  DATA_SCIENCE: ['DS', 'DATA SCIENCE', 'DATA SCIENCE AND ENGINEERING'],
};

const getCanonicalBranch = (bStr: string) => {
  if (!bStr) return '';
  const clean = bStr.toUpperCase().trim();
  for (const [code, syns] of Object.entries(BRANCH_CANONICALS)) {
    if (syns.includes(clean)) return code;
  }
  if (clean.includes('COMPUTER SCIENCE') || clean.includes('COMPUTER ENG')) return 'CSE';
  if (clean.includes('INFORMATION TECH') || clean.includes('INFORMATION SCI')) return 'IT';
  if (clean.includes('ELECTRONICS') && clean.includes('COMMUNICATION')) return 'ECE';
  if (clean.includes('ELECTRICAL')) return 'EE';
  if (clean.includes('MECHANICAL')) return 'ME';
  if (clean.includes('CIVIL')) return 'CE';
  return clean;
};

const isBranchMatch = (stBranch: string, eligBranches: string[]) => {
  if (!eligBranches || eligBranches.length === 0) return true;
  if (!stBranch) return false;
  const stCanon = getCanonicalBranch(stBranch);
  const driveCanons = new Set(eligBranches.map((b) => getCanonicalBranch(b)));
  if (driveCanons.has(stCanon)) return true;
  return eligBranches.some((b) => b.toUpperCase().trim() === stBranch.toUpperCase().trim());
};

export const StudentCommunity: React.FC = () => {
  const { driveId: paramDriveId } = useParams<{ driveId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerToast } = usePlacement();

  const [allCommunities, setAllCommunities] = useState<CommunityItem[]>([]);
  const activeDriveId = paramDriveId || searchParams.get('drive_id') || (allCommunities[0]?.drive_id || '');

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [community, setCommunity] = useState<CommunityItem | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [skillGap, setSkillGap] = useState<any>(null);
  const [responses, setResponses] = useState<CommunityResponseItem[]>([]);
  const [forms, setForms] = useState<PlacementForm[]>([]);

  // Registration Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [registerFormData, setRegisterFormData] = useState({
    name: '',
    email: '',
    roll_number: '',
    branch: 'CSE',
    cgpa: 8.0,
    phone: '',
    preferred_location: '',
    cover_note: '',
  });
  const [isSubmittingReg, setIsSubmittingReg] = useState<boolean>(false);

  // Active Tab: 'overview' | 'announcements' | 'forms' | 'preparation' | 'responses'
  const [activeTab, setActiveTab] = useState<'overview' | 'announcements' | 'forms' | 'preparation' | 'responses'>('overview');

  const isOfficer = user?.role === 'placement_officer' || user?.role === ('admin' as any);

  // Load Data
  useEffect(() => {
    let isMounted = true;
    const fetchCommunityData = async () => {
      setLoading(true);
      try {
        const [commRes, msgsRes, profileRes, listRes, formsRes] = await Promise.allSettled([
          apiService.getPlacementCommunity(activeDriveId),
          apiService.getCommunityMessages(activeDriveId),
          apiService.getMyStudentProfile(),
          apiService.getPlacementCommunities(),
          apiService.getForms(activeDriveId),
        ]);

        if (isMounted) {
          if (commRes.status === 'fulfilled' && commRes.value) {
            setCommunity(commRes.value);
          }
          if (msgsRes.status === 'fulfilled' && msgsRes.value) {
            setMessages(msgsRes.value);
          }
          if (listRes.status === 'fulfilled' && listRes.value) {
            setAllCommunities(listRes.value);
          }
          if (formsRes.status === 'fulfilled' && formsRes.value) {
            setForms(formsRes.value);
          }
          if (profileRes.status === 'fulfilled' && profileRes.value) {
            const p = profileRes.value;
            setStudentProfile(p);
            setRegisterFormData((prev) => ({
              ...prev,
              name: p.name || user?.name || '',
              email: p.email || user?.email || '',
              roll_number: p.rollNumber || p.roll_number || '',
              branch: p.branch || 'CSE',
              cgpa: p.cgpa ?? 0.0,
              phone: p.phone || p.mobile || '',
              preferred_location: p.preferred_location || 'Bengaluru',
            }));
          }

          // Fetch Skill Gap for this drive
          try {
            const gap = await apiService.getOpportunitySkillGap(activeDriveId);
            if (gap) setSkillGap(gap);
          } catch {
            // Optional skill gap
          }

          // Fetch responses if officer
          if (isOfficer) {
            try {
              const resps = await apiService.getCommunityResponses(activeDriveId);
              if (resps) setResponses(resps);
            } catch {
              // Ignore
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load community data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCommunityData();
    return () => {
      isMounted = false;
    };
  }, [activeDriveId, user?.id, isOfficer]);

  const drive = community?.drive;
  const isRegistered = community?.is_registered;

  // Authoritative Eligibility evaluation
  const studentCgpa = studentProfile?.cgpa ?? 0.0;
  const studentBranch = (studentProfile?.branch || 'CSE').trim();
  const minCgpa = drive?.minCgpa ?? 0.0;
  const eligibleBranches = drive?.eligibleBranches || ['CSE', 'IT'];
  const isCgpaEligible = minCgpa <= 0 || studentCgpa >= minCgpa;
  const isBranchEligible = isBranchMatch(studentBranch, eligibleBranches);
  const isEligible = isCgpaEligible && isBranchEligible;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community) return;

    if (!isEligible) {
      triggerToast('You do not meet the eligibility criteria for this placement drive.', 'error');
      setIsRegisterModalOpen(false);
      return;
    }

    setIsSubmittingReg(true);
    try {
      const res = await apiService.registerForCommunityDrive(activeDriveId, {
        name: registerFormData.name,
        email: registerFormData.email,
        roll_number: registerFormData.roll_number,
        branch: registerFormData.branch,
        cgpa: Number(registerFormData.cgpa),
        phone: registerFormData.phone,
        preferred_location: registerFormData.preferred_location,
        custom_answers: {
          cover_note: registerFormData.cover_note,
        },
      });

      triggerToast(res.message || 'Registration submitted successfully!', 'success');
      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              is_registered: true,
              registered_count: res.registered_count || prev.registered_count + 1,
            }
          : null
      );
      setIsRegisterModalOpen(false);

      if (isOfficer) {
        const updatedResponses = await apiService.getCommunityResponses(activeDriveId);
        setResponses(updatedResponses);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || 'Failed to submit registration.';
      triggerToast(errMsg, 'error');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  if (loading && !community) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-[#64748B]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
        <p className="text-xs font-semibold">Loading Placement Community Workspace...</p>
      </div>
    );
  }

  if (!community && !loading) {
    return (
      <div className="space-y-6 pb-12 text-[#14213D]">
        <PageHeader
          title="Placement Communities"
          subtitle="Discover active placement drive communication communities."
          icon={<Users className="w-5 h-5 text-[#2563EB]" />}
        />
        <Card className="p-12 text-center bg-white border border-slate-200 shadow-xs space-y-3">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[#14213D]">No active placement communities</h3>
          <p className="text-xs text-[#64748B]">
            Communities are created automatically once Placement Officers approve recruiter placement drives.
          </p>
          <Button variant="primary" onClick={() => navigate('/student/drives')}>
            Browse Available Placement Drives
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-[#14213D]">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/student/drives')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] hover:text-[#14213D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Placement Drives
        </button>

        {/* Other Active Communities Quick Selector */}
        {allCommunities.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs">
            <span className="text-[#64748B] font-medium hidden sm:inline">Active Communities:</span>
            <select
              value={activeDriveId}
              onChange={(e) => navigate(`/student/community/${e.target.value}`)}
              className="bg-transparent font-semibold text-[#14213D] focus:outline-none cursor-pointer"
            >
              {allCommunities.map((c) => (
                <option key={c.drive_id} value={c.drive_id} className="bg-white text-[#14213D]">
                  {c.company_name} — {c.role_title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* COMMUNITY HERO BANNER */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <CompanyLogo
              logo={drive?.companyLogo || community?.company_name?.substring(0, 2).toUpperCase() || 'CP'}
              name={community?.company_name || 'Company'}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 uppercase tracking-wider">
                  Placement Community
                </span>
                <StatusBadge status={(community?.status || 'active').toLowerCase() as any} />
                {isEligible ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Eligible
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-600" /> Not Eligible
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#14213D] tracking-tight mt-2">
                {community?.company_name} — {community?.role_title}
              </h1>

              <div className="flex items-center gap-4 text-xs font-medium text-[#64748B] mt-3 flex-wrap">
                {community?.package_lpa && (
                  <span className="text-emerald-700 font-bold">
                    ₹{community.package_lpa} LPA {community.salary_text ? `(${community.salary_text})` : ''}
                  </span>
                )}
                {community?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" /> {community.location}
                  </span>
                )}
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Registered Students: {community?.registered_count ?? 0}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {isRegistered ? (
              <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Registered ✓
              </div>
            ) : isEligible ? (
              <Button
                variant="primary"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={() => setIsRegisterModalOpen(true)}
              >
                Register for Placement Drive
              </Button>
            ) : (
              <div
                className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs"
                title={!isCgpaEligible ? `CGPA ${studentCgpa} is below minimum requirement ${minCgpa}` : `Branch ${studentBranch} is not in eligible branches [${eligibleBranches.join(', ')}]`}
              >
                <AlertCircle className="w-4 h-4 text-red-600" /> Not Eligible to Register
              </div>
            )}

            <Button
              variant="outline"
              icon={<BrainCircuit className="w-4 h-4 text-[#2563EB]" />}
              onClick={() => navigate(`/student/assessment?drive_id=${encodeURIComponent(activeDriveId)}`)}
            >
              Prepare for This Drive
            </Button>
          </div>
        </div>
      </div>

      {/* COMMUNITY TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#14213D] border border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Drive Overview
          </div>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
            activeTab === 'announcements'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#14213D] border border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Officer Announcements ({messages.length})
          </div>
        </button>

        <button
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
            activeTab === 'forms'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#14213D] border border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" /> Forms &amp; Surveys ({forms.length})
          </div>
        </button>

        <button
          onClick={() => setActiveTab('preparation')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
            activeTab === 'preparation'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#14213D] border border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5" /> AI Preparation &amp; Skill Gap
          </div>
        </button>

        {isOfficer && (
          <button
            onClick={() => setActiveTab('responses')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 ${
              activeTab === 'responses'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-[#64748B] hover:bg-slate-50 hover:text-[#14213D] border border-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> View Registered Responses ({responses.length})
            </div>
          </button>
        )}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Drive Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#14213D]">Role &amp; Job Description</h3>
              <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-line font-medium">
                {drive?.description ||
                  `Join ${community?.company_name} as a ${community?.role_title}. You will work on cutting-edge systems, collaborate with cross-functional product teams, and develop enterprise solutions.`}
              </p>
            </Card>

            {/* Skills & Tech Stack */}
            <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#14213D]">Technical Requirements</h3>
              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                  Mandatory Required Skills
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {drive?.requiredSkills && drive.requiredSkills.length > 0 ? (
                    drive.requiredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-semibold rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B]">Standard technical fundamentals</span>
                  )}
                </div>
              </div>

              {drive?.preferredSkills && drive.preferredSkills.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                    Preferred / Good-to-have Skills
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {drive.preferredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 bg-slate-50 text-[#64748B] border border-slate-200 text-xs font-medium rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            {/* Eligibility Check Card */}
            <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" /> Eligibility Criteria
              </h4>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#64748B]">Minimum CGPA</span>
                  <span className="font-bold text-[#14213D]">
                    {minCgpa} (Your CGPA: {studentCgpa})
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#64748B]">Eligible Branches</span>
                  <span className="font-bold text-[#14213D]">
                    {eligibleBranches.join(', ')} (You: {studentBranch})
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#64748B]">Target Batch</span>
                  <span className="font-bold text-[#14213D]">{drive?.graduationYear || 2027}</span>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl text-xs font-semibold mt-2 ${
                  isEligible
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {isEligible
                  ? '✓ You meet all academic & branch eligibility requirements for this drive.'
                  : `⚠ You do not currently meet the eligibility criteria: ${
                      !isCgpaEligible ? `CGPA is below required ${minCgpa}. ` : ''
                    }${!isBranchEligible ? `${studentBranch} is not in eligible branches.` : ''}`}
              </div>
            </Card>

            {/* Quick Registration Status */}
            <Card className="p-5 bg-white border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-[#14213D]">Registration Status</h4>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Total Candidates Registered:</span>
                <strong className="text-xl font-bold text-[#14213D]">{community?.registered_count ?? 0}</strong>
              </div>

              {isRegistered ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
                  You are registered for this placement drive.
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  Register Now
                </Button>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICER ANNOUNCEMENTS & FORMS FEED */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <Card className="p-4 bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#14213D]">Placement Officer Broadcast Feed</h3>
                <p className="text-xs text-[#64748B]">Official placement notices, registration forms, and interview updates</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-semibold rounded-full">
                {messages.length} Announcements
              </span>
            </div>
          </Card>

          {messages.length === 0 ? (
            <Card className="p-12 text-center bg-white border border-slate-200 space-y-2 shadow-xs">
              <MessageSquare className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
              <p className="text-sm font-bold text-[#14213D]">No announcements yet</p>
              <p className="text-xs text-[#64748B]">Placement Officer messages will appear here in real time.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <Card
                  key={msg.id}
                  className="p-5 bg-white border border-slate-200 hover:border-blue-200 transition-all space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white font-bold flex items-center justify-center text-xs">
                        PO
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#14213D] block">{msg.author_name}</span>
                        <span className="text-[10px] text-[#64748B] font-medium uppercase">Placement Officer</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#2563EB] uppercase border border-blue-200">
                        {msg.message_type || 'ANNOUNCEMENT'}
                      </span>
                      <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#2563EB]" />
                        {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#334155] leading-relaxed font-medium whitespace-pre-line">
                    {msg.content}
                  </p>

                  {/* CLICKABLE ACTION BUTTONS */}
                  {(msg.action_type || msg.message_type === 'REGISTRATION' || msg.message_type === 'FORM' || msg.form_id) && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      {msg.action_type === 'START_ASSESSMENT' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<BrainCircuit className="w-4 h-4" />}
                          onClick={() => navigate(`/student/assessment?drive_id=${encodeURIComponent(activeDriveId)}`)}
                        >
                          {msg.action_label || 'Start Assessment'}
                        </Button>
                      ) : msg.action_type === 'VIEW_INTERVIEW' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Calendar className="w-4 h-4" />}
                          onClick={() => navigate('/student/interviews')}
                        >
                          {msg.action_label || 'View Interview Schedule'}
                        </Button>
                      ) : msg.action_type === 'VIEW_DRIVE' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Briefcase className="w-4 h-4" />}
                          onClick={() => setActiveTab('overview')}
                        >
                          {msg.action_label || 'View Drive Details'}
                        </Button>
                      ) : (msg.action_type === 'OPEN_FORM' || msg.message_type === 'FORM') && msg.form_id ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                          icon={<ClipboardList className="w-4 h-4" />}
                          onClick={() => navigate(`/student/forms/${msg.form_id}`)}
                        >
                          {msg.action_label || 'Fill Form'}
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<FileText className="w-4 h-4" />}
                          onClick={() => setIsRegisterModalOpen(true)}
                        >
                          {msg.action_label || (isRegistered ? 'View Registration' : 'Open Registration Form')}
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: FORMS & SURVEYS */}
      {activeTab === 'forms' && (
        <div className="space-y-4">
          {forms.length === 0 ? (
            <Card className="p-8 text-center bg-white border border-slate-200 shadow-xs space-y-3">
              <ClipboardList className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-[#14213D]">No forms uploaded yet</h3>
              <p className="text-xs text-[#64748B]">The Placement Office has not uploaded any custom forms or surveys for this drive yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forms.map((f) => (
                <Card key={f.id} className="p-5 bg-white border border-slate-200 hover:border-purple-200 transition-all shadow-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {f.fields.length} FIELDS
                      </span>
                      <span className="text-[10px] text-[#64748B]">By {f.created_by_name}</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#14213D]">{f.title}</h4>
                    {f.description && <p className="text-xs text-[#64748B] line-clamp-2">{f.description}</p>}
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-[#64748B]">{f.submission_count} submissions</span>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      icon={<ClipboardList className="w-4 h-4" />}
                      onClick={() => navigate(`/student/forms/${f.id}`)}
                    >
                      Fill Form
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PREPARATION & SKILL GAP */}
      {activeTab === 'preparation' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#14213D] flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-[#2563EB]" /> Personalized AI Exam &amp; Prep
                </h3>
                <p className="text-xs text-[#64748B]">
                  AI generates focused coding &amp; aptitude tests based on {community?.company_name} requirements.
                </p>
              </div>

              <Button
                variant="primary"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={() => navigate(`/student/assessment?drive_id=${encodeURIComponent(activeDriveId)}`)}
                className="shrink-0"
              >
                Launch Focused Drive Assessment
              </Button>
            </div>

            {/* Skill Gap Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  ✓ Matched Technical Skills
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {skillGap?.matched_skills && skillGap.matched_skills.length > 0 ? (
                    skillGap.matched_skills.map((s: string) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B]">Analyze your resume to see skill matches</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  ⚠ Missing / Weak Skills to Practice
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {skillGap?.missing_skills && skillGap.missing_skills.length > 0 ? (
                    skillGap.missing_skills.map((s: string) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B]">No critical skill gaps detected for this role</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: OFFICER VIEW RESPONSES */}
      {activeTab === 'responses' && isOfficer && (
        <Card className="p-6 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#14213D]">Registered Candidate Responses</h3>
              <p className="text-xs text-[#64748B]">Live registration records submitted via this placement community</p>
            </div>
            <span className="text-sm font-bold text-emerald-700">Total: {responses.length} Candidates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#14213D]">
              <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 pl-4">Candidate</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">CGPA</th>
                  <th className="p-3">Skills</th>
                  <th className="p-3">Registered At</th>
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {responses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#64748B]">
                      No responses yet. Be the first student to register!
                    </td>
                  </tr>
                ) : (
                  responses.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 pl-4 font-bold text-[#14213D]">{r.student_name}</td>
                      <td className="p-3 font-mono text-[#64748B]">{r.roll_number || 'N/A'}</td>
                      <td className="p-3 font-semibold text-[#14213D]">{r.branch || 'CSE'}</td>
                      <td className="p-3 font-bold text-emerald-700">{r.cgpa != null ? r.cgpa : 'N/A'}</td>
                      <td className="p-3 text-[#64748B]">
                        {(r.skills || []).slice(0, 3).join(', ') || 'Technical candidate'}
                      </td>
                      <td className="p-3 text-[#64748B]">
                        {r.registered_at ? new Date(r.registered_at).toLocaleDateString() : 'Today'}
                      </td>
                      <td className="p-3 pr-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          {r.status || 'APPLIED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* STUDENT REGISTRATION MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 text-[#14213D]">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#14213D]">Placement Drive Registration</h3>
                <p className="text-xs text-[#64748B]">{community?.company_name} — {community?.role_title}</p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs text-[#334155]">
              {!isEligible && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    You do not satisfy the drive eligibility criteria ({!isCgpaEligible ? `CGPA below ${minCgpa}. ` : ''}{!isBranchEligible ? `Branch ${studentBranch} is not eligible.` : ''}).
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#14213D] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={registerFormData.name}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, name: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#14213D] mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={registerFormData.roll_number}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, roll_number: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#14213D] mb-1">Branch</label>
                  <input
                    type="text"
                    required
                    value={registerFormData.branch}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, branch: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#14213D] mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={registerFormData.cgpa}
                    onChange={(e) => setRegisterFormData({ ...registerFormData, cgpa: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14213D] mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={registerFormData.phone}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, phone: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14213D] mb-1">Preferred Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru / Hyderabad / Remote"
                  value={registerFormData.preferred_location}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, preferred_location: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#14213D] mb-1">Cover Note / Remarks (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Briefly state your relevant project experience or technical highlights..."
                  value={registerFormData.cover_note}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, cover_note: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmittingReg || !isEligible}
                  icon={isSubmittingReg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                >
                  {isSubmittingReg ? 'Submitting...' : !isEligible ? 'Ineligible to Register' : 'Submit Registration'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
