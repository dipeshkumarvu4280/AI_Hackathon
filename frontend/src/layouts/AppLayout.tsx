import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Sparkles,
  CalendarCheck,
  DoorOpen,
  Bell,
  BarChart3,
  AlertTriangle,
  Bot,
  UserCheck,
  Briefcase,
  GraduationCap,
  BookOpen,
  Settings,
  X,
  LogOut,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  BrainCircuit,
  Award,
  Layers,
} from 'lucide-react';
import { TopNavbar } from '../components/navigation/TopNavbar';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userRole: UserRole = user?.role || 'placement_officer';

  const getPageTitle = (path: string) => {
    // Placement Officer routes
    if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
      if (path.includes('/companies')) return 'Companies & Placement Drives';
      if (path.includes('/candidates')) return 'Candidates Management Pool';
      if (path.includes('/matching')) return 'Autonomous AI Candidate Matching';
      if (path.includes('/interviews')) return 'Interview Schedules & Timelines';
      if (path.includes('/panels')) return 'Interview Panels & Assessment Rooms';
      if (path.includes('/notifications')) return 'Operational Notifications & Alerts';
      if (path.includes('/analytics')) return 'Institutional Skill Gap Analytics';
      if (path.includes('/exceptions')) return 'AI Exceptions & Conflict Engine';
      if (path.includes('/copilot')) return 'Placement Officer Copilot AI';
      if (path.includes('/audit')) return 'Institutional System Audit Logs';
      return 'Placement Officer Operations Hub';
    }

    // Student routes
    if (path.startsWith('/student')) {
      if (path.includes('/dashboard')) return 'Student Workspace';
      if (path.includes('/resume')) return 'AI Resume Analyzer & Profile';
      if (path.includes('/drives')) return 'Eligible Placement Drives';
      if (path.includes('/assessment')) return 'AI Placement Assessment & PrepBot';
      if (path.includes('/assessments')) return 'My Placement Assessments';
      if (path.includes('/applications')) return 'My Submitted Applications';
      if (path.includes('/interviews')) return 'My Scheduled Interviews';
      if (path.includes('/notifications')) return 'Candidate Notifications & Alerts';
      if (path.includes('/profile')) return 'My Student Profile & Credentials';
      if (path.includes('/copilot')) return 'Student Placement Copilot';
      return 'Student Workspace';
    }

    // Recruiter routes
    if (path.startsWith('/recruiter')) {
      if (path.includes('/drives')) return 'Company Placement Drives';
      if (path.includes('/candidates')) return 'Shortlisted Candidate Pool';
      if (path.includes('/interviews')) return 'Interview Round Coordination';
      if (path.includes('/copilot')) return 'Recruiter Placement Copilot';
      if (path.includes('/notifications')) return 'Recruiter Notifications';
      return 'Recruiter Workspace';
    }

    return 'PlaceMind Operations Hub';
  };

  // 1. Student Portal Navigation
  const studentNavSections: NavSection[] = [
    {
      label: 'STUDENT WORKSPACE',
      items: [
        { path: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { path: '/student/applications', label: 'My Applications', icon: <FileCheck className="w-4 h-4" /> },
        { path: '/student/drives', label: 'Placement Drives', icon: <Briefcase className="w-4 h-4" /> },
        { path: '/student/resume', label: 'Resume Analyzer', icon: <Sparkles className="w-4 h-4" /> },
        { path: '/student/assessment', label: 'AI Assessment', icon: <BrainCircuit className="w-4 h-4" /> },
        { path: '/student/assessments', label: 'My Assessments', icon: <BarChart3 className="w-4 h-4" /> },
        { path: '/student/community', label: 'Communities', icon: <Users className="w-4 h-4" /> },
        { path: '/student/offers', label: 'Offers & Joining', icon: <Award className="w-4 h-4" /> },
        { path: '/student/interviews', label: 'My Interviews', icon: <GraduationCap className="w-4 h-4" /> },
        { path: '/student/profile', label: 'Profile', icon: <BookOpen className="w-4 h-4" /> },
        { path: '/student/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
      ],
    },
  ];

  // 2. Recruiter Portal Navigation
  const recruiterNavSections: NavSection[] = [
    {
      label: 'RECRUITER WORKSPACE',
      items: [
        { path: '/recruiter/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { path: '/recruiter/drives', label: 'Post Drives', icon: <Building2 className="w-4 h-4" /> },
        { path: '/recruiter/candidates', label: 'Applications', icon: <Users className="w-4 h-4" /> },
        { path: '/recruiter/interviews', label: 'Interview Schedules', icon: <CalendarCheck className="w-4 h-4" /> },
        { path: '/recruiter/copilot', label: 'Placement Copilot', icon: <Bot className="w-4 h-4" /> },
        { path: '/recruiter/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
      ],
    },
  ];

  // 3. Placement Officer Portal Navigation
  const placementOfficerNavSections: NavSection[] = [
    {
      label: 'OVERVIEW',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      label: 'PLACEMENT OPERATIONS',
      items: [
        { path: '/admin/companies', label: 'Drives Management', icon: <Building2 className="w-4 h-4" /> },
        { path: '/admin/candidates', label: 'Candidates Pool', icon: <Users className="w-4 h-4" /> },
        { path: '/admin/matching', label: 'AI Matching Hub', icon: <Sparkles className="w-4 h-4" /> },
        { path: '/admin/interviews', label: 'Interview Schedules', icon: <CalendarCheck className="w-4 h-4" /> },
        { path: '/admin/panels', label: 'Panels & Rooms', icon: <DoorOpen className="w-4 h-4" /> },
      ],
    },
    {
      label: 'INTELLIGENCE & AUDIT',
      items: [
        { path: '/admin/reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
        { path: '/admin/analytics', label: 'Skill Analytics', icon: <Layers className="w-4 h-4" /> },
        { path: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { path: '/admin/exceptions', label: 'AI Exceptions', icon: <AlertTriangle className="w-4 h-4" /> },
        { path: '/admin/copilot', label: 'Placement Copilot', icon: <Bot className="w-4 h-4" /> },
        { path: '/admin/audit', label: 'Audit Logs', icon: <BookOpen className="w-4 h-4" /> },
      ],
    },
  ];

  // Select navigation strictly based on authenticated role
  const getNavSections = (): NavSection[] => {
    switch (userRole) {
      case 'student':
        return studentNavSections;
      case 'recruiter':
        return recruiterNavSections;
      case 'placement_officer':
      default:
        return placementOfficerNavSections;
    }
  };

  const activeNavSections = getNavSections();

  const getPortalHeaderInfo = () => {
    switch (userRole) {
      case 'student':
        return {
          title: 'Student Portal',
          badgeClass: 'bg-blue-50 text-[#2563EB] border-blue-200/80',
        };
      case 'recruiter':
        return {
          title: 'Recruiter Portal',
          badgeClass: 'bg-purple-50 text-[#7C3AED] border-purple-200/80',
        };
      case 'placement_officer':
      default:
        return {
          title: 'Placement Officer',
          badgeClass: 'bg-teal-50 text-[#0D9488] border-teal-200/80',
        };
    }
  };

  const portalInfo = getPortalHeaderInfo();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-slate-200/90 shadow-[1px_0_8px_rgba(0,0,0,0.03)]">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#14213D] tracking-tight leading-none">
              PlaceMind
            </h1>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">{portalInfo.title}</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role-Isolated Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
        {activeNavSections.map((section) => (
          <div key={section.label}>
            {activeNavSections.length > 1 && (
              <span className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {section.label}
              </span>
            )}
            <div className="mt-1.5 space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:text-[#14213D] hover:bg-slate-100/90 font-medium'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer with Logout */}
      <div className="p-3.5 border-t border-slate-100 space-y-1 bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#EEF3FA] text-[#14213D] overflow-x-hidden selection:bg-[#2563EB] selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 fixed inset-y-0 z-40">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay and Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen bg-[#EEF3FA] text-[#14213D]">
        <TopNavbar
          currentTitle={getPageTitle(location.pathname)}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
