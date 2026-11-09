import React from 'react';
import { Bot, UserCheck, Clock, Sparkles } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';

export const AgentActivityTimeline: React.FC = () => {
  const { agentActivities } = usePlacement();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#14213D] flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#2563EB]" /> Agent Activity &amp; Audit Trail
        </h3>
        <span className="text-xs text-[#64748B] font-medium">Real-time autonomous log</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {agentActivities.map((event) => (
          <div key={event.id} className="relative flex items-start gap-3 text-xs">
            {/* Timeline Dot Indicator */}
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-xs ${
                event.type === 'officer_action'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#2563EB] text-white'
              }`}
            >
              {event.type === 'officer_action' ? (
                <UserCheck className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs w-full space-y-1 text-[#14213D]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#14213D] text-xs">{event.title}</span>
                <span className="text-[10px] font-semibold text-[#94A3B8] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#2563EB]" /> {event.timestamp}
                </span>
              </div>
              <p className="text-[#64748B] font-medium leading-relaxed">{event.detail}</p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-[#64748B] font-semibold uppercase">
                <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#475569]">{event.category}</span>
                <span className="text-[#2563EB]">{event.type.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
