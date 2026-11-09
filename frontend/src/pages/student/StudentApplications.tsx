import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Calendar,
  Clock,
  RefreshCw,
  Loader2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiService } from '../../services/api';

export const StudentApplications: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'shortlisted' | 'applied'>('all');

  const fetchApplications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await apiService.getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch student applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED').length;
  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'shortlisted') return app.status === 'SHORTLISTED';
    if (statusFilter === 'applied') return app.status !== 'SHORTLISTED';
    return true;
  });

  return (
    <div className="space-y-6 pb-12 text-[#14213D]">
      <PageHeader
        title="My Applications"
        subtitle="Track your campus placement drives and external job applications in real-time."
        icon={<Briefcase className="w-5 h-5 text-[#2563EB]" />}
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={() => fetchApplications(true)}
              disabled={refreshing}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => navigate('/student/drives')}
            >
              Explore Drives
            </Button>
          </div>
        }
      />

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-[#CBD5E1]/90 text-[#14213D] shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#475569] font-bold">Total Submitted</span>
            <Briefcase className="w-4 h-4 text-[#2563EB]" />
          </div>
          <p className="text-2xl font-black mt-2 text-[#14213D]">{applications.length}</p>
          <span className="text-[11px] text-[#475569] font-medium">Active recruitment applications</span>
        </Card>

        <Card className="p-4 bg-white border border-[#CBD5E1]/90 text-[#14213D] shadow-xs hover:shadow-md hover:border-emerald-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#475569] font-bold">Shortlisted for Rounds</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-800">{shortlistedCount}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Ready for technical interviews</span>
        </Card>

        <Card className="p-4 bg-white border border-[#CBD5E1]/90 text-[#14213D] shadow-xs hover:shadow-md hover:border-amber-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#475569] font-bold">Under Review</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black mt-2 text-amber-800">
            {Math.max(0, applications.length - shortlistedCount)}
          </p>
          <span className="text-[11px] text-[#475569] font-medium">Recruiter screening in progress</span>
        </Card>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 bg-[#F1F5F9] p-1.5 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white text-[#2563EB] shadow-xs font-bold'
              : 'text-[#475569] hover:text-[#14213D]'
          }`}
        >
          All Applications ({applications.length})
        </button>
        <button
          onClick={() => setStatusFilter('shortlisted')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
            statusFilter === 'shortlisted'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-emerald-800 hover:bg-white/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Shortlisted ({shortlistedCount})
        </button>
        <button
          onClick={() => setStatusFilter('applied')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            statusFilter === 'applied'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'text-amber-800 hover:bg-white/60'
          }`}
        >
          Under Review ({Math.max(0, applications.length - shortlistedCount)})
        </button>
      </div>

      {/* APPLICATIONS LIST */}
      {loading ? (
        <Card className="p-12 text-center bg-white border border-[#CBD5E1]/90 shadow-xs">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#475569] font-medium">Loading your applications...</p>
        </Card>
      ) : filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => {
            const isShortlisted = app.status === 'SHORTLISTED';
            return (
              <Card
                key={app.id || `${app.drive_id}-${app.applied_at}`}
                className={`p-5 bg-white border transition-all duration-200 text-[#14213D] shadow-xs hover:shadow-md hover:-translate-y-1 active:translate-y-0 motion-reduce:transform-none ${
                  isShortlisted
                    ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
                    : 'border-[#CBD5E1]/90 hover:border-blue-400/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#14213D]">{app.company_name}</h3>
                      {app.source === 'external' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          External Opportunity
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
                          Campus Drive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#475569] font-medium mt-0.5">{app.job_title}</p>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold border flex items-center gap-1 shrink-0 ${
                      isShortlisted
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : app.status === 'EXTERNAL_APPLICATION_COMPLETED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : app.status === 'APPLICATION_STARTED'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-[#2563EB] border-blue-200'
                    }`}
                  >
                    {isShortlisted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : null}
                    {isShortlisted
                      ? 'Shortlisted'
                      : app.status === 'EXTERNAL_APPLICATION_COMPLETED'
                      ? 'Application Completed'
                      : app.status === 'APPLICATION_STARTED'
                      ? 'Application Started'
                      : 'Applied'}
                  </span>
                </div>

                {app.interview && (
                  <div className="mt-4 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {app.interview.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" /> {app.interview.time}
                      </span>
                    </div>
                    <div className="text-[#475569] text-[11px] flex items-center justify-between pt-1 border-t border-emerald-100">
                      <span>Panel: <strong className="text-[#14213D]">{app.interview.panel_name}</strong></span>
                      <span>Room: <strong className="text-[#14213D]">{app.interview.room_number || app.interview.room_name}</strong></span>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#475569]">
                  <span>Applied on: <strong className="text-[#14213D]">{app.applied_at}</strong></span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs py-1 px-2.5 bg-white border-slate-300 text-[#14213D] hover:bg-slate-50 shadow-xs"
                    onClick={() => navigate('/student/drives')}
                  >
                    View Opportunity &rarr;
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center bg-[#F8FAFC] border border-[#CBD5E1]/90 text-[#475569] space-y-3 shadow-xs">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-[#14213D]">No applications submitted yet</h3>
          <p className="text-xs text-[#475569] max-w-md mx-auto">
            Discover active campus placement drives matched against your resume profile.
          </p>
          <Button
            variant="primary"
            className="mt-2"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => navigate('/student/drives')}
          >
            Discover Placement Drives
          </Button>
        </Card>
      )}
    </div>
  );
};
