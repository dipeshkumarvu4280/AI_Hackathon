import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  User,
  Menu,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
  Building2,
  Users,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import { useAuth, getPortalDashboardUrl } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface TopNavbarProps {
  currentTitle: string;
  onMobileMenuToggle: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTitle,
  onMobileMenuToggle,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notificationsList, markNotificationRead, markAllNotificationsRead } = usePlacement();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const markAllRead = () => {
    markAllNotificationsRead();
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'student':
        return {
          label: 'Student Candidate',
          avatarBg: 'bg-[#2563EB]',
          badgeClass: 'bg-blue-50 text-[#2563EB] border-blue-200/80',
        };
      case 'recruiter':
        return {
          label: 'Company Recruiter',
          avatarBg: 'bg-[#7C3AED]',
          badgeClass: 'bg-purple-50 text-[#7C3AED] border-purple-200/80',
        };
      case 'placement_officer':
      default:
        return {
          label: 'Placement Officer',
          avatarBg: 'bg-[#0D9488]',
          badgeClass: 'bg-teal-50 text-[#0D9488] border-teal-200/80',
        };
    }
  };

  const badgeInfo = getRoleBadge(user?.role);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-[#14213D]">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          aria-label="Toggle navigation menu"
          className="p-2 text-slate-500 hover:text-slate-800 rounded-xl md:hidden hover:bg-slate-100 transition-colors cursor-pointer shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-[#14213D] tracking-tight leading-tight flex items-center gap-2 truncate">
            <span className="truncate max-w-[150px] sm:max-w-[280px] md:max-w-md lg:max-w-xl">{currentTitle}</span>
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* NOTIFICATIONS CONTAINER */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:text-[#14213D] hover:bg-slate-100 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#2563EB] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* NOTIFICATIONS DROPDOWN MENU */}
          {notificationsOpen && (
            <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-xs font-bold text-[#14213D] uppercase tracking-wider">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 text-[10px] font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                {notificationsList.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notificationsList.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setNotificationsOpen(false);
                        if (n.relatedRoute) {
                          navigate(n.relatedRoute);
                          return;
                        }
                        const notifType = (n.type || (n as any).notificationType || '').toUpperCase();
                        const driveId = n.drive_id || (n as any).driveId;
                        if (notifType.includes('INTERVIEW') || notifType.includes('SHORTLIST')) {
                          navigate(user?.role === 'student' ? '/student/interviews' : '/admin/interviews');
                          return;
                        }
                        if (user?.role === 'recruiter') {
                          navigate('/recruiter/drives');
                          return;
                        }
                        if (driveId) {
                          navigate(user?.role === 'student' ? `/student/community/${driveId}` : `/admin/companies/${driveId}`);
                          return;
                        }
                        navigate(user?.role === 'student' ? '/student/drives' : '/admin/notifications');
                      }}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer space-y-1 ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#14213D] flex items-center gap-1.5">
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE DROPDOWN */}
        <div className="relative pl-2 border-l border-slate-200" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            aria-label="User Profile"
            className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer min-h-[40px]"
          >
            <div className={`w-8 h-8 rounded-full ${badgeInfo.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-[#14213D] block leading-tight max-w-[140px] truncate">
                {user?.name || 'User'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* PROFILE DROPDOWN MENU */}
          {profileOpen && (
            <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-72 max-w-xs bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-2">
                <div>
                  <span className="text-xs font-bold text-[#14213D] block">
                    {user?.name || 'User Profile'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium block truncate">
                    {user?.email || 'No email attached'}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeInfo.badgeClass}`}>
                  <span>{badgeInfo.label}</span>
                </div>
              </div>

              <div className="p-2 space-y-1 text-xs font-medium">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(getPortalDashboardUrl(user?.role));
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left font-semibold"
                >
                  <Sparkles className="w-4 h-4 text-[#2563EB]" />
                  <span>My Portal Dashboard</span>
                </button>
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50/40">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
