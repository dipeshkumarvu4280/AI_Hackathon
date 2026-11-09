import React, { useState } from 'react';
import { X, GraduationCap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNumber: '',
    college: 'Campus University',
    branch: 'CSE',
    graduationYear: 2027,
    cgpa: 8.0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.name || !formData.email || !formData.rollNumber) {
      setError('Please fill in all mandatory fields');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.registerStudent({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        rollNumber: formData.rollNumber,
        branch: formData.branch,
        college: formData.college,
        graduationYear: Number(formData.graduationYear),
        cgpa: Number(formData.cgpa),
      });

      if (res.access_token) {
        localStorage.setItem('placemind_token', res.access_token);
      }
      setLoading(false);
      onSuccess(formData.email);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.detail || 'Failed to complete student registration');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-xl relative text-[#14213D] max-h-[94vh] sm:max-h-[90vh] overflow-y-auto my-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[#2563EB]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#14213D]">Student Registration</h3>
            <p className="text-xs text-[#64748B]">Create your campus placement portal profile</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Student ID / Roll No *</label>
              <input
                type="text"
                required
                placeholder="2021CS1115"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="student@campus.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Branch *</label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] focus:outline-none focus:border-[#2563EB] cursor-pointer shadow-xs"
              >
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="EEE">Electrical (EEE)</option>
                <option value="ME">Mechanical (ME)</option>
                <option value="CE">Civil (CE)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Graduation Year</label>
              <input
                type="number"
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] focus:outline-none focus:border-[#2563EB] shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] focus:outline-none focus:border-[#2563EB] shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#14213D] mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] shadow-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Student Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
