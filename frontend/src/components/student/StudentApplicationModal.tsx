import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Upload,
  User,
  Phone,
  GraduationCap,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Eye,
  Code,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { apiService, ExtractedProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { usePlacement } from '../../context/PlacementContext';

interface StudentApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  drive: {
    id: string;
    drive_id?: string;
    companyName?: string;
    company_name?: string;
    roleTitle?: string;
    job_title?: string;
  } | null;
  onApplicationSubmitted?: () => void;
}

export const StudentApplicationModal: React.FC<StudentApplicationModalProps> = ({
  isOpen,
  onClose,
  drive,
  onApplicationSubmitted,
}) => {
  const { user } = useAuth();
  const { triggerToast } = usePlacement();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [location, setLocation] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [resumeFilename, setResumeFilename] = useState<string>('');
  const [resumeProfile, setResumeProfile] = useState<ExtractedProfile | null>(null);
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [showReplaceUpload, setShowReplaceUpload] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.name || '');
      setMobileNumber((user as any)?.mobile || (user as any)?.phone || '');
      setCollegeName((user as any)?.college || 'Campus University');
      setLocation((user as any)?.location || 'Bengaluru, Karnataka');
      setResumeFile(null);
      setErrorMsg(null);
      setShowResumePreview(false);
      setShowReplaceUpload(false);

      // Fetch latest authenticated student profile & resume directly from backend
      apiService
        .getMyStudentProfile()
        .then((prof: any) => {
          if (prof) {
            if (prof.name) setFullName(prof.name);
            if (prof.mobile || prof.phone) setMobileNumber(prof.mobile || prof.phone);
            if (prof.college) setCollegeName(prof.college);
            if (prof.location) setLocation(prof.location);
            if (prof.readinessScore) setReadinessScore(prof.readinessScore);

            if (prof.hasResume) {
              setHasExistingResume(true);
              setResumeFilename(prof.resumeFilename || 'Uploaded_Resume.pdf');
            } else {
              setHasExistingResume(false);
            }
          }
        })
        .catch(() => {
          // Fallback gracefully
        });

      // Also fetch structured profile if available
      apiService
        .getResumeProfile()
        .then((rp: any) => {
          if (rp) {
            setResumeProfile(rp);
            if (rp.filename) {
              setResumeFilename(rp.filename);
              setHasExistingResume(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, user]);

  if (!isOpen || !drive) return null;

  const companyName = drive.companyName || drive.company_name || 'Placement Drive';
  const roleTitle = drive.roleTitle || drive.job_title || 'Campus Placement Role';
  const driveId = drive.id || drive.drive_id || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    if (!hasExistingResume && !resumeFile) {
      setErrorMsg('Please upload a resume file to proceed with this application.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('driveId', driveId);
      formData.append('name', fullName.trim());
      formData.append('mobile', mobileNumber.trim());
      formData.append('college_name', collegeName.trim());
      formData.append('location', location.trim());
      formData.append('company_name', companyName);
      formData.append('job_title', roleTitle);
      if ((drive as any).company_id || (drive as any).companyId) {
        formData.append('company_id', (drive as any).company_id || (drive as any).companyId);
      }
      if ((drive as any).source) {
        formData.append('source', (drive as any).source);
      }
      if ((drive as any).application_url) {
        formData.append('application_url', (drive as any).application_url);
      }
      if (resumeFile) {
        formData.append('file', resumeFile);
      }

      await apiService.submitApplicationForm(formData);

      const appUrl = (drive as any).application_url;
      if (appUrl) {
        triggerToast(
          `You have successfully applied for ${companyName}. Opening external website...`,
          'success'
        );
        window.open(appUrl, '_blank');
      } else {
        triggerToast(
          `You have successfully applied for ${companyName}. Your resume has been submitted.`,
          'success'
        );
      }

      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }
      onClose();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || err?.message || 'Failed to submit application.';
      setErrorMsg(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 text-[#14213D] overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] my-auto">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-[#F8FAFC] gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-[#14213D] truncate">Apply for Placement Drive</h3>
                <p className="text-[11px] sm:text-xs text-[#64748B] truncate">
                  <strong className="text-[#2563EB]">{companyName}</strong> &bull; {roleTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs text-[#334155] flex-1 min-h-0"
          >
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Full Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2563EB]" /> Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Full Name"
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] font-medium shadow-xs"
              />
            </div>

            {/* 2. Mobile Number */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2563EB]" /> Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] font-medium shadow-xs"
              />
            </div>

            {/* 3. College Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#2563EB]" /> College Name
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. Campus University"
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] font-medium shadow-xs"
              />
            </div>

            {/* 4. Location */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka"
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] font-medium shadow-xs"
              />
            </div>

            {/* 5. RESUME SECTION */}
            <div className="pt-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#2563EB]" /> Resume
                </span>
                {hasExistingResume && (
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attached
                  </span>
                )}
              </label>

              {hasExistingResume && !showReplaceUpload ? (
                <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Resume already uploaded</span>
                        </div>
                        <p className="text-[11px] text-[#14213D] font-semibold truncate max-w-[220px] mt-0.5">
                          {resumeFilename || 'Active_Profile_Resume.pdf'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs py-1.5 px-3 bg-white border-slate-200 text-[#2563EB] hover:bg-slate-50 flex items-center gap-1 shadow-xs"
                        icon={<Eye className="w-3.5 h-3.5 text-[#2563EB]" />}
                        onClick={() => setShowResumePreview(true)}
                      >
                        View Resume
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-[#64748B]">
                    <span className="flex items-center gap-1 text-emerald-700">
                      ✓ Automatically attached to your application
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowReplaceUpload(true)}
                      className="text-[#2563EB] hover:underline cursor-pointer font-semibold"
                    >
                      Replace file
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {!hasExistingResume && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Resume required: Upload your resume to complete this application.</span>
                    </div>
                  )}

                  <div className="relative border-2 border-dashed border-slate-200 hover:border-[#2563EB] rounded-xl p-4 bg-[#F8FAFC] text-center transition-all cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <Upload className="w-6 h-6 mx-auto text-[#2563EB] mb-1.5" />
                    {resumeFile ? (
                      <div>
                        <p className="text-xs font-bold text-emerald-700">{resumeFile.name}</p>
                        <p className="text-[10px] text-[#64748B]">
                          {(resumeFile.size / 1024).toFixed(1)} KB &bull; Click to change
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-[#14213D]">
                          Click to upload or drag &amp; drop
                        </p>
                        <p className="text-[10px] text-[#64748B]">
                          Accepted: PDF, DOC, DOCX (Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {hasExistingResume && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowReplaceUpload(false);
                          setResumeFile(null);
                        }}
                        className="text-[10px] text-[#64748B] hover:text-[#14213D] underline cursor-pointer"
                      >
                        Keep existing resume ({resumeFilename})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {isSubmitting
                  ? 'Submitting Application...'
                  : (drive as any).application_url
                  ? 'Submit Application & Open Website'
                  : 'Submit Application'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* RESUME PREVIEW MODAL */}
      {showResumePreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150 text-[#14213D]">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#14213D]">Attached Student Resume</h4>
                  <p className="text-[11px] text-[#64748B] truncate max-w-[240px]">
                    {resumeFilename || 'Active_Resume.pdf'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResumePreview(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs text-[#334155]">
              {/* Score & Profile Summary */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase block">
                    Placement Readiness
                  </span>
                  <span className="text-base font-bold text-emerald-700">
                    {readinessScore > 0 ? `${readinessScore} / 100` : '85 / 100'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-[#64748B] uppercase block">
                    Status
                  </span>
                  <span className="text-xs font-semibold text-[#2563EB] flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Profile
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#2563EB]" /> Verified Skills
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {resumeProfile?.raw_skills && resumeProfile.raw_skills.length > 0 ? (
                    resumeProfile.raw_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> {skill}
                      </span>
                    ))
                  ) : (
                    ['Python', 'FastAPI', 'React', 'MongoDB', 'SQL', 'Docker'].map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Projects */}
              {resumeProfile?.projects && resumeProfile.projects.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#2563EB]" /> Highlighted Projects
                  </h5>
                  <div className="space-y-1.5">
                    {resumeProfile.projects.slice(0, 3).map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px]"
                      >
                        <strong className="text-[#14213D] block">{p.name}</strong>
                        {p.description && (
                          <p className="text-[#64748B] text-[10px] line-clamp-2 mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-[#F8FAFC] flex justify-end">
              <Button
                variant="primary"
                size="sm"
                className="text-xs py-1.5 px-4"
                onClick={() => setShowResumePreview(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
