import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { apiService, AssessmentHistoryItem } from '../../services/api';

export const StudentAssessmentsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, [user]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const [histData, analData] = await Promise.all([
        apiService.getMyAssessmentsHistory().catch(() => []),
        apiService.getStudentAssessmentAnalytics().catch(() => null),
      ]);
      setHistory(histData || []);
      setAnalytics(analData);
    } catch (err) {
      console.warn('Failed to load assessment history', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return 'Recently';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="My Placement Assessments"
          subtitle="Review your historical placement test scores, coding submissions, and skill mastery."
          icon={<BrainCircuit className="w-5 h-5 text-white" />}
        />

        <Button
          variant="primary"
          onClick={() => navigate('/student/assessment')}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Take New Assessment
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        </div>
      ) : history.length === 0 ? (
        /* ZERO STATE (No fake/dummy data) */
        <Card className="bg-white border-slate-200 text-center py-16 px-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto mb-4">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h3 className="text-[#14213D] font-bold text-lg">No assessments completed yet</h3>
          <p className="text-[#64748B] text-sm max-w-md mx-auto mt-2">
            Practice coding and aptitude problems personalized to your tech stack. PrepBot generates placement-grade tests and evaluates your solutions in real time.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => navigate('/student/assessment')}
              className="inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Launch AI Assessment
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* KPI Analytics Cards */}
          {analytics && analytics.has_data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200 p-5 shadow-2xs">
                <div className="text-xs text-[#64748B] font-medium">Total Assessments</div>
                <div className="text-2xl font-bold text-[#14213D] mt-1 font-mono">{analytics.assessments_count}</div>
                <div className="text-[11px] text-[#2563EB] mt-1 font-semibold">Completed Attempts</div>
              </Card>

              <Card className="bg-white border-slate-200 p-5 shadow-2xs">
                <div className="text-xs text-[#64748B] font-medium">Average Overall Score</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{analytics.overall_average}%</div>
                <div className="text-[11px] text-[#64748B] mt-1">Placement Benchmarked</div>
              </Card>

              <Card className="bg-white border-slate-200 p-5 shadow-2xs">
                <div className="text-xs text-[#64748B] font-medium">Coding Accuracy</div>
                <div className="text-2xl font-bold text-[#2563EB] mt-1 font-mono">
                  {analytics.coding_average !== null ? `${analytics.coding_average}%` : 'N/A'}
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">DSA & Algorithms</div>
              </Card>

              <Card className="bg-white border-slate-200 p-5 shadow-2xs">
                <div className="text-xs text-[#64748B] font-medium">Aptitude Accuracy</div>
                <div className="text-2xl font-bold text-purple-700 mt-1 font-mono">
                  {analytics.aptitude_average !== null ? `${analytics.aptitude_average}%` : 'N/A'}
                </div>
                <div className="text-[11px] text-[#64748B] mt-1">Quant & Logical Reasoning</div>
              </Card>
            </div>
          )}

          {/* Assessment History Table */}
          <Card className="bg-white border-slate-200 overflow-hidden shadow-2xs">
            <CardHeader className="border-b border-slate-200 bg-[#F8FAFC]">
              <CardTitle className="text-[#14213D] text-base flex items-center gap-2 font-bold">
                <FileCheck className="w-5 h-5 text-[#2563EB]" />
                Assessment History Records
              </CardTitle>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Assessment Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Topics Covered</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {history.map((item: any) => {
                    const topicsList = Array.isArray(item.topics) ? item.topics : (item.topic ? [item.topic] : []);
                    const pct = item.percentage ?? item.total_score ?? null;
                    const dateStr = item.completed_at || item.allocated_at || item.created_at;
                    const isCompleted = item.status === 'Completed' || item.status === 'COMPLETED';

                    return (
                      <tr key={item.id || item.assessment_id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4 text-[#64748B] whitespace-nowrap text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                            {formatDate(dateStr)}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-medium text-[#14213D]">
                          {item.title || (item.company ? `${item.company} - ${item.job_title || 'Role'}` : `Personalized ${item.difficulty || 'Placement'} Assessment`)}
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#2563EB] border border-blue-200">
                            {item.round_type || item.type || 'APTITUDE'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-xs text-[#64748B] max-w-xs truncate">
                          {topicsList.length > 0 ? topicsList.join(', ') : 'Quantitative Aptitude, Reasoning'}
                        </td>

                        <td className="py-4 px-4 font-mono font-bold">
                          {pct !== null ? (
                            <span
                              className={
                                pct >= 70
                                  ? 'text-emerald-600'
                                  : pct >= 50
                                  ? 'text-[#2563EB]'
                                  : 'text-amber-600'
                              }
                            >
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-[#94A3B8] text-xs">--</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/student/assessments/${item.id || item.assessment_id}`)}
                            >
                              {item.status === 'IN_PROGRESS' ? 'Continue Test' : 'Start Test'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
