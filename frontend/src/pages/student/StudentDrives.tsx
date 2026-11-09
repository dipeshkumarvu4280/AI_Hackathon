import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Building2,
  MapPin,
  CheckCircle2,
  Calendar,
  Lock,
  Sparkles,
  Search,
  Globe,
  GraduationCap,
  XCircle,
  ShieldAlert,
  Loader2,
  Target,
  ChevronDown,
  ChevronUp,
  Layers,
  ListFilter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePlacement } from '../../context/PlacementContext';
import { useAuth } from '../../context/AuthContext';
import {
  apiService,
  PlacementRecommendation,
  UnifiedOpportunitiesResponse,
} from '../../services/api';
import { ProfileCompletionWidget } from '../../components/student/ProfileCompletionWidget';
import { CompanySkillGapModal } from '../../components/student/CompanySkillGapModal';
import { StudentApplicationModal } from '../../components/student/StudentApplicationModal';

export const StudentDrives: React.FC = () => {
  const navigate = useNavigate();
  const { hasAppliedToDrive } = usePlacement();
  const { user } = useAuth();

  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [dataResponse, setDataResponse] = useState<UnifiedOpportunitiesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'college' | 'external'>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'eligible' | 'ineligible' | 'high_match'>('all');
  const [viewMode, setViewMode] = useState<'company' | 'flat'>('company');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [applyingDrive, setApplyingDrive] = useState<any | null>(null);

  // Fetch opportunities whenever filter, page, or search changes
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, opsRes] = await Promise.allSettled([
          apiService.getMyStudentProfile(),
          apiService.getOpportunities(sourceFilter, eligibilityFilter, page, pageSize, searchQuery),
        ]);

        if (isMounted) {
          if (profileRes.status === 'fulfilled' && profileRes.value) {
            setStudentProfile(profileRes.value);
          }
          if (opsRes.status === 'fulfilled' && opsRes.value) {
            setDataResponse(opsRes.value);
            // Default first 3 companies expanded
            if (opsRes.value.company_groups && opsRes.value.company_groups.length > 0) {
              const initialExpanded = new Set<string>();
              opsRes.value.company_groups.slice(0, 4).forEach((g) => initialExpanded.add(g.company));
              setExpandedCompanies(initialExpanded);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch opportunities or profile', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user?.id, sourceFilter, eligibilityFilter, page, searchQuery]);

  const toggleCompanyExpand = (companyName: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(companyName)) {
        next.delete(companyName);
      } else {
        next.add(companyName);
      }
      return next;
    });
  };

  const isProfileComplete = Boolean(studentProfile?.isProfileComplete);
  const completionPercentage = studentProfile?.profileCompletion ?? 0;
  const hasResume = Boolean(studentProfile?.hasResume);

  const totalOpps = dataResponse?.total_opportunities ?? 0;
  const eligibleCount = dataResponse?.eligible_count ?? 0;
  const ineligibleCount = dataResponse?.ineligible_count ?? 0;
  const totalCompanies = dataResponse?.total_companies ?? 0;
  const totalPages = dataResponse?.total_pages ?? 1;

  // Render individual opportunity card
  const renderOpportunityCard = (opp: PlacementRecommendation, isInsideGroup: boolean = false) => {
    const isCollege = opp.source_type === 'college';
    const applied = hasAppliedToDrive(opp.drive_id);
    const isEligible = opp.eligible;
    const matchScore = opp.match_score;
    const matchedSkills = opp.matched_skills || [];
    const skillGaps = opp.skill_gaps || [];
    const reasons = opp.eligibility_reasons || [];

    return (
      <Card
        key={opp.drive_id}
        className={`p-5 text-[#14213D] transition-all duration-200 border shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transform-none ${
          isInsideGroup ? 'bg-[#F8FAFC] border-slate-200 hover:border-blue-300' : 'bg-white border-[#CBD5E1]/90 hover:border-blue-400/80'
        } ${
          isEligible
            ? 'border-l-4 border-l-emerald-500'
            : 'border-l-4 border-l-amber-500'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1">
            {!isInsideGroup && (
              <div
                className={`w-11 h-11 rounded-xl border font-bold text-base flex items-center justify-center shrink-0 ${
                  isCollege
                    ? 'bg-blue-50 border-blue-100 text-[#2563EB]'
                    : 'bg-purple-50 border-purple-100 text-purple-600'
                }`}
              >
                {isCollege ? <Building2 className="w-5 h-5 text-[#2563EB]" /> : <Globe className="w-5 h-5 text-purple-600" />}
              </div>
            )}

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {!isInsideGroup && <h3 className="text-sm font-bold text-[#14213D]">{opp.company}</h3>}
                <span className="text-sm font-bold text-[#14213D]">{opp.role}</span>

                {/* Source Badge */}
                {isCollege ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 font-bold flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> Campus Drive
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3 text-purple-600" /> {opp.source_label}
                  </span>
                )}

                {/* Package / Salary */}
                {opp.package_lpa && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    {opp.package_lpa} LPA
                  </span>
                )}
                {opp.salary_text && !opp.package_lpa && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-[#475569] border border-slate-200 font-medium">
                    {opp.salary_text}
                  </span>
                )}

                {/* Match & Eligibility Badges */}
                {hasResume ? (
                  <>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                        isEligible
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isEligible ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-amber-600" />}
                      {isEligible ? 'Eligible' : 'Not Currently Eligible'}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                      {matchScore}% Match
                    </span>
                  </>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" /> Resume Required
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569] font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB]" /> {opp.location || 'Remote / Hybrid'}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" /> {opp.deadline ? `Deadline: ${opp.deadline}` : opp.posted_at}
                </span>
                {opp.min_cgpa && (
                  <>
                    <span>&bull;</span>
                    <span>Min CGPA: <strong className="text-[#14213D]">{opp.min_cgpa}</strong></span>
                  </>
                )}
              </div>

              {/* Ineligibility Reason / Missing Criteria */}
              {hasResume && !isEligible && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 font-medium space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <Target className="w-3.5 h-3.5" /> Missing Requirements / Skill Gaps:
                  </div>
                  <div className="text-[11px] text-[#475569]">
                    {reasons.length > 0 ? reasons.join(' • ') : `Missing required technical skills: ${skillGaps.join(', ')}`}
                  </div>
                </div>
              )}

              {/* Skills Breakdown */}
              <div className="space-y-1 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#475569]">Skills:</span>
                  {hasResume ? (
                    <>
                      {matchedSkills.map((skill, i) => (
                        <span
                          key={`m-${i}`}
                          className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> {skill}
                        </span>
                      ))}
                      {skillGaps.map((skill, i) => (
                        <span
                          key={`g-${i}`}
                          className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <span className="text-red-500 font-bold">✗</span> {skill}
                        </span>
                      ))}
                    </>
                  ) : (
                    opp.skill_gaps?.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-[#F8FAFC] text-[#475569] border border-slate-200 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0">
            {/* View Skill Gap Button */}
            <Button
              variant="outline"
              size="sm"
              className="text-xs py-2 bg-white border-slate-300 text-[#14213D] hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
              icon={<Target className="w-3.5 h-3.5 text-[#2563EB]" />}
              onClick={() => setSelectedOpportunityId(opp.drive_id)}
            >
              View Skill Gap
            </Button>

            {/* College Drive Detail Link & Community */}
            {isCollege && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs py-2 bg-blue-50 border-blue-200 text-[#2563EB] hover:bg-blue-100 flex items-center gap-1.5 shadow-xs font-semibold"
                  icon={<Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />}
                  onClick={() => navigate(`/student/community/${opp.drive_id}`)}
                >
                  Placement Community
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs py-2 bg-white border-slate-300 text-[#14213D] hover:bg-slate-50 shadow-xs"
                  onClick={() => navigate(`/student/assessment?drive_id=${encodeURIComponent(opp.drive_id)}`)}
                >
                  Prepare for Drive
                </Button>
              </>
            )}

            {/* Application Handlers */}
            {applied ? (
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#2563EB]" /> Applied
              </span>
            ) : !hasResume ? (
              <Button
                variant="secondary"
                size="sm"
                className="text-xs py-2 px-3 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 flex items-center justify-center gap-1.5 shadow-xs font-bold"
                icon={<Lock className="w-3.5 h-3.5 text-amber-600" />}
                onClick={() => navigate('/student/resume')}
              >
                Upload Resume
              </Button>
            ) : isEligible ? (
              <Button
                variant="primary"
                size="sm"
                className="text-xs py-2 px-4 shadow-xs font-bold"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => setApplyingDrive(opp)}
              >
                Apply / Register
              </Button>
            ) : (
              <span
                className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 flex items-center justify-center gap-1.5 cursor-default"
                title={reasons.join(' | ') || 'Does not meet drive eligibility requirements'}
              >
                <XCircle className="w-3.5 h-3.5 text-amber-600" /> Not Eligible
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Campus Placement Drives"
        subtitle="Explore active campus placement drives matched against your resume profile."
        icon={<Briefcase className="w-5 h-5 text-[#2563EB]" />}
        action={
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/student')}>
            Back to Student Dashboard
          </Button>
        }
      />

      {/* PROFILE COMPLETION BANNER */}
      <ProfileCompletionWidget
        completion={completionPercentage}
        isComplete={isProfileComplete}
        missingRequirements={studentProfile?.missingRequirements}
        checklist={studentProfile?.checklist}
        compact={true}
        showCTA={true}
      />

      {/* NO RESUME NOTICE */}
      {!hasResume && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#14213D] shadow-xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#14213D]">Personalized Discovery &amp; Eligibility Unavailable</p>
              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                Upload your resume to analyze your profile and compare it with all available opportunities.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="shrink-0 text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold"
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => navigate('/student/resume')}
          >
            Upload Resume
          </Button>
        </div>
      )}

      {/* AGGREGATE SUMMARY METRICS CARD */}
      <div className="p-4 rounded-2xl bg-white border border-[#CBD5E1]/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span className="text-[#475569] block text-[11px] font-bold">Total Drives</span>
            <span className="text-base font-black text-[#14213D]">{totalOpps}</span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200" />
          <div>
            <span className="text-emerald-800 block text-[11px] font-bold">Eligible For You</span>
            <span className="text-base font-black text-emerald-800">{eligibleCount}</span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200" />
          <div>
            <span className="text-amber-800 block text-[11px] font-bold">Not Currently Eligible</span>
            <span className="text-base font-black text-amber-800">{ineligibleCount}</span>
          </div>
          <div className="h-7 w-[1px] bg-slate-200" />
          <div>
            <span className="text-[#2563EB] block text-[11px] font-bold">Companies</span>
            <span className="text-base font-black text-[#2563EB]">{totalCompanies}</span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('company')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'company'
                ? 'bg-white text-[#2563EB] shadow-xs font-bold'
                : 'text-[#475569] hover:text-[#14213D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Group by Company
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'flat'
                ? 'bg-white text-[#2563EB] shadow-xs font-bold'
                : 'text-[#475569] hover:text-[#14213D]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" /> All Drives List
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Main Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#F1F5F9] p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setSourceFilter('all');
                setEligibilityFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                sourceFilter === 'all' && eligibilityFilter === 'all'
                  ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                  : 'text-[#475569] hover:text-[#14213D] hover:bg-white/60'
              }`}
            >
              All Drives ({totalOpps})
            </button>

            <button
              onClick={() => {
                setEligibilityFilter('eligible');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                eligibilityFilter === 'eligible'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Eligible ({eligibleCount})
            </button>

            <button
              onClick={() => {
                setEligibilityFilter('ineligible');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                eligibilityFilter === 'ineligible'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Target className="w-3.5 h-3.5" /> Not Eligible ({ineligibleCount})
            </button>

            <button
              onClick={() => {
                setSourceFilter('college');
                setEligibilityFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                sourceFilter === 'college' && eligibilityFilter === 'all'
                  ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                  : 'text-[#475569] hover:text-[#14213D] hover:bg-white/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Campus Drives
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, role or skill..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] shadow-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* DISCOVERY LIST RENDERING */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-[#475569]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
          <p className="text-xs font-bold">Discovering active campus placement drives...</p>
        </div>
      ) : totalOpps === 0 ? (
        <Card className="p-8 text-center text-[#475569] bg-[#F8FAFC] border-[#CBD5E1]/90 shadow-xs">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-[#14213D]">No placement drives match your filter</p>
          <p className="text-xs text-[#475569] mt-1">Try switching tabs to view all drives or adjust your search.</p>
        </Card>
      ) : viewMode === 'company' && dataResponse?.company_groups ? (
        /* ================= GROUPED BY COMPANY VIEW ================= */
        <div className="space-y-4">
          {dataResponse.company_groups.map((group) => {
            const isExpanded = expandedCompanies.has(group.company);
            const isCollege = group.source_type === 'college';

            return (
              <Card key={group.company} className="p-0 overflow-hidden bg-white border-[#CBD5E1]/90 text-[#14213D] shadow-xs hover:border-blue-300 transition-colors">
                {/* Company Header Row */}
                <div
                  onClick={() => toggleCompanyExpand(group.company)}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-xl border font-bold text-base flex items-center justify-center shrink-0 ${
                        isCollege
                          ? 'bg-blue-50 border-blue-100 text-[#2563EB]'
                          : 'bg-purple-50 border-purple-100 text-purple-600'
                      }`}
                    >
                      {isCollege ? <Building2 className="w-6 h-6 text-[#2563EB]" /> : <Globe className="w-6 h-6 text-purple-600" />}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-[#14213D]">{group.company}</h3>
                        {isCollege ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 font-bold flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> Campus Drive
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-bold flex items-center gap-1">
                            <Globe className="w-3 h-3 text-purple-600" /> {group.source_label}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#475569] font-medium mt-1 flex items-center gap-2">
                        <span>{group.total_jobs} {group.total_jobs === 1 ? 'Drive' : 'Drives'}</span>
                        <span>&bull;</span>
                        <span className="text-emerald-800 font-bold">{group.eligible_jobs} Eligible</span>
                        <span>&bull;</span>
                        <span className="text-amber-800 font-bold">{group.ineligible_jobs} Not Eligible</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {hasResume && (
                      <div className="text-right">
                        <span className="text-[10px] text-[#475569] block font-bold">Best Match</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
                          {group.best_match_score}% Match
                        </span>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs py-1.5 px-3 bg-white border-slate-300 text-[#14213D] hover:bg-slate-50"
                      icon={isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    >
                      {isExpanded ? 'Hide' : `View (${group.total_jobs})`}
                    </Button>
                  </div>
                </div>

                {/* Expanded Child Opportunities */}
                {isExpanded && (
                  <div className="p-4 pt-3 space-y-3 border-t border-slate-200 bg-[#F8FAFC]/80">
                    <p className="text-[11px] font-bold text-[#475569] pt-1">
                      Available roles at {group.company}:
                    </p>
                    {group.opportunities.map((opp) => renderOpportunityCard(opp, true))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        /* ================= FLAT OPPORTUNITIES LIST VIEW ================= */
        <div className="space-y-4">
          {dataResponse?.opportunities.map((opp) => renderOpportunityCard(opp, false))}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-[#64748B]">
          <span>
            Showing page <strong className="text-[#14213D]">{page}</strong> of <strong className="text-[#14213D]">{totalPages}</strong> ({totalOpps} total drives)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              icon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* COMPANY SPECIFIC SKILL GAP MODAL */}
      <CompanySkillGapModal
        opportunityId={selectedOpportunityId}
        onClose={() => setSelectedOpportunityId(null)}
      />

      {/* SIMPLE STUDENT APPLICATION MODAL */}
      <StudentApplicationModal
        isOpen={!!applyingDrive}
        drive={applyingDrive}
        onClose={() => setApplyingDrive(null)}
        onApplicationSubmitted={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};
