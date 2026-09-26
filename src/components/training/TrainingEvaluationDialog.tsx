import React, { useState } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { D365Dialog } from '../common/D365Dialog';
import { TrainingCourse } from '../../types/d365.types';
import { d365Service } from '../../services/d365Service';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations, formatString } from '../../i18n/popupTranslations';

interface TrainingEvaluationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: TrainingCourse | null;
  onSuccess: () => void;
}

export const TrainingEvaluationDialog: React.FC<TrainingEvaluationDialogProps> = ({
  isOpen,
  onClose,
  course,
  onSuccess,
}) => {
  const { language } = usePersonalization();
  const pt = getPopupTranslations(language);

  const ratingColumns = [
    pt.training.ratingExcellent,
    pt.training.ratingVeryGood,
    pt.training.ratingGood,
    pt.training.ratingFair,
    pt.training.ratingPoor,
  ];

  const statements = [
    { id: 'relevance', statement: pt.trainingEval.critRelevance },
    { id: 'trainerCompetence', statement: pt.trainingEval.critTrainerCompetence },
    { id: 'timeSufficiency', statement: pt.trainingEval.critTimeSufficiency },
    { id: 'organization', statement: pt.trainingEval.critOrganization },
    { id: 'overallBenefit', statement: pt.trainingEval.critOverallBenefit },
  ];

  const [ratings, setRatings] = useState<Record<string, string>>({
    relevance: pt.training.ratingExcellent,
    trainerCompetence: pt.training.ratingExcellent,
    timeSufficiency: pt.training.ratingVeryGood,
    organization: pt.training.ratingExcellent,
    overallBenefit: pt.training.ratingExcellent,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!course) return null;

  const handleSelect = (statementId: string, rating: string) => {
    setRatings((prev) => ({ ...prev, [statementId]: rating }));
  };

  const handleSend = async () => {
    for (const item of statements) {
      if (!ratings[item.id]) {
        setErrorMessage(formatString(pt.trainingEval.validationIncomplete, { statement: item.statement }));
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await d365Service.submitTrainingEvaluation({
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        trainerKnowledge: ratings.trainerCompetence || pt.training.ratingExcellent,
        trainerEngagement: ratings.trainerCompetence || pt.training.ratingExcellent,
        courseContent: ratings.relevance || pt.training.ratingExcellent,
        overallProgramEvaluation: ratings.overallBenefit || pt.training.ratingExcellent,
        programDuration: ratings.timeSufficiency || pt.training.ratingVeryGood,
        positiveFeedback: language === 'en'
          ? 'Distinguished training program that effectively enhances public sector digital workflow.'
          : 'برنامج تدريبي متميز ومفيد جداً لمنظومة العمل الحكومي الرقمي.',
      });

      setIsSubmitting(false);

      if (response.isSuccess) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(response.error || pt.trainingEval.errorFailedSubmit);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : pt.trainingEval.errorUnexpected);
    }
  };

  return (
    <D365Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={formatString(pt.trainingEval.dialogTitle, { courseTitle: course.courseTitle })}
      subtitle={formatString(pt.trainingEval.dialogSubtitle, { courseId: course.courseId })}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="p-2.5 bg-[#FDF3F2] border border-[#A80000] text-[#A80000] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="text-xs text-[#605E5C]">
          {pt.trainingEval.introInstruction}
        </div>

        {/* Matrix Table */}
        <div className="bg-white border border-[#D1D1D1] overflow-x-auto">
          <table className="w-full min-w-[520px] text-xs text-start border-collapse">
            <thead>
              <tr className="bg-[#F3F2F1] border-b border-[#D1D1D1] text-[#323130] font-semibold">
                <th className="p-3 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.trainingEval.colStatement}</th>
                {ratingColumns.map((col) => (
                  <th key={col} className="p-3 rtl:border-l ltr:border-r border-[#D1D1D1] text-center w-24">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statements.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b border-[#EDEBE9] ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
                  } hover:bg-[#F3F2F1]`}
                >
                  <td className="p-3 rtl:border-l ltr:border-r border-[#EDEBE9] text-[#323130] font-medium">
                    {item.statement}
                  </td>
                  {ratingColumns.map((col) => (
                    <td key={col} className="p-3 rtl:border-l ltr:border-r border-[#EDEBE9] text-center">
                      <input
                        type="radio"
                        name={`rating-${item.id}`}
                        checked={ratings[item.id] === col}
                        onChange={() => handleSelect(item.id, col)}
                        className="w-4 h-4 text-[#0078D4] border-[#8A8886] focus:ring-[#0078D4] cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Buttons: [Submit] [Cancel] */}
        <div className="pt-2 flex flex-wrap items-center justify-start gap-2 border-t border-[#EDEBE9]">
          <button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 min-h-[32px] bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-semibold border border-[#0078D4] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{isSubmitting ? pt.common.sending : pt.common.submit}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1 px-4 py-1.5 min-h-[32px] bg-white hover:bg-[#F3F2F1] text-[#605E5C] text-xs border border-[#D1D1D1] transition-colors cursor-pointer"
          >
            <span>{pt.common.cancel}</span>
          </button>
        </div>
      </div>
    </D365Dialog>
  );
};
