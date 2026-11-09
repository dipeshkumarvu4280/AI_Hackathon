import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  CheckCircle2,
  FileText,
  Mail,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { apiService, ExtractedProfile } from '../../services/api';

export const StudentProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ExtractedProfile | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [readinessScore, setReadinessScore] = useState<number>(0);
  const [hasResume, setHasResume] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Fetch structured resume profile and student profile directly
    apiService
      .getMyStudentProfile()
      .then((res: any) => {
        if (isMounted && res) {
          setStudentDetails(res);
          if (res.readinessScore) setReadinessScore(res.readinessScore);
          if (res.hasResume) setHasResume(true);
        }
      })
      .catch((err) => console.warn('Could not load student profile', err));

    apiService
      .getResumeProfile()
      .then((data: any) => {
        if (isMounted && data) {
          setProfile(data);
          setHasResume(true);
        }
      })
      .catch((err: any) => console.warn('Could not load resume profile', err));

    return () => {
      isMounted = false;
    };
  }, []);

  const student = {
    name: studentDetails?.name || user?.name || 'Student Candidate',
    email: studentDetails?.email || user?.email || 'student@demo.com',
    rollNumber: studentDetails?.rollNumber || studentDetails?.roll_number || '2021CS1115',
    branch: studentDetails?.branch || 'Computer Science & Engineering',
    batch: studentDetails?.graduationYear || studentDetails?.batch || '2027',
    college: studentDetails?.college || 'Campus University',
    cgpa: studentDetails?.cgpa || '8.5',
    skills: profile?.skills || studentDetails?.skills || [],
  };

  const studentSkills = profile?.raw_skills || student.skills;
  const studentProjects = profile?.projects || [];
  const studentCertifications = profile?.certifications || [];
  const studentExperience = profile?.experience || [];

  return (
    <div className="space-y-6 pb-12 text-[#14213D]">
      <PageHeader
        title="Student Profile & Credentials"
        subtitle="Manage your academic records, verified technical skills, and resume profile."
        icon={<User className="w-5 h-5 text-[#2563EB]" />}
        action={
          <Button
            variant="primary"
            icon={<Sparkles className="w-4 h-4 text-white" />}
            onClick={() => navigate('/student/resume')}
          >
            {hasResume ? 'Re-Analyze Resume' : 'Upload Resume'}
          </Button>
        }
      />

      {/* STUDENT PROFILE CARD */}
      <Card className="p-6 bg-white border border-[#CBD5E1]/90 text-[#14213D] shadow-xs hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-[#14213D]">{student.name}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
                  Student Candidate
                </span>
              </div>
              <p className="text-xs text-[#475569] font-medium flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#2563EB]" /> {student.email}
              </p>
              <p className="text-xs text-[#475569] font-medium">
                {student.branch || 'Computer Science & Engineering'} &bull; Batch {student.batch || '2027'} &bull; CGPA: <strong className="text-[#14213D] font-bold">{student.cgpa || 'N/A'}</strong>
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xs font-bold text-[#475569] block">Placement Readiness</span>
              <span className="text-lg font-black text-[#14213D]">{readinessScore > 0 ? `${readinessScore} / 100` : 'Pending'}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-[#2563EB] font-black text-base shadow-xs">
              {readinessScore > 0 ? `${readinessScore}%` : '--'}
            </div>
          </div>
        </div>
      </Card>

      {/* VERIFIED SKILLS */}
      <Card className="p-6 bg-white border border-[#CBD5E1]/90 text-[#14213D] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Technical Skills ({studentSkills.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="text-xs py-1 px-2.5 bg-white border-slate-300 text-[#2563EB] hover:bg-slate-50 font-semibold"
            onClick={() => navigate('/student/resume')}
          >
            Update via Resume &rarr;
          </Button>
        </div>

        {studentSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {studentSkills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-[#F8FAFC] rounded-xl border border-slate-200 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-[#14213D]">No verified skills detected</p>
            <p className="text-xs text-[#475569]">Upload and analyze your resume to automatically extract your skills.</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={() => navigate('/student/resume')}
            >
              Upload Resume Now
            </Button>
          </div>
        )}
      </Card>

      {/* PROJECTS & EXPERIENCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects */}
        <Card className="p-6 bg-white border border-[#CBD5E1]/90 text-[#14213D] space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2563EB]" /> Technical Projects ({studentProjects.length})
          </h3>
          {studentProjects.length > 0 ? (
            <div className="space-y-3 pt-1">
              {studentProjects.map((proj: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-[#14213D] block">{proj.name || proj.title}</span>
                  {proj.description && <p className="text-[11px] text-[#475569] leading-relaxed">{proj.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#475569] italic pt-2">No projects extracted from resume yet.</p>
          )}
        </Card>

        {/* Certifications & Experience */}
        <Card className="p-6 bg-white border border-[#CBD5E1]/90 text-[#14213D] space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Certifications &amp; Experience
          </h3>
          {studentCertifications.length > 0 || studentExperience.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {studentCertifications.map((cert: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-amber-800 block">{cert.name}</span>
                  {cert.issuer && <span className="text-[10px] text-[#475569]">{cert.issuer}</span>}
                </div>
              ))}
              {studentExperience.map((exp: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-emerald-800 block">{exp.role} &bull; {exp.company}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#475569] italic pt-2">No certifications or internships recorded yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
};
