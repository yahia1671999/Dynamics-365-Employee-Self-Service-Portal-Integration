import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, Calendar, Info, ShieldCheck } from 'lucide-react';
import { D365Dialog } from '../common/D365Dialog';
import { d365Service } from '../../services/d365Service';
import { UnifiedRequestItem } from '../../types/d365.types';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations, PopupTranslations } from '../../i18n/popupTranslations';

export type QuickActionType =
  | 'PERMISSION'
  | 'SECONDMENT'
  | 'SECONDMENT_RENEW'
  | 'SECONDMENT_TERMINATE'
  | 'LOAN'
  | 'LOAN_RENEW'
  | 'LOAN_TERMINATE'
  | 'TRANSFER'
  | 'FINANCIAL_DISCLOSURE'
  | 'DRUG_TEST';

interface QuickActionConfig {
  title: string;
  subtitle: string;
  typeLabel: string;
  dateLabel: string;
  reasonLabel: string;
  badgeText?: string;
  destinationHelpText?: string;
  defaultEntity?: string;
  defaultNotes?: string;
}

function getActionConfig(actionType: QuickActionType, pt: PopupTranslations): QuickActionConfig {
  const q = pt.quickAction;
  switch (actionType) {
    case 'PERMISSION':
      return {
        title: q.permissionTitle,
        subtitle: q.permissionSubtitle,
        typeLabel: q.permissionTypeLabel,
        dateLabel: q.permissionDateLabel,
        reasonLabel: q.permissionReasonLabel,
        defaultEntity: q.permissionDefaultEntity,
        defaultNotes: q.permissionDefaultNotes,
      };
    case 'SECONDMENT':
      return {
        title: q.secondmentTitle,
        subtitle: q.secondmentSubtitle,
        typeLabel: q.secondmentTypeLabel,
        dateLabel: q.secondmentDateLabel,
        reasonLabel: q.secondmentReasonLabel,
        defaultEntity: q.secondmentDefaultEntity,
        defaultNotes: q.secondmentDefaultNotes,
      };
    case 'SECONDMENT_RENEW':
      return {
        title: q.secondmentRenewTitle,
        subtitle: q.secondmentRenewSubtitle,
        typeLabel: q.secondmentRenewTypeLabel,
        dateLabel: q.secondmentRenewDateLabel,
        reasonLabel: q.secondmentRenewReasonLabel,
        badgeText: q.secondmentRenewBadgeText,
        destinationHelpText: q.secondmentRenewHelpText,
        defaultNotes: q.secondmentRenewDefaultNotes,
      };
    case 'SECONDMENT_TERMINATE':
      return {
        title: q.secondmentTerminateTitle,
        subtitle: q.secondmentTerminateSubtitle,
        typeLabel: q.secondmentTerminateTypeLabel,
        dateLabel: q.secondmentTerminateDateLabel,
        reasonLabel: q.secondmentTerminateReasonLabel,
        badgeText: q.secondmentTerminateBadgeText,
        destinationHelpText: q.secondmentTerminateHelpText,
        defaultNotes: q.secondmentTerminateDefaultNotes,
      };
    case 'LOAN':
      return {
        title: q.loanTitle,
        subtitle: q.loanSubtitle,
        typeLabel: q.loanTypeLabel,
        dateLabel: q.loanDateLabel,
        reasonLabel: q.loanReasonLabel,
        defaultEntity: q.loanDefaultEntity,
        defaultNotes: q.loanDefaultNotes,
      };
    case 'LOAN_RENEW':
      return {
        title: q.loanRenewTitle,
        subtitle: q.loanRenewSubtitle,
        typeLabel: q.loanRenewTypeLabel,
        dateLabel: q.loanRenewDateLabel,
        reasonLabel: q.loanRenewReasonLabel,
        badgeText: q.loanRenewBadgeText,
        destinationHelpText: q.loanRenewHelpText,
        defaultNotes: q.loanRenewDefaultNotes,
      };
    case 'LOAN_TERMINATE':
      return {
        title: q.loanTerminateTitle,
        subtitle: q.loanTerminateSubtitle,
        typeLabel: q.loanTerminateTypeLabel,
        dateLabel: q.loanTerminateDateLabel,
        reasonLabel: q.loanTerminateReasonLabel,
        badgeText: q.loanTerminateBadgeText,
        destinationHelpText: q.loanTerminateHelpText,
        defaultNotes: q.loanTerminateDefaultNotes,
      };
    case 'TRANSFER':
      return {
        title: q.transferTitle,
        subtitle: q.transferSubtitle,
        typeLabel: q.transferTypeLabel,
        dateLabel: q.transferDateLabel,
        reasonLabel: q.transferReasonLabel,
        defaultEntity: q.transferDefaultEntity,
        defaultNotes: q.transferDefaultNotes,
      };
    case 'FINANCIAL_DISCLOSURE':
      return {
        title: q.disclosureTitle,
        subtitle: q.disclosureSubtitle,
        typeLabel: q.disclosureTypeLabel,
        dateLabel: q.disclosureDateLabel,
        reasonLabel: q.disclosureReasonLabel,
        defaultEntity: q.disclosureDefaultEntity,
        defaultNotes: q.disclosureDefaultNotes,
      };
    case 'DRUG_TEST':
      return {
        title: q.drugTestTitle,
        subtitle: q.drugTestSubtitle,
        typeLabel: q.drugTestTypeLabel,
        dateLabel: q.drugTestDateLabel,
        reasonLabel: q.drugTestReasonLabel,
        defaultEntity: q.drugTestDefaultEntity,
        defaultNotes: q.drugTestDefaultNotes,
      };
  }
}

