import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Award,
  ArrowLeft,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiService } from '../../services/api';
import { usePlacement } from '../../context/PlacementContext';

export const AptitudeTestView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { triggerToast } = usePlacement();

  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [starting, setStarting] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Question & Navigation State
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [resultData, setResultData] = useState<any | null>(null);

  // Persistent Timer State
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const autoSubmitFiredRef = useRef<boolean>(false);

  // 1. Fetch / Start Assessment Session
  const initAssessment = async () => {
    if (!id) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // First try fetching active session
      let data = await apiService.getAssessmentDetail(id).catch(() => null);

      // If status is ALLOCATED, start it
      if (data && (data.status === 'ALLOCATED' || !data.started_at)) {
        setStarting(true);
        data = await apiService.startAssessment(id);
        setStarting(false);
      } else if (!data) {
        setStarting(true);
        data = await apiService.startAssessment(id);
        setStarting(false);
      }

      setSession(data);

      // Hydrate saved answers if present
      if (data?.saved_answers) {
        setSelectedAnswers(data.saved_answers);
      }

      // Check if already completed
      if (data?.status === 'COMPLETED') {
        triggerToast('Assessment is already completed.', 'info');
      }
    } catch (err: any) {
      console.error('Failed to initialize aptitude test session:', err);
      const msg = err?.response?.data?.detail || err?.message || 'Failed to load aptitude test.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAssessment();
  }, [id]);

  // 2. Persistent Timer Countdown Effect
  useEffect(() => {
    if (!session || session.status === 'COMPLETED' || !session.expires_at) {
      return;
    }

    const calculateRemaining = () => {
      const expiresMs = new Date(session.expires_at).getTime();
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
      return diffSec;
    };

    setRemainingSeconds(calculateRemaining());

    const timerInterval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !autoSubmitFiredRef.current && session.status !== 'COMPLETED') {
        autoSubmitFiredRef.current = true;
        clearInterval(timerInterval);
        triggerToast('Time is up! Your test is being automatically submitted.', 'warning');
        handleFinalSubmit(true);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [session]);

  // 3. Option Select Handler (Saves answer locally and to backend)
  const handleOptionSelect = async (questionId: string, optionText: string) => {
    if (session?.status === 'COMPLETED') return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));

    if (id) {
      try {
        await apiService.saveAssessmentAnswer(id, questionId, optionText);
      } catch (err) {
        console.warn('Asynchronous answer save failed:', err);
      }
    }
  };

  // 4. Final Submission Handler
  const handleFinalSubmit = async (isAutoSubmit: boolean = false) => {
    if (!id || submitting) return;
    setSubmitting(true);
    setIsSubmitModalOpen(false);

    try {
      const questions = session?.questions || [];
      const formattedAnswers = questions.map((q: any) => ({
        question_id: q.id,
        type: q.type || 'aptitude',
        selected_option: selectedAnswers[q.id] || '',
      }));

      const result = await apiService.submitAssessment(id, {
        answers: formattedAnswers,
        time_taken_seconds: 0,
      });

      setResultData(result);
      setSession((prev: any) => ({ ...prev, status: 'COMPLETED' }));

      if (isAutoSubmit) {
        triggerToast('Time is up! Your aptitude test has been submitted.', 'warning');
      } else {
        triggerToast('Aptitude Test Submitted Successfully!', 'success');
      }
    } catch (err: any) {
      console.error('Failed to submit aptitude test:', err);
      const msg = err?.response?.data?.detail || err?.message || 'Failed to submit assessment.';
      triggerToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Render Loading State
  if (loading || starting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-[#64748B]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2563EB]" />
        <p className="text-sm font-bold text-[#14213D]">Preparing Aptitude Assessment Environment...</p>
        <p className="text-xs text-[#64748B]">Configuring persistent timer and question payload...</p>
      </div>
    );
  }

  // Render Error State
  if (errorMsg || !session) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Aptitude Test Unavailable"
          subtitle={errorMsg || 'Could not load the requested test session.'}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          action={
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/student/dashboard')}>
              Back to Dashboard
            </Button>
          }
        />
        <Card className="p-8 text-center bg-white border-slate-200 shadow-xs">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#14213D]">Test Access Restricted</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">{errorMsg}</p>
          <Button variant="primary" className="mt-4 text-xs" onClick={() => navigate('/student/dashboard')}>
            Return to Student Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Render Completion Result View
  if (resultData || session.status === 'COMPLETED') {
    const scorePct = resultData?.percentage ?? session?.percentage ?? session?.score ?? 0;
    const passThreshold = resultData?.passing_percentage ?? session?.passing_percentage ?? 60;
    const isPassed = resultData?.result === 'QUALIFIED' || session?.result === 'QUALIFIED' || scorePct >= passThreshold;
    const isTechnical = (session?.type || session?.round_type || '').toUpperCase() === 'TECHNICAL';

    return (
      <div className="space-y-6 pb-12 max-w-3xl mx-auto text-[#14213D]">
        <PageHeader
          title={isTechnical ? 'Technical Test Evaluation' : 'Aptitude Test Evaluation'}
          subtitle={`${session.company || 'Placement Drive'} • ${session.job_title || 'Role'}`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        />

        <Card className="p-8 bg-white border-slate-200 text-center space-y-6 shadow-xs">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl font-black ${
              isPassed
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}
          >
            {isPassed ? '🎉' : '❌'}
          </div>

          <div>
            <span
              className={`text-xs font-bold uppercase tracking-widest block ${
                isPassed ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              Status: {isPassed ? (isTechnical ? 'TECHNICAL QUALIFIED' : 'APTITUDE QUALIFIED') : (isTechnical ? 'REJECTED AT TECHNICAL' : 'REJECTED AT APTITUDE')}
            </span>
            <h2 className="text-2xl font-black text-[#14213D] mt-1">
              {isPassed ? 'Congratulations! You Qualified' : `${isTechnical ? 'Technical' : 'Aptitude'} Result: Not Qualified`}
            </h2>
            <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
              {isPassed
                ? (isTechnical
                    ? `You passed the Technical assessment with ${scorePct}% (Passing threshold: ${passThreshold}%). Your profile is now eligible for the interview stage.`
                    : `You passed the Aptitude assessment with ${scorePct}% (Passing threshold: ${passThreshold}%). Placement Office has been notified for Technical Round allocation.`)
                : `You scored ${scorePct}%. The required passing score for this drive is ${passThreshold}%. You did not qualify for the next round.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto text-center">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-[#64748B] uppercase block font-bold">Your Score</span>
              <span className="text-xl font-black text-[#2563EB] font-mono mt-1 block">{scorePct}%</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-[#64748B] uppercase block font-bold">Passing Mark</span>
              <span className="text-xl font-black text-amber-600 font-mono mt-1 block">{passThreshold}%</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-[#64748B] uppercase block font-bold">Result</span>
              <span className={`text-sm font-black mt-2 block ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPassed ? 'QUALIFIED' : 'FAILED'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/student/dashboard')}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Return to Student Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Active Questions & Timer State
  const questions = session.questions || [];
  const currentQ = questions[currentIdx] || {};
  const totalQ = questions.length;
  const answeredCount = Object.keys(selectedAnswers).filter((k) => selectedAnswers[k]).length;

  // Format Timer Display
  const formatTimer = (sec: number | null) => {
    if (sec === null || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = remainingSeconds !== null && remainingSeconds < 300; // < 5 mins

  return (
    <div className="space-y-6 pb-12 text-[#14213D]">
      {/* HEADER WITH PERSISTENT TIMER */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border border-slate-200 py-3.5 px-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-[#2563EB]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#14213D]">{session.title || 'Aptitude Assessment'}</h2>
            <p className="text-xs text-[#64748B]">
              {session.company || 'Placement Drive'} &bull; {session.job_title || 'Role'}
            </p>
          </div>
        </div>

        {/* Persistent Countdown Timer Badge */}
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono font-bold text-sm transition-all ${
            isUrgent
              ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
              : 'bg-blue-50 text-[#2563EB] border-blue-200'
          }`}
        >
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-[#2563EB]'}`} />
          <span>TIME LEFT: {formatTimer(remainingSeconds)}</span>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
          icon={<Send className="w-4 h-4" />}
          onClick={() => setIsSubmitModalOpen(true)}
        >
          Submit Test
        </Button>
      </div>

      {/* MAIN TEST AREA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* QUESTION PANEL (3 COLS) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 bg-white border-slate-200 shadow-xs space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-[#64748B]">
                Question <strong className="text-[#2563EB] text-sm font-mono">{currentIdx + 1}</strong> of {totalQ}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2563EB] border border-blue-100">
                {currentQ.topic || 'Quantitative Aptitude'}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#14213D] leading-relaxed">
                {currentQ.question || 'Aptitude question text loading...'}
              </h3>
            </div>

            {/* MCQ Options */}
            <div className="space-y-3 pt-2">
              {(currentQ.options || []).map((option: string, optIdx: number) => {
                const isSelected = selectedAnswers[currentQ.id] === option;
                const optionLabel = String.fromCharCode(65 + optIdx);

                return (
                  <div
                    key={optIdx}
                    onClick={() => handleOptionSelect(currentQ.id, option)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#2563EB] text-[#14213D] shadow-xs'
                        : 'bg-white border-slate-200 text-[#14213D] hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-7 h-7 rounded-lg border font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-slate-100 text-[#64748B] border-slate-200'
                        }`}
                      >
                        {optionLabel}
                      </div>
                      <span className="text-sm font-medium">{option}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIdx === 0}
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              >
                Previous
              </Button>

              <span className="text-xs text-[#64748B]">
                Progress: <strong className="text-emerald-600 font-mono">{answeredCount}</strong> / {totalQ} Answered
              </span>

              {currentIdx < totalQ - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ChevronRight className="w-4 h-4" />}
                  onClick={() => setCurrentIdx((prev) => Math.min(totalQ - 1, prev + 1))}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  icon={<Send className="w-4 h-4" />}
                  onClick={() => setIsSubmitModalOpen(true)}
                >
                  Submit Test
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* SIDE QUESTION PALETTE GRID (1 COL) */}
        <div className="space-y-6">
          <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-[#14213D] uppercase tracking-wider">Question Roster</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q: any, idx: number) => {
                const isAnswered = !!selectedAnswers[q.id];
                const isCurrent = currentIdx === idx;

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-[#2563EB] ring-offset-2 ring-offset-white bg-[#2563EB] text-white font-black'
                        : isAnswered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-[#64748B] border border-slate-200 hover:bg-slate-50 hover:text-[#14213D]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-[#64748B]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-white border border-slate-200" />
                <span>Unanswered ({totalQ - answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#2563EB]" />
                <span>Current Question</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full border border-slate-200 space-y-4 text-[#14213D] shadow-xl my-auto">
            <div className="flex items-center gap-3 text-emerald-600">
              <Send className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-[#14213D]">Confirm Test Submission</h3>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              You have answered <strong className="text-emerald-600">{answeredCount}</strong> of <strong className="text-[#14213D]">{totalQ}</strong> questions. Are you sure you want to submit your aptitude test?
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsSubmitModalOpen(false)} className="w-full sm:w-auto">
                Continue Test
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto"
                disabled={submitting}
                onClick={() => handleFinalSubmit(false)}
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
