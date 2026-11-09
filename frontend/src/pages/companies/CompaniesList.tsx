import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Filter,
  Search,
  Users,
  Briefcase,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  Check,
  X,
  Edit3,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Company, PlacementDrive } from '../../types';
import { isDrivePendingApproval, isDriveActiveOrAnnounced } from '../../utils/driveStatus';
import { CreateDriveModal } from '../../components/companies/CreateDriveModal';
import { CompanyLogo } from '../../components/ui/CompanyLogo';
import { usePlacement } from '../../context/PlacementContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

export const CompaniesList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    drives: drivesList,
    createDrive,
    updateDrive,
    approveDrive,
    rejectDrive,
    requestDriveChanges,
    triggerToast,
  } = usePlacement();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [driveToEdit, setDriveToEdit] = useState<PlacementDrive | null>(null);

  useEffect(() => {
    apiService.getCompanies()
      .then((res) => { if (res) setCompanies(res); })
      .catch(() => {});
  }, []);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Review Modal State (for Reject / Request Changes reasons)
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    type: 'reject' | 'request_changes';
    driveId: string;
    driveTitle: string;
    companyName: string;
  } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isPlacementOfficer = user?.role === 'placement_officer' || user?.role === ('admin' as any);

  const handleDriveCreated = (newDrive: PlacementDrive) => {
    createDrive(newDrive);
  };

  const handleDriveUpdated = (updatedDrive: PlacementDrive) => {
    updateDrive(updatedDrive.id, updatedDrive);
  };

  const handleQuickApprove = async (e: React.MouseEvent, driveId: string, company: string, role: string) => {
    e.stopPropagation();
    await approveDrive(driveId);
  };

  const handleOpenReviewModal = (e: React.MouseEvent, type: 'reject' | 'request_changes', drive: PlacementDrive) => {
    e.stopPropagation();
    setReviewModal({
      isOpen: true,
      type,
      driveId: drive.id,
      driveTitle: drive.roleTitle,
      companyName: drive.companyName,
    });
    setReviewNote(type === 'reject' ? 'Role requirements do not align with current semester placement criteria.' : 'Please update the minimum CGPA and eligible branch list.');
  };

  const handleSubmitReviewAction = async () => {
    if (!reviewModal) return;
    setIsSubmittingReview(true);
    try {
      if (reviewModal.type === 'reject') {
        await rejectDrive(reviewModal.driveId, reviewNote);
      } else {
        await requestDriveChanges(reviewModal.driveId, reviewNote);
      }
      setReviewModal(null);
    } catch {
      triggerToast('Action completed.', 'info');
      setReviewModal(null);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const pendingCount = drivesList.filter(
    (d) => isDrivePendingApproval(d.status)
  ).length;

  const activeCount = drivesList.filter(
    (d) => isDriveActiveOrAnnounced(d.status)
  ).length;

  const filteredDrives = drivesList.filter((drive) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      drive.companyName.toLowerCase().includes(q) ||
      drive.roleTitle.toLowerCase().includes(q) ||
      drive.requiredSkills.some((s) => s.toLowerCase().includes(q));

    let matchesStatus = true;
    if (statusFilter === 'pending_approval') {
      matchesStatus = isDrivePendingApproval(drive.status);
    } else if (statusFilter === 'active') {
      matchesStatus = isDriveActiveOrAnnounced(drive.status);
    } else if (statusFilter !== 'all') {
      matchesStatus = drive.status?.toLowerCase() === statusFilter.toLowerCase();
    }

    const matchesType = typeFilter === 'all' || drive.employmentType === typeFilter;
    const matchesBranch = branchFilter === 'all' || drive.eligibleBranches.includes(branchFilter);
    const matchesLocation =
      locationFilter === 'all' || drive.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType && matchesBranch && matchesLocation;
  });

  return (
    <div className="space-y-6 pb-12 text-[#14213D]">
      {/* Header */}
      <PageHeader
        title="Companies & Placement Drives"
        subtitle="Manage company requirements, recruiter job submissions, and AI-assisted approval workflows."
        icon={<Building2 className="w-5 h-5 text-[#2563EB]" />}
        action={
          user?.role === 'recruiter' ? (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setDriveToEdit(null);
                setIsModalOpen(true);
              }}
            >
              Create Placement Drive
            </Button>
          ) : undefined
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Total Drives</span>
          <div className="text-2xl font-black text-[#14213D] mt-1">{drivesList.length}</div>
        </div>
        <div
          onClick={() => setStatusFilter(statusFilter === 'pending_approval' ? 'all' : 'pending_approval')}
          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-1 active:translate-y-0 motion-reduce:transform-none ${
            statusFilter === 'pending_approval'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-[#CBD5E1]/90 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Approvals
            </span>
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                ACTION REQ
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-emerald-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Active &amp; Published</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Active Applicants</span>
          <div className="text-2xl font-black text-[#2563EB] mt-1">
            {drivesList.reduce((acc, d) => acc + (d.registeredCount || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4 bg-white border-[#CBD5E1]/90 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
            <input
              type="text"
              placeholder="Search company, role, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] focus:bg-white border border-slate-300 text-[#14213D] placeholder-[#94A3B8] rounded-lg focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 bg-[#F8FAFC] focus:bg-white border border-slate-300 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] cursor-pointer font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending_approval">Pending Approval ({pendingCount})</option>
            <option value="active">Active / Published</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>

          {/* Job Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs p-2 bg-[#F8FAFC] focus:bg-white border border-slate-300 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] cursor-pointer font-medium"
          >
            <option value="all">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="PPO">PPO</option>
          </select>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="text-xs p-2 bg-[#F8FAFC] focus:bg-white border border-slate-300 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] cursor-pointer font-medium"
          >
            <option value="all">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="Mechanical">Mechanical</option>
          </select>
        </div>
      </Card>

      {/* Placement Drives Table */}
      <Card className="bg-white border-[#CBD5E1]/90 text-[#14213D] shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-[#F8FAFC]/50">
          <CardTitle className="text-base font-bold text-[#14213D]">Placement Drives List</CardTitle>
          <span className="text-xs text-[#475569] font-bold">Showing {filteredDrives.length} drives</span>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredDrives.length === 0 ? (
            <div className="p-12 text-center text-[#475569] space-y-2 bg-[#F8FAFC]">
              <Building2 className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
              <p className="text-sm font-bold text-[#14213D]">No placement drives match your filters</p>
              <p className="text-xs text-[#475569]">Try selecting a different status or clear your search.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-[#14213D] border-collapse min-w-[860px]">
              <thead className="bg-[#F1F5F9] text-[11px] font-bold uppercase tracking-wider text-[#475569] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 w-[28%] min-w-[220px]">Company &amp; Role</th>
                  <th className="px-4 py-3.5 w-[12%] min-w-[100px]">Location</th>
                  <th className="px-4 py-3.5 w-[10%] min-w-[90px]">Package</th>
                  <th className="px-4 py-3.5 w-[16%] min-w-[130px]">Eligibility</th>
                  <th className="px-4 py-3.5 w-[8%] min-w-[75px] text-center">Applicants</th>
                  <th className="px-4 py-3.5 w-[12%] min-w-[110px]">Status</th>
                  <th className="px-4 py-3.5 w-[10%] min-w-[90px]">Deadline</th>
                  <th className="px-4 py-3.5 w-[14%] min-w-[130px] text-right">Review / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrives.map((drive) => {
                  const isPending = (drive.status || '').toLowerCase() === 'pending_approval';

                  return (
                    <tr
                      key={drive.id}
                      onClick={() => navigate(user?.role === 'recruiter' ? `/recruiter/drives` : `/companies/${drive.id}`)}
                      className={`transition-colors hover:bg-blue-50/40 cursor-pointer text-[#14213D] ${
                        isPending ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      {/* Company & Role */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3 min-w-0">
                          <CompanyLogo
                            logo={drive.companyLogo}
                            name={drive.companyName}
                            size="md"
                          />
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="font-bold text-[#14213D] text-sm flex items-center gap-1.5 min-w-0">
                              <span className="truncate" title={drive.companyName}>{drive.companyName}</span>
                              {drive.aiConfirmed && (
                                <span className="p-0.5 rounded bg-blue-50 text-[#2563EB] shrink-0" title="Verified JD">
                                  <Sparkles className="w-3 h-3 text-[#2563EB]" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#475569] font-medium break-words">
                              {drive.roleTitle} &bull; <span className="text-[#64748B]">{drive.employmentType}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 align-middle whitespace-normal break-words">
                        <span className="font-semibold text-[#475569]">{drive.location}</span>
                      </td>

                      {/* Package */}
                      <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                        <span className="font-bold text-emerald-800 text-sm">₹{drive.packageLpa} LPA</span>
                      </td>

                      {/* Eligibility */}
                      <td className="px-4 py-3.5 align-middle whitespace-normal">
                        <div className="text-[#475569] space-y-1">
                          <div className="font-bold text-[#14213D] text-xs">Min CGPA: {drive.minCgpa}</div>
                          <div className="flex flex-wrap gap-1">
                            {drive.eligibleBranches.map((b) => (
                              <span key={b} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#475569]">
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Applications */}
                      <td className="px-4 py-3.5 align-middle text-center whitespace-nowrap">
                        <span className="font-bold text-[#14213D] text-sm">{drive.registeredCount || 0}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                        <StatusBadge status={drive.status} />
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-3.5 align-middle text-xs font-semibold text-[#475569] whitespace-nowrap">
                        {drive.deadline}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 align-middle text-right whitespace-nowrap">
                        {isPlacementOfficer && isPending ? (
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleQuickApprove(e, drive.id, drive.companyName, drive.roleTitle)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                              title="Approve &amp; Publish to Students"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={(e) => handleOpenReviewModal(e, 'request_changes', drive)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              title="Request Changes"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={(e) => handleOpenReviewModal(e, 'reject', drive)}
                              className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Reject Drive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(user?.role === 'recruiter' ? `/recruiter/drives` : `/companies/${drive.id}`);
                            }}
                            className="p-1.5 text-[#64748B] hover:text-[#14213D] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Recruiter Partner Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#14213D]">Visiting Campus Recruiters</h3>
        {companies.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B] bg-white rounded-2xl border border-slate-200">
            No visiting recruiters registered yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {companies.map((c) => (
              <Card key={c.id} className="p-4 bg-white border-slate-200 text-[#14213D] hover:border-blue-300 transition-all shadow-xs">
                <div className="flex items-start justify-between">
                  <CompanyLogo logo={c.logo} name={c.name} size="md" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-100">
                    {c.tier || 'Tier 1'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#14213D] mt-3">{c.name}</h4>
                <p className="text-xs text-[#64748B] mt-0.5 font-medium">{c.industry}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-[#64748B] space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="text-[#475569]">{c.location}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Job Description Analysis Modal */}
      <CreateDriveModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDriveToEdit(null);
        }}
        initialDrive={driveToEdit}
        onDriveCreated={handleDriveCreated}
        onDriveUpdated={handleDriveUpdated}
      />

      {/* Officer Drive Review Modal (Reject / Request Changes) */}
      {reviewModal && reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4 text-[#14213D]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-5 h-5 ${reviewModal.type === 'reject' ? 'text-red-600' : 'text-[#2563EB]'}`} />
                <h3 className="text-base font-bold text-[#14213D]">
                  {reviewModal.type === 'reject' ? 'Reject Placement Drive' : 'Request Changes from Recruiter'}
                </h3>
              </div>
              <button onClick={() => setReviewModal(null)} className="text-[#64748B] hover:text-[#14213D]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#64748B] space-y-1">
              <p>Company: <strong className="text-[#14213D]">{reviewModal.companyName}</strong></p>
              <p>Role: <strong className="text-[#14213D]">{reviewModal.driveTitle}</strong></p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#14213D]">
                {reviewModal.type === 'reject' ? 'Reason for Rejection' : 'Specific Changes Required'}
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg text-[#14213D] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                placeholder={reviewModal.type === 'reject' ? 'Enter reason for rejection...' : 'Specify what needs to be changed before approval...'}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setReviewModal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className={reviewModal.type === 'reject' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-[#2563EB] hover:bg-blue-700 text-white'}
                onClick={handleSubmitReviewAction}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? 'Submitting...' : reviewModal.type === 'reject' ? 'Confirm Rejection' : 'Send Change Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
