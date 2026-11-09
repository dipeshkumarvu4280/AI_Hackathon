import React, { useEffect, useState, useCallback } from 'react';
import { History, Filter, RefreshCw, Search, Database, AlertCircle } from 'lucide-react';
import { apiService, AuditLogItem } from '../../services/api';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { role?: string; entity?: string; search?: string } = {};
      if (filterRole !== 'all') params.role = filterRole;
      if (filterEntity !== 'all') params.entity = filterEntity;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await apiService.getAuditLogs(params);
      setLogs(data || []);
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
      setError(err?.response?.data?.detail || 'Unable to load audit trail records.');
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterEntity, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-[#F8FAFC] to-[#E8F0FE]/60 p-6 rounded-2xl border border-[#CBD5E1]/90 text-[#14213D] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5 text-[#2563EB]" /> Immutable Audit &amp; History Log
          </div>
          <h1 className="text-2xl font-black text-[#14213D] tracking-tight">System Audit Log</h1>
          <p className="text-xs text-[#475569] mt-1 font-medium">
            Complete activity audit trail tracking approvals, drive creation, student applications, shortlists, interview scheduling, and offer events.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#14213D] border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#2563EB] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Log Filters & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-[#CBD5E1]/90 shadow-xs text-[#14213D]">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-3.5 h-3.5 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, action, entity, or detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-slate-300 text-[#14213D] placeholder-[#94A3B8] rounded-lg text-xs font-medium focus:outline-none focus:border-[#2563EB] focus:bg-white"
          />
        </div>

        {/* Role Filter */}
        <div className="md:col-span-3 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-slate-300 text-[#14213D] rounded-lg text-xs font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="placement_officer">Placement Officer</option>
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin / System</option>
          </select>
        </div>

        {/* Entity Filter */}
        <div className="md:col-span-3 flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-slate-300 text-[#14213D] rounded-lg text-xs font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white cursor-pointer"
          >
            <option value="all">All Entities</option>
            <option value="Drive">Drive</option>
            <option value="Application">Application</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="PracticeInterview">Practice Interview</option>
            <option value="Auth">Auth</option>
            <option value="Student">Student</option>
            <option value="Recruiter">Recruiter</option>
          </select>
        </div>
      </div>

      {/* Error state if any */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#CBD5E1]/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#14213D] border-collapse">
            <thead className="bg-[#F1F5F9] text-[#475569] uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 pl-5">Timestamp</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5 pr-5">Event Summary &amp; Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-[#14213D]">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#475569]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 text-[#2563EB] animate-spin" />
                      <span>Loading immutable audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3.5 pl-5 font-mono text-[#475569] whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3.5 font-bold text-[#14213D]">{log.userName}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-[#475569] border border-slate-200 capitalize">
                        {(log.userRole || 'system').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-[#2563EB] font-mono">{log.action}</td>
                    <td className="p-3.5 text-[#14213D] font-semibold">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px]">
                        {log.entity}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-[#334155]">{log.detail}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#475569] font-medium">
                    No audit records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
