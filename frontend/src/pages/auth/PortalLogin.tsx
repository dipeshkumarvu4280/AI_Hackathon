import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useAuth, getPortalDashboardUrl } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { SignupModal } from '../../components/auth/SignupModal';
import { RecruiterSignupModal } from '../../components/auth/RecruiterSignupModal';
import { PlacementOfficerSignupModal } from '../../components/auth/PlacementOfficerSignupModal';

interface PortalConfig {
  portalRole: UserRole;
  title: string;
  portalSubtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  icon: React.ReactNode;
  accentGradient: string;
  buttonClass: string;
  badgeClass: string;
  demoEmail: string;
  demoPass: string;
  canRegister: boolean;
  registerLabel?: string;
  restrictedNotice?: string;
}

export const PortalLogin: React.FC = () => {
  const { portalType } = useParams<{ portalType: string }>();
  const navigate = useNavigate();
  const { login, forgotPassword, user, isAuthenticated } = useAuth();

  // Map route param to portal configuration
  const getPortalConfig = (): PortalConfig => {
    switch (portalType) {
      case 'student':
        return {
          portalRole: 'student',
          title: 'Student Portal Login',
          portalSubtitle: 'Access placement drives, AI resume analyzer, and interview schedules.',
          emailLabel: 'Student Email / Roll ID',
          emailPlaceholder: 'student@demo.com',
          icon: <GraduationCap className="w-6 h-6 text-[#2563EB]" />,
          accentGradient: 'from-[#2563EB] to-blue-600',
          buttonClass: 'bg-[#2563EB] hover:bg-[#1D4ED8]',
          badgeClass: 'bg-blue-50 text-[#2563EB] border-blue-200',
          demoEmail: 'student@demo.com',
          demoPass: 'password123',
          canRegister: true,
          registerLabel: 'New student candidate? Register here',
        };

      case 'recruiter':
        return {
          portalRole: 'recruiter',
          title: 'Recruiter Portal Login',
          portalSubtitle: 'Manage company hiring drives, candidate pipelines, and evaluation shortlists.',
          emailLabel: 'Corporate Work Email',
          emailPlaceholder: 'recruiter@demo.com',
          icon: <Building2 className="w-6 h-6 text-purple-600" />,
          accentGradient: 'from-purple-600 to-indigo-600',
          buttonClass: 'bg-purple-600 hover:bg-purple-700',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          demoEmail: 'recruiter@demo.com',
          demoPass: 'password123',
          canRegister: true,
          registerLabel: 'New campus recruiter? Request drive access',
        };

      case 'placement-officer':
      case 'placement_officer':
      default:
        return {
          portalRole: 'placement_officer',
          title: 'Placement Officer Login',
          portalSubtitle: 'Manage institutional placement drives, AI matching algorithms, panels & rooms, and automated operations.',
          emailLabel: 'Official Institutional Email',
          emailPlaceholder: 'placement@demo.com',
          icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
          accentGradient: 'from-teal-600 to-emerald-600',
          buttonClass: 'bg-teal-600 hover:bg-teal-700',
          badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
          demoEmail: 'placement@demo.com',
          demoPass: 'password123',
          canRegister: true,
          registerLabel: 'New placement officer? Register institutional account',
        };
    }
  };

  const config = getPortalConfig();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Modals
  const [studentSignupOpen, setStudentSignupOpen] = useState(false);
  const [recruiterSignupOpen, setRecruiterSignupOpen] = useState(false);
  const [officerSignupOpen, setOfficerSignupOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Clear errors and input state whenever portalType changes
  useEffect(() => {
    setError(null);
    setSuccessNotice(null);
    setEmail('');
    setPassword('');
  }, [portalType]);

  // If already authenticated in this role, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === config.portalRole) {
        navigate(getPortalDashboardUrl(user.role), { replace: true });
      }
    }
  }, [isAuthenticated, user, config.portalRole, navigate]);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error) setError(null);
    if (successNotice) setSuccessNotice(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (error) setError(null);
    if (successNotice) setSuccessNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password, config.portalRole);
    setLoading(false);

    if (result.success && result.user) {
      const targetUrl = getPortalDashboardUrl(result.user.role);
      navigate(targetUrl, { replace: true });
    } else {
      setError(result.error || 'Invalid credentials or unauthorized portal access.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    const res = await forgotPassword(forgotEmail, config.portalRole);
    setForgotLoading(false);
    setForgotSuccess(res.message);
  };

  return (
    <div className="min-h-screen bg-[#EEF3FA] text-[#14213D] flex flex-col justify-between relative selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="p-6 md:p-8 flex items-center justify-between max-w-7xl w-full mx-auto relative z-10">
        <Link to="/login" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#14213D] tracking-tight">PlaceMind</h1>
            <p className="text-xs text-[#475569] font-medium">Campus Placement Platform</p>
          </div>
        </Link>

        <Link
          to="/login"
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#14213D] shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Switch Portal</span>
        </Link>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#CBD5E1]/90 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mx-auto mb-1">
              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${config.badgeClass}`}>
                {config.title.replace(' Login', '')}
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-[#14213D]">
              {config.title}
            </h2>
            <p className="text-xs text-[#475569] font-medium leading-relaxed">
              {config.portalSubtitle}
            </p>
          </div>

          {/* Error / Alert Box */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5 font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#14213D]">{config.emailLabel}</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={config.emailPlaceholder}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] focus:bg-white border border-slate-300 rounded-xl text-xs text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] font-medium shadow-xs transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#14213D]">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessNotice(null);
                    setForgotModalOpen(true);
                    setForgotEmail(email);
                    setForgotSuccess(null);
                  }}
                  className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] font-medium shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-[#64748B] cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#2563EB] focus:ring-0 cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 ${config.buttonClass} text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {config.title.replace(' Login', '')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Links or Policy Notices */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            {config.canRegister && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessNotice(null);
                    if (config.portalRole === 'recruiter') {
                      setRecruiterSignupOpen(true);
                    } else if (config.portalRole === 'placement_officer') {
                      setOfficerSignupOpen(true);
                    } else {
                      setStudentSignupOpen(true);
                    }
                  }}
                  className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  {config.registerLabel}
                </button>
              </div>
            )}

            {config.restrictedNotice && (
              <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-[#64748B] text-left font-medium">
                <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <span>{config.restrictedNotice}</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#14213D]">Reset Portal Password</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Enter your registered {config.emailLabel.toLowerCase()} to receive password reset instructions for the {config.title.replace(' Login', '')}.
            </p>

            {forgotSuccess ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
                <button
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#14213D] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Close &amp; Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder={config.emailPlaceholder}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] font-medium shadow-xs"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#64748B] text-xs font-semibold border border-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className={`px-4 py-2 ${config.buttonClass} text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer`}
                  >
                    {forgotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Send Reset Instructions</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Student Signup Modal */}
      <SignupModal
        isOpen={studentSignupOpen}
        onClose={() => {
          setError(null);
          setStudentSignupOpen(false);
        }}
        onSuccess={(regEmail) => {
          setError(null);
          setStudentSignupOpen(false);
          setEmail(regEmail);
          setPassword('');
          setSuccessNotice('Account created successfully. Please sign in.');
        }}
      />

      {/* Recruiter Signup Modal */}
      <RecruiterSignupModal
        isOpen={recruiterSignupOpen}
        onClose={() => {
          setError(null);
          setRecruiterSignupOpen(false);
        }}
        onSuccess={(regEmail) => {
          setError(null);
          setRecruiterSignupOpen(false);
          setEmail(regEmail);
          setPassword('');
          setSuccessNotice('Recruiter account created successfully. Please sign in.');
        }}
      />

      {/* Placement Officer Signup Modal */}
      <PlacementOfficerSignupModal
        isOpen={officerSignupOpen}
        onClose={() => {
          setError(null);
          setOfficerSignupOpen(false);
        }}
        onSuccess={(regEmail) => {
          setError(null);
          setOfficerSignupOpen(false);
          setEmail(regEmail);
          setPassword('');
          setSuccessNotice('Placement Officer account created successfully. Please sign in.');
        }}
      />

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#64748B] relative z-10 font-medium border-t border-slate-200/80">
        PlaceMind Autonomous Placement Operating System &bull; Enterprise Portal Security
      </footer>
    </div>
  );
};
