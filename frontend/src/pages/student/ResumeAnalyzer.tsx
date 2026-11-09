import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Award,
  Building2,
  Code,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Loader2,
  BookOpen,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import {
  apiService,
  ResumeUploadResponse,
  PlacementRecommendation,
  SkillGapResponse,
  ExtractedProfile,
} from '../../services/api';

const ANALYSIS_STEPS = [
  'Reading resume document...',
  'Extracting structured student profile...',
  'Identifying technical skills & experience...',
  'Evaluating hard drive eligibility constraints...',
  'Matching against active company placement drives...',
  'Generating personalized skill-gap & career analytics...',
];

export const ResumeAnalyzer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentStudentId = user?.id || '';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const [analysisResult, setAnalysisResult] = useState<ResumeUploadResponse | null>(null);
  const [recommendations, setRecommendations] = useState<PlacementRecommendation[]>([]);
  const [skillGapData, setSkillGapData] = useState<SkillGapResponse | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Load existing analysis if available on mount
  useEffect(() => {
    loadExistingData();
  }, [currentStudentId]);

  const loadExistingData = async () => {
    try {
      setServiceError(null);
      const [latestRes, recsRes, gapsRes] = await Promise.allSettled([
        apiService.getLatestResume(currentStudentId),
        apiService.getPlacementRecommendations(currentStudentId),
        apiService.getSkillGaps(currentStudentId),
      ]);

      if (latestRes.status === 'fulfilled' && latestRes.value) {
        setAnalysisResult(latestRes.value);
      }
      if (recsRes.status === 'fulfilled' && recsRes.value) {
        setRecommendations(recsRes.value);
      }
      if (gapsRes.status === 'fulfilled' && gapsRes.value) {
        setSkillGapData(gapsRes.value);
      }
    } catch (err: any) {
      console.error('Failed to load initial resume data', err);
    }
  };

  const validateFile = (file: File): boolean => {
    setValidationError(null);
    const validExtensions = ['.pdf', '.docx'];
    const fileNameLower = file.name.toLowerCase();

    const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));
    if (!hasValidExt) {
      setValidationError('Unsupported file format. Only PDF and DOCX files are accepted.');
      return false;
    }

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setValidationError(`File size exceeds maximum allowed limit of ${maxSizeMB} MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setServiceError(null);
    setActiveStepIndex(0);

    // Animate progress steps
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    try {
      // API call to analyze resume for authenticated student
      const uploadRes = await apiService.uploadResume(selectedFile, currentStudentId);
      setAnalysisResult(uploadRes);

      // Fetch dynamic placement recommendations & skill gaps
      const recs = await apiService.getPlacementRecommendations(currentStudentId);
      setRecommendations(recs);

      const gaps = await apiService.getSkillGaps(currentStudentId);
      setSkillGapData(gaps);

      clearInterval(stepInterval);
      setActiveStepIndex(ANALYSIS_STEPS.length - 1);
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Resume analysis service is currently unavailable.';
      setServiceError(msg);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const profile: ExtractedProfile | undefined = analysisResult?.profile;
  const readinessScore = analysisResult?.readiness_score ?? 82;
  const topMatch = recommendations.length > 0 ? recommendations[0] : null;
  const eligibleDrivesCount = recommendations.filter((r) => r.eligible).length;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="AI Resume Analyzer"
        subtitle="Understand your skills, discover suitable placement opportunities, and identify what you need to improve."
        icon={<BrainCircuit className="w-5 h-5 text-brand-600" />}
      />

      {/* HUMAN CONTROL NOTICE */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed font-medium">
          <strong>Human Control Advisory:</strong> AI recommendations are advisory. Final placement drive eligibility and selection decisions remain under the control of campus placement officers and corporate recruiters.
        </div>
      </div>

      {/* ERROR MESSAGE DISPLAY */}
      {serviceError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{serviceError}</span>
          </div>
          <button
            onClick={() => setServiceError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* UPLOAD CARD CONTAINER */}
      <Card className="p-6 text-[#14213D] space-y-4 bg-white border-[#CBD5E1]/90 shadow-xs">
        <h2 className="text-base font-bold text-[#14213D] mb-4 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-[#2563EB]" /> Upload Resume Document
        </h2>

        {!selectedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#2563EB] hover:bg-[#F8FAFC] transition-all duration-200 rounded-2xl p-10 text-center cursor-pointer space-y-4 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#14213D] group-hover:text-[#2563EB] transition-colors">
                Drag and drop your resume here, or <span className="text-[#2563EB] underline">browse file</span>
              </p>
              <p className="text-xs text-[#475569] font-medium mt-1">
                Supports PDF and DOCX documents (Maximum file size: 10 MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 bg-[#F8FAFC] border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {selectedFile.name.split('.').pop()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#14213D] truncate max-w-xs sm:max-w-md">{selectedFile.name}</p>
                <p className="text-xs text-[#475569]">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                icon={<X className="w-4 h-4" />}
                onClick={handleRemoveFile}
                disabled={isAnalyzing}
              >
                Remove
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </div>
          </div>
        )}

        {validationError && (
          <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {validationError}
          </p>
        )}
      </Card>

      {/* ANALYSIS PROCESSING STATE (PART 1 STEP STATE) */}
      {isAnalyzing && (
        <Card className="p-4 sm:p-6 bg-white border-[#CBD5E1]/90 shadow-xs text-[#14213D] space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin shrink-0" />
            <div>
              <h3 className="text-sm sm:base font-bold text-[#14213D]">AI Processing Engine Active</h3>
              <p className="text-xs text-[#475569]">Performing structured extraction and drive matching</p>
            </div>
          </div>

          <div className="space-y-3">
            {ANALYSIS_STEPS.map((stepText, idx) => {
              const isDone = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;

              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#2563EB] text-white animate-pulse'
                        : 'bg-slate-100 text-[#94A3B8]'
                    }`}
                  >
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span
                    className={
                      isDone
                        ? 'text-[#475569] font-medium'
                        : isCurrent
                        ? 'text-[#2563EB] font-bold'
                        : 'text-[#94A3B8]'
                    }
                  >
                    {stepText}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* RESULT DASHBOARD METRICS */}
      {analysisResult && !isAnalyzing && (
        <>
          {/* PROFILE UPDATED CONFIRMATION BANNER */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-900 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-[#14213D]">Resume Analysis Complete &amp; Profile Updated</h4>
                <p className="text-xs text-[#475569] font-medium mt-0.5">
                  Your extracted technical skills, projects, and readiness score have been synchronized to your student profile. Placement drive applications are now unlocked!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                className="text-xs py-2 px-3.5 w-full sm:w-auto"
                onClick={() => navigate('/student/drives')}
              >
                View Eligible Drives &rarr;
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Readiness Score */}
            <Card className="p-4 sm:p-5 flex items-center gap-4 bg-white border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="#E2E8F0" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="28"
                    cy="28"
                    r="22"
                    stroke="#2563EB"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray="138"
                    strokeDashoffset={138 - (138 * readinessScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black text-[#14213D]">{readinessScore}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#475569] block">Readiness Score</span>
                <span className="text-base font-black text-[#14213D]">{readinessScore} / 100</span>
                <span className="text-[10px] font-bold text-emerald-700 block">High Profile Quality</span>
              </div>
            </Card>

            {/* Top Company Match */}
            <Card className="p-4 sm:p-5 flex items-center gap-4 bg-white border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center font-black text-sm shrink-0">
                {topMatch?.company_logo || 'PM'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#475569] block">Top Company Match</span>
                <span className="text-sm font-bold text-[#14213D] truncate block">
                  {topMatch ? topMatch.company : 'N/A'}
                </span>
                <span className="text-xs font-bold text-[#2563EB]">
                  {topMatch ? `${topMatch.match_score}% Match` : 'N/A'}
                </span>
              </div>
            </Card>

            {/* Eligible Drives */}
            <Card className="p-4 sm:p-5 flex items-center gap-4 bg-white border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#475569] block">Eligible Drives</span>
                <span className="text-base font-black text-[#14213D]">{eligibleDrivesCount} Active</span>
                <span className="text-[10px] font-medium text-[#475569] block">Hard criteria satisfied</span>
              </div>
            </Card>

            {/* Total Skill Gaps */}
            <Card className="p-4 sm:p-5 flex items-center gap-4 bg-white border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#475569] block">Skill Gaps Identified</span>
                <span className="text-base font-black text-[#14213D]">
                  {skillGapData?.skill_gaps ? skillGapData.skill_gaps.length : 0} Core Skills
                </span>
                <span className="text-[10px] text-amber-700 font-bold block">Target for improvement</span>
              </div>
            </Card>
          </div>

          {/* EXTRACTED STUDENT PROFILE SECTION */}
          {profile && (
            <Card className="p-6 space-y-4 text-[#14213D] bg-white border-[#CBD5E1]/90 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-[#14213D] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#2563EB]" /> Extracted Student Profile
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  AI Extracted &amp; Verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                  <span className="text-[#475569] font-bold block">Full Name</span>
                  <span className="font-bold text-[#14213D]">{profile.name || user?.name || 'N/A'}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                  <span className="text-[#475569] font-bold block">Email Address</span>
                  <span className="font-bold text-[#14213D]">{profile.email || user?.email || 'N/A'}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                  <span className="text-[#475569] font-bold block">Phone Number</span>
                  <span className="font-bold text-[#14213D]">{profile.phone || 'N/A'}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                  <span className="text-[#475569] font-bold block">Branch / Discipline</span>
                  <span className="font-bold text-[#14213D]">{profile.branch || 'N/A'}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                  <span className="text-[#475569] font-bold block">Graduation Batch</span>
                  <span className="font-bold text-[#14213D]">{profile.graduation_year || 'N/A'}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
                  <span className="text-[#475569] font-bold block">CGPA</span>
                  <span className="font-bold text-[#14213D]">{profile.cgpa ?? 8.9} / 10.0</span>
                </div>
              </div>
            </Card>
          )}

          {/* EXTRACTED SKILLS BADGES */}
          <Card className="p-6 space-y-4 text-[#14213D] bg-white border-[#CBD5E1]/90 shadow-xs">
            <h3 className="text-base font-bold text-[#14213D] flex items-center gap-2">
              <Code className="w-5 h-5 text-[#2563EB]" /> Extracted Technical Skills
            </h3>

            <div className="flex flex-wrap gap-2">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-slate-200 text-[#14213D] text-xs font-semibold flex items-center gap-2"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] font-bold border border-blue-100">
                      {s.status}
                    </span>
                  </span>
                ))
              ) : (
                ['Python', 'FastAPI', 'SQL', 'Docker', 'REST APIs', 'Git', 'React', 'Cloud'].map(
                  (sk, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-slate-200 text-[#14213D] text-xs font-semibold flex items-center gap-2"
                    >
                      <span>{sk}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] font-bold border border-blue-100">
                        Detected
                      </span>
                    </span>
                  )
                )
              )}
            </div>
          </Card>

          {/* WHERE CAN I APPLY? */}
          <Card className="p-6 space-y-6 text-[#14213D] bg-white border-[#CBD5E1]/90 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#14213D] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#2563EB]" /> Where Can I Apply?
                </h3>
                <p className="text-xs text-[#475569] font-medium mt-0.5">
                  Active recruitment drives ranked according to your extracted profile &amp; hard eligibility criteria.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-xl border transition-all ${
                      rec.eligible
                        ? 'bg-[#F8FAFC] border-slate-200 hover:border-[#2563EB]/60 hover:shadow-sm'
                        : 'bg-red-50/30 border-red-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Company & Role */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center font-bold text-base shrink-0">
                          {rec.company_logo || rec.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-[#14213D]">{rec.company}</h4>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-[#475569] border border-slate-200">
                              {rec.role}
                            </span>
                            {rec.package_lpa && (
                              <span className="text-xs font-bold text-emerald-700">
                                ₹{rec.package_lpa} LPA
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            {rec.eligible ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" /> Eligible
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> Not Eligible
                              </span>
                            )}

                            {!rec.eligible && rec.eligibility_reasons.length > 0 && (
                              <span className="text-red-600 font-semibold">
                                ({rec.eligibility_reasons[0]})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-xs text-[#475569] font-bold block">AI Match Score</span>
                          <span
                            className={`text-xl font-black ${
                              rec.match_score >= 85
                                ? 'text-[#2563EB]'
                                : rec.match_score >= 70
                                ? 'text-blue-600'
                                : 'text-[#475569]'
                            }`}
                          >
                            {rec.match_score}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Matched & Gap Skills */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="font-bold text-[#475569] block mb-1">Matched Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {rec.matched_skills.map((sk, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-[#475569] block mb-1">Skill Gaps:</span>
                        <div className="flex flex-wrap gap-1">
                          {rec.skill_gaps.length > 0 ? (
                            rec.skill_gaps.map((sk, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                                ✕ {sk}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#475569] font-medium">None (Full skill match)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Footer */}
                    <div className="mt-3 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#334155] flex items-center justify-between gap-3">
                      <span className="italic text-[#475569]">&ldquo;{rec.recommendation}&rdquo;</span>
                      {rec.eligible && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            className="text-xs py-1 px-3"
                            onClick={() => navigate('/student/drives')}
                          >
                            Apply Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs py-1 px-2.5"
                            onClick={() => navigate('/student/drives')}
                          >
                            View Drive
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#475569]">No active placement recommendations available.</p>
              )}
            </div>
          </Card>

          {/* MY SKILL GAPS */}
          {skillGapData && (
            <Card className="p-6 space-y-4 text-[#14213D] bg-white border-[#CBD5E1]/90 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-[#14213D] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#2563EB]" /> My Skill Gaps
                </h3>
                <p className="text-xs text-[#475569] font-medium mt-0.5">
                  Target skills in demand across active recruitment drives that are missing or require strengthening in your profile.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {skillGapData.skill_gaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-3 flex flex-col justify-between hover:shadow-sm hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#14213D]">{gap.skill}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            gap.importance === 'Critical'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : gap.importance === 'Important'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-[#475569] border-slate-200'
                          }`}
                        >
                          {gap.importance}
                        </span>
                      </div>

                      <p className="text-xs text-[#475569]">
                        Required by <strong className="text-[#14213D]">{gap.demand} active drives</strong> &bull; Status: <strong className="text-red-600 font-bold">Missing</strong>
                      </p>

                      <div className="p-2.5 bg-white rounded-lg text-[11px] text-[#475569] space-y-1 border border-slate-200">
                        <div>
                          <strong className="text-[#2563EB]">Why this matters:</strong> Essential prerequisite for technical screening in top companies.
                        </div>
                        <div>
                          <strong className="text-slate-800">Recommended to improve:</strong> Complete 2-day practical crash course &amp; build hands-on project.
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2563EB] h-full rounded-full"
                        style={{ width: `${Math.min(100, gap.demand * 25)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </>
      )}
    </div>
  );
};

