import React, { useState, useEffect } from 'react';
import {
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Send,
  Save,
} from 'lucide-react';
import { D365Dialog } from '../common/D365Dialog';
import { LeaveBalance, DelegatedEmployee, LeaveTypeCode } from '../../types/d365.types';
import { d365Service } from '../../services/d365Service';
import { authService } from '../../services/authService';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations } from '../../i18n/popupTranslations';

interface LeaveRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
  leaveBalances: LeaveBalance[];
  delegatedEmployees: DelegatedEmployee[];
  initialLeaveType?: LeaveTypeCode;
}

const LEAVE_TYPE_NAMES: Record<LeaveTypeCode, { ar: string; en: string }> = {
  ANNUAL: { ar: 'إجازة اعتيادية', en: 'Annual Leave' },
  CASUAL: { ar: 'إجازة عارضة', en: 'Casual Leave' },
  SICK: { ar: 'إجازة مرضية', en: 'Sick Leave' },
  MATERNITY: { ar: 'إجازة وضع', en: 'Maternity Leave' },
  PERMISSION: { ar: 'إذن انصراف', en: 'Exit Permission' },
  FAMILY_CARE: { ar: 'رعاية أسرة', en: 'Family Care' },
  CHILD_CARE: { ar: 'رعاية طفل', en: 'Child Care' },
  COMPENSATORY: { ar: 'إجازة تعويضية', en: 'Compensatory Leave' },
  HAJJ: { ar: 'إجازة حج', en: 'Hajj Leave' },
  BEREAVEMENT: { ar: 'إجازة وفاة', en: 'Bereavement Leave' },
};

