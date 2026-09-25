import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { D365Dialog } from '../common/D365Dialog';
import { Penalty } from '../../types/d365.types';
import { PenaltyGrievanceDialog } from './PenaltyGrievanceDialog';
import { exportToCsv } from '../../utils/exportUtils';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations } from '../../i18n/popupTranslations';

interface PenaltiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  penalties: Penalty[];
  onRefresh?: () => void;
}

export const PenaltiesDialog: React.FC<PenaltiesDialogProps> = ({
  isOpen,
  onClose,
  penalties,
  onRefresh,
}) => {
  const { language } = usePersonalization();
  const pt = getPopupTranslations(language);

  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(penalties[0] || null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [grievanceTargetPenalty, setGrievanceTargetPenalty] = useState<Penalty | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getLocalizedPenaltyStatus = (p: Penalty): string => {
    if (language === 'en') {
      return p.penaltyStatus === 'Active' || p.hearingStatus === 'سارية' ? 'Active' : (p.penaltyStatus || 'Active');
    }
    return p.hearingStatus || p.penaltyStatusAr || 'سارية';
  };

  const handleExport = () => {
    exportToCsv(
      'Penalties_Records',
      penalties.map((p) => ({
        [pt.penalties.colPenaltyNumber]: p.penaltyNumber,
        [pt.penalties.colStatus]: getLocalizedPenaltyStatus(p),
        [pt.penalties.colSigningDate]: p.penaltySigningDate,
        [pt.penalties.colRemovalDate]: p.penaltyRemovalDate || '2026-09-07',
        [pt.penalties.employeePenaltyLabel.replace(':', '')]: p.employeePenalty || p.action,
        [pt.penalties.investigationAuthorityLabel.replace(':', '')]: p.investigationAuthority || pt.penalties.defaultInvestigationAuthority,
        [pt.penalties.durationLabel.replace(':', '')]: p.duration || '-',
      }))
    );
    setToastMessage(pt.penalties.exportSuccessMsg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGrievanceSuccess = () => {
    if (onRefresh) onRefresh();
    setToastMessage(pt.penalties.grievanceSuccessMsg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <>
      <D365Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={pt.penalties.dialogTitle}
        subtitle={pt.penalties.dialogSubtitle}
        maxWidth="3xl"
        secondaryActionLabel={pt.common.close}
        onSecondaryAction={onClose}
        tertiaryActionLabel={pt.common.exportExcel}
        onTertiaryAction={handleExport}
      >
        <div className="space-y-4">
          {toastMessage && (
            <div className="p-2.5 bg-[#DFF6DD] border border-[#107C41] text-[#107C41] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-xs hover:underline font-bold cursor-pointer">
                {pt.common.close}
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-[#D1D1D1] overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-[#F3F2F1] border-b border-[#D1D1D1] text-[#323130] font-semibold">
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.penalties.colPenaltyNumber}</th>
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.penalties.colStatus}</th>
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.penalties.colSigningDate}</th>
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.penalties.colRemovalDate}</th>
                  <th className="p-2.5 text-center w-28">{pt.common.action}</th>
                </tr>
              </thead>
              <tbody>
                {penalties.map((penalty) => {
                  const isSelected = selectedPenalty?.id === penalty.id;
                  return (
                    <tr
                      key={penalty.id}
                      onClick={() => setSelectedPenalty(penalty)}
                      className={`border-b border-[#EDEBE9] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EDEBE9]' : 'hover:bg-[#FAF9F8]'
                      }`}
                    >
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono font-semibold text-[#0078D4]">
                        {penalty.penaltyNumber}
                      </td>
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] text-[#323130]">
                        {getLocalizedPenaltyStatus(penalty)}
                      </td>
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-[#605E5C]">
                        {penalty.penaltySigningDate}
                      </td>
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-[#605E5C]">
                        {penalty.penaltyRemovalDate || '2026-09-07'}
                      </td>
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        {penalty.hasGrievance ? (
                          <span className="inline-block px-2 py-1 text-[11px] bg-[#F3F2F1] text-[#605E5C] border border-[#D1D1D1]">
                            {pt.penalties.grievanceSubmittedBadge}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setGrievanceTargetPenalty(penalty)}
                            className="px-2.5 py-1 bg-[#0078D4] hover:bg-[#106EBE] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            {pt.penalties.submitGrievanceBtn}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Accordion: Penalty Details */}
          {selectedPenalty && (
            <div className="bg-white border border-[#D1D1D1]">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="w-full px-3 py-2 bg-[#F3F2F1] border-b border-[#EDEBE9] flex items-center justify-between text-xs font-bold text-[#323130] hover:bg-[#EDEBE9] transition-colors cursor-pointer"
              >
                <span>{pt.penalties.penaltyDetailsAccordion} ({selectedPenalty.penaltyNumber})</span>
                {isDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isDetailsOpen && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Investigation Authority */}
                  <div className="space-y-1">
                    <span className="text-[#605E5C] block">{pt.penalties.investigationAuthorityLabel}</span>
                    <span className="font-semibold text-[#323130] bg-[#F9F9F9] p-2 block border border-[#EDEBE9]">
                      {selectedPenalty.investigationAuthority || pt.penalties.defaultInvestigationAuthority}
                    </span>
                  </div>

                  {/* Disciplinary Measure */}
                  <div className="space-y-1">
                    <span className="text-[#605E5C] block">{pt.penalties.employeePenaltyLabel}</span>
                    <span className="font-semibold text-[#A80000] bg-[#F9F9F9] p-2 block border border-[#EDEBE9]">
                      {selectedPenalty.employeePenalty || selectedPenalty.action}
                    </span>
                  </div>

                  {/* Penalty Status */}
                  <div className="space-y-1">
                    <span className="text-[#605E5C] block">{pt.penalties.penaltyStatusLabel}</span>
                    <span className="font-semibold text-[#323130] bg-[#F9F9F9] p-2 block border border-[#EDEBE9]">
                      {getLocalizedPenaltyStatus(selectedPenalty)}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <span className="text-[#605E5C] block">{pt.penalties.durationLabel}</span>
                    <span className="font-semibold text-[#323130] bg-[#F9F9F9] p-2 block border border-[#EDEBE9]">
                      {selectedPenalty.duration || '-'}
                    </span>
                  </div>

                  {/* Removal Date */}
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-[#605E5C] block">{pt.penalties.removalDateLabel}</span>
                    <span className="font-mono font-semibold text-[#0078D4] bg-[#F9F9F9] p-2 block border border-[#EDEBE9]">
                      {selectedPenalty.penaltyRemovalDate || '2026-09-07'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </D365Dialog>

      {/* Grievance Submission Dialog */}
      <PenaltyGrievanceDialog
        isOpen={!!grievanceTargetPenalty}
        onClose={() => setGrievanceTargetPenalty(null)}
        penalty={grievanceTargetPenalty}
        onSuccess={handleGrievanceSuccess}
      />
    </>
  );
};
