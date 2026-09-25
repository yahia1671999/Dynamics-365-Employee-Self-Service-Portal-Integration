import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { D365Dialog } from '../common/D365Dialog';
import { PerformanceEvaluation } from '../../types/d365.types';
import { exportToCsv } from '../../utils/exportUtils';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations, formatString } from '../../i18n/popupTranslations';

interface PerformanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  evaluations: PerformanceEvaluation[];
}

export const PerformanceDialog: React.FC<PerformanceDialogProps> = ({
  isOpen,
  onClose,
  evaluations,
}) => {
  const { language } = usePersonalization();
  const pt = getPopupTranslations(language);

  const getLocalizedRating = (rating: string): string => {
    if (language === 'ar') return rating;
    if (rating === 'ممتاز') return 'Excellent';
    if (rating === 'جيد جداً') return 'Very Good';
    if (rating === 'جيد') return 'Good';
    if (rating === 'متوسط') return 'Fair';
    if (rating === 'ضعيف') return 'Poor';
    return rating;
  };

  const getLocalizedCycle = (cycle: string): string => {
    if (language === 'ar') return cycle;
    if (cycle === 'التقييم السنوي الشامل') return 'Comprehensive Annual Review';
    if (cycle === 'تقييم نصف سنوي') return 'Mid-Year Review';
    return cycle;
  };

  const getLocalizedStatus = (status: string): string => {
    if (language === 'ar') return status;
    if (status === 'معتمد') return 'Approved';
    if (status === 'قيد الاعتماد') return 'Pending Approval';
    return status;
  };

  const handleExport = () => {
    exportToCsv(
      'Performance_Evaluations',
      evaluations.map((e) => ({
        [pt.performance.colYear]: e.year,
        [pt.performance.colCycle]: getLocalizedCycle(e.cycle),
        [pt.performance.colRating]: getLocalizedRating(e.rating),
        [pt.performance.colCompetencies]: `${e.competenciesScore}%`,
        [pt.performance.colGoalsAchieved]: formatString(pt.performance.goalsRatio, {
          achieved: e.goalsAchievedCount,
          total: e.totalGoalsCount,
        }),
        [pt.performance.reviewerLabel.replace(':', '')]: e.reviewerName,
        [pt.common.details]: e.reviewDate,
        [pt.common.status]: getLocalizedStatus(e.status),
      }))
    );
  };

  return (
    <D365Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={pt.performance.dialogTitle}
      subtitle={pt.performance.dialogSubtitle}
      maxWidth="3xl"
      secondaryActionLabel={pt.common.close}
      onSecondaryAction={onClose}
      tertiaryActionLabel={pt.common.exportExcel}
      onTertiaryAction={handleExport}
    >
      <div className="space-y-4">
        <div className="bg-white border border-[#D1D1D1] overflow-x-auto">
          <table className="w-full min-w-[500px] text-xs text-start border-collapse">
            <thead>
              <tr className="bg-[#F3F2F1] border-b border-[#D1D1D1] text-[#323130] font-semibold">
                <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.performance.colYear}</th>
                <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.performance.colCycle}</th>
                <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.performance.colRating}</th>
                <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.performance.colCompetencies}</th>
                <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.performance.colGoalsAchieved}</th>
                <th className="p-2.5 text-start">{pt.common.status}</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((item) => (
                <tr key={item.id} className="border-b border-[#EDEBE9] hover:bg-[#FAF9F8]">
                  <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono font-bold text-[#0078D4]">
                    {item.year}
                  </td>
                  <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-medium text-[#323130]">
                    {getLocalizedCycle(item.cycle)}
                  </td>
                  <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] text-[#107C41] font-bold">
                    {getLocalizedRating(item.rating)}
                  </td>
                  <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-[#323130]">
                    {item.competenciesScore}%
                  </td>
                  <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-[#323130]">
                    {item.goalsAchievedCount} / {item.totalGoalsCount}
                  </td>
                  <td className="p-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-[#DFF6DD] text-[#107C41] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      {getLocalizedStatus(item.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evaluation Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evaluations.map((item) => (
            <div key={item.id} className="p-3 bg-[#F9F9F9] border border-[#D1D1D1] space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#EDEBE9] pb-1.5">
                <span className="font-bold text-[#0078D4]">
                  {formatString(pt.performance.cardTitle, { year: item.year })}
                </span>
                <span className="font-mono text-[#605E5C]">{item.reviewDate}</span>
              </div>
              <div className="text-[#323130]">
                {pt.performance.reviewerLabel} <span className="font-semibold">{item.reviewerName}</span>
              </div>
              <div className="text-[#323130]">
                {pt.performance.finalScoreLabel} <span className="font-bold text-[#107C41]">{getLocalizedRating(item.rating)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </D365Dialog>
  );
};
