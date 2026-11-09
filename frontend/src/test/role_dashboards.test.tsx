import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { RecruiterDashboard } from '../pages/recruiter/RecruiterDashboard';
import { Dashboard as PlacementOfficerDashboard } from '../pages/dashboard/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import { PlacementProvider } from '../context/PlacementContext';
import { apiService } from '../services/api';

// Helper wrapper
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      <PlacementProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </PlacementProvider>
    </AuthProvider>
  );
};

describe('Role-Based Dashboards Redesign Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders Student Dashboard with welcome banner, metrics, recent activity, and quick actions', async () => {
    vi.spyOn(apiService, 'getMyStudentDashboard').mockResolvedValue({
      student: {
        name: 'Dipesh Kumar',
        email: 'dipesh@demo.com',
        branch: 'CSE',
        batch: '2027',
        cgpa: 8.5,
        skills: ['React', 'TypeScript'],
        projects: [],
        experience: [],
        certifications: [],
        readinessScore: 85,
      },
      hasResume: true,
      appliedDriveIds: [],
      interviews: [],
      isNewUser: false,
      profileCompletion: 100,
      isProfileComplete: true,
      missingRequirements: [],
    });
    vi.spyOn(apiService, 'getMyApplications').mockResolvedValue([]);
    vi.spyOn(apiService, 'getStudentAssessmentAnalytics').mockResolvedValue(null as any);
    vi.spyOn(apiService, 'getStudentAssessments').mockResolvedValue([]);

    renderWithProviders(<StudentDashboard />);

    // Welcome banner elements
    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/Your placement journey continues here/i)).toBeInTheDocument();
    expect(screen.getByText(/Dream Big • Get Placed/i)).toBeInTheDocument();

    // 3 Key Metric Cards
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Placement Drives')).toBeInTheDocument();
    expect(screen.getByText('Profile Status')).toBeInTheDocument();

    // Recent Activity & Quick Actions
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Browse Placement Drives')).toBeInTheDocument();
    expect(screen.getByText('Update Your Profile')).toBeInTheDocument();
  });

  it('renders Recruiter Dashboard with welcome banner, metrics, recent drives, and quick actions', async () => {
    renderWithProviders(<RecruiterDashboard />);

    // Welcome banner elements
    expect(await screen.findByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage your placement drives and find the right talent/i)).toBeInTheDocument();
    expect(screen.getByText(/Build Your Team/i)).toBeInTheDocument();

    // 3 Key Metric Cards
    expect(screen.getByText('Active Drives')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Shortlisted')).toBeInTheDocument();

    // Recent Drives & Quick Actions
    expect(screen.getByText('Your Recent Drives')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Post a New Drive')).toBeInTheDocument();
    expect(screen.getAllByText(/View Applications/i).length).toBeGreaterThan(0);
  });

  it('renders Placement Officer Dashboard with welcome banner, metrics, upcoming interviews, and quick actions', async () => {
    renderWithProviders(<PlacementOfficerDashboard />);

    // Welcome banner elements
    expect(await screen.findByText(/Welcome back, Placement Officer!/i)).toBeInTheDocument();
    expect(screen.getByText(/Oversee campus placements and manage drives efficiently/i)).toBeInTheDocument();
    expect(screen.getByText(/Ensure Fair & Smooth Placements/i)).toBeInTheDocument();

    // 4 Key Metric Cards
    expect(screen.getByText('Total Drives')).toBeInTheDocument();
    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('Scheduled Interviews')).toBeInTheDocument();
    expect(screen.getByText('Final Selections')).toBeInTheDocument();

    // Upcoming Interviews & Quick Actions
    expect(screen.getByText('Upcoming Interviews')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Manage Drives')).toBeInTheDocument();
    expect(screen.getByText('View Reports')).toBeInTheDocument();
    expect(screen.getByText('Schedule Interviews')).toBeInTheDocument();
  });
});
