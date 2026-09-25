import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { D365Dialog } from '../common/D365Dialog';
import { TrainingCourse } from '../../types/d365.types';
import { TrainingEvaluationDialog } from './TrainingEvaluationDialog';
import { exportToCsv } from '../../utils/exportUtils';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations } from '../../i18n/popupTranslations';

interface TrainingCoursesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courses: TrainingCourse[];
  onRefresh?: () => void;
}

export const TrainingCoursesDialog: React.FC<TrainingCoursesDialogProps> = ({
  isOpen,
  onClose,
  courses,
  onRefresh,
}) => {
  const { language } = usePersonalization();
  const pt = getPopupTranslations(language);

  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(courses[0] || null);
  const [isImmediateEvalOpen, setIsImmediateEvalOpen] = useState(true);
  const [is3MonthsEvalOpen, setIs3MonthsEvalOpen] = useState(true);
  const [evalTargetCourse, setEvalTargetCourse] = useState<TrainingCourse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const ratingHeaders = [
    pt.training.ratingExcellent,
    pt.training.ratingVeryGood,
    pt.training.ratingGood,
    pt.training.ratingFair,
    pt.training.ratingPoor,
  ];

  const handleExport = () => {
    exportToCsv(
      'Employee_Training_Courses',
      courses.map((c) => ({
        [pt.training.colCourseTitle]: c.courseTitle,
        [pt.training.colCourseId]: c.courseId,
        [pt.training.colStartDate]: c.startDate,
        [pt.training.colEndDate]: c.endDate,
        [pt.training.colGeneralEval]: c.generalEvaluationScore || '-',
        [pt.training.col3MonthsEval]: c.evaluationAfter3MonthsScore || '-',
      }))
    );
    setToastMessage(pt.training.exportSuccessMsg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEvaluationSuccess = () => {
    if (onRefresh) onRefresh();
    setToastMessage(pt.training.evalSuccessMsg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const immediateStatements = [
    { statement: pt.training.immStatement1, selected: pt.training.ratingExcellent },
    { statement: pt.training.immStatement2, selected: pt.training.ratingExcellent },
    { statement: pt.training.immStatement3, selected: pt.training.ratingVeryGood },
    { statement: pt.training.immStatement4, selected: pt.training.ratingExcellent },
  ];

  const threeMonthStatements = [
    { statement: pt.training.threeMoStatement1, selected: pt.training.ratingVeryGood },
    { statement: pt.training.threeMoStatement2, selected: pt.training.ratingExcellent },
    { statement: pt.training.threeMoStatement3, selected: pt.training.ratingVeryGood },
  ];

  return (
    <>
      <D365Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={pt.training.dialogTitle}
        subtitle={pt.training.dialogSubtitle}
        maxWidth="4xl"
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

          {/* Main Table */}
          <div className="bg-white border border-[#D1D1D1] overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead>
                <tr className="bg-[#F3F2F1] border-b border-[#D1D1D1] text-[#323130] font-semibold">
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.training.colCourseTitle}</th>
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.training.colCourseId}</th>
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.training.colStartDate}</th>
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.training.colEndDate}</th>
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.training.colGeneralEval}</th>
                  <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.training.col3MonthsEval}</th>
                  <th className="p-2.5 text-center w-28">{pt.common.action}</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  const isPending = course.generalEvaluationStatus === 'PendingEvaluation';
                  return (
                    <tr
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`border-b border-[#EDEBE9] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EDEBE9]' : 'hover:bg-[#FAF9F8]'
                      }`}
                    >
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-semibold text-[#323130]">
                        {course.courseTitle}
                      </td>
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-[#0078D4]">
                        {course.courseId}
                      </td>
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-[#605E5C]">
                        {course.startDate}
                      </td>
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-mono text-[#605E5C]">
                        {course.endDate}
                      </td>
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] text-[#323130]">
                        {course.generalEvaluationScore || '-'}
                      </td>
                      <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] text-[#323130]">
                        {course.evaluationAfter3MonthsScore || '-'}
                      </td>
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => setEvalTargetCourse(course)}
                            className="px-2.5 py-1 bg-[#0078D4] hover:bg-[#106EBE] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            {pt.training.evaluateCourseBtn}
                          </button>
                        ) : (
                          <span className="inline-block px-2 py-1 text-[11px] bg-[#DFF6DD] text-[#107C41] font-semibold">
                            {pt.training.evaluatedBadge}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Accordion 1: Immediate Evaluation */}
          <div className="bg-white border border-[#D1D1D1]">
            <button
              type="button"
              onClick={() => setIsImmediateEvalOpen(!isImmediateEvalOpen)}
              className="w-full px-3 py-2 bg-[#F3F2F1] border-b border-[#EDEBE9] flex items-center justify-between text-xs font-bold text-[#323130] hover:bg-[#EDEBE9] transition-colors cursor-pointer"
            >
              <span>{pt.training.immediateEvalAccordion}</span>
              {isImmediateEvalOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isImmediateEvalOpen && (
              <div className="p-3 overflow-x-auto">
                <table className="w-full min-w-[480px] text-xs text-start border-collapse border border-[#D1D1D1]">
                  <thead>
                    <tr className="bg-[#F3F2F1] border-b border-[#D1D1D1] text-[#323130] font-semibold">
                      <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.training.colStatement}</th>
                      {ratingHeaders.map((h) => (
                        <th key={h} className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-center w-20">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {immediateStatements.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#EDEBE9] hover:bg-[#FAFAFA]">
                        <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-medium text-[#323130]">
                          {row.statement}
                        </td>
                        {ratingHeaders.map((h) => (
                          <td key={h} className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] text-center">
                            <input
                              type="radio"
                              readOnly
                              checked={row.selected === h}
                              className="w-3.5 h-3.5 text-[#0078D4]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Accordion 2: 3-Months Impact Evaluation */}
          <div className="bg-white border border-[#D1D1D1]">
            <button
              type="button"
              onClick={() => setIs3MonthsEvalOpen(!is3MonthsEvalOpen)}
              className="w-full px-3 py-2 bg-[#F3F2F1] border-b border-[#EDEBE9] flex items-center justify-between text-xs font-bold text-[#323130] hover:bg-[#EDEBE9] transition-colors cursor-pointer"
            >
              <span>{pt.training.threeMonthsEvalAccordion}</span>
              {is3MonthsEvalOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {is3MonthsEvalOpen && (
              <div className="p-3 overflow-x-auto">
                <table className="w-full min-w-[480px] text-xs text-start border-collapse border border-[#D1D1D1]">
                  <thead>
                    <tr className="bg-[#F3F2F1] border-b border-[#D1D1D1] text-[#323130] font-semibold">
                      <th className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-start">{pt.training.colStatement}</th>
                      {ratingHeaders.map((h) => (
                        <th key={h} className="p-2.5 rtl:border-l ltr:border-r border-[#D1D1D1] text-center w-20">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {threeMonthStatements.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#EDEBE9] hover:bg-[#FAFAFA]">
                        <td className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] font-medium text-[#323130]">
                          {row.statement}
                        </td>
                        {ratingHeaders.map((h) => (
                          <td key={h} className="p-2.5 rtl:border-l ltr:border-r border-[#EDEBE9] text-center">
                            <input
                              type="radio"
                              readOnly
                              checked={row.selected === h}
                              className="w-3.5 h-3.5 text-[#0078D4]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </D365Dialog>

      {/* Course Evaluation Modal */}
      <TrainingEvaluationDialog
        isOpen={!!evalTargetCourse}
        onClose={() => setEvalTargetCourse(null)}
        course={evalTargetCourse}
        onSuccess={handleEvaluationSuccess}
      />
    </>
  );
};
