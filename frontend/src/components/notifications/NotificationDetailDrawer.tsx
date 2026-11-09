import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ExternalLink, CheckCircle2, User, Clock, Building2 } from 'lucide-react';
import { NotificationItem } from '../../types';
import { usePlacement } from '../../context/PlacementContext';
import { Button } from '../ui/Button';

interface NotificationDetailDrawerProps {
  notification: NotificationItem | null;
  onClose: () => void;
}

export const NotificationDetailDrawer: React.FC<NotificationDetailDrawerProps> = ({
  notification,
  onClose,
}) => {
  const navigate = useNavigate();
  const { markNotificationRead } = usePlacement();

  if (!notification) return null;

  const handleNavigate = () => {
    markNotificationRead(notification.id);
    onClose();

    const notifType = (notification.type || (notification as any).notificationType || '').toUpperCase();
    const driveId = notification.drive_id || (notification as any).driveId;
    const role = notification.recipientRole || (notification as any).recipient_role;

    // Explicit related route takes highest priority
    if (notification.relatedRoute) {
      navigate(notification.relatedRoute);
      return;
    }

    // Role & event specific destinations
    if (notifType === 'FORM_UPLOADED' || (notification as any).form_id) {
      const formId = (notification as any).form_id;
      if (formId) {
        navigate(`/student/forms/${formId}`);
        return;
      }
    }

    if (notifType === 'CAMPUS_DRIVE_PENDING') {
      if (driveId) {
        navigate(`/admin/companies/${driveId}`);
        return;
      }
    }

    if (notifType.includes('INTERVIEW') || notifType.includes('SHORTLIST')) {
      navigate(role === 'student' ? '/student/interviews' : '/admin/interviews');
      return;
    }

    if (notifType.includes('COMMUNITY') || notifType.includes('ANNOUNCEMENT') || notifType === 'NEW_DRIVE_AVAILABLE') {
      if (driveId) {
        navigate(`/student/community/${driveId}`);
        return;
      }
    }

    if (role === 'recruiter' || notifType.includes('DRIVE_APPROVED') || notifType.includes('DRIVE_REJECTED')) {
      navigate('/recruiter/drives');
      return;
    }

    if (notifType === 'APPLICATION_RECEIVED' && driveId) {
      navigate(`/admin/companies/${driveId}`);
      return;
    }

    // Fallback: If driveId is present on any drive notification
    if (driveId) {
      navigate(`/student/community/${driveId}`);
    } else {
      navigate(role === 'student' ? '/student/drives' : '/admin/notifications');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white text-[#14213D] h-full p-6 shadow-2xl overflow-y-auto space-y-6 border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200">
              <Bell className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14213D]">Notification Context</h3>
              <p className="text-xs text-[#64748B]">ID: {notification.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#64748B] hover:text-[#14213D] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Info */}
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[#64748B]">Notification Header</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] uppercase border border-blue-200">
                {notification.type}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#14213D]">{notification.title}</h4>
            <p className="text-[#64748B] leading-relaxed font-medium">{notification.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Target Recipient</span>
              <span className="font-bold text-[#14213D] mt-0.5 block">{notification.recipientName}</span>
              <span className="text-[10px] text-[#64748B] font-medium uppercase">({notification.recipientRole})</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Dispatch Time</span>
              <span className="font-bold text-[#14213D] mt-0.5 block">{notification.timestamp}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Verified Logged</span>
            </div>
          </div>

          {/* Related Metadata Context */}
          {(notification.relatedDriveName || notification.relatedCandidateName) && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-[#64748B] block">Linked Entities</span>
              {notification.relatedDriveName && (
                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#2563EB]" /> Placement Drive:
                  </span>
                  <span className="font-bold text-[#14213D]">{notification.relatedDriveName}</span>
                </div>
              )}
              {notification.relatedCandidateName && (
                <div className="flex items-center justify-between text-[#64748B]">
                  <span className="font-semibold flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#2563EB]" /> Candidate:
                  </span>
                  <span className="font-bold text-[#14213D]">{notification.relatedCandidateName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          {(notification.relatedRoute || notification.drive_id || (notification as any).driveId) && (
            <Button
              variant="primary"
              className="w-full justify-center"
              icon={<ExternalLink className="w-4 h-4" />}
              onClick={handleNavigate}
            >
              {(notification.type === 'APPLICATION_RECEIVED' || (notification as any).notificationType === 'APPLICATION_RECEIVED')
                ? 'Open Placement Drive & Candidates'
                : 'Go to Related Item'}
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full justify-center"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => {
              markNotificationRead(notification.id);
              onClose();
            }}
          >
            Mark as Read
          </Button>
        </div>
      </div>
    </div>
  );
};
