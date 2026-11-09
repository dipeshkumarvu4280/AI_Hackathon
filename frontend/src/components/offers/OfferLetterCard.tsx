import React from 'react';
import {
  Building2,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { PlacementOffer } from '../../types';
import { Button } from '../ui/Button';

interface OfferLetterCardProps {
  offer: PlacementOffer;
  onAccept?: () => void;
  onDecline?: () => void;
  hideActions?: boolean;
}

export const OfferLetterCard: React.FC<OfferLetterCardProps> = ({
  offer,
  onAccept,
  onDecline,
  hideActions = false,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (offer.status) {
      case 'ACCEPTED':
      case 'JOINING_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Offer Accepted
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            Offer Declined
          </span>
        );
      case 'OFFERED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Action Required: Awaiting Decision
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-[#14213D]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#14213D]">{offer.company_name}</h2>
              {getStatusBadge()}
            </div>
            <p className="text-sm font-semibold text-[#2563EB] mt-0.5">{offer.designation || offer.job_title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs text-[#14213D] border-slate-200 hover:bg-slate-50"
          >
            <Printer className="w-3.5 h-3.5 text-[#2563EB]" /> Print Letter
          </Button>
        </div>
      </div>

      {/* CTC & Key Compensation Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block mb-1">
            Total Compensation (CTC)
          </span>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{offer.package_lpa?.toFixed(2)} <span className="text-xs font-semibold text-[#64748B]">LPA</span>
          </div>
          <span className="text-[11px] text-[#64748B] block mt-1">Annual Cost to Company</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block mb-1">
            Fixed Base Salary
          </span>
          <div className="text-xl font-bold text-[#14213D]">
            ₹{(offer.base_salary_lpa || offer.package_lpa * 0.8)?.toFixed(2)}{' '}
            <span className="text-xs font-semibold text-[#64748B]">LPA</span>
          </div>
          <span className="text-[11px] text-[#64748B] block mt-1">Base Pay &amp; Allowances</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block mb-1">
            Joining Date &amp; Location
          </span>
          <div className="text-sm font-bold text-[#2563EB] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#2563EB]" /> {offer.joining_date}
          </div>
          <div className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {offer.job_location}
          </div>
        </div>
      </div>

      {/* Official Offer Letter Document Content */}
      <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 text-sm text-[#334155] leading-relaxed space-y-4 font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs text-[#64748B]">
          <span>Offer Ref: #{offer.id}</span>
          <span>Issued on: {new Date(offer.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>

        <div className="whitespace-pre-line text-[#14213D]">
          {offer.offer_letter_text || (
            <>
              Dear {offer.student_name},<br /><br />
              On behalf of {offer.company_name}, we are delighted to formally extend this offer of employment for the position of {offer.designation || offer.job_title}.<br /><br />
              Your starting compensation package will be INR {offer.package_lpa} LPA, located at our {offer.job_location} office with a planned joining date of {offer.joining_date}.
            </>
          )}
        </div>

        {/* Terms & Conditions */}
        {offer.terms_and_conditions && offer.terms_and_conditions.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase text-[#64748B] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" /> Offer Terms &amp; Pre-requisites
            </h4>
            <ul className="space-y-1.5">
              {offer.terms_and_conditions.map((term, idx) => (
                <li key={idx} className="text-xs text-[#334155] flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        {offer.benefits && offer.benefits.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase text-[#64748B] mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" /> Corporate Benefits &amp; Perks
            </h4>
            <ul className="space-y-1.5">
              {offer.benefits.map((benefit, idx) => (
                <li key={idx} className="text-xs text-[#334155] flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirmation Details (If Accepted) */}
        {offer.status === 'ACCEPTED' && offer.joining_details && (
          <div className="pt-4 border-t border-slate-200 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
            <h4 className="text-xs font-bold uppercase text-emerald-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Confirmed Joining Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#64748B]">Confirmed Date: </span>
                <span className="font-bold text-[#14213D]">{offer.joining_details.confirmed_joining_date}</span>
              </div>
              <div>
                <span className="text-[#64748B]">Location: </span>
                <span className="font-bold text-[#14213D]">{offer.joining_details.preferred_location || offer.job_location}</span>
              </div>
              {offer.joining_details.emergency_contact_name && (
                <div>
                  <span className="text-[#64748B]">Emergency Contact: </span>
                  <span className="text-[#14213D]">{offer.joining_details.emergency_contact_name} ({offer.joining_details.emergency_contact_phone})</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer for Student Decision */}
      {!hideActions && offer.status === 'OFFERED' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-[#64748B]">
            {offer.response_deadline && (
              <span>Please respond by: <strong className="text-amber-700">{offer.response_deadline}</strong></span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onDecline && (
              <Button
                variant="outline"
                onClick={onDecline}
                className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50"
              >
                Decline Offer
              </Button>
            )}
            {onAccept && (
              <Button
                variant="primary"
                onClick={onAccept}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept Offer &amp; Confirm Joining
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