interface QuickActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: QuickActionType | null;
  onSuccess: (message: string) => void;
  defaultEntity?: string;
}

export const QuickActionDialog: React.FC<QuickActionDialogProps> = ({
  isOpen,
  onClose,
  actionType,
  onSuccess,
  defaultEntity,
}) => {
  const { language } = usePersonalization();
  const pt = getPopupTranslations(language);

  const [requestDate, setRequestDate] = useState('2026-10-01');
  const [targetEntity, setTargetEntity] = useState('');
  const [notes, setNotes] = useState('');
  const [autoApproveInWorkflow, setAutoApproveInWorkflow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && actionType) {
      setErrorMessage(null);
      setIsSubmitting(false);

      const cfg = getActionConfig(actionType, pt);

      if (actionType === 'SECONDMENT_RENEW' || actionType === 'SECONDMENT_TERMINATE') {
        const activeEntity = defaultEntity || d365Service.getActiveSecondmentEntity();
        setTargetEntity(activeEntity);
        setRequestDate('2027-04-01');
        setNotes(cfg.defaultNotes || '');
      } else if (actionType === 'LOAN_RENEW' || actionType === 'LOAN_TERMINATE') {
        const activeEntity = defaultEntity || d365Service.getActiveLoanEntity();
        setTargetEntity(activeEntity);
        setRequestDate('2027-05-01');
        setNotes(cfg.defaultNotes || '');
      } else {
        setTargetEntity(defaultEntity || cfg.defaultEntity || '');
        setRequestDate('2026-10-01');
        setNotes(cfg.defaultNotes || '');
      }
    }
  }, [isOpen, actionType, defaultEntity, language]);

  if (!actionType) return null;
  const config = getActionConfig(actionType, pt);

  const handleSubmit = () => {
    let effectiveEntity = targetEntity.trim();
    if (!effectiveEntity) {
      if (actionType === 'SECONDMENT_RENEW' || actionType === 'SECONDMENT_TERMINATE') {
        effectiveEntity = defaultEntity || d365Service.getActiveSecondmentEntity();
        setTargetEntity(effectiveEntity);
      } else if (actionType === 'LOAN_RENEW' || actionType === 'LOAN_TERMINATE') {
        effectiveEntity = defaultEntity || d365Service.getActiveLoanEntity();
        setTargetEntity(effectiveEntity);
      } else {
        setErrorMessage(`${pt.quickAction.validationEnterPrefix} ${config.typeLabel}`);
        return;
      }
    }
    if (!notes.trim()) {
      setErrorMessage(`${pt.quickAction.validationWritePrefix} ${config.reasonLabel}`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const categoryMap: Record<QuickActionType, UnifiedRequestItem['category']> = {
      PERMISSION: 'PERMISSION',
      SECONDMENT: 'SECONDMENT',
      SECONDMENT_RENEW: 'SECONDMENT',
      SECONDMENT_TERMINATE: 'SECONDMENT',
      LOAN: 'LOAN',
      LOAN_RENEW: 'LOAN',
      LOAN_TERMINATE: 'LOAN',
      TRANSFER: 'TRANSFER',
      FINANCIAL_DISCLOSURE: 'MONITORING',
      DRUG_TEST: 'MONITORING',
    };

    // Submit request into D365 Unified Requests
    d365Service.submitGeneralRequest(
      `${config.title} (${effectiveEntity})`,
      categoryMap[actionType],
      notes,
      autoApproveInWorkflow ? 'Approved' : 'InReview',
      requestDate
    );

    // Business Rules Execution upon approval:
    if (autoApproveInWorkflow) {
      if (actionType === 'SECONDMENT' || actionType === 'SECONDMENT_RENEW') {
        d365Service.setEmployeeEmploymentStatus('Seconded', effectiveEntity);
      } else if (actionType === 'SECONDMENT_TERMINATE') {
        d365Service.setEmployeeEmploymentStatus('Active');
      } else if (actionType === 'LOAN' || actionType === 'LOAN_RENEW') {
        d365Service.setEmployeeEmploymentStatus('Loaned', effectiveEntity);
      } else if (actionType === 'LOAN_TERMINATE') {
        d365Service.setEmployeeEmploymentStatus('Active');
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      let successMsg = pt.quickAction.successGeneral;
      if (autoApproveInWorkflow) {
        if (actionType === 'SECONDMENT') {
          successMsg = pt.quickAction.successSecondedActive;
        } else if (actionType === 'SECONDMENT_RENEW') {
          successMsg = pt.quickAction.successSecondedRenewed;
        } else if (actionType === 'SECONDMENT_TERMINATE') {
          successMsg = pt.quickAction.successSecondedTerminated;
        } else if (actionType === 'LOAN') {
          successMsg = pt.quickAction.successLoanActive;
        } else if (actionType === 'LOAN_RENEW') {
          successMsg = pt.quickAction.successLoanRenewed;
        } else if (actionType === 'LOAN_TERMINATE') {
          successMsg = pt.quickAction.successLoanTerminated;
        }
      }
      onSuccess(successMsg);
      onClose();
    }, 350);
  };

  const isRenewalOrTermination =
    actionType === 'SECONDMENT_RENEW' ||
    actionType === 'SECONDMENT_TERMINATE' ||
    actionType === 'LOAN_RENEW' ||
    actionType === 'LOAN_TERMINATE';

  return (
    <D365Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      subtitle={config.subtitle}
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-2.5 bg-[#FDF3F2] border border-[#A80000] text-[#A80000] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Business Rule Notice Banner */}
        {config.destinationHelpText && (
          <div className="p-2.5 bg-[#EFF6FC] border border-[#0078D4] text-[#004578] text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-[#0078D4] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">{pt.common.businessRuleTitle}</strong>
              <span>{config.destinationHelpText}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Destination Entity Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#323130]">
                {config.typeLabel} <span className="text-[#A80000]">*</span>
              </label>
              {isRenewalOrTermination && (
                <span className="text-[10px] bg-[#EFF6FC] text-[#0078D4] border border-[#C7E0F4] px-1.5 py-0.2 font-semibold">
                  {pt.common.autoRetained}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => setTargetEntity(e.target.value)}
                placeholder={`${pt.quickAction.entityPlaceholderPrefix} ${config.typeLabel}...`}
                className="w-full h-8 px-2 bg-white text-xs text-[#323130] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none"
              />
            </div>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-xs font-semibold text-[#323130] mb-1">
              {config.dateLabel} <span className="text-[#A80000]">*</span>
            </label>
            <div className="flex items-center gap-2 bg-white px-2 py-1 border border-[#8A8886] focus-within:border-[#0078D4]">
              <Calendar className="w-4 h-4 text-[#0078D4]" />
              <input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className="w-full bg-transparent text-xs text-[#323130] outline-none font-mono"
              />
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-[#323130] mb-1">
              {config.reasonLabel} <span className="text-[#A80000]">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={pt.quickAction.notesPlaceholder}
              className="w-full p-2 text-xs bg-white text-[#323130] border border-[#8A8886] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none"
            ></textarea>
          </div>

          {/* Workflow Auto-Approval Option for Review */}
          <div className="p-2.5 bg-[#FAF9F8] border border-[#EDEBE9] text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[#323130]">
              <input
                type="checkbox"
                checked={autoApproveInWorkflow}
                onChange={(e) => setAutoApproveInWorkflow(e.target.checked)}
                className="w-4 h-4 text-[#0078D4] rounded border-gray-300 focus:ring-[#0078D4]"
              />
              <span className="font-semibold">
                {pt.quickAction.autoApproveLabel}
              </span>
            </label>
            <p className="text-[11px] text-[#605E5C] mt-1 rtl:mr-6 ltr:ml-6">
              {autoApproveInWorkflow
                ? pt.quickAction.autoApproveActiveHint
                : pt.quickAction.autoApproveInactiveHint}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#EDEBE9]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 min-h-[32px] bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-semibold border border-[#0078D4] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>{isSubmitting ? pt.common.submitting : pt.common.confirmAndSubmit}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-1 px-4 py-1.5 min-h-[32px] bg-white hover:bg-[#F3F2F1] text-[#605E5C] text-xs border border-[#D1D1D1] transition-colors cursor-pointer"
            >
              <span>{pt.common.cancel}</span>
            </button>
          </div>

          <div className="text-[11px] text-[#605E5C] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#107C41]" />
            <span>{pt.common.rulesEngineNotice}</span>
          </div>
        </div>
      </div>
    </D365Dialog>
  );
};
