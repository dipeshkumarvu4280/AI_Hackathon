import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, LogOut, Loader2 } from 'lucide-react';
import { useAuth, getPortalDashboardUrl } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  portalName?: string;
  fallbackLoginPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  portalName = 'Restricted Portal',
  fallbackLoginPath = '/login',
}) => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F8FF] text-[#14213D] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-3" />
        <p className="text-xs text-[#64748B] font-medium">Verifying portal authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackLoginPath} state={{ from: location }} replace />;
  }

  const userRole = user.role;
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    const roleLabels: Record<string, string> = {
      student: 'Student',
      recruiter: 'Company Recruiter',
      placement_officer: 'Placement Officer',
    };

    const userPortalLabel = roleLabels[userRole] || userRole;
    const targetDashboard = getPortalDashboardUrl(userRole);

    return (
      <div className="min-h-screen bg-[#F5F8FF] text-[#14213D] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-black text-[#14213D] tracking-tight">Access Denied</h2>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
              You don't have permission to access the <strong className="text-[#14213D]">{portalName}</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1.5 font-medium">
            <div className="flex justify-between text-[#64748B]">
              <span>Active Account:</span>
              <span className="text-[#14213D] font-bold truncate max-w-[200px]">{user.email}</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Assigned Role:</span>
              <span className="text-[#2563EB] font-bold">{userPortalLabel}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => navigate(targetDashboard, { replace: true })}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Return to {userPortalLabel} Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#14213D] border border-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4 text-[#64748B]" />
              <span>Sign Out &amp; Switch Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
