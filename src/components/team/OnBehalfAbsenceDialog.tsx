import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2 } from 'lucide-react';
import { TeamMember } from '../../types/d365.types';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations } from '../../i18n/popupTranslations';

interface OnBehalfAbsenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  initialMemberId?: string;
  onSubmit: (memberId: string, duration: string, date: string, reason: string) => void;
}

export const OnBehalfAbsenceDialog: React.FC<OnBehalfAbsenceDialogProps> = ({
  isOpen,
  onClose,
  teamMembers,
  initialMemberId,
  onSubmit,
}) => {
  const { language, direction } = usePersonalization();
  const pt = getPopupTranslations(language);

  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId || teamMembers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(pt.onBehalfAbsence.duration2Hrs);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDuration(pt.onBehalfAbsence.duration2Hrs);
  }, [language]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError(pt.onBehalfAbsence.validationSelectMember);
      return;
    }
    if (!reason.trim()) {
      setError(pt.onBehalfAbsence.validationReason);
      return;
    }
    setError(null);
    onSubmit(selectedMemberId, duration, date, reason);
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
            <Clock className="w-4 h-4" />
            <span>{pt.onBehalfAbsence.title}</span>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          {error && (
            <div className="p-2 bg-[#FDE7E9] text-[#A80000] border border-[#FDE7E9]">
              {error}
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-[#323130] font-semibold mb-1">
              {pt.onBehalfAbsence.memberLabel}
            </label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-[#323130] font-semibold mb-1">
                {pt.onBehalfAbsence.dateLabel}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-8 px-2 border border-[#8A8886] focus:border-[#0078D4] outline-none text-xs font-mono"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[#323130] font-semibold mb-1">
                {pt.onBehalfAbsence.durationLabel}
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full h-8 px-2 border border-[#8A8886] focus:border-[#0078D4] outline-none bg-white text-xs cursor-pointer"
              >
                <option value={pt.onBehalfAbsence.duration1Hr}>{pt.onBehalfAbsence.duration1Hr}</option>
                <option value={pt.onBehalfAbsence.duration2Hrs}>{pt.onBehalfAbsence.duration2Hrs}</option>
                <option value={pt.onBehalfAbsence.duration3Hrs}>{pt.onBehalfAbsence.duration3Hrs}</option>
                <option value={pt.onBehalfAbsence.durationFullDay}>{pt.onBehalfAbsence.durationFullDay}</option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[#323130] font-semibold mb-1">
              {pt.onBehalfAbsence.reasonLabel}
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={pt.onBehalfAbsence.reasonPlaceholder}
              className="w-full p-2 border border-[#8A8886] focus:border-[#0078D4] outline-none text-xs"
              required
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
              <span>{pt.onBehalfAbsence.submitBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
