import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, GraduationCap, ArrowRight, Sparkles, Building2, Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';
import { apiService } from '../../services/api';
import { SignupModal } from '../../components/auth/SignupModal';
import { usePlacement } from '../../context/PlacementContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUserRole, triggerToast } = usePlacement();
  const [selectedRole, setSelectedRole] = useState<UserRole>('placement_officer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const executeLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.login({
        email: email || '',
        password: password || '',
        portalRole: selectedRole,
      });

      if (res.access_token) {
        localStorage.setItem('placemind_token', res.access_token);
      }

      const role: UserRole = res.user?.role || selectedRole;
      setCurrentUserRole(role);
      setLoading(false);

      triggerToast(`Authenticated as ${res.user?.name || role}`, 'success');

      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF3FA] text-[#14213D] flex flex-col justify-between relative selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="p-6 md:p-8 flex items-center justify-between max-w-7xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xl shadow-xs">
            P
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#14213D] tracking-tight">PlaceMind</h1>
            <p className="text-xs text-[#475569] font-medium">AI Campus Placement Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          Campus Placement Platform
        </div>
      </header>

      {/* Main Login Workspace Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#CBD5E1]/90 p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Autonomous Placement Operations
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[#14213D]">
              Sign In to PlaceMind
            </h2>
            <p className="text-xs text-[#475569] mt-1 font-medium">
              Select your role or enter credentials to access your dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selector Options - 3 Roles */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-blue-50 border-blue-300 text-[#2563EB] shadow-xs'
                  : 'bg-white border-slate-200 text-[#64748B] hover:border-slate-300 hover:text-[#14213D]'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-1">
                <GraduationCap className="w-4 h-4 text-[#2563EB]" />
                <div className="text-[11px] font-bold">Student</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('recruiter')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'recruiter'
                  ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                  : 'bg-white border-slate-200 text-[#64748B] hover:border-slate-300 hover:text-[#14213D]'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-1">
                <Building2 className="w-4 h-4 text-purple-600" />
                <div className="text-[11px] font-bold">Recruiter</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('placement_officer')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedRole === 'placement_officer'
                  ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-xs'
                  : 'bg-white border-slate-200 text-[#64748B] hover:border-slate-300 hover:text-[#14213D]'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <div className="text-[11px] font-bold">Officer</div>
              </div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={executeLogin} className="space-y-3.5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-medium shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#14213D]">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all font-medium shadow-xs"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedRole === 'placement_officer'
                      ? 'Sign In as Placement Officer'
                      : selectedRole === 'student'
                      ? 'Sign In as Student'
                      : 'Sign In as Recruiter'}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Student Signup Trigger Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-[#64748B]">New student candidate? </span>
            <button
              type="button"
              onClick={() => setSignupModalOpen(true)}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              Register Account Here
            </button>
          </div>
        </div>
      </main>

      {/* Signup Modal */}
      <SignupModal
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        onSuccess={(regEmail) => {
          setSignupModalOpen(false);
          setEmail(regEmail);
          setPassword('password123');
          setSelectedRole('student');
          triggerToast('Registration complete! Click Sign In to enter.', 'success');
        }}
      />

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[#64748B] relative z-10 font-medium">
        PlaceMind Autonomous Placement Operations &bull; Enterprise Portal Security
      </footer>
    </div>
  );
};
