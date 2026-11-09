import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  Code,
  FileText,
  Loader2,
  Award,
  Layers,
  BrainCircuit,
  UserCheck,
  Building2,
  Clock,
  User,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { ProfileCompletionWidget } from '../../components/student/ProfileCompletionWidget';

// Student Graduation Cap and Books SVG Illustration for Welcome Banner
const StudentIllustration: React.FC = () => (
  <svg
    className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 drop-shadow-md select-none pointer-events-none"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Soft subtle glow behind books */}
    <circle cx="100" cy="110" r="70" fill="#DBEAFE" fillOpacity="0.6" />

    {/* Bottom Book */}
    <path
      d="M40 145 C40 145 65 140 100 140 C135 140 160 145 160 145 L160 160 C160 160 135 155 100 155 C65 155 40 160 40 160 Z"
      fill="#2563EB"
    />
    <path
      d="M42 147 C50 145 75 142 100 142 C125 142 150 145 158 147 L158 150 C150 148 125 145 100 145 C75 145 50 148 42 150 Z"
      fill="#93C5FD"
    />
    <path
      d="M40 160 C65 155 135 155 160 160 L158 165 C135 160 65 160 42 165 Z"
      fill="#1D4ED8"
    />

    {/* Middle Book */}
    <path
      d="M48 125 C48 125 70 120 100 120 C130 120 152 125 152 125 L152 140 C152 140 130 135 100 135 C70 135 48 140 48 140 Z"
      fill="#3B82F6"
    />
    <path
      d="M50 127 C60 125 80 122 100 122 C120 122 140 125 150 127 L150 130 C140 128 120 125 100 125 C80 125 60 128 50 130 Z"
      fill="#EFF6FF"
    />

    {/* Graduation Cap Top Diamond */}
    <path
      d="M100 60 L160 85 L100 110 L40 85 Z"
      fill="#14213D"
    />
    <path
      d="M100 63 L152 85 L100 105 L48 85 Z"
      fill="#1E293B"
    />

    {/* Cap Skull Base */}
    <path
      d="M65 96 C65 110 80 122 100 122 C120 122 135 110 135 96 L135 90 C125 98 112 102 100 102 C88 102 75 98 65 90 Z"
      fill="#0F172A"
    />

    {/* Button / Tassel Center */}
    <circle cx="100" cy="85" r="4.5" fill="#FCD34D" />

    {/* Tassel Cord */}
    <path
      d="M100 85 C125 90 145 100 150 118"
      stroke="#FCD34D"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Tassel Fringe */}
    <path
      d="M148 118 L152 118 L154 132 L146 132 Z"
      fill="#F59E0B"
    />
  </svg>
);

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [allocatedAssessments, setAllocatedAssessments] = useState<any[]>([]);
  const [selectedAllocatedModal, setSelectedAllocatedModal] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [data, apps, assess, studentAsses] = await Promise.all([
          apiService.getMyStudentDashboard().catch(() => null),
          apiService.getMyApplications().catch(() => []),
          apiService.getStudentAssessmentAnalytics().catch(() => null),
          apiService.getStudentAssessments().catch(() => []),
        ]);
        if (isMounted) {
          if (data) setDashboardData(data);
          if (apps) setMyApplications(apps);
          if (assess) setAssessmentData(assess);
          if (studentAsses) setAllocatedAssessments(studentAsses);
        }
      } catch (err) {
        console.warn('Failed to load dynamic student dashboard, using fallback');
        if (isMounted) {
          setDashboardData({
            student: {
              name: user?.name || 'Student Candidate',
              email: user?.email || '',
              branch: 'CSE',
              batch: '2027',
              cgpa: 0,
              skills: [],
              projects: [],
              experience: [],
              certifications: [],
              readinessScore: 0,
            },
            hasResume: false,
            appliedDriveIds: [],
            interviews: [],
            isNewUser: true,
            profileCompletion: 0,
            isProfileComplete: false,
            missingRequirements: ['Upload and analyze your resume in the Resume Analyzer'],
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  const student = dashboardData?.student || {
    name: user?.name || 'Student Candidate',
    email: user?.email || '',
    branch: 'CSE',
    batch: '2027',
    cgpa: 0,
    skills: [],
    projects: [],
    experience: [],
    certifications: [],
    readinessScore: 0,
  };

  const studentFirstName = student.name ? student.name.split(' ')[0] : 'Student';
  const hasResume = dashboardData?.hasResume || false;
  const isProfileComplete = dashboardData?.isProfileComplete ?? (student.skills?.length > 0 && hasResume);
  const profileCompletion = dashboardData?.profileCompletion ?? (hasResume ? (isProfileComplete ? 100 : 75) : 0);
  const readinessScore = student.readinessScore || 0;
  const studentSkills: string[] = student.skills || [];
  const studentProjects: any[] = student.projects || [];
  const studentExperience: any[] = student.experience || [];
  const studentCertifications: any[] = student.certifications || [];
  const appliedDrivesCount = dashboardData?.appliedDriveIds?.length || myApplications.length || 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
        <p className="text-xs font-semibold">Loading student workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 text-[#14213D]">
      {/* 1. WELCOME HERO SECTION (Matching placemind-dashboard-reference.png) */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#E8F0FE] via-[#F8FAFC] to-white border border-[#CBD5E1]/90 p-6 sm:p-8 md:p-10 overflow-hidden shadow-xs">
        {/* Soft background curve accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#14213D] tracking-tight">
              Welcome back, {studentFirstName}! 👋
            </h1>
            <p className="text-sm sm:text-base text-[#475569] font-medium leading-relaxed">
              Your placement journey continues here.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <span className="px-4 py-1.5 rounded-full bg-[#2563EB] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs">
                <span>Dream Big &bull; Get Placed</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold">
                {student.branch || 'CSE'} &bull; Batch {student.batch || '2027'}
              </span>
              {student.cgpa > 0 && (
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold">
                  CGPA: <strong>{student.cgpa}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Right Illustration */}
          <div className="flex justify-center md:justify-end shrink-0">
            <StudentIllustration />
          </div>
        </div>
      </div>

      {/* 2. THREE KEY METRIC CARDS (Matching placemind-dashboard-reference.png) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Card 1: My Applications */}
        <div
          onClick={() => navigate('/student/applications')}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shadow-xs group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              My Applications
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {myApplications.length}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-[#2563EB] transition-colors">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Placement Drives */}
        <div
          onClick={() => navigate('/student/drives')}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-purple-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] shadow-xs group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              Placement Drives
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {appliedDrivesCount}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-[#7C3AED] transition-colors">
            <span>Explore Drives</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Profile Status */}
        <div
          onClick={() => navigate('/student/profile')}
          className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-teal-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 ease-in-out cursor-pointer flex flex-col justify-between space-y-4 group motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0D9488] shadow-xs group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              Profile Status
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#14213D] mt-1">
              {profileCompletion}%
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#475569] group-hover:text-[#0D9488] transition-colors">
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY & QUICK ACTIONS ROW (Matching placemind-dashboard-reference.png) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#CBD5E1]/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-black text-[#14213D]">
              Recent Activity
            </h2>
            <button
              onClick={() => navigate('/student/applications')}
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Activity Content: Either actual records or the reference empty state */}
          {myApplications.length === 0 ? (
            <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-[#14213D]">
                  No recent activity yet
                </h3>
                <p className="text-xs text-[#475569] font-medium leading-relaxed">
                  Your activities will appear here once you apply for drives.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {myApplications.slice(0, 4).map((app) => (
                <div
                  key={app.id || app.drive_id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2.5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0 font-bold text-xs">
                      {app.company_name ? app.company_name[0] : 'C'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#14213D] truncate">
                        {app.company_name}
                      </h4>
                      <p className="text-[11px] text-[#475569] font-medium truncate">
                        {app.job_title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        app.status === 'SHORTLISTED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {app.status || 'Applied'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                      {app.applied_at || 'Recent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#CBD5E1]/90 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-black text-[#14213D] pb-3 border-b border-slate-100">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/drives')}
              className="w-full py-3 px-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Placement Drives</span>
            </button>

            <button
              onClick={() => navigate('/student/resume')}
              className="w-full py-3 px-4 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-2xs"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>Update Your Profile</span>
            </button>

            <button
              onClick={() => navigate('/student/assessment')}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#E8F0FE] hover:bg-blue-100 text-[#2563EB] border border-blue-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch PrepBot AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. PRESERVED EXISTING STUDENT CAPABILITIES */}
      {/* Profile Completion Checklist */}
      <ProfileCompletionWidget
        completion={profileCompletion}
        isComplete={isProfileComplete}
        missingRequirements={dashboardData?.missingRequirements}
        checklist={dashboardData?.checklist}
      />

      {/* ALLOCATED APTITUDE ASSESSMENT CARD (Preserved) */}
      {(() => {
        const allocatedAptitude = (allocatedAssessments || []).find(
          (a: any) => a.status === 'ALLOCATED' || a.round_type === 'APTITUDE'
        );
        if (!allocatedAptitude) return null;
        return (
          <div className="p-6 bg-gradient-to-r from-blue-50/80 to-white border border-blue-200/80 rounded-3xl shadow-sm text-[#14213D]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-blue-100/80 border border-blue-200 text-[#2563EB] font-bold text-xl shrink-0">
                  🧠
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[#14213D]">Aptitude Assessment</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#2563EB] border border-blue-200">
                      Status: Allocated
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Company: <strong>{allocatedAptitude.company || allocatedAptitude.company_name}</strong> &bull; Role:{' '}
                    <strong className="text-[#2563EB]">{allocatedAptitude.job_title || allocatedAptitude.role_title}</strong>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
                    <span>📅 Scheduled: <strong>{allocatedAptitude.scheduled_at || 'TBD'}</strong></span>
                    <span>⏳ Deadline: <strong>{allocatedAptitude.deadline || 'TBD'}</strong></span>
                    <span>⏱️ Duration: <strong>{allocatedAptitude.duration_minutes || 30} mins</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => setSelectedAllocatedModal(allocatedAptitude)}
                >
                  Details
                </Button>
                {allocatedAptitude.status !== 'COMPLETED' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() =>
                      navigate(`/student/assessments/${allocatedAptitude.id || allocatedAptitude.assessment_id}`)
                    }
                  >
                    {allocatedAptitude.status === 'IN_PROGRESS' ? 'Continue Test' : 'Start Aptitude Test'}
                  </Button>
                ) : (
                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
                    Test Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ALLOCATED TECHNICAL ROUND CARD (Preserved) */}
      {(() => {
        const allocatedTechnical = (allocatedAssessments || []).find(
          (a: any) =>
            a.round_type === 'TECHNICAL' ||
            a.type === 'TECHNICAL' ||
            a.status === 'TECHNICAL_ALLOCATED'
        );
        if (!allocatedTechnical) return null;
        return (
          <div className="p-6 bg-gradient-to-r from-purple-50/60 to-indigo-50/40 border border-purple-200/80 rounded-3xl shadow-sm text-[#14213D]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-purple-100/80 border border-purple-200 text-purple-700 font-bold text-xl shrink-0">
                  💻
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[#14213D]">Technical Round</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      Status: Allocated
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Company: <strong>{allocatedTechnical.company || allocatedTechnical.company_name}</strong> &bull; Role:{' '}
                    <strong className="text-[#7C3AED]">{allocatedTechnical.job_title || allocatedTechnical.role_title}</strong>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
                    <span>📅 Scheduled: <strong>{allocatedTechnical.scheduled_at || 'To Be Announced'}</strong></span>
                    <span>⏳ Duration: <strong>{allocatedTechnical.duration_minutes || 45} mins</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => setSelectedAllocatedModal(allocatedTechnical)}
                >
                  Details
                </Button>
                {allocatedTechnical.status !== 'COMPLETED' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() =>
                      navigate(`/student/assessments/${allocatedTechnical.id || allocatedTechnical.assessment_id}`)
                    }
                  >
                    {allocatedTechnical.status === 'IN_PROGRESS' ? 'Continue Test' : 'Start Technical Test'}
                  </Button>
                ) : (
                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
                    Technical Test Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ALLOCATED / SCHEDULED HR INTERVIEW CARD (Preserved) */}
      {(() => {
        const hrInterview =
          (myApplications || []).find(
            (app: any) =>
              ['HR_INTERVIEW_ALLOCATED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(app.status) ||
              ['HR_INTERVIEW_ALLOCATED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'].includes(app.stage) ||
              app.hr_status === 'ALLOCATED'
          ) ||
          ((dashboardData as any)?.interviews || []).find((i: any) => i.status !== 'CANCELLED');

        if (!hrInterview) return null;

        const isScheduled =
          hrInterview.status === 'scheduled' ||
          hrInterview.status === 'INTERVIEW_SCHEDULED' ||
          hrInterview.stage === 'INTERVIEW_SCHEDULED' ||
          !!(hrInterview.date || hrInterview.scheduled_date);
        const isCompleted =
          hrInterview.status === 'completed' ||
          hrInterview.status === 'COMPLETED' ||
          hrInterview.stage === 'INTERVIEW_COMPLETED';

        return (
          <div className="p-6 bg-gradient-to-r from-teal-50/60 to-emerald-50/40 border border-teal-200/80 rounded-3xl shadow-sm text-[#14213D]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-teal-100/80 border border-teal-200 text-teal-700 font-bold text-xl shrink-0">
                  👔
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[#14213D]">HR / Interview Round</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : isScheduled
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-teal-100 text-teal-800 border-teal-200'
                      }`}
                    >
                      Status: {isCompleted ? 'INTERVIEW COMPLETED' : isScheduled ? 'INTERVIEW SCHEDULED' : 'Awaiting Schedule'}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Company: <strong>{hrInterview.companyName || hrInterview.company_name || hrInterview.company}</strong> &bull; Role:{' '}
                    <strong className="text-[#0D9488]">{hrInterview.roleTitle || hrInterview.job_title || hrInterview.role_title}</strong>
                  </div>

                  {isScheduled ? (
                    <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
                      <span>👥 Panel: <strong>{hrInterview.panelName || hrInterview.panel_name || 'HR Panel'}</strong></span>
                      <span>📍 Room: <strong>{hrInterview.roomName || hrInterview.room_name || 'Main Hall'}</strong></span>
                      <span>📅 Date: <strong>{hrInterview.date || hrInterview.scheduled_date || 'TBD'}</strong></span>
                      <span>⏰ Time: <strong>{hrInterview.timeSlot || hrInterview.time || hrInterview.startTime || 'TBD'}</strong></span>
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-slate-500">
                      HR round allocated. Venue and room scheduling in progress.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => setSelectedAllocatedModal(hrInterview)}
                >
                  Details
                </Button>
                {isCompleted ? (
                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold">
                    Interview Completed
                  </span>
                ) : isScheduled ? (
                  <span className="text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold">
                    Scheduled
                  </span>
                ) : (
                  <span className="text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 text-xs font-bold">
                    Awaiting Schedule
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* VERIFIED SKILLS, PROJECTS & EXPERIENCE (Preserved & Redesigned) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Skills */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
          <h3 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified Technical Skills</span>
          </h3>
          {studentSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {studentSkills.map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <Code className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No skills detected</p>
              <p className="text-[11px] text-slate-500">Upload resume to extract skills.</p>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
          <h3 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <span>Technical Projects</span>
          </h3>
          {studentProjects.length > 0 ? (
            <div className="space-y-2 pt-1">
              {studentProjects.slice(0, 3).map((p: any, i: number) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-bold text-[#14213D] block">{p.name || p.title}</span>
                  {p.description && <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <Layers className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No projects recorded</p>
              <p className="text-[11px] text-slate-500">Projects will populate from resume.</p>
            </div>
          )}
        </div>

        {/* Certifications & Experience */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
          <h3 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Certifications &amp; Experience</span>
          </h3>
          {studentCertifications.length > 0 || studentExperience.length > 0 ? (
            <div className="space-y-2 pt-1">
              {studentCertifications.slice(0, 2).map((c: any, i: number) => (
                <div key={i} className="p-2 bg-amber-50/60 rounded-xl border border-amber-100 text-xs">
                  <span className="font-bold text-amber-900 block">{c.name}</span>
                  {c.issuer && <span className="text-[10px] text-amber-700">{c.issuer}</span>}
                </div>
              ))}
              {studentExperience.slice(0, 2).map((e: any, i: number) => (
                <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block">{e.role} &bull; {e.company}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-1">
              <Award className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No experience or certs</p>
              <p className="text-[11px] text-slate-500">Credentials will populate from resume.</p>
            </div>
          )}
        </div>
      </div>

      {/* ALLOCATION DETAILS MODAL */}
      {selectedAllocatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 text-[#14213D]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="text-base font-bold text-[#14213D]">Allocation Details</h3>
              </div>
              <button
                onClick={() => setSelectedAllocatedModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assessment Title</span>
                <p className="text-sm font-bold text-[#14213D]">{selectedAllocatedModal.title || 'Placement Assessment'}</p>
                <p className="text-xs text-[#2563EB]">
                  {selectedAllocatedModal.job_title || selectedAllocatedModal.role_title} at {selectedAllocatedModal.company || selectedAllocatedModal.company_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="text-xs font-bold text-[#2563EB] mt-0.5 block">Allocated</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Duration</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                    {selectedAllocatedModal.duration_minutes || 30} mins
                  </span>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Scheduled:</span>
                  <span className="font-bold text-slate-800">{selectedAllocatedModal.scheduled_at || 'TBA'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Deadline:</span>
                  <span className="font-bold text-slate-800">{selectedAllocatedModal.deadline || 'TBA'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAllocatedModal(null)}
              >
                Close
              </Button>
              {selectedAllocatedModal.status !== 'COMPLETED' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                  icon={<Sparkles className="w-4 h-4" />}
                  onClick={() => {
                    const assId = selectedAllocatedModal.id || selectedAllocatedModal.assessment_id;
                    setSelectedAllocatedModal(null);
                    navigate(`/student/assessments/${assId}`);
                  }}
                >
                  Start Test
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
