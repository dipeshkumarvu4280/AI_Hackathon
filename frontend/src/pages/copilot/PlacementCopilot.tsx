import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Trash2,
  Bot,
  User,
  ArrowRight,
  Building2,
  Users,
  Calendar,
  AlertTriangle,
  BarChart2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Layers,
  History,
  RotateCcw,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { usePlacement } from '../../context/PlacementContext';
import { CopilotMessage, CopilotPrompt, CopilotActionProposal } from '../../types';
import { apiService } from '../../services/api';

const defaultSuggestedPrompts: CopilotPrompt[] = [
  { id: 'p-1', text: 'What placement actions need attention?', category: 'Pending Exceptions' },
  { id: 'p-2', text: 'Which rooms are free right now?', category: 'Venue Availability' },
  { id: 'p-3', text: 'Show active placement drives.', category: 'Drives' },
  { id: 'p-4', text: 'Who are the top candidate profiles?', category: 'Candidate Matching' },
];

export const PlacementCopilot: React.FC = () => {
  const navigate = useNavigate();
  const { triggerToast } = usePlacement();

  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('Analyzing live placement data...');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<Array<{ query: string; timestamp: string }>>([]);

  // Action Confirmation state
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setSessionHistory((prev) => [...prev, { query, timestamp: timeStr }]);
    if (!textToSend) setInputText('');

    setIsProcessing(true);
    setProcessingStage('Querying PlaceMind live database...');
    setActionError(null);

    try {
      // Build conversation history format for LLM context
      const historyContext = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const response = await apiService.sendCopilotQuery(query, historyContext);
      setIsProcessing(false);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      setIsProcessing(false);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: "Live placement data is temporarily unavailable. Please verify backend services and try again.",
          timestamp,
        },
      ]);
    }
  };

  const handleConfirmAction = async (messageId: string, proposal: CopilotActionProposal) => {
    setIsExecutingAction(true);
    setActionError(null);

    try {
      const result = await apiService.executeCopilotAction({
        action_type: proposal.action_type,
        details: proposal.details,
      });

      // Update message state to mark proposal as executed
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.actionProposal) {
            return {
              ...msg,
              actionProposal: {
                ...msg.actionProposal,
                confirmed: true,
                executed: true,
              },
            };
          }
          return msg;
        })
      );

      // Append system confirmation message
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-confirm-${Date.now()}`,
          sender: 'assistant',
          text: `✅ ${result.message}\nInterview has been saved to the canonical PlaceMind schedule. Candidate has been notified.`,
          timestamp: timeStr,
          actionButton: {
            label: 'View Interview Schedule',
            route: '/interviews',
          },
        },
      ]);

      triggerToast('Interview scheduled successfully via Placement Copilot!', 'info');
    } catch (err: any) {
      console.error('Copilot action execution failed:', err);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to execute proposed placement action.';
      setActionError(errorMsg);
      triggerToast(errorMsg, 'error');
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleCancelAction = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            actionProposal: undefined,
          };
        }
        return msg;
      })
    );
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-cancel-${Date.now()}`,
        sender: 'assistant',
        text: 'Placement action was cancelled. No changes were made to the database.',
        timestamp: timeStr,
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Placement Copilot AI"
        subtitle="Conversational operations assistant grounded in live PlaceMind placement drives, venue rooms, panels, and candidate data."
        icon={<Bot className="w-5 h-5 text-white" />}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<History className="w-4 h-4" />}
              onClick={() => setShowHistoryModal(true)}
            >
              Session History ({sessionHistory.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                setMessages([]);
                setActionError(null);
              }}
            >
              Clear Chat
            </Button>
          </div>
        }
      />

      {/* MAIN COPILOT WORKSPACE CARD */}
      <Card className="p-0 border-[#CBD5E1]/90 bg-white overflow-hidden shadow-xs">
        {/* COPILOT HEADER */}
        <div className="p-4 border-b border-slate-200 bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#14213D] flex items-center gap-2">
                <span>PlaceMind Operations Copilot</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live Database Grounded
                </span>
              </h3>
              <p className="text-[11px] text-[#475569] font-medium">Powered by Google Gemini &amp; Authoritative MongoDB Context</p>
            </div>
          </div>
        </div>

        {/* CHAT MESSAGES DISPLAY */}
        <div className="p-6 min-h-[420px] max-h-[520px] overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#14213D]">How can I assist your recruitment operations today?</h3>
                <p className="text-xs text-[#475569] mt-1 max-w-md mx-auto leading-relaxed font-medium">
                  Ask about verified room availability, active placement drives, panel schedules, or top candidate matches. Select a verified prompt or type your query below.
                </p>
              </div>

              {/* SUGGESTED PROMPTS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto pt-2">
                {defaultSuggestedPrompts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSend(p.text)}
                    className="p-3.5 rounded-xl border border-[#CBD5E1]/90 bg-[#F8FAFC] hover:bg-white hover:border-blue-400/80 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-xs font-semibold text-[#14213D] flex items-start gap-2.5 group cursor-pointer shadow-xs motion-reduce:transform-none"
                  >
                    <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="block text-[#14213D] font-bold">{p.text}</span>
                      <span className="text-[10px] text-[#475569] block mt-0.5 font-medium">{p.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ACTIVE CHAT HISTORY */
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 text-xs animate-in fade-in ${
                  msg.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-xl space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-[#2563EB] text-white p-3.5 rounded-2xl rounded-tr-none font-medium shadow-xs'
                      : 'bg-[#F8FAFC] border border-slate-200 text-[#14213D] p-4 rounded-2xl rounded-tl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed font-medium">{msg.text}</p>

                  {/* STRUCTURED CARDS */}
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {msg.cards.map((c, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white border border-[#CBD5E1]/90 text-[#14213D] space-y-1 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{c.title}</span>
                            {c.badge && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                c.badge === 'Available' || c.badge === 'ACTIVE' || c.badge === 'Shortlisted'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : c.badge === 'Booked' || c.badge === 'Action Needed'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-blue-50 text-[#2563EB] border-blue-200'
                              }`}>
                                {c.badge}
                              </span>
                            )}
                          </div>
                          {c.subtitle && <p className="text-[11px] font-bold text-[#14213D]">{c.subtitle}</p>}
                          {c.detail && <p className="text-[11px] text-[#475569] font-medium">{c.detail}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* INTERACTIVE ACTION PROPOSAL CONFIRMATION CARD */}
                  {msg.actionProposal && !msg.actionProposal.executed && (
                    <div className="mt-3 p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#2563EB]" />
                          <span className="text-xs font-bold text-[#14213D] uppercase tracking-wider">
                            Proposed Placement Action
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Verified Available
                        </span>
                      </div>

                      <p className="text-xs text-[#475569] leading-relaxed font-medium">
                        {msg.actionProposal.summary}
                      </p>

                      {actionError && (
                        <div className="p-2 rounded bg-red-50 border border-red-200 text-[11px] text-red-700">
                          {actionError}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={isExecutingAction}
                          onClick={() => handleConfirmAction(msg.id, msg.actionProposal!)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          {isExecutingAction ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirm &amp; Schedule
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isExecutingAction}
                          onClick={() => handleCancelAction(msg.id)}
                          className="text-xs text-[#475569] hover:text-[#14213D]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {msg.actionProposal && msg.actionProposal.executed && (
                    <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Interview confirmed and scheduled in PlaceMind database.</span>
                    </div>
                  )}

                  {/* CONTEXTUAL ACTION BUTTON */}
                  {msg.actionButton && (
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        onClick={() => navigate(msg.actionButton!.route)}
                      >
                        {msg.actionButton.label}
                      </Button>
                    </div>
                  )}

                  <span className={`text-[10px] block text-right font-medium ${msg.sender === 'user' ? 'text-white/80' : 'text-[#64748B]'}`}>{msg.timestamp}</span>
                </div>
              </div>
            ))
          )}

          {/* PROCESSING STATE */}
          {isProcessing && (
            <div className="flex items-center gap-3 text-xs text-[#2563EB] font-bold bg-blue-50 p-3.5 rounded-xl border border-blue-200 animate-pulse">
              <Bot className="w-4 h-4 animate-spin text-[#2563EB]" />
              <span>{processingStage}</span>
            </div>
          )}
        </div>

        {/* INPUT COMPOSER */}
        <div className="p-4 border-t border-slate-200 bg-[#F8FAFC]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot about room availability, drives, top candidates, or schedule an interview..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs p-3 bg-white border border-slate-300 text-[#14213D] placeholder-[#94A3B8] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 font-medium shadow-xs"
            />
            <Button variant="primary" type="submit" icon={<Send className="w-4 h-4" />} disabled={isProcessing}>
              Send
            </Button>
          </form>
        </div>
      </Card>

      {/* SESSION HISTORY MODAL */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Copilot Session History"
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          <p className="text-xs text-[#64748B]">
            Review queries asked in this Copilot session. Click any query to re-execute it against live data.
          </p>
          {sessionHistory.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#64748B] bg-slate-50 rounded-xl border border-slate-200">
              No queries in this session yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessionHistory.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setShowHistoryModal(false);
                    handleSend(item.query);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-1">
                    <span>Query #{i + 1}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#14213D] truncate">{item.query}</p>
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setShowHistoryModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