export const LeaveRequestDialog: React.FC<LeaveRequestDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  leaveBalances,
  delegatedEmployees,
  initialLeaveType = 'ANNUAL',
}) => {
  const { language } = usePersonalization();
  const pt = getPopupTranslations(language);

  const [leaveTypeCode, setLeaveTypeCode] = useState<LeaveTypeCode>(initialLeaveType);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [delegatedEmployeeId, setDelegatedEmployeeId] = useState(
    delegatedEmployees[0]?.id || ''
  );
  const [socialInsuranceOption, setSocialInsuranceOption] = useState<string>('yes');
  const [takafulFundOption, setTakafulFundOption] = useState<string>('yes');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<Array<{ id: string; fileName: string; fileType: string; uploadDate: string }>>([]);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [isBalancesOpen, setIsBalancesOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStartDate('2025-09-22');
      setEndDate('2025-09-26');
      setErrorMessage(null);
      if (initialLeaveType) {
        setLeaveTypeCode(initialLeaveType);
      }
    }
  }, [isOpen, initialLeaveType]);

  const selectedBalance = leaveBalances.find((b) => b.leaveTypeCode === leaveTypeCode) || leaveBalances[0];
  const availableBalance = selectedBalance ? selectedBalance.currentBalance : 0;

  const calculateDays = (): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const requestedDays = calculateDays();
  const remainingBalance = availableBalance - requestedDays;
  const isBalanceExceeded = remainingBalance < 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAtt = {
        id: `att-${Date.now()}`,
        fileName: file.name,
        fileType: file.type.includes('pdf') ? pt.leaveRequest.defaultPdfType : pt.leaveRequest.defaultSupportingDocType,
        uploadDate: new Date().toISOString().split('T')[0],
      };
      setAttachments([...attachments, newAtt]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const currentEmp = d365Service.getEmployee();
  const isSeconded = currentEmp.employmentStatus === 'Seconded' || (currentEmp.employmentStatusAr && currentEmp.employmentStatusAr.includes('منتدب'));
  const isLoaned = currentEmp.employmentStatus === 'Loaned' || (currentEmp.employmentStatusAr && currentEmp.employmentStatusAr.includes('معار'));

  const getLocalizedLeaveTitle = (code: LeaveTypeCode, fallbackAr: string): string => {
    const item = LEAVE_TYPE_NAMES[code];
    if (item) {
      return language === 'en' ? item.en : item.ar;
    }
    return fallbackAr;
  };

  const getLocalizedUnit = (unit: string): string => {
    if (unit === 'أيام' || unit === 'days' || unit === 'Days') {
      return pt.common.days;
    }
    return pt.common.hours;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (isSeconded) {
      setErrorMessage(pt.leaveRequest.validationSeconded);
      return;
    }
    if (isLoaned) {
      setErrorMessage(pt.leaveRequest.validationLoaned);
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage(pt.leaveRequest.validationDatesRequired);
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage(pt.leaveRequest.validationEndBeforeStart);
      return;
    }
    if (!isDraft && isBalanceExceeded) {
      setErrorMessage(pt.leaveRequest.validationInsufficientBalance);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const chosenDelegated = delegatedEmployees.find((e) => e.id === delegatedEmployeeId) || delegatedEmployees[0];
    const currentUser = authService.getCurrentUser();

    try {
      const response = await d365Service.submitLeaveRequest({
        employeeId: currentUser?.id || '',
        employeeName: currentUser?.name || '',
        leaveTypeCode: leaveTypeCode,
        leaveTypeTitle: selectedBalance?.leaveTypeTitle || 'إجازة اعتيادية',
        startDate: startDate,
        endDate: endDate,
        requestedDays: requestedDays,
        delegatedEmployeeId: chosenDelegated?.id || '',
        delegatedEmployeeName: chosenDelegated?.name || '',
        delegatedEmployeeTitle: chosenDelegated?.jobTitle || '',
        socialInsuranceOption: socialInsuranceOption === 'yes',
        healthInsuranceOption: takafulFundOption === 'yes',
        attachments: attachments.map((a) => ({
          id: a.id,
          fileName: a.fileName,
          fileSize: '350 KB',
          uploadDate: a.uploadDate,
        })),
        notes: notes || (isDraft ? pt.leaveRequest.draftNotesPrefix : pt.leaveRequest.officialNotesPrefix),
        d365SyncStatus: 'Synced',
      });

      setIsSubmitting(false);

      if (response.isSuccess && response.data) {
        onSuccess(response.data.id);
        onClose();
      } else {
        setErrorMessage(response.error || pt.leaveRequest.errorFailedSubmit);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : pt.leaveRequest.errorUnexpected);
    }
  };

  const currentUser = authService.getCurrentUser();
  const empName = currentUser?.name || currentEmp.name || 'User';

  return (
    <D365Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${pt.leaveRequest.dialogTitlePrefix} ${empName}`}
      subtitle={pt.leaveRequest.dialogSubtitle}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-2.5 bg-[#FDF3F2] border border-[#A80000] text-[#A80000] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Top Form Fields */}
        <div className="bg-white border border-[#D1D1D1] p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* نوع الإجازة */}
            <div>
              <label htmlFor="leaveTypeSelect" className="block text-xs font-semibold text-[#323130] mb-1">
                {pt.leaveRequest.leaveType} <span className="text-[#A80000]">*</span>
              </label>
              <select
                id="leaveTypeSelect"
                value={leaveTypeCode}
                onChange={(e) => setLeaveTypeCode(e.target.value as LeaveTypeCode)}
                className="w-full h-8 px-2 bg-white text-xs text-[#323130] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none"
              >
                {leaveBalances.map((b) => (
                  <option key={b.leaveTypeCode} value={b.leaveTypeCode}>
                    {getLocalizedLeaveTitle(b.leaveTypeCode, b.leaveTypeTitle)} ({pt.leaveRequest.balanceText} {b.currentBalance.toFixed(2)} {getLocalizedUnit(b.unit)})
                  </option>
                ))}
              </select>
            </div>

            {/* القائم بالأعمال خلال الفترة */}
            <div>
              <label htmlFor="delegatedSelect" className="block text-xs font-semibold text-[#323130] mb-1">
                {pt.leaveRequest.delegatedEmployee} <span className="text-[#A80000]">*</span>
              </label>
              <select
                id="delegatedSelect"
                value={delegatedEmployeeId}
                onChange={(e) => setDelegatedEmployeeId(e.target.value)}
                className="w-full h-8 px-2 bg-white text-xs text-[#323130] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none"
              >
                {delegatedEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} - {e.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* اشتراك التأمين الاجتماعي */}
            <div>
              <label htmlFor="socialInsuranceSelect" className="block text-xs font-semibold text-[#323130] mb-1">
                {pt.leaveRequest.socialInsurance}
              </label>
              <select
                id="socialInsuranceSelect"
                value={socialInsuranceOption}
                onChange={(e) => setSocialInsuranceOption(e.target.value)}
                className="w-full h-8 px-2 bg-white text-xs text-[#323130] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none"
              >
                <option value="yes">{pt.common.yes}</option>
                <option value="no">{pt.common.no}</option>
              </select>
            </div>

            {/* اشتراك صندوق التكافل الاجتماعي */}
            <div>
              <label htmlFor="takafulFundSelect" className="block text-xs font-semibold text-[#323130] mb-1">
                {pt.leaveRequest.takafulFund}
              </label>
              <select
                id="takafulFundSelect"
                value={takafulFundOption}
                onChange={(e) => setTakafulFundOption(e.target.value)}
                className="w-full h-8 px-2 bg-white text-xs text-[#323130] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none"
              >
                <option value="yes">{pt.common.yes}</option>
                <option value="no">{pt.common.no}</option>
              </select>
            </div>

            {/* تاريخ البدء */}
            <div>
              <label htmlFor="leaveStartDate" className="block text-xs font-semibold text-[#323130] mb-1">
                {pt.leaveRequest.startDate} <span className="text-[#A80000]">*</span>
              </label>
              <input
                id="leaveStartDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-8 px-2 bg-white text-xs text-[#323130] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none font-mono"
              />
            </div>

            {/* تاريخ الانتهاء */}
            <div>
              <label htmlFor="leaveEndDate" className="block text-xs font-semibold text-[#323130] mb-1">
                {pt.leaveRequest.endDate} <span className="text-[#A80000]">*</span>
              </label>
              <input
                id="leaveEndDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-8 px-2 bg-white text-xs text-[#323130] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Accordion 1: المرفقات */}
        <div className="bg-white border border-[#D1D1D1]">
          <button
            type="button"
            aria-expanded={isAttachmentsOpen}
            aria-label={`${pt.leaveRequest.attachmentsSection}, ${isAttachmentsOpen ? 'open' : 'closed'}`}
            onClick={() => setIsAttachmentsOpen(!isAttachmentsOpen)}
            className="w-full px-3 py-2 bg-[#F3F2F1] border-b border-[#EDEBE9] flex items-center justify-between text-xs font-bold text-[#323130] hover:bg-[#EDEBE9] transition-colors focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none"
          >
            <span>{pt.leaveRequest.attachmentsSection}</span>
            {isAttachmentsOpen ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </button>

          {isAttachmentsOpen && (
            <div className="p-3 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0078D4] text-white hover:bg-[#106EBE] text-xs font-semibold cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#0078D4] shrink-0">
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{pt.leaveRequest.uploadNewFile}</span>
                  <input
                    type="file"
                    aria-label={pt.leaveRequest.uploadNewFileAria}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-[#605E5C]">
                  {pt.leaveRequest.maxFileSizeHint}
                </span>
              </div>

              {/* Table of attachments */}
              <div className="border border-[#D1D1D1] overflow-x-auto">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-[#F3F2F1] border-b border-[#D1D1D1] text-[#323130] font-semibold">
                      <th className="p-2 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.leaveRequest.fileNameHeader}</th>
                      <th className="p-2 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.leaveRequest.fileTypeHeader}</th>
                      <th className="p-2 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.leaveRequest.uploadDateHeader}</th>
                      <th className="p-2 text-center w-20">{pt.leaveRequest.actionsHeader}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-[#605E5C]">
                          {pt.leaveRequest.noAttachments}
                        </td>
                      </tr>
                    ) : (
                      attachments.map((att) => (
                        <tr key={att.id} className="border-b border-[#EDEBE9] hover:bg-[#FAF9F8]">
                          <td className="p-2 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-xs text-[#323130]">
                            {att.fileName}
                          </td>
                          <td className="p-2 rtl:border-l ltr:border-r border-[#EDEBE9] text-[#605E5C]">
                            {att.fileType}
                          </td>
                          <td className="p-2 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-xs text-[#605E5C]">
                            {att.uploadDate}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeAttachment(att.id)}
                              className="p-1 text-[#A80000] hover:bg-[#FDF3F2] transition-colors focus-visible:ring-2 focus-visible:ring-[#A80000] focus-visible:outline-none"
                              title={pt.leaveRequest.deleteAttachment}
                              aria-label={`${pt.leaveRequest.deleteAttachment} ${att.fileName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: ملاحظات */}
        <div className="bg-white border border-[#D1D1D1]">
          <button
            type="button"
            aria-expanded={isNotesOpen}
            aria-label={`${pt.leaveRequest.notesSection}, ${isNotesOpen ? 'open' : 'closed'}`}
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="w-full px-3 py-2 bg-[#F3F2F1] border-b border-[#EDEBE9] flex items-center justify-between text-xs font-bold text-[#323130] hover:bg-[#EDEBE9] transition-colors focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none"
          >
            <span>{pt.leaveRequest.notesSection}</span>
            {isNotesOpen ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </button>

          {isNotesOpen && (
            <div className="p-3">
              <label htmlFor="leaveNotes" className="sr-only">{pt.leaveRequest.notesLabel}</label>
              <textarea
                id="leaveNotes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={pt.leaveRequest.notesPlaceholder}
                className="w-full p-2 text-xs bg-white text-[#323130] placeholder-[#605E5C] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] focus-visible:ring-2 focus-visible:ring-[#0078D4] outline-none"
              ></textarea>
            </div>
          )}
        </div>

        {/* Accordion 3: الأرصدة */}
        <div className="bg-white border border-[#D1D1D1]">
          <button
            type="button"
            aria-expanded={isBalancesOpen}
            aria-label={`${pt.leaveRequest.balancesSection}, ${isBalancesOpen ? 'open' : 'closed'}`}
            onClick={() => setIsBalancesOpen(!isBalancesOpen)}
            className="w-full px-3 py-2 bg-[#F3F2F1] border-b border-[#EDEBE9] flex items-center justify-between text-xs font-bold text-[#323130] hover:bg-[#EDEBE9] transition-colors focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none"
          >
            <span>{pt.leaveRequest.balancesSection}</span>
            {isBalancesOpen ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </button>

          {isBalancesOpen && (
            <div className="p-3">
              <div className="border border-[#D1D1D1] overflow-x-auto">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-[#F3F2F1] border-b border-[#D1D1D1] text-[#323130] font-semibold">
                      <th className="p-2 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.leaveRequest.colType}</th>
                      <th className="p-2 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.leaveRequest.colUnit}</th>
                      <th className="p-2 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.leaveRequest.colAvailable}</th>
                      <th className="p-2 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.leaveRequest.colRequested}</th>
                      <th className="p-2 text-start">{pt.leaveRequest.colRemaining}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#EDEBE9] hover:bg-[#FAF9F8]">
                      <td className="p-2 rtl:border-l ltr:border-r border-[#EDEBE9] font-semibold text-[#323130]">
                        {getLocalizedLeaveTitle(selectedBalance?.leaveTypeCode || 'ANNUAL', selectedBalance?.leaveTypeTitle || 'اجازة اعتيادي')}
                      </td>
                      <td className="p-2 rtl:border-l ltr:border-r border-[#EDEBE9] text-[#605E5C]">
                        {getLocalizedUnit(selectedBalance?.unit || 'أيام')}
                      </td>
                      <td className="p-2 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-[#0078D4] font-bold">
                        {availableBalance.toFixed(2)}
                      </td>
                      <td className="p-2 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono font-bold text-[#323130]">
                        {requestedDays.toFixed(2)}
                      </td>
                      <td
                        className={`p-2 font-mono font-bold ${
                          isBalanceExceeded ? 'text-[#A80000] bg-[#FDF3F2]' : 'text-[#107C41]'
                        }`}
                      >
                        {remainingBalance.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: [إرسال/Submit] [حفظ المسودة/Save Draft] [إلغاء/Cancel] */}
        <div className="pt-2 flex flex-wrap items-center justify-start gap-2 border-t border-[#EDEBE9]">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 min-h-[32px] bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-semibold border border-[#0078D4] transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
            <span>{pt.common.submit}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 min-h-[32px] bg-white hover:bg-[#F3F2F1] text-[#323130] text-xs font-semibold border border-[#8A8886] transition-colors focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[#0078D4]" aria-hidden="true" />
            <span>{pt.common.saveAsDraft}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1 px-4 py-1.5 min-h-[32px] bg-white hover:bg-[#F3F2F1] text-[#605E5C] text-xs border border-[#D1D1D1] transition-colors focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none cursor-pointer"
          >
            <span>{pt.common.cancel}</span>
          </button>
        </div>
      </div>
    </D365Dialog>
  );
};
