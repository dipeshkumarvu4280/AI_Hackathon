import React, { useState } from 'react';
import {
  Bell,
  Search,
  Star,
  CheckCircle2,
  Trash2,
  Clock,
  Filter,
  ToggleLeft,
  ToggleRight,
  Send,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { usePlacement } from '../../context/PlacementContext';
import { NotificationItem } from '../../types';
import { SendNotificationModal } from '../../components/notifications/SendNotificationModal';
import { NotificationDetailDrawer } from '../../components/notifications/NotificationDetailDrawer';

type NotificationStatusFilter = 'all' | 'unread' | 'today' | 'scheduled' | 'important';

export const NotificationsList: React.FC = () => {
  const {
    notificationsList,
    reminderConfigs,
    toastNotice,
    markNotificationRead,
    toggleNotificationImportant,
    deleteNotification,
    toggleReminder,
  } = usePlacement();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatusFilter>('all');
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'students' | 'staff' | 'panel'>('all');

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  // Helper Predicates for Accurate Real-Time Category Mapping
  const isUnread = (item: NotificationItem): boolean => !item.read;

  const isToday = (item: NotificationItem): boolean => {
    if (item.created_at) {
      const d = new Date(item.created_at);
      if (!isNaN(d.getTime())) {
        const now = new Date();
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth() &&
          d.getDate() === now.getDate()
        );
      }
    }
    const ts = (item.timestamp || '').toLowerCase();
    if (ts.includes('just now') || ts.includes('today')) return true;
    const now = new Date();
    const todayFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase();
    return ts.includes(todayFormatted);
  };

  const isScheduled = (item: NotificationItem): boolean => {
    const it = item as any;
    return Boolean(
      it.scheduled === true ||
      it.status === 'SCHEDULED' ||
      it.scheduledAt ||
      item.type === 'INTERVIEW_SCHEDULED' ||
      item.type === 'INTERVIEW_SLOT_ASSIGNED'
    );
  };

  const isImportant = (item: NotificationItem): boolean => {
    const it = item as any;
    return Boolean(
      item.important === true ||
      it.priority === 'IMPORTANT' ||
      it.priority === 'HIGH'
    );
  };

  // Live Statistics Calculated Strictly from Authenticated User's Notifications
  const unreadCount = notificationsList.filter(isUnread).length;
  const todayCount = notificationsList.filter(isToday).length;
  const scheduledCount = notificationsList.filter(isScheduled).length;
  const importantCount = notificationsList.filter(isImportant).length;

  // Filtered Notifications based on Search, Status Category & Recipient Role
  const filteredNotifs = notificationsList.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.message || '').toLowerCase().includes(q) ||
      (item.recipientName || '').toLowerCase().includes(q) ||
      (item.type || '').toLowerCase().includes(q) ||
      (item.company_name || '').toLowerCase().includes(q) ||
      (item.job_title || '').toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === 'unread') matchesStatus = isUnread(item);
    else if (statusFilter === 'today') matchesStatus = isToday(item);
    else if (statusFilter === 'scheduled') matchesStatus = isScheduled(item);
    else if (statusFilter === 'important') matchesStatus = isImportant(item);

    const matchesRecipient =
      recipientFilter === 'all' || item.recipientRole === recipientFilter;

    return matchesSearch && matchesStatus && matchesRecipient;
  });

  const handleCardClick = (target: NotificationStatusFilter) => {
    if (statusFilter === target) {
      setStatusFilter('all');
    } else {
      setStatusFilter(target);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#14213D]">
      {/* Header */}
      <PageHeader
        title="Notification Center"
        subtitle="Keep students, panels and placement teams informed throughout the placement process."
        icon={<Bell className="w-5 h-5 text-white" />}
        action={
          <Button
            variant="primary"
            icon={<Send className="w-4 h-4" />}
            onClick={() => setIsSendModalOpen(true)}
          >
            Send Notification
          </Button>
        }
      />

      {/* Dynamic Toast Feedback */}
      {toastNotice && (
        <div className="p-4 rounded-xl bg-[#14213D] text-white flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <Bell className="w-4 h-4 text-blue-400" />
            <span>{toastNotice}</span>
          </div>
        </div>
      )}

      {/* SUMMARY KPI CARDS (Live & Clickable) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. UNREAD CARD */}
        <div
          id="kpi-card-unread"
          onClick={() => handleCardClick('unread')}
          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none hover:shadow-md hover:-translate-y-1 active:translate-y-0 motion-reduce:transform-none ${
            statusFilter === 'unread'
              ? 'bg-blue-50/60 border-[#2563EB] ring-2 ring-[#2563EB]/40 shadow-sm'
              : 'bg-white border-[#CBD5E1]/90 hover:border-blue-400/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Unread</span>
            <Bell className={`w-3.5 h-3.5 ${statusFilter === 'unread' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
          </div>
          <div className="text-2xl font-black text-[#2563EB] mt-1">{unreadCount}</div>
          <span className="text-[10px] text-[#475569] font-bold mt-1 block">
            {statusFilter === 'unread' ? 'Active filter • Click to reset' : 'Click to view unread'}
          </span>
        </div>

        {/* 2. TODAY CARD */}
        <div
          id="kpi-card-today"
          onClick={() => handleCardClick('today')}
          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none hover:shadow-md hover:-translate-y-1 active:translate-y-0 motion-reduce:transform-none ${
            statusFilter === 'today'
              ? 'bg-blue-50/60 border-[#2563EB] ring-2 ring-[#2563EB]/40 shadow-sm'
              : 'bg-white border-[#CBD5E1]/90 hover:border-blue-400/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Today</span>
            <Calendar className={`w-3.5 h-3.5 ${statusFilter === 'today' ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
          </div>
          <div className="text-2xl font-black text-[#14213D] mt-1">{todayCount}</div>
          <span className="text-[10px] text-[#475569] font-bold mt-1 block">
            {statusFilter === 'today' ? 'Active filter • Click to reset' : 'Click to view today'}
          </span>
        </div>

        {/* 3. SCHEDULED CARD */}
        <div
          id="kpi-card-scheduled"
          onClick={() => handleCardClick('scheduled')}
          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none hover:shadow-md hover:-translate-y-1 active:translate-y-0 motion-reduce:transform-none ${
            statusFilter === 'scheduled'
              ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-sm'
              : 'bg-white border-[#CBD5E1]/90 hover:border-emerald-400 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">Scheduled</span>
            <Clock className={`w-3.5 h-3.5 ${statusFilter === 'scheduled' ? 'text-emerald-600' : 'text-[#64748B]'}`} />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{scheduledCount}</div>
          <span className="text-[10px] text-[#475569] font-bold mt-1 block">
            {statusFilter === 'scheduled' ? 'Active filter • Click to reset' : 'Click to view scheduled'}
          </span>
        </div>

        {/* 4. IMPORTANT CARD */}
        <div
          id="kpi-card-important"
          onClick={() => handleCardClick('important')}
          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none hover:shadow-md hover:-translate-y-1 active:translate-y-0 motion-reduce:transform-none ${
            statusFilter === 'important'
              ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/40 shadow-sm'
              : 'bg-white border-[#CBD5E1]/90 hover:border-amber-400 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Important</span>
            <Star className={`w-3.5 h-3.5 ${statusFilter === 'important' ? 'fill-amber-500 text-amber-500' : 'text-[#64748B]'}`} />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{importantCount}</div>
          <span className="text-[10px] text-[#475569] font-bold mt-1 block">
            {statusFilter === 'important' ? 'Active filter • Click to reset' : 'Click to view important'}
          </span>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <Card className="p-4 bg-white border-[#CBD5E1]/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search notifications, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-slate-300 text-[#14213D] placeholder-[#94A3B8] rounded-lg focus:outline-none focus:border-[#2563EB] focus:bg-white"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-[#2563EB] text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200 hover:text-[#14213D] border border-slate-200'
              }`}
            >
              All ({notificationsList.length})
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                statusFilter === 'unread'
                  ? 'bg-[#2563EB] text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200 hover:text-[#14213D] border border-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setStatusFilter('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                statusFilter === 'today'
                  ? 'bg-[#2563EB] text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200 hover:text-[#14213D] border border-slate-200'
              }`}
            >
              Today ({todayCount})
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                statusFilter === 'scheduled'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200 hover:text-[#14213D] border border-slate-200'
              }`}
            >
              Scheduled ({scheduledCount})
            </button>
            <button
              onClick={() => setStatusFilter('important')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                statusFilter === 'important'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200 hover:text-[#14213D] border border-slate-200'
              }`}
            >
              Important ({importantCount})
            </button>
          </div>

          {/* Recipient Dropdown Filter */}
          <div>
            <select
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value as any)}
              className="w-full text-xs p-2 bg-[#F8FAFC] border border-slate-300 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] focus:bg-white cursor-pointer font-medium"
            >
              <option value="all">All Recipient Types</option>
              <option value="students">Students</option>
              <option value="staff">Placement Staff</option>
              <option value="panel">Panel Members</option>
            </select>
          </div>
        </div>
      </Card>

      {/* NOTIFICATION ITEMS LIST */}
      <Card className="bg-white border-[#CBD5E1]/90 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-[#F8FAFC]/50">
          <CardTitle className="text-base font-bold text-[#14213D]">Broadcast Feed</CardTitle>
          <span className="text-xs text-[#475569] font-bold">Showing {filteredNotifs.length} items</span>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifs.length === 0 ? (
            <div className="p-12 text-center text-[#64748B] space-y-2">
              <Bell className="w-8 h-8 text-[#94A3B8] mx-auto opacity-50" />
              {statusFilter === 'unread' ? (
                <>
                  <p className="text-sm font-bold text-[#14213D]">No unread notifications</p>
                  <p className="text-xs text-[#64748B]">All caught up! You have read all notifications in your feed.</p>
                </>
              ) : statusFilter === 'today' ? (
                <>
                  <p className="text-sm font-bold text-[#14213D]">No notifications received today</p>
                  <p className="text-xs text-[#64748B]">You haven't received any new placement alerts or interview updates today.</p>
                </>
              ) : statusFilter === 'scheduled' ? (
                <>
                  <p className="text-sm font-bold text-[#14213D]">No scheduled notifications</p>
                  <p className="text-xs text-[#64748B]">You have no upcoming scheduled interviews or placement sessions at this time.</p>
                </>
              ) : statusFilter === 'important' ? (
                <>
                  <p className="text-sm font-bold text-[#14213D]">No important notifications</p>
                  <p className="text-xs text-[#64748B]">No notifications are currently flagged as important or high priority.</p>
                </>
              ) : search ? (
                <>
                  <p className="text-sm font-bold text-[#14213D]">No matching notifications</p>
                  <p className="text-xs text-[#64748B]">No alerts match "{search}". Try searching with different terms.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-[#14213D]">No notifications yet</p>
                  <p className="text-xs text-[#64748B]">All live campus drive applications and alerts will appear here in real-time.</p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedNotif(item)}
                  className={`p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !item.read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Star Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNotificationImportant(item.id);
                      }}
                      className="mt-1 text-[#94A3B8] hover:text-amber-500 transition-colors cursor-pointer"
                      title={item.important ? 'Remove Importance' : 'Mark as Important'}
                    >
                      <Star className={`w-4 h-4 ${item.important ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#14213D]">{item.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200 uppercase">
                          {item.type}
                        </span>
                        {!item.read && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2563EB] text-white">
                            NEW
                          </span>
                        )}
                        {item.important && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            IMPORTANT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed font-normal">{item.message}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#64748B] mt-2 font-medium">
                        <span>Recipient: <strong className="text-[#14213D]">{item.recipientName}</strong> ({item.recipientRole})</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#2563EB]" /> {item.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(item.id);
                      }}
                      className="p-1.5 text-[#64748B] hover:text-[#14213D] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title={item.read ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${item.read ? 'text-emerald-600' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AUTOMATED REMINDERS SECTION */}
      <Card className="p-5 bg-white border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-[#14213D] mb-1 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#2563EB]" /> Automated Reminders Setup
        </h3>
        <p className="text-xs text-[#64748B] mb-4 font-medium">Configure autonomous notification timing preferences</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reminderConfigs.map((rem) => (
            <div key={rem.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#14213D]">{rem.title}</span>
                <button onClick={() => toggleReminder(rem.id)} className="text-[#2563EB] cursor-pointer">
                  {rem.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 text-[#94A3B8]" />}
                </button>
              </div>
              <span className="text-[11px] text-[#64748B] block">{rem.timing}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />

      {/* Notification Detail Drawer */}
      <NotificationDetailDrawer
        notification={selectedNotif}
        onClose={() => setSelectedNotif(null)}
      />
    </div>
  );
};
