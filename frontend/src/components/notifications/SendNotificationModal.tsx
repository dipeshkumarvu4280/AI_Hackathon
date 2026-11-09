import React, { useState } from 'react';
import { Bell, X, Send, Users, ShieldAlert, Check } from 'lucide-react';
import { NotificationItem, NotificationType, RecipientRole } from '../../types';
import { usePlacement } from '../../context/PlacementContext';
import { Button } from '../ui/Button';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({ isOpen, onClose }) => {
  const { sendNotification, students, panelsList } = usePlacement();

  const [recipientRole, setRecipientRole] = useState<RecipientRole>('students');
  const [recipientName, setRecipientName] = useState(students[0]?.name || '');
  const [notifType, setNotifType] = useState<NotificationType>('interview');
  const [title, setTitle] = useState('Placement Announcement');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      read: false,
      important: notifType === 'important_update',
      type: notifType,
      recipientRole,
      recipientName,
      relatedRoute: '/interviews',
    };

    sendNotification(newNotif);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 max-h-[94vh] sm:max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150 text-[#14213D]">
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#F8FAFC] border-b border-slate-200 text-[#14213D] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200 font-bold text-xs shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#14213D] tracking-tight truncate">Send Placement Notification</h3>
              <p className="text-[10px] sm:text-xs text-[#64748B] truncate">Broadcast updates to candidates, panels, or campus officers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-[#64748B] hover:text-[#14213D] transition-colors cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#14213D] mb-1">Recipient Category</label>
              <select
                value={recipientRole}
                onChange={(e) => {
                  const role = e.target.value as RecipientRole;
                  setRecipientRole(role);
                  if (role === 'students') setRecipientName(students[0]?.name || '');
                  else if (role === 'panel') setRecipientName(panelsList[0]?.name || '');
                  else setRecipientName('Placement Officer');
                }}
                className="w-full text-xs p-2.5 bg-[#F8FAFC] border border-slate-200 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] focus:bg-white font-medium cursor-pointer"
              >
                <option value="students">Student Candidate</option>
                <option value="panel">Interview Panel</option>
                <option value="staff">Placement Staff / Officers</option>
                <option value="all">All Registered Students</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14213D] mb-1">Specific Recipient</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F8FAFC] border border-slate-200 text-[#14213D] rounded-lg font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#14213D] mb-1">Notification Type</label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value as NotificationType)}
                className="w-full text-xs p-2.5 bg-[#F8FAFC] border border-slate-200 text-[#14213D] rounded-lg focus:outline-none focus:border-[#2563EB] focus:bg-white font-medium cursor-pointer"
              >
                <option value="interview">Interview Notice</option>
                <option value="eligibility">Eligibility Alert</option>
                <option value="reminder">Reminder Nudge</option>
                <option value="important_update">Important Update</option>
                <option value="system_alert">System Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14213D] mb-1">Subject / Header</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F8FAFC] border border-slate-200 text-[#14213D] rounded-lg font-bold focus:outline-none focus:border-[#2563EB] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14213D] mb-1">Message Content</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs p-3 bg-[#F8FAFC] border border-slate-200 text-[#14213D] placeholder-[#94A3B8] rounded-lg focus:outline-none focus:border-[#2563EB] focus:bg-white leading-relaxed font-medium"
              placeholder="Enter clear, concise notification details..."
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" icon={<Send className="w-3.5 h-3.5" />}>
              Send Notification
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
