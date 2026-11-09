import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Building2,
  Users,
  Building,
  DoorOpen,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Sparkles,
  ArrowLeft,
  BrainCircuit,
  Trash2,
  MoreVertical,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { apiService, DynamicInterviewSession } from '../../services/api';
import { AIInterviewPracticeStudioModal } from '../../components/student/AIInterviewPracticeStudioModal';

export const StudentInterviews: React.FC = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [practiceSessions, setPracticeSessions] = useState<DynamicInterviewSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'recruitment' | 'practice'>('recruitment');

  // Practice Studio Modal
  const [isPracticeStudioOpen, setIsPracticeStudioOpen] = useState(false);
  const [selectedPracticeSessionId, setSelectedPracticeSessionId] = useState<string | null>(null);

  // Kebab menu & Delete modal states
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<DynamicInterviewSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchAllData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [resInterviews, resPractice] = await Promise.allSettled([
        apiService.getMyInterviews(),
        apiService.getDynamicInterviewSessions(),
      ]);

      if (resInterviews.status === 'fulfilled') {
        const raw: any = resInterviews.value;
        const list = Array.isArray(raw)
          ? raw
          : raw?.data && Array.isArray(raw.data)
          ? raw.data
          : raw?.interviews && Array.isArray(raw.interviews)
          ? raw.interviews
          : [];
        setInterviews(list);
      } else {
        setInterviews([]);
      }

      if (resPractice.status === 'fulfilled') {
        setPracticeSessions(Array.isArray(resPractice.value) ? resPractice.value : []);
      } else {
        setPracticeSessions([]);
      }
    } catch (err) {
      console.error('Failed to load interview records:', err);
      setInterviews([]);
      setPracticeSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await apiService.deleteDynamicInterviewSession(sessionToDelete.session_id);
      setPracticeSessions((prev) => prev.filter((s) => s.session_id !== sessionToDelete.session_id));
      setSessionToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.response?.data?.detail || 'Failed to delete interview session.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#14213D]">
      <PageHeader
        title="Interview Schedules & Practice"
        subtitle="View institutional interview schedules, venues, and practice interview sessions."
        icon={<Calendar className="w-5 h-5 text-[#2563EB]" />}
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/student')}
            >
              Back to Dashboard
            </Button>
          </div>
        }
      />

      {/* TAB SWITCHER */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F1F5F9] border border-slate-200 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('recruitment')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'recruitment'
              ? 'bg-white text-[#2563EB] shadow-xs font-bold'
              : 'text-[#475569] hover:text-[#14213D]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Campus Interviews ({interviews.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'practice'
              ? 'bg-white text-[#2563EB] shadow-xs font-bold'
              : 'text-[#475569] hover:text-[#14213D]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
          AI Practice History ({practiceSessions.length})
        </button>
      </div>

      {loading ? (
        <Card className="p-12 text-center bg-white border border-[#CBD5E1]/90 shadow-xs">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#475569] font-medium">Loading interview records...</p>
        </Card>
      ) : (
        <>
          {/* TAB 1: CAMPUS RECRUITMENT INTERVIEWS */}
          {activeTab === 'recruitment' && (
            interviews.length > 0 ? (
              <div className="space-y-5">
                {interviews.map((item, idx) => {
                  const company = item.company_name || item.companyName || 'Company';
                  const role = item.job_title || item.roleTitle || 'Software Engineer';
                  const panel = item.panel_name || item.panelName || 'Technical Interview Panel';
                  const members: string[] = item.panel_members || item.panelMembers || [];
                  const block = item.block || 'Block B';
                  const room = item.room_number || item.roomNumber || item.room_name || item.roomName || 'B-204';
                  const dateStr = item.date || 'TBD';
                  const timeStr = item.start_time && item.end_time
                    ? `${item.start_time} - ${item.end_time}`
                    : (item.time || item.timeSlot || '10:00 AM - 10:30 AM');
                  const status = (item.status || 'SCHEDULED').toUpperCase();

                  return (
                    <Card
                      key={item.id || item.interview_id || idx}
                      className="p-6 bg-white border border-[#CBD5E1]/90 text-[#14213D] shadow-xs hover:border-blue-400/80 hover:shadow-md hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none"
                    >
                      {/* Header Row: Company, Role & Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 font-bold shadow-xs">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h3 className="text-lg font-bold text-[#14213D] tracking-tight">{company}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SHORTLISTED / SCHEDULED
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#2563EB] mt-0.5">
                              {role} &bull; <span className="text-[#475569] font-medium">{item.round || 'Technical Round 1'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 self-start sm:self-center">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                            Status: <strong className="text-[#14213D]">{status}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Interview Logistics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#2563EB]" /> Interview Date
                          </span>
                          <p className="text-xs font-bold text-[#14213D]">{dateStr}</p>
                        </div>

                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Time Slot
                          </span>
                          <p className="text-xs font-bold text-amber-800 font-mono">{timeStr}</p>
                        </div>

                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-teal-600" /> Academic Block
                          </span>
                          <p className="text-xs font-bold text-[#14213D]">{block}</p>
                        </div>

                        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                            <DoorOpen className="w-3.5 h-3.5 text-purple-600" /> Room Number
                          </span>
                          <p className="text-xs font-bold text-purple-800">{room}</p>
                        </div>
                      </div>

                      {/* Panel Section */}
                      <div className="mt-4 p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-[#2563EB]" /> Interview Panel
                          </span>
                          <p className="text-xs font-bold text-[#14213D]">{panel}</p>
                        </div>

                        {members && members.length > 0 && (
                          <div className="space-y-1 sm:text-right">
                            <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">
                              Panel Members
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                              {members.map((member, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white text-[#14213D] border border-slate-200 shadow-xs"
                                >
                                  {member}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center bg-[#F8FAFC] border border-[#CBD5E1]/90 space-y-3 text-[#14213D] shadow-xs">
                <Calendar className="w-12 h-12 text-[#2563EB] mx-auto opacity-70" />
                <h3 className="text-base font-bold text-[#14213D]">No campus interviews scheduled yet.</h3>
                <p className="text-xs text-[#475569] max-w-md mx-auto leading-relaxed">
                  When placement officers and recruiters shortlist your profile and assign venue rooms, your confirmed schedules will appear here.
                </p>
                <Button variant="primary" size="sm" onClick={() => navigate('/student/drives')}>
                  Explore Active Placement Drives
                </Button>
              </Card>
            )
          )}

          {/* TAB 2: AI PRACTICE SESSIONS */}
          {activeTab === 'practice' && (
            practiceSessions.length > 0 ? (
              <div className="space-y-4">
                {practiceSessions.map((ps) => {
                  const isCompleted = ps.status === 'COMPLETED';
                  const isInProgress = ps.status === 'IN_PROGRESS';

                  return (
                    <Card
                      key={ps.session_id}
                      className="p-5 bg-white border border-[#CBD5E1]/90 text-[#14213D] shadow-xs hover:border-blue-400/80 hover:shadow-md hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-[#2563EB] flex items-center justify-center font-bold shrink-0">
                            <BrainCircuit className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-bold text-[#14213D]">{ps.company}</h4>
                              <span className="text-xs text-[#475569]">({ps.role})</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  isCompleted
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : isInProgress
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {ps.status}
                              </span>
                            </div>

                            <p className="text-xs text-[#475569] mt-1 flex flex-wrap items-center gap-2">
                              <span className="capitalize font-bold text-[#2563EB]">{ps.mode} Mode</span>
                              <span>•</span>
                              <span>{ps.answers_count} of {ps.questions_count} answered</span>
                              <span>•</span>
                              <span>{new Date(ps.started_at).toLocaleDateString()}</span>
                            </p>

                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {ps.topics?.slice(0, 4).map((top: string, tIdx: number) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F8FAFC] text-[#475569] border border-slate-200"
                                >
                                  {top}
                                </span>
                              ))}
                              {ps.topics.length > 4 && (
                                <span className="text-[10px] text-[#475569]">+{ps.topics.length - 4} more</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                          {isCompleted && ps.overall_score !== undefined && ps.overall_score !== null && (
                            <div className="text-right mr-1">
                              <span className="text-[10px] text-[#475569] font-bold block uppercase">Evaluation</span>
                              <span className="text-lg font-black text-[#2563EB]">{Math.round(ps.overall_score)}%</span>
                            </div>
                          )}

                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs"
                            onClick={() => {
                              setSelectedPracticeSessionId(ps.session_id);
                              setIsPracticeStudioOpen(true);
                            }}
                          >
                            {isInProgress ? 'Resume Session' : 'Review Report'}
                          </Button>

                          {/* Kebab action menu */}
                          <div className="relative">
                            <button
                              type="button"
                              title="More Options"
                              aria-label="More Options"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveKebabId(activeKebabId === ps.session_id ? null : ps.session_id);
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors focus:outline-none cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeKebabId === ps.session_id && (
                              <>
                                <div
                                  className="fixed inset-0 z-20 cursor-default"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveKebabId(null);
                                  }}
                                />
                                <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl z-30 py-1 overflow-hidden animate-fadeIn">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveKebabId(null);
                                      setDeleteError(null);
                                      setSessionToDelete(ps);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                    Delete Interview
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center bg-[#F8FAFC] border border-[#CBD5E1]/90 space-y-3 text-[#14213D] shadow-xs">
                <BrainCircuit className="w-12 h-12 text-[#2563EB] mx-auto opacity-70" />
                <h3 className="text-base font-bold text-[#14213D]">No AI Practice Sessions Yet</h3>
                <p className="text-xs text-[#475569] max-w-md mx-auto leading-relaxed">
                  Start your dynamic AI mock interview or video practice session. PlaceMind will generate company-specific technical challenges and evaluate your actual responses.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold"
                  onClick={() => {
                    setSelectedPracticeSessionId(null);
                    setIsPracticeStudioOpen(true);
                  }}
                >
                  Start First Practice Session
                </Button>
              </Card>
            )
          )}
        </>
      )}

      {/* UNIFIED AI INTERVIEW PRACTICE STUDIO MODAL */}
      <AIInterviewPracticeStudioModal
        isOpen={isPracticeStudioOpen}
        onClose={() => {
          setIsPracticeStudioOpen(false);
          setSelectedPracticeSessionId(null);
        }}
        initialSessionId={selectedPracticeSessionId}
        onSessionComplete={() => fetchAllData()}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!sessionToDelete}
        onClose={() => {
          if (!isDeleting) {
            setSessionToDelete(null);
            setDeleteError(null);
          }
        }}
        title="Delete Interview History?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {sessionToDelete && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h5 className="text-sm font-bold text-[#14213D]">{sessionToDelete.company}</h5>
                <p className="text-xs text-[#64748B]">{sessionToDelete.role} • <span className="capitalize">{sessionToDelete.mode} Mode</span></p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                sessionToDelete.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {sessionToDelete.status}
              </span>
            </div>
          )}

          {sessionToDelete?.status === 'IN_PROGRESS' ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> This practice interview is currently in progress. Deleting it will permanently discard your ongoing questions, answers, and session data.
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#64748B] leading-relaxed">
              This will permanently remove this interview session, transcript, evaluation, score, feedback, suggestions, and associated practice data from your interview history.
            </p>
          )}

          {deleteError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {deleteError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSessionToDelete(null);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              icon={isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
