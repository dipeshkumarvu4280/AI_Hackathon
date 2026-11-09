import React from 'react';
import { Room } from '../../types';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface RoomScheduleTimelineProps {
  room: Room;
}

export const RoomScheduleTimeline: React.FC<RoomScheduleTimelineProps> = ({ room }) => {
  const defaultBookings = room.bookings || [
    { time: '09:00 AM', status: 'free' },
    { time: '10:00 AM', status: 'free' },
    { time: '11:00 AM', status: 'free' },
    { time: '12:00 PM', status: 'free' },
    { time: '01:00 PM', status: 'free' },
    { time: '02:00 PM', status: 'free' },
    { time: '03:00 PM', status: 'free' },
    { time: '04:00 PM', status: 'free' },
  ];

  return (
    <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#14213D] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Today's Venue Schedule Timeline — {room.name}
        </span>
        <span className="text-[10px] font-semibold text-[#64748B]">{room.building}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
        {defaultBookings.map((b) => (
          <div
            key={b.time}
            className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-all ${
              b.status === 'occupied'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-slate-50 border-slate-200 text-[#14213D] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-[#14213D]">{b.time}</span>
              {b.status === 'occupied' ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase border border-amber-200">
                  Occupied
                </span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase border border-emerald-200">
                  Free Block
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium mt-1 truncate text-[#64748B]">
              {b.status === 'occupied' ? b.driveName || 'Interview Session' : 'Available for booking'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
