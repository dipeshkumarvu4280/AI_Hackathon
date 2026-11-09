import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Check,
  Zap,
  BarChart3,
  Home,
  Sun,
  Moon,
  Users,
  X,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { useAuth, getPortalDashboardUrl } from '../../context/AuthContext';
import campusHeroImg from '../../assets/campus-hero.png';

// Subtle SVG dot pattern matching the reference design
const DotMatrix: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    className={`pointer-events-none select-none ${className}`}
    width="112"
    height="80"
    fill="none"
    viewBox="0 0 112 80"
    aria-hidden="true"
  >
    {Array.from({ length: 4 }).map((_, rowIndex) =>
      Array.from({ length: 7 }).map((_, colIndex) => (
        <circle
          key={`${rowIndex}-${colIndex}`}
          cx={10 + colIndex * 15}
          cy={10 + rowIndex * 18}
          r="2.5"
          className="fill-blue-300/45 dark:fill-blue-500/20"
        />
      ))
    )}
  </svg>
);

export const PortalSelect: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  });
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('theme-light');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('theme-light');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const portals = [
    {
      id: 'student',
      title: 'Student Portal',
      badge: 'For Students',
      description:
        'Explore placement opportunities, check eligibility, apply for drives and track your applications.',
      icon: <GraduationCap className="w-7 h-7 text-[#2563EB]" />,
      buttonText: 'Student Login',
      route: '/login/student',
      iconContainerClass: 'bg-blue-100/70 border-blue-200/80 text-[#2563EB]',
      badgeClass: 'bg-blue-50 text-[#2563EB] border-blue-200/70',
      buttonClass:
        'bg-[#2563EB] hover:bg-[#1D4ED8] focus-visible:ring-blue-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)]',
      cardHoverBorder: 'hover:border-blue-300 hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)]',
      decorativeWave: (
        <svg
          className="absolute -bottom-8 -right-8 w-44 h-44 pointer-events-none opacity-40 transition-transform duration-500 group-hover:scale-110"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0,120 C60,190 130,190 200,110 L200,200 L0,200 Z"
            fill="#BFDBFE"
          />
          <path
            d="M50,150 C100,200 150,200 200,140 L200,200 L50,200 Z"
            fill="#93C5FD"
            fillOpacity="0.5"
          />
        </svg>
      ),
    },
    {
      id: 'recruiter',
      title: 'Recruiter Portal',
      badge: 'For Companies',
      description:
        'Post placement drives, manage applications and find the best talent from our campus.',
      icon: <Building2 className="w-7 h-7 text-[#7C3AED]" />,
      buttonText: 'Recruiter Login',
      route: '/login/recruiter',
      iconContainerClass: 'bg-purple-100/70 border-purple-200/80 text-[#7C3AED]',
      badgeClass: 'bg-purple-50 text-[#7C3AED] border-purple-200/70',
      buttonClass:
        'bg-[#7C3AED] hover:bg-[#6D28D9] focus-visible:ring-purple-500 text-white shadow-[0_4px_14px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)]',
      cardHoverBorder: 'hover:border-purple-300 hover:shadow-[0_20px_40px_rgba(124,58,237,0.08)]',
      decorativeWave: (
        <svg
          className="absolute -bottom-8 -right-8 w-44 h-44 pointer-events-none opacity-40 transition-transform duration-500 group-hover:scale-110"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0,120 C60,190 130,190 200,110 L200,200 L0,200 Z"
            fill="#E9D5FF"
          />
          <path
            d="M50,150 C100,200 150,200 200,140 L200,200 L50,200 Z"
            fill="#D8B4FE"
            fillOpacity="0.5"
          />
        </svg>
      ),
    },
    {
      id: 'placement_officer',
      title: 'Placement Officer Portal',
      badge: 'For Placement Officers',
      description:
        'Approve drives, manage students, view analytics and ensure a smooth placement process.',
      icon: <ShieldCheck className="w-7 h-7 text-[#0D9488]" />,
      buttonText: 'Placement Officer Login',
      route: '/login/placement-officer',
      iconContainerClass: 'bg-teal-100/70 border-teal-200/80 text-[#0D9488]',
      badgeClass: 'bg-teal-50 text-[#0D9488] border-teal-200/70',
      buttonClass:
        'bg-[#0D9488] hover:bg-[#0F766E] focus-visible:ring-teal-500 text-white shadow-[0_4px_14px_rgba(13,148,136,0.25)] hover:shadow-[0_6px_20px_rgba(13,148,136,0.35)]',
      cardHoverBorder: 'hover:border-teal-300 hover:shadow-[0_20px_40px_rgba(13,148,136,0.08)]',
      decorativeWave: (
        <svg
          className="absolute -bottom-8 -right-8 w-44 h-44 pointer-events-none opacity-40 transition-transform duration-500 group-hover:scale-110"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M0,120 C60,190 130,190 200,110 L200,200 L0,200 Z"
            fill="#CCFBF1"
          />
          <path
            d="M50,150 C100,200 150,200 200,140 L200,200 L50,200 Z"
            fill="#99F6E4"
            fillOpacity="0.5"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#EEF3FA] text-[#14213D] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#2563EB] selection:text-white transition-colors duration-200">
      {/* Background Soft Wave Top-Right */}
      <div
        className="absolute top-0 right-0 w-[540px] h-[480px] bg-gradient-to-bl from-blue-200/40 via-blue-100/20 to-transparent rounded-bl-[160px] pointer-events-none -z-0"
        aria-hidden="true"
      />

      {/* Background Soft Wave Bottom-Left */}
      <div
        className="absolute -bottom-16 -left-16 w-80 sm:w-[460px] h-80 sm:h-[460px] pointer-events-none opacity-60 -z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
          <path
            d="M0,180 C140,180 240,280 400,400 L0,400 Z"
            fill="#DBEAFE"
            fillOpacity="0.7"
          />
          <path
            d="M0,250 C120,250 200,320 320,400 L0,400 Z"
            fill="#93C5FD"
            fillOpacity="0.4"
          />
        </svg>
      </div>

      {/* Decorative Dot Matrices */}
      <DotMatrix className="absolute top-80 -left-6 hidden xl:block" />
      <DotMatrix className="absolute bottom-6 right-8 hidden lg:block" />

      {/* 1. TOP NAVBAR */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2 relative z-20">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full px-4 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between shadow-[0_4px_25px_rgba(20,33,61,0.04)] transition-all">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight">
                PlaceMind
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              className="px-4 py-1.5 rounded-full bg-blue-50 text-[#2563EB] font-bold text-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => setAboutModalOpen(true)}
              className="px-4 py-1.5 rounded-full text-slate-700 hover:text-[#14213D] hover:bg-slate-100/80 font-semibold text-sm transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('portals')}
              className="px-4 py-1.5 rounded-full text-slate-700 hover:text-[#14213D] hover:bg-slate-100/80 font-semibold text-sm transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="px-4 py-1.5 rounded-full text-slate-700 hover:text-[#14213D] hover:bg-slate-100/80 font-semibold text-sm transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-9 h-9 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all duration-200 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Sun className="w-4 h-4 text-slate-600 hover:text-[#2563EB]" />
              )}
            </button>

            {/* Authenticated user button or Login shortcut */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium hidden lg:inline">
                  Signed in as{' '}
                  <strong className="text-[#14213D] font-bold">{user.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => navigate(getPortalDashboardUrl(user.role))}
                  className="px-4 py-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => scrollToSection('portals')}
                className="px-5 py-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <section
          id="hero"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-16"
        >
          {/* Left Column: Headline and Highlights */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Top Chip Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-[#2563EB] font-bold text-xs tracking-tight shadow-xs select-none">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Smart Placement. Brighter Future.</span>
            </div>

            {/* Main Welcome Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#14213D] leading-[1.08]">
              Welcome to <br />
              <span className="text-[#2563EB]">PlaceMind</span>
            </h1>

            {/* Description Subtitle */}
            <p className="text-base sm:text-lg text-[#475569] font-medium leading-relaxed max-w-xl">
              Your unified platform for campus placements, driven by innovation and
              opportunity.
            </p>

            {/* Secure, Efficient & Smarter Placement Feature Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-[#14213D]">
              <div className="inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#0D9488] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
                <span>Secure & Reliable</span>
              </div>
              <span className="text-slate-300 font-light hidden sm:inline select-none">
                |
              </span>
              <div className="inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-white stroke-none" />
                </span>
                <span>Fast & Efficient</span>
              </div>
              <span className="text-slate-300 font-light hidden sm:inline select-none">
                |
              </span>
              <div className="inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <BarChart3 className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                <span>Smarter Placements</span>
              </div>
            </div>
          </div>

          {/* Right Column: Subtle Modern Campus Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(37,99,235,0.08)] border border-blue-200/80 bg-white group">
              <img
                src={campusHeroImg}
                alt="PlaceMind Institutional Campus"
                className="w-full h-[240px] sm:h-[300px] lg:h-[340px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="eager"
              />
              {/* Subtle gentle gradient blend overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 via-transparent to-white/20 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        {/* 3. ROLE SELECTION CARDS SECTION */}
        <section
          id="portals"
          aria-label="Role Portals Selection"
          className="space-y-4 mb-12 sm:mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {portals.map((portal) => (
              <div
                key={portal.id}
                onClick={() => navigate(portal.route)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(portal.route);
                  }
                }}
                className={`group bg-gradient-to-b from-white to-[#F8FAFC] rounded-3xl p-7 sm:p-8 border border-[#CBD5E1]/90 ${portal.cardHoverBorder} shadow-[0_8px_24px_rgba(20,33,61,0.04)] hover:shadow-[0_16px_36px_rgba(37,99,235,0.12)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 cursor-pointer relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] motion-reduce:transform-none`}
              >
                {/* Decorative bottom corner subtle wave */}
                {portal.decorativeWave}

                <div className="space-y-6 relative z-10">
                  {/* Top Row: Icon & Role Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl border ${portal.iconContainerClass} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105`}
                    >
                      {portal.icon}
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${portal.badgeClass}`}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-black text-[#14213D] tracking-tight">
                      {portal.title}
                    </h2>
                    <p className="text-sm text-[#475569] font-medium leading-relaxed">
                      {portal.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-8 relative z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(portal.route);
                    }}
                    className={`w-full py-3 px-5 ${portal.buttonClass} font-bold text-sm rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer focus-visible:outline-none`}
                  >
                    <span>{portal.buttonText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. CLEAN TRUST & BENEFITS STRIP */}
        <section
          aria-label="Platform Governance and Security"
          className="flex justify-center mb-6"
        >
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-full px-6 sm:px-10 py-3.5 shadow-[0_4px_25px_rgba(20,33,61,0.04)] inline-flex items-center gap-4 sm:gap-8 flex-wrap justify-center text-xs sm:text-sm font-semibold text-[#14213D]">
            <div className="inline-flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2563EB]" />
              <span>Role-Isolated Portals</span>
            </div>
            <span className="text-slate-200 font-light hidden sm:inline select-none">
              |
            </span>
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>Institutional Placement Governance</span>
            </div>
            <span className="text-slate-200 font-light hidden sm:inline select-none">
              |
            </span>
            <div className="inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>End-to-End Placement Workflows</span>
            </div>
          </div>
        </section>
      </main>

      {/* 5. FOOTER */}
      <footer className="py-6 px-4 text-center text-xs text-slate-500 font-medium relative z-10 border-t border-blue-100/60 bg-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4">
          <p className="flex items-center gap-1.5 text-slate-500">
            <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>
              PlaceMind Autonomous Placement Operating System &bull; Permission-secured role isolation
            </span>
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setAboutModalOpen(true)}
              className="hover:text-[#2563EB] transition-colors cursor-pointer"
            >
              About
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setContactModalOpen(true)}
              className="hover:text-[#2563EB] transition-colors cursor-pointer"
            >
              Placement Cell
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL 1: ABOUT PLACEMIND */}
      {aboutModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setAboutModalOpen(false)}
              aria-label="Close dialog"
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#14213D]">About PlaceMind</h3>
                <p className="text-xs text-slate-500">Campus Placement Operating System</p>
              </div>
            </div>

            <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                PlaceMind is an enterprise campus placement automation platform designed to
                orchestrate every stage of institutional recruitment.
              </p>
              <ul className="space-y-2 pt-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-2 shrink-0" />
                  <span>
                    <strong>Students:</strong> Discover drives, check academic eligibility, optimize
                    resumes, and monitor interview rounds in real time.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-2 shrink-0" />
                  <span>
                    <strong>Recruiters:</strong> Publish opportunities, review qualified applicants,
                    schedule panels, and record candidate evaluations.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] mt-2 shrink-0" />
                  <span>
                    <strong>Placement Officers:</strong> Maintain institutional compliance, govern
                    company drives, assign interview rooms, and track real-time placement analytics.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAboutModalOpen(false)}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONTACT PLACEMENT CELL */}
      {contactModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setContactModalOpen(false)}
              aria-label="Close dialog"
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#14213D]">Placement Office Contact</h3>
                <p className="text-xs text-slate-500">Official Support & Administration</p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm text-slate-600">
              <p>
                For drive inquiries, student registration assistance, or recruiter partnerships,
                please contact the institutional placement cell:
              </p>
              <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>placement@institution.edu</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>+1 (800) 555-PLACEMIND</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>Training & Placement Cell, Academic Administration Wing</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
