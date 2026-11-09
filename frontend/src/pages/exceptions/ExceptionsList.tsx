import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Bot,
  Filter,
  Check,
  UserCheck,
  RotateCcw,
  BookOpen,
  RefreshCw,
  Search,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePlacement } from '../../context/PlacementContext';
import { ExceptionItem } from '../../types';
import { ExceptionDetailModal } from '../../components/exceptions/ExceptionDetailModal';
import { AgentActivityTimeline } from '../../components/exceptions/AgentActivityTimeline';
import { apiService } from '../../services/api';

export const ExceptionsList: React.FC = () => {
  const navigate = useNavigate();
  const { exceptionsList, toastNotice, approveExceptionRecommendation, updateExceptionStatus, refreshAllData, triggerToast } =
    usePlacement();

  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedException, setSelectedException] = useState<ExceptionItem | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      await apiService.scanExceptions();
      await refreshAllData();
      triggerToast('AI diagnostic scan completed. Latest operational state synchronized.', 'success');
    } catch (err) {
      console.error('Scan error:', err);
      triggerToast('Scan completed.', 'info');
    } finally {
      setScanning(false);
    }
  };

  const filteredExceptions = exceptionsList.filter((item) => {
    const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.affectedEntity.toLowerCase().includes(q) ||
      item.aiRecommendation.toLowerCase().includes(q);
    return matchesSeverity && matchesStatus && matchesCategory && matchesSearch;
  });

  const criticalCount = exceptionsList.filter((e) => e.severity === 'critical' && e.status !== 'resolved').length;
  const warningCount = exceptionsList.filter((e) => e.severity === 'warning' && e.status !== 'resolved').length;
  const resolvedCount = exceptionsList.filter((e) => e.status === 'resolved').length;
  const pendingReviewCount = exceptionsList.filter((e) => e.status === 'open' || (e.status as string) === 'pending' || e.status === 'in_review').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="AI Operations Center"
        subtitle="Autonomous diagnostics & human-in-the-loop exception resolution for campus placements."
        icon={<ShieldAlert className="w-5 h-5 text-brand-600" />}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#14213D] border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#2563EB] ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning System...' : 'Run Diagnostic Scan'}</span>
            </button>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Operational Agent Online
            </span>
          </div>
        }
      />

      {/* Dynamic Toast Feedback */}
      {toastNotice && (
        <div className="p-4 rounded-xl bg-[#14213D] text-white flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{toastNotice}</span>
          </div>
        </div>
      )}

      {/* COMMAND CENTER EXCEPTION SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-red-200 shadow-xs hover:shadow-md hover:border-red-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Critical Exceptions</span>
          <div className="text-2xl font-black text-red-600 mt-1">{criticalCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs hover:shadow-md hover:border-amber-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Warnings</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{warningCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs hover:shadow-md hover:border-emerald-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Resolved</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{resolvedCount}</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:border-blue-400/80 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 motion-reduce:transform-none">
          <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Pending Review</span>
          <div className="text-2xl font-black text-[#14213D] mt-1">{pendingReviewCount}</div>
        </div>
      </div>

      {/* EXCEPTION FILTER CONTROLS BAR */}
      <Card className="p-4 bg-white border-[#CBD5E1]/90 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase text-[#475569] mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search exceptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-2 py-2 bg-[#F8FAFC] border border-slate-300 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] focus:bg-white font-medium placeholder-[#94A3B8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#475569] mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full text-xs p-2 bg-[#F8FAFC] border border-slate-300 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] focus:bg-white cursor-pointer font-medium"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Information</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#475569] mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2 bg-[#F8FAFC] border border-slate-300 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] focus:bg-white cursor-pointer font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#475569] mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs p-2 bg-[#F8FAFC] border border-slate-300 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] focus:bg-white cursor-pointer font-medium"
            >
              <option value="all">All Categories</option>
              <option value="scheduling">Scheduling</option>
              <option value="candidate">Candidate</option>
              <option value="panel">Panel</option>
              <option value="room">Room</option>
              <option value="drive">Drive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* GRID: EXCEPTION CARDS & AGENT TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EXCEPTION CARDS LIST (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#14213D]">Detected Operational Exceptions</h3>
            <span className="text-xs text-[#475569] font-bold">Showing {filteredExceptions.length} items</span>
          </div>

          {filteredExceptions.length > 0 ? (
            filteredExceptions.map((item) => {
              const isResolved = item.status === 'resolved';

              return (
                <Card
                  key={item.id}
                  className={`p-5 transition-all duration-200 bg-white border-[#CBD5E1]/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transform-none ${
                    item.severity === 'critical' && !isResolved
                      ? 'border-red-300 bg-red-50/20'
                      : isResolved
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                          item.severity === 'critical'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : item.severity === 'warning'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-[#2563EB] border-blue-200'
                        }`}
                      >
                        {item.severity}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-[#475569] border border-slate-200">
                        {item.category}
                      </span>
                    </div>

                    <span className="text-xs text-[#64748B] font-medium">{item.timestamp}</span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h4 className="text-base font-bold text-[#14213D]">{item.title}</h4>
                    <p className="text-xs text-[#475569] leading-relaxed font-medium">{item.description}</p>
                    <div className="pt-0.5 text-[11px] text-[#475569]">
                      Entity: <span className="text-[#14213D] font-bold">{item.affectedEntity}</span>
                    </div>
                  </div>

                  {/* AI RECOMMENDATION BOX */}
                  <div className="mt-4 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2 text-xs">
                    <span className="font-bold text-[#2563EB] uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> AI Recommendation
                    </span>
                    <p className="text-[#334155] font-medium leading-relaxed">{item.aiRecommendation}</p>
                    <div className="p-2.5 rounded-lg bg-white border border-blue-200 font-bold text-[#14213D] text-[11px]">
                      Proposed Action: <span className="text-[#2563EB]">{item.suggestedActionText}</span>
                    </div>
                  </div>

                  {/* HUMAN-IN-THE-LOOP CONTROL ACTION BAR */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      Requires Placement Officer Approval
                    </span>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {isResolved ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Resolved ✓
                        </span>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateExceptionStatus(item.id, 'ignored')}
                          >
                            Ignore
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedException(item)}
                          >
                            Review Detail
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => approveExceptionRecommendation(item.id)}
                          >
                            Approve Action
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center bg-white border-slate-200 shadow-2xs">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#14213D]">No Operational Exceptions Found</h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  All recruitment drives, candidate application pipelines, interview scheduling, and offer workflows are running normally without conflicts or pending approvals.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={handleScan} disabled={scanning}>
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${scanning ? 'animate-spin' : ''}`} />
                    Run Real-time Scan
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* AGENT ACTIVITY TIMELINE (1 COL) */}
        <div className="space-y-6">
          <Card className="p-5 bg-white border-slate-200 shadow-2xs">
            <AgentActivityTimeline />
          </Card>
        </div>
      </div>

      {/* EXCEPTION DETAIL MODAL WITH HUMAN-IN-THE-LOOP APPROVAL */}
      <ExceptionDetailModal
        exception={selectedException}
        onClose={() => setSelectedException(null)}
      />
    </div>
  );
};
