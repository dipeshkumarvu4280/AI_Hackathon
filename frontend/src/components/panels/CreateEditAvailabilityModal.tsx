import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  Building2,
  DoorOpen,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CreateEditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot?: any | null; // if passed, we are editing
  onSave: (slotData: any) => Promise<void>;
}

export const CreateEditAvailabilityModal: React.FC<CreateEditAvailabilityModalProps> = ({
  isOpen,
  onClose,
  slot,
  onSave,
}) => {
  const [panelName, setPanelName] = useState('');
  const [panelMembers, setPanelMembers] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');
  const [block, setBlock] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (slot) {
      setPanelName(slot.panel_name || '');
      setPanelMembers(
        Array.isArray(slot.panel_members)
          ? slot.panel_members.join(', ')
          : slot.panel_members || ''
      );
      setDate(slot.date || '2026-08-25');
      setStartTime(slot.start_time || '10:00 AM');
      setEndTime(slot.end_time || '10:30 AM');
      setBlock(slot.block || 'Block B');
      setRoomNumber(slot.room_number || 'B-204');
      setStatus(slot.status || 'AVAILABLE');
    } else {
      setPanelName('');
      setPanelMembers('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('10:00 AM');
      setEndTime('10:30 AM');
      setBlock('');
      setRoomNumber('');
      setStatus('AVAILABLE');
    }
    setErrorMsg('');
  }, [slot, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!slot;
  const isAssigned = slot?.status === 'ASSIGNED' || !!slot?.assigned_student_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panelName.trim() || !date.trim() || !startTime.trim() || !block.trim() || !roomNumber.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const membersArray = panelMembers
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const payload = {
      panel_name: panelName.trim(),
      panel_members: membersArray,
      date: date.trim(),
      start_time: startTime.trim(),
      end_time: endTime.trim(),
      block: block.trim(),
      room_number: roomNumber.trim(),
      status: isAssigned ? 'ASSIGNED' : status,
    };

    setLoading(true);
    setErrorMsg('');
    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to save availability slot.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14213D]">
                {isEditing ? 'Edit Interview Availability' : 'Add Interview Availability'}
              </h3>
              <p className="text-xs text-[#64748B]">
                {isEditing
                  ? 'Modify interview panel, room, block, and timing availability.'
                  : 'Manually configure new interview panel and room availability.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#14213D] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assigned Warning Banner */}
        {isAssigned && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Slot is already assigned to a candidate</strong>
              <span>
                Assigned to: <strong className="text-[#14213D]">{slot.assigned_student_name || slot.assigned_student_id}</strong>
                {slot.assigned_company_name ? ` (${slot.assigned_company_name})` : ''}. Modifying this slot may affect the scheduled interview.
              </span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs text-[#14213D]">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 font-semibold text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Panel Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              Panel Name *
            </label>
            <input
              type="text"
              required
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              placeholder="e.g. Technical Panel A, Core Systems Panel"
              className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Panel Members */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              Panel Members (comma-separated)
            </label>
            <input
              type="text"
              value={panelMembers}
              onChange={(e) => setPanelMembers(e.target.value)}
              placeholder="e.g. Dr. Suresh, Prof. Anjali Roy"
              className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Start Time *
              </label>
              <input
                type="text"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                End Time *
              </label>
              <input
                type="text"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:30 AM"
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Block & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Block *
              </label>
              <input
                type="text"
                required
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="e.g. Block B, Tech Tower"
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Room Number *
              </label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. B-204, Room 102"
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Availability Status */}
          {!isAssigned && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Availability Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 text-[#14213D] rounded-xl focus:outline-none focus:border-[#2563EB] cursor-pointer"
              >
                <option value="AVAILABLE">AVAILABLE (Can be assigned)</option>
                <option value="UNAVAILABLE">UNAVAILABLE (Cannot be selected)</option>
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {loading ? 'Saving Slot...' : isEditing ? 'Update Availability' : 'Save Availability'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
