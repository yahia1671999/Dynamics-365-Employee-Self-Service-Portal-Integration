import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2 } from 'lucide-react';
import { TeamMember } from '../../types/d365.types';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations } from '../../i18n/popupTranslations';

interface OnBehalfLeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  initialMemberId?: string;
  onSubmit: (memberId: string, leaveType: string, startDate: string, endDate: string, days: number, notes?: string) => void;
}

export const OnBehalfLeaveDialog: React.FC<OnBehalfLeaveDialogProps> = ({
  isOpen,
  onClose,
  teamMembers,
  initialMemberId,
  onSubmit,
}) => {
  const { language, direction } = usePersonalization();
  const pt = getPopupTranslations(language);

  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId || teamMembers[0]?.id || '');
  const [leaveType, setLeaveType] = useState(pt.onBehalfLeave.typeAnnual);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [days, setDays] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLeaveType(pt.onBehalfLeave.typeAnnual);
  }, [language]);

  if (!isOpen) return null;

  const currentMember = teamMembers.find((m) => m.id === selectedMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError(pt.onBehalfLeave.validationSelectMember);
      return;
    }
    if (days <= 0) {
      setError(pt.onBehalfLeave.validationDays);
      return;
    }
    setError(null);
    onSubmit(selectedMemberId, leaveType, startDate, endDate, days, notes);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir={direction}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 animate-in fade-in duration-200"
    >
      <div className="bg-white border border-[#0078D4] w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-150 rounded-xs overflow-hidden">
        {/* Header */}
        <div className="bg-[#0078D4] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Calendar className="w-4 h-4" />
            <span>{pt.onBehalfLeave.title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1 transition-colors cursor-pointer"
            aria-label={pt.common.closeDialogAria}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {error && (
            <div className="p-2 bg-[#FDE7E9] text-[#A80000] border border-[#FDE7E9]">
              {error}
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-[#323130] font-semibold mb-1">
              {pt.onBehalfLeave.memberLabel}
            </label>
            <div className="relative">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full h-8 px-2 border border-[#8A8886] focus:border-[#0078D4] outline-none bg-white text-xs"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} - {m.jobTitle} ({m.department})
                  </option>
                ))}
              </select>
            </div>
            {currentMember && (
              <div className="mt-1 p-2 bg-[#EFF6FC] border border-[#DEECF9] text-[11px] text-[#0078D4] flex items-center justify-between">
                <span>{pt.onBehalfLeave.availableAnnual} <strong>{currentMember.leaves.annualAvailable} {pt.common.day}</strong></span>
                <span>{pt.onBehalfLeave.availableCasual} <strong>{currentMember.leaves.casualAvailable} {pt.common.day}</strong></span>
              </div>
            )}
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-[#323130] font-semibold mb-1">
              {pt.onBehalfLeave.leaveTypeLabel}
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full h-8 px-2 border border-[#8A8886] focus:border-[#0078D4] outline-none bg-white text-xs cursor-pointer"
            >
              <option value={pt.onBehalfLeave.typeAnnual}>{pt.onBehalfLeave.typeAnnual}</option>
              <option value={pt.onBehalfLeave.typeCasual}>{pt.onBehalfLeave.typeCasual}</option>
              <option value={pt.onBehalfLeave.typeSick}>{pt.onBehalfLeave.typeSick}</option>
              <option value={pt.onBehalfLeave.typeFamily}>{pt.onBehalfLeave.typeFamily}</option>
              <option value={pt.onBehalfLeave.typeOfficial}>{pt.onBehalfLeave.typeOfficial}</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[#323130] font-semibold mb-1">
                {pt.onBehalfLeave.startDateLabel}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-8 px-2 border border-[#8A8886] focus:border-[#0078D4] outline-none text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[#323130] font-semibold mb-1">
                {pt.onBehalfLeave.endDateLabel}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-8 px-2 border border-[#8A8886] focus:border-[#0078D4] outline-none text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-[#323130] font-semibold mb-1">
                {pt.onBehalfLeave.daysCountLabel}
              </label>
              <input
                type="number"
                min={1}
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                className="w-full h-8 px-2 border border-[#8A8886] focus:border-[#0078D4] outline-none text-xs font-bold font-mono"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#323130] font-semibold mb-1">
              {pt.onBehalfLeave.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={pt.onBehalfLeave.notesPlaceholder}
              className="w-full p-2 border border-[#8A8886] focus:border-[#0078D4] outline-none text-xs"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EDEBE9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-[#8A8886] text-[#323130] hover:bg-[#EDEBE9] cursor-pointer"
            >
              {pt.common.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{pt.onBehalfLeave.submitBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
