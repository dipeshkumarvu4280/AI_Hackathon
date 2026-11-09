import React, { useState, useEffect } from 'react';
import {
  DoorOpen,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Building2,
  CalendarCheck,
  AlertTriangle,
  Layers,
  ChevronRight,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { usePlacement } from '../../context/PlacementContext';
import { CreatePanelModal } from '../../components/panels/CreatePanelModal';
import { CreateEditAvailabilityModal } from '../../components/panels/CreateEditAvailabilityModal';
import { RoomScheduleTimeline } from '../../components/rooms/RoomScheduleTimeline';
import { apiService } from '../../services/api';
import { Room, Panel } from '../../types';

export const PanelsList: React.FC = () => {
  const { panelsList, roomsList, interviewsList, exceptionsList, confirmPanel, triggerToast } = usePlacement();
  const [activeTab, setActiveTab] = useState<'availability' | 'panels' | 'rooms' | 'assignments' | 'conflicts'>('availability');

  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any | null>(null);

  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(roomsList[0] || null);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const data = await apiService.getInterviewAvailability();
      setAvailabilitySlots(data || []);
    } catch (err) {
      console.error('Failed to fetch availability slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSaveSlot = async (slotData: any) => {
    if (editingSlot) {
      await apiService.updateInterviewAvailability(editingSlot.id, slotData);
      triggerToast('Interview availability slot updated successfully.', 'success');
    } else {
      await apiService.createInterviewAvailability(slotData);
      triggerToast('New interview availability slot saved.', 'success');
    }
    await fetchSlots();
  };

  const handleDeleteSlot = async (slot: any) => {
    if (slot.status === 'ASSIGNED' || slot.assigned_student_id) {
      alert('This interview slot is already assigned to a candidate. Reschedule or unassign the candidate before deleting.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete availability for ${slot.panel_name} on ${slot.date}?`)) {
      try {
        await apiService.deleteInterviewAvailability(slot.id);
        triggerToast('Availability slot deleted.', 'info');
        await fetchSlots();
      } catch (err: any) {
        const msg = err?.response?.data?.detail || err?.message || 'Failed to delete slot.';
        alert(msg);
      }
    }
  };

  const panelAndRoomConflicts = exceptionsList.filter(
    (e) => e.category === 'panel' || e.category === 'room' || e.category === 'scheduling'
  );

  return (
    <div className="space-y-6 pb-12 text-[#14213D]">
      {/* Page Header */}
      <PageHeader
        title="Panels & Rooms"
        subtitle="Manage manual interview availability, panel allocations, room capacity, and conflict resolution."
        icon={<DoorOpen className="w-5 h-5 text-white" />}
        action={
          activeTab === 'availability' ? (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingSlot(null);
                setIsAvailabilityModalOpen(true);
              }}
            >
              + Add Interview Availability
            </Button>
          ) : activeTab === 'panels' ? (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreatePanelOpen(true)}
            >
              Create Panel
            </Button>
          ) : undefined
        }
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'availability'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#475569] hover:text-[#14213D]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Interview Availability ({availabilitySlots.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('panels')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'panels'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#475569] hover:text-[#14213D]'
          }`}
        >
          Panels ({panelsList.length})
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rooms'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#14213D]'
          }`}
        >
          Rooms ({roomsList.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#64748B] hover:text-[#14213D]'
          }`}
        >
          Assignments ({interviewsList.length})
        </button>
        <button
          onClick={() => setActiveTab('conflicts')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'conflicts'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-[#64748B] hover:text-[#14213D]'
          }`}
        >
          <span>Conflicts</span>
          {panelAndRoomConflicts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold">
              {panelAndRoomConflicts.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: INTERVIEW AVAILABILITY SLOTS TABLE */}
      {activeTab === 'availability' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#14213D]">Manual Interview Availability Slots</h3>
              <p className="text-xs text-[#64748B]">
                Configured interview slots saved directly in MongoDB. Available slots are selected when shortlisting students.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingSlot(null);
                setIsAvailabilityModalOpen(true);
              }}
            >
              + Add Interview Availability
            </Button>
          </div>

          <Card className="p-0 overflow-hidden bg-white border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-bold tracking-wider">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Time</th>
                    <th className="p-3.5">Panel</th>
                    <th className="p-3.5">Panel Members</th>
                    <th className="p-3.5">Block</th>
                    <th className="p-3.5">Room</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingSlots ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748B]">
                        Loading availability slots...
                      </td>
                    </tr>
                  ) : availabilitySlots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748B]">
                        <Calendar className="w-8 h-8 mx-auto text-[#94A3B8] mb-2 opacity-50" />
                        <p className="font-bold text-sm text-[#14213D]">No interview slots available.</p>
                        <p className="text-xs text-[#64748B] mt-1">
                          Click "+ Add Interview Availability" above to configure your first manual interview slot.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    availabilitySlots.map((slot) => {
                      const isAvailable = slot.status === 'AVAILABLE';
                      const isAssigned = slot.status === 'ASSIGNED';
                      return (
                        <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-[#14213D] whitespace-nowrap">
                            {slot.date}
                          </td>
                          <td className="p-3.5 font-mono text-[#64748B] whitespace-nowrap">
                            {slot.start_time} - {slot.end_time}
                          </td>
                          <td className="p-3.5 font-bold text-[#2563EB] whitespace-nowrap">
                            {slot.panel_name}
                          </td>
                          <td className="p-3.5 text-[#64748B] max-w-xs truncate">
                            {Array.isArray(slot.panel_members) && slot.panel_members.length > 0
                              ? slot.panel_members.join(', ')
                              : '—'}
                          </td>
                          <td className="p-3.5 text-[#64748B] whitespace-nowrap">
                            {slot.block}
                          </td>
                          <td className="p-3.5 font-semibold text-[#14213D] whitespace-nowrap">
                            {slot.room_number}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            {isAvailable && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                🟢 AVAILABLE
                              </span>
                            )}
                            {isAssigned && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                                🔵 ASSIGNED
                              </span>
                            )}
                            {!isAvailable && !isAssigned && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#64748B] border border-slate-200">
                                ⚪ UNAVAILABLE
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingSlot(slot);
                                  setIsAvailabilityModalOpen(true);
                                }}
                                className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Availability"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSlot(slot)}
                                className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Delete Availability"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: PANELS LIST */}
      {activeTab === 'panels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {panelsList.map((panel) => (
            <Card key={panel.id} className="p-5 space-y-4 bg-white border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#14213D]">{panel.name}</h4>
                  <span className="text-xs text-[#64748B]">{panel.companyName || panel.expertise?.join(', ') || 'Core Engineering'}</span>
                </div>
                <StatusBadge
                  status={panel.confirmed ? 'completed' : 'pending'}
                />
              </div>

              <div className="space-y-2 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Members: {panel.members?.join(', ') || 'Lead Interviewers'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Assigned Slots: {panel.interviewsScheduled || 0} interviews</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">Room: {panel.roomNumber || 'Main Block'}</span>
                {!panel.confirmed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => confirmPanel(panel.id)}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Confirm Panel
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: ROOMS */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomsList.map((room) => (
              <Card
                key={room.id}
                className={`p-5 cursor-pointer transition-all bg-white border-slate-200 ${
                  selectedRoom?.id === room.id ? 'border-[#2563EB] ring-1 ring-[#2563EB]' : ''
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#14213D]">{room.name}</h4>
                    <span className="text-xs text-[#64748B]">{room.building}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-[#64748B] border border-slate-200">
                    Cap: {room.capacity}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
                  <span>Video Conf: {room.hasVideoConf ? 'Available ✓' : 'Standard'}</span>
                </div>
              </Card>
            ))}
          </div>

          {selectedRoom && <RoomScheduleTimeline room={selectedRoom} />}
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <Card className="p-0 overflow-hidden bg-white border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-bold">
                <th className="p-3.5">Candidate</th>
                <th className="p-3.5">Company & Role</th>
                <th className="p-3.5">Panel</th>
                <th className="p-3.5">Venue</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interviewsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#64748B]">
                    No interviews assigned yet.
                  </td>
                </tr>
              ) : (
                interviewsList.map((intv) => (
                  <tr key={intv.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-[#14213D]">{intv.candidateName}</td>
                    <td className="p-3.5 text-[#64748B]">
                      {intv.companyName} &bull; {intv.roleTitle}
                    </td>
                    <td className="p-3.5 text-[#2563EB]">{intv.panelName}</td>
                    <td className="p-3.5 text-[#64748B]">{intv.roomName}</td>
                    <td className="p-3.5 font-mono text-[#14213D]">
                      {intv.date} &bull; {intv.timeSlot}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {intv.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 5: CONFLICTS */}
      {activeTab === 'conflicts' && (
        <div className="space-y-3">
          {panelAndRoomConflicts.length === 0 ? (
            <Card className="p-8 text-center text-[#64748B] bg-white border-slate-200">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="font-bold text-sm text-[#14213D]">No scheduling or room conflicts detected.</p>
              <p className="text-xs text-[#64748B]">All panel allocations and room schedules are currently harmonious.</p>
            </Card>
          ) : (
            panelAndRoomConflicts.map((conf) => (
              <Card key={conf.id} className="p-4 bg-red-50/50 border-red-200 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="font-bold text-xs text-red-700">{conf.title}</h4>
                </div>
                <p className="text-xs text-[#14213D]">{conf.description}</p>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create / Edit Availability Modal */}
      <CreateEditAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => {
          setIsAvailabilityModalOpen(false);
          setEditingSlot(null);
        }}
        slot={editingSlot}
        onSave={handleSaveSlot}
      />

      {/* Create Panel Modal */}
      <CreatePanelModal
        isOpen={isCreatePanelOpen}
        onClose={() => setIsCreatePanelOpen(false)}
      />
    </div>
  );
};
