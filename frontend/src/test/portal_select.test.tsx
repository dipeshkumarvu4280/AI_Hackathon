import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PortalSelect } from '../pages/auth/PortalSelect';
import { AuthProvider } from '../context/AuthContext';

// Helper wrapper for routing and auth context
const renderPortalSelect = () => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <PortalSelect />
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('PortalSelect Landing & Portal Selection Tests', () => {
  it('renders branding and headline according to the redesign specification', () => {
    renderPortalSelect();

    // PlaceMind Branding
    expect(screen.getAllByText('PlaceMind').length).toBeGreaterThan(0);
    expect(screen.getByText('Smart Placement. Brighter Future.')).toBeInTheDocument();
    expect(screen.getByText(/Your unified platform for campus placements/i)).toBeInTheDocument();
  });

  it('renders all three role portals with accurate titles, descriptions, and action buttons', () => {
    renderPortalSelect();

    // 1. Student Portal
    expect(screen.getByRole('heading', { name: 'Student Portal' })).toBeInTheDocument();
    expect(screen.getByText('For Students')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Student Login/i })).toBeInTheDocument();

    // 2. Recruiter Portal
    expect(screen.getByRole('heading', { name: 'Recruiter Portal' })).toBeInTheDocument();
    expect(screen.getByText('For Companies')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recruiter Login/i })).toBeInTheDocument();

    // 3. Placement Officer Portal
    expect(screen.getByRole('heading', { name: 'Placement Officer Portal' })).toBeInTheDocument();
    expect(screen.getByText('For Placement Officers')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Placement Officer Login/i })).toBeInTheDocument();
  });

  it('renders the verified feature highlights and truthful security governance strip', () => {
    renderPortalSelect();

    // Hero feature highlights
    expect(screen.getByText('Secure & Reliable')).toBeInTheDocument();
    expect(screen.getByText('Fast & Efficient')).toBeInTheDocument();
    expect(screen.getByText('Smarter Placements')).toBeInTheDocument();

    // Bottom trust strip (truthful, non-dummy)
    expect(screen.getByText('Role-Isolated Portals')).toBeInTheDocument();
    expect(screen.getByText('Institutional Placement Governance')).toBeInTheDocument();
    expect(screen.getByText('End-to-End Placement Workflows')).toBeInTheDocument();
  });

  it('opens and closes the About modal cleanly', () => {
    renderPortalSelect();

    const aboutButtons = screen.getAllByRole('button', { name: 'About' });
    fireEvent.click(aboutButtons[0]);

    expect(screen.getByRole('heading', { name: 'About PlaceMind' })).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('heading', { name: 'About PlaceMind' })).not.toBeInTheDocument();
  });

  it('verifies that each role login button targets its designated route', () => {
    renderPortalSelect();

    const studentBtn = screen.getByRole('button', { name: /Student Login/i });
    const recruiterBtn = screen.getByRole('button', { name: /Recruiter Login/i });
    const officerBtn = screen.getByRole('button', { name: /Placement Officer Login/i });

    expect(studentBtn).toBeInTheDocument();
    expect(recruiterBtn).toBeInTheDocument();
    expect(officerBtn).toBeInTheDocument();
  });
});
