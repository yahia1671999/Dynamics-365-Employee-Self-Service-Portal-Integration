import React, { useState } from 'react';
import { AlertCircle, Calendar, Send, X } from 'lucide-react';
import { D365Dialog } from '../common/D365Dialog';
import { Penalty } from '../../types/d365.types';
import { d365Service } from '../../services/d365Service';

interface PenaltyGrievanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  penalty: Penalty | null;
  onSuccess: () => void;
}

export const PenaltyGrievanceDialog: React.FC<PenaltyGrievanceDialogProps> = ({
  isOpen,
  onClose,
  penalty,
  onSuccess,
}) => {
  const [grievanceDate, setGrievanceDate] = useState('2025-09-19');
  const [grievanceSubject, setGrievanceSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!penalty) return null;

  const handleSend = () => {
    if (!grievanceSubject.trim()) {
      setErrorMessage('يرجى كتابة نص التظلم وموضوعه قبل الإرسال.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      d365Service.submitGrievance({
        penaltyId: penalty.id,
        grievanceDate,
        grievanceSubject: grievanceSubject.slice(0, 40),
        grievanceDetails: grievanceSubject,
        attachments: [],
      });
      setIsSubmitting(false);
      onSuccess();
      onClose();
    }, 400);
  };

  return (
    <D365Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="طلب تظلم عن الجزاء المحدد"
      subtitle={`رقم الجزاء: ${penalty.penaltyNumber} - ${penalty.action}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-2.5 bg-[#FDF3F2] border border-[#A80000] text-[#A80000] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Fields: Matching Screenshot 4 */}
        <div className="space-y-4">
          {/* تاريخ طلب التظلم */}
          <div>
            <label htmlFor="grievanceDateInput" className="block text-xs font-semibold text-[#323130] mb-1">
              تاريخ طلب التظلم <span className="text-[#A80000]">*</span>
            </label>
            <div className="flex items-center gap-2 bg-white px-2 py-1.5 border border-[#8A8886] focus-within:border-[#0078D4]">
              <Calendar className="w-4 h-4 text-[#0078D4]" />
              <input
                id="grievanceDateInput"
                type="date"
                value={grievanceDate}
                onChange={(e) => setGrievanceDate(e.target.value)}
                className="w-full bg-transparent text-xs text-[#323130] outline-none font-mono"
              />
            </div>
          </div>

          {/* موضوع التظلم */}
          <div>
            <label htmlFor="grievanceSubjectArea" className="block text-xs font-semibold text-[#323130] mb-1">
              موضوع التظلم <span className="text-[#A80000]">*</span>
            </label>
            <textarea
              id="grievanceSubjectArea"
              rows={5}
              value={grievanceSubject}
              onChange={(e) => setGrievanceSubject(e.target.value)}
              placeholder="اكتب نص التظلم هنا..."
              className="w-full p-2.5 text-xs bg-white text-[#323130] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none placeholder:text-[#8A8886]"
            ></textarea>
          </div>
        </div>

        {/* Buttons: Matching Screenshot 4: [إرسال] [إلغاء الأمر] */}
        <div className="pt-2 flex items-center justify-start gap-2 border-t border-[#EDEBE9]">
          <button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-semibold border border-[#0078D4] transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-1.5 bg-white hover:bg-[#F3F2F1] text-[#605E5C] text-xs border border-[#D1D1D1] transition-colors"
          >
            <span>إلغاء الأمر</span>
          </button>
        </div>
      </div>
    </D365Dialog>
  );
};
