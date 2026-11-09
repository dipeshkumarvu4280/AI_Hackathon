import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  ArrowLeft,
  GraduationCap,
  Mail,
  Award,
  Code,
  Briefcase,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  FolderGit2,
  FileText,
  Sparkles,
  RefreshCw,

} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MatchScore } from '../../components/ui/MatchScore';
import { apiService } from '../../services/api';
import { usePlacement } from '../../context/PlacementContext';
import { ShortlistInterviewModal } from '../../components/candidates/ShortlistInterviewModal';

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { triggerToast } = usePlacement();

  const [candidate, setCandidate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);

  const fetchCandidate = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // First try fetching single application
      const data = await apiService.getApplicationDetail(id).catch(async () => {
        // Fallback: search candidate pool for this id (could be studentId or appId)
        const pool = await apiService.getCandidatePool();
        return pool.find((c) => c.id === id || c.student_id === id);
      });
      setCandidate(data || null);
    } catch (err) {
      console.error('Error fetching candidate detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const handleShortlistSuccess = async (payload: any) => {
    if (!candidate) return;
    try {
      await apiService.shortlistApplication(candidate.id, payload);
      triggerToast(`Successfully shortlisted ${candidate.student_name}!`, 'success');
      await fetchCandidate();
    } catch (err) {
      triggerToast('Failed to shortlist candidate.', 'error');
    }
  };

  const handleAllocateAptitude = async () => {
    if (!candidate) return;
    try {
      await apiService.allocateAptitude(candidate.id);
      triggerToast(`Allocated Aptitude Round to ${candidate.student_name}! Notification dispatched.`, 'success');
      await fetchCandidate();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to allocate aptitude round.';
      triggerToast(msg, 'error');
    }
  };

  const handleAllocateTechnical = async () => {
    if (!candidate) return;
    try {
      await apiService.allocateTechnicalRound(candidate.id);
      triggerToast(`Allocated Technical Round to ${candidate.student_name}! Notification dispatched.`, 'success');
      await fetchCandidate();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to allocate technical round.';
      triggerToast(msg, 'error');
    }
  };

  const handleReject = async () => {
    if (!candidate) return;
    if (window.confirm(`Mark ${candidate.student_name}'s application as Not Shortlisted?`)) {
      try {
        await apiService.rejectApplication(candidate.id);
        triggerToast(`Updated application status to Not Shortlisted.`, 'info');
        await fetchCandidate();
      } catch (err) {
        triggerToast('Failed to update status.', 'error');
      }
    }
  };

  const handleFinalSelect = async () => {
    if (!candidate) return;
    try {
      await apiService.executeRoundAction(candidate.id, 'FINAL_SELECT');
      triggerToast(`Successfully marked ${candidate.student_name} as Finally Selected!`, 'success');
      await fetchCandidate();
    } catch (err: any) {
      triggerToast(err?.response?.data?.detail || 'Failed to select candidate.', 'error');
    }
  };

  const handleRejectInterview = async () => {
    if (!candidate) return;
    if (window.confirm(`Mark ${candidate.student_name} as Not Selected after interview?`)) {
      try {
        await apiService.executeRoundAction(candidate.id, 'REJECT');
        triggerToast(`Updated candidate status to Rejected.`, 'info');
        await fetchCandidate();
      } catch (err: any) {
        triggerToast(err?.response?.data?.detail || 'Failed to update status.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2563EB]" />
        <p className="text-sm font-bold text-[#14213D]">Loading candidate profile...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Candidate Profile Not Found"
          subtitle="The requested candidate application could not be found."
          icon={<UserCheck className="w-5 h-5" />}
          action={
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/candidates')}>
              Back to Candidates
            </Button>
          }
        />
      </div>
    );
  }

  const stage = (candidate.stage || candidate.status || 'APPLIED').toUpperCase();
  const isShortlisted = stage === 'SHORTLISTED';
  const isAptitudeAssigned = stage === 'APTITUDE_ALLOCATED' || stage === 'APTITUDE_ASSIGNED';
  const isRejected = ['NOT_SHORTLISTED', 'REJECTED', 'APTITUDE_FAILED', 'REJECTED_AT_APTITUDE', 'REJECTED_AT_TECHNICAL', 'REJECTED_AT_HR', 'INTERVIEW_FAILED'].includes(stage);
  const isSelected = ['SELECTED', 'FINAL_SELECTED', 'PLACED'].includes(stage);
  const hasInterview = !!candidate.interview;

  return (
    <div className="space-y-6 pb-12 text-[#14213D]">
      {/* PAGE HEADER */}
      <PageHeader
        title={`Candidate: ${candidate.student_name || 'Student Profile'}`}
        subtitle={`Application for ${candidate.job_title} at ${candidate.company_name}`}
        icon={<UserCheck className="w-5 h-5" />}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/candidates')}>
              Back to Candidates
            </Button>
            {isShortlisted && (
              <Button
                variant="primary"
                icon={<Sparkles className="w-4 h-4" />}
                className="bg-amber-600 hover:bg-amber-500 text-white"
                onClick={handleAllocateAptitude}
              >
                Allocate Aptitude
              </Button>
            )}
            {stage === 'APTITUDE_QUALIFIED' && (
              <Button
                variant="primary"
                icon={<Sparkles className="w-4 h-4" />}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={handleAllocateTechnical}
              >
                Allocate Technical Round
              </Button>
            )}
            {stage === 'INTERVIEW_COMPLETED' && (
              <>
                <Button
                  variant="primary"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  onClick={handleFinalSelect}
                >
                  Final Select Candidate
                </Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleRejectInterview}
                >
                  Reject After Interview
                </Button>
              </>
            )}
            {!isShortlisted && !isAptitudeAssigned && !isRejected && !isSelected && stage !== 'APTITUDE_QUALIFIED' && stage !== 'TECHNICAL_ALLOCATED' && stage !== 'INTERVIEW_COMPLETED' && stage !== 'HR_INTERVIEW_ALLOCATED' && stage !== 'INTERVIEW_SCHEDULED' && (
              <Button
                variant="primary"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => setIsShortlistModalOpen(true)}
              >
                Shortlist Candidate
              </Button>
            )}
            {!isRejected && !isShortlisted && !isSelected && stage !== 'INTERVIEW_COMPLETED' && (
              <Button variant="outline" onClick={handleReject}>
                Do Not Shortlist
              </Button>
            )}
          </div>
        }
      />

      {/* PROFILE SUMMARY HERO CARD */}
      <Card className="p-6 bg-white border-[#CBD5E1]/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#7C3AED] flex items-center justify-center font-bold text-white text-2xl shadow-md shrink-0">
              {candidate.student_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-[#14213D]">{candidate.student_name}</h2>
                {isShortlisted && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🟢 Shortlisted
                  </span>
                )}
                {stage === 'INTERVIEW_COMPLETED' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                    🤝 Interview Completed
                  </span>
                )}
                {isSelected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🏆 Selected / Placed
                  </span>
                )}
                {stage === 'OFFER_EXTENDED' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    📄 Offer Extended
                  </span>
                )}
                {stage === 'OFFER_ACCEPTED' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✅ Offer Accepted
                  </span>
                )}
                {stage === 'JOINED' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🎉 Joined Company
                  </span>
                )}
                {isRejected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                    🔴 {stage === 'REJECTED_AT_HR' ? 'Rejected at Interview' : stage === 'REJECTED_AT_TECHNICAL' ? 'Rejected at Technical' : stage === 'REJECTED_AT_APTITUDE' ? 'Rejected at Aptitude' : 'Not Shortlisted'}
                  </span>
                )}
                {stage === 'APPLIED' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                    🔵 Applied
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-[#64748B] mt-1">
                Roll No: <span className="font-mono text-[#14213D]">{candidate.rollNumber}</span> &bull; {candidate.branch} (Class of {candidate.graduation_year || 2027})
              </p>
              <div className="flex items-center gap-4 text-xs text-[#64748B] mt-2 flex-wrap">
                <span className="flex items-center gap-1 font-medium font-mono text-[#14213D]">
                  📱 {candidate.mobile || candidate.applicant?.mobile || 'Mobile N/A'}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  🎓 {candidate.college_name || candidate.applicant?.college_name || 'Campus University'}
                </span>
                <span className="flex items-center gap-1 font-medium text-[#94A3B8]">
                  📍 {candidate.location || candidate.applicant?.location || 'Bengaluru'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#64748B] mt-2 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#2563EB]" /> {candidate.student_email}
                </span>
                <span className="flex items-center gap-1 font-bold text-[#14213D]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#2563EB]" /> CGPA: {candidate.cgpa}
                </span>
                <span className="flex items-center gap-1 text-[#94A3B8]">
                  <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> Applied on: {candidate.applied_at}
                </span>
                {candidate.resume_url && candidate.resume_url !== '#' && (
                  <span className="flex items-center gap-1 text-[#2563EB] font-semibold">
                    <FileText className="w-3.5 h-3.5 text-[#2563EB]" /> Resume: {candidate.resume_url}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* READINESS GAUGE */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="5" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#2563EB"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * (candidate.readiness_score || 0)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-black text-[#14213D]">{candidate.readiness_score || 0}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#14213D] block">Placement Readiness</span>
              <span className="text-[11px] text-[#64748B] block">Score: {candidate.readiness_score || 0} / 100</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">
                Eligible Candidate ✓
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* SCHEDULED INTERVIEW CARD */}
      {hasInterview && (
        <Card className="p-5 bg-emerald-50/40 border-emerald-200">
          <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Scheduled Placement Interview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Date</span>
              <span className="font-bold text-[#14213D] mt-0.5 block">{candidate.interview.date}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Time</span>
              <span className="font-bold text-[#14213D] mt-0.5 block">{candidate.interview.time}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Panel</span>
              <span className="font-bold text-[#2563EB] mt-0.5 block">{candidate.interview.panel_name}</span>
              {candidate.interview.panel_members && candidate.interview.panel_members.length > 0 && (
                <span className="text-[9px] text-[#64748B] block truncate mt-0.5">
                  {candidate.interview.panel_members.join(', ')}
                </span>
              )}
            </div>
            <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Venue</span>
              <span className="font-bold text-[#14213D] mt-0.5 block">
                {candidate.interview.room_number ? `${candidate.interview.room_number} (${candidate.interview.block})` : candidate.interview.room_name}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* REAL RESUME SKILLS & PROJECTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SKILLS */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#2563EB]" /> Technical Skills Extracted
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {(candidate.skills || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((sk: string) => (
                  <span
                    key={sk}
                    className="px-3 py-1 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-semibold"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] italic">Not provided</p>
            )}
          </CardContent>
        </Card>

        {/* PROJECTS */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#2563EB]" /> Technical Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {(candidate.projects || []).length > 0 ? (
              candidate.projects.map((proj: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-xs text-[#14213D]">{proj.title || proj.name || proj}</h4>
                  {proj.description && (
                    <p className="text-[11px] text-[#64748B] leading-relaxed">{proj.description}</p>
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {proj.technologies.map((t: string) => (
                        <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-[#64748B]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-[#64748B] italic">Not provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* EXPERIENCE & CERTIFICATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#2563EB]" /> Experience & Internships
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {(candidate.experience || []).length > 0 ? (
              candidate.experience.map((exp: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-xs text-[#14213D]">{exp.role || exp.title} at {exp.company}</h4>
                  <span className="text-[10px] text-[#64748B] block">{exp.duration}</span>
                  {exp.description && <p className="text-[11px] text-[#64748B]">{exp.description}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-[#64748B] italic">Not provided</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" /> Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {(candidate.certifications || []).length > 0 ? (
              candidate.certifications.map((cert: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-xs text-[#14213D]">{cert.name || cert.title}</h4>
                  <span className="text-[10px] text-[#64748B] block">{cert.issuer || cert.organization}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#64748B] italic">Not provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shortlist Modal */}
      <ShortlistInterviewModal
        isOpen={isShortlistModalOpen}
        onClose={() => setIsShortlistModalOpen(false)}
        candidate={candidate}
        onShortlistSuccess={handleShortlistSuccess}
      />
    </div>
  );
};
