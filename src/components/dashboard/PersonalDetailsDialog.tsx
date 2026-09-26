import React from 'react';
import { User, Lock, ShieldCheck, Calendar, GraduationCap, Heart, Users, CheckCircle2 } from 'lucide-react';
import { D365Dialog } from '../common/D365Dialog';
import { Employee } from '../../types/d365.types';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations } from '../../i18n/popupTranslations';

interface PersonalDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export const PersonalDetailsDialog: React.FC<PersonalDetailsDialogProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const { language } = usePersonalization();
  const pt = getPopupTranslations(language);

  // Personal details with default values prepared for Dynamics 365 OData integration
  const details = employee.personalDetails || {
    maritalStatus: 'متزوجة',
    maritalStatusDate: '2012-04-18',
    dependentsCount: 2,
    spouseWorking: 'نعم',
    religion: 'مسلم',
    educationQualification: 'بكالوريوس حاسبات ومعلومات - علوم الحاسب',
    retirementDate: '2045-09-18',
    isDisabled: 'لا',
    verificationDate: '2024-01-10',
  };

  const getLocalizedMaritalStatus = (val: string): string => {
    if (language === 'ar') return val;
    if (val === 'متزوجة' || val === 'متزوج') return 'Married';
    if (val === 'أعزب' || val === 'عزباء') return 'Single';
    if (val === 'مطلق' || val === 'مطلقة') return 'Divorced';
    if (val === 'أرمل' || val === 'أرملة') return 'Widowed';
    return val;
  };

  const getLocalizedBoolean = (val: string): string => {
    if (language === 'ar') return val;
    if (val === 'نعم') return pt.common.yes;
    if (val === 'لا') return pt.common.no;
    return val;
  };

  const getLocalizedReligion = (val: string): string => {
    if (language === 'ar') return val;
    if (val === 'مسلم' || val === 'مسلمة') return 'Muslim';
    if (val === 'مسيحي' || val === 'مسيحية') return 'Christian';
    return val;
  };

  const getLocalizedEducation = (val: string): string => {
    if (language === 'ar') return val;
    if (val.includes('حاسبات') || val.includes('حاسب')) {
      return pt.personalDetails.valEducationDegree;
    }
    return val;
  };

  return (
    <D365Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={pt.personalDetails.dialogTitle}
      subtitle={pt.personalDetails.dialogSubtitle}
      maxWidth="2xl"
      primaryActionLabel={pt.common.close}
      onPrimaryAction={onClose}
    >
      <div className="space-y-4 text-xs text-[#323130]">
        {/* Info banner - D365 Read-only notice */}
        <div className="flex items-center gap-2 p-2.5 bg-[#EFF6FC] border border-[#C7E0F4] text-[#004E8C]">
          <Lock className="w-4 h-4 shrink-0 text-[#0078D4]" aria-hidden="true" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold">{pt.personalDetails.readOnlyBannerTitle} </span>
            {pt.personalDetails.readOnlyBannerText}
          </div>
        </div>

        {/* Employee Summary Ribbon */}
        <div className="p-3 bg-[#FAF9F8] border border-[#EDEBE9] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002050] text-[#69AFE5] border border-[#0078D4] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
              {employee.avatarUrl ? (
                <img
                  src={employee.avatarUrl}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" aria-hidden="true" />
              )}
            </div>
            <div>
              <span className="font-bold text-[#323130] block">{employee.name}</span>
              <span className="text-[11px] text-[#605E5C] block">
                {pt.personalDetails.workerIdLabel} <span className="font-mono text-[#0078D4]">{employee.id}</span> | {pt.personalDetails.civilIdLabel} <span className="font-mono text-[#323130]">{employee.civilId}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E7F6EC] border border-[#8CD9A7] text-[#107C41] text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{pt.personalDetails.verifiedBadge}</span>
          </div>
        </div>

        {/* 9 Personal Details Fields in D365 Form Grid (Read Only) */}
        <div className="border border-[#D1D1D1] bg-white p-3.5">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#EDEBE9]">
            <span className="font-bold text-xs text-[#323130]">{pt.personalDetails.sectionHeader}</span>
            <span className="text-[10px] text-[#605E5C] font-mono">Entity: HcmPersonPrivateDetails</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Marital Status */}
            <div>
              <label htmlFor="field-maritalStatus" className="block text-xs font-semibold text-[#605E5C] mb-1">
                {pt.personalDetails.maritalStatus}
              </label>
              <div className="relative">
                <input
                  id="field-maritalStatus"
                  type="text"
                  readOnly
                  value={getLocalizedMaritalStatus(String(details.maritalStatus))}
                  aria-readonly="true"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F3F2F1] text-[#323130] border border-[#D1D1D1] cursor-default focus-visible:outline-none"
                />
                <span className="absolute rtl:left-2.5 ltr:right-2.5 top-2 text-[10px] text-[#605E5C] bg-[#EDEBE9] px-1">
                  MaritalStatus
                </span>
              </div>
            </div>

            {/* 2. Marital Status Date */}
            <div>
              <label htmlFor="field-maritalStatusDate" className="block text-xs font-semibold text-[#605E5C] mb-1">
                {pt.personalDetails.maritalStatusDate}
              </label>
              <div className="relative">
                <input
                  id="field-maritalStatusDate"
                  type="text"
                  readOnly
                  value={details.maritalStatusDate}
                  aria-readonly="true"
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#F3F2F1] text-[#323130] border border-[#D1D1D1] cursor-default focus-visible:outline-none"
                />
                <Calendar className="w-3.5 h-3.5 text-[#605E5C] absolute rtl:left-2.5 ltr:right-2.5 top-2.5" aria-hidden="true" />
              </div>
            </div>

            {/* 3. Dependents Count */}
            <div>
              <label htmlFor="field-dependentsCount" className="block text-xs font-semibold text-[#605E5C] mb-1">
                {pt.personalDetails.dependentsCount}
              </label>
              <div className="relative">
                <input
                  id="field-dependentsCount"
                  type="text"
                  readOnly
                  value={details.dependentsCount}
                  aria-readonly="true"
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#F3F2F1] text-[#323130] border border-[#D1D1D1] cursor-default focus-visible:outline-none"
                />
                <Users className="w-3.5 h-3.5 text-[#605E5C] absolute rtl:left-2.5 ltr:right-2.5 top-2.5" aria-hidden="true" />
              </div>
            </div>

            {/* 4. Spouse Working */}
            <div>
              <label htmlFor="field-spouseWorking" className="block text-xs font-semibold text-[#605E5C] mb-1">
                {pt.personalDetails.spouseWorking}
              </label>
              <div className="relative">
                <input
                  id="field-spouseWorking"
                  type="text"
                  readOnly
                  value={getLocalizedBoolean(String(details.spouseWorking))}
                  aria-readonly="true"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F3F2F1] text-[#323130] border border-[#D1D1D1] cursor-default focus-visible:outline-none"
                />
                <Heart className="w-3.5 h-3.5 text-[#605E5C] absolute rtl:left-2.5 ltr:right-2.5 top-2.5" aria-hidden="true" />
              </div>
            </div>

            {/* 5. Religion */}
            <div>
              <label htmlFor="field-religion" className="block text-xs font-semibold text-[#605E5C] mb-1">
                {pt.personalDetails.religion}
              </label>
              <div className="relative">
                <input
                  id="field-religion"
                  type="text"
                  readOnly
                  value={getLocalizedReligion(String(details.religion))}
                  aria-readonly="true"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F3F2F1] text-[#323130] border border-[#D1D1D1] cursor-default focus-visible:outline-none"
                />
                <span className="absolute rtl:left-2.5 ltr:right-2.5 top-2 text-[10px] text-[#605E5C] bg-[#EDEBE9] px-1">
                  ReligionId
                </span>
              </div>
            </div>

            {/* 6. Educational Qualification */}
            <div>
              <label htmlFor="field-educationQualification" className="block text-xs font-semibold text-[#605E5C] mb-1">
                {pt.personalDetails.educationQualification}
              </label>
              <div className="relative">
                <input
                  id="field-educationQualification"
                  type="text"
                  readOnly
                  value={getLocalizedEducation(String(details.educationQualification))}
                  aria-readonly="true"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F3F2F1] text-[#323130] border border-[#D1D1D1] cursor-default focus-visible:outline-none"
                />
                <GraduationCap className="w-3.5 h-3.5 text-[#605E5C] absolute rtl:left-2.5 ltr:right-2.5 top-2.5" aria-hidden="true" />
              </div>
            </div>

            {/* 7. Retirement Date */}
            <div>
              <label htmlFor="field-retirementDate" className="block text-xs font-semibold text-[#605E5C] mb-1">
                {pt.personalDetails.retirementDate}
              </label>
              <div className="relative">
                <input
                  id="field-retirementDate"
                  type="text"
                  readOnly
                  value={details.retirementDate}
                  aria-readonly="true"
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#F3F2F1] text-[#323130] border border-[#D1D1D1] cursor-default focus-visible:outline-none"
                />
                <Calendar className="w-3.5 h-3.5 text-[#0078D4] absolute rtl:left-2.5 ltr:right-2.5 top-2.5" aria-hidden="true" />
              </div>
            </div>

            {/* 8. Special Needs / Determination */}
            <div>
              <label htmlFor="field-isDisabled" className="block text-xs font-semibold text-[#605E5C] mb-1">
                {pt.personalDetails.isDisabled}
              </label>
              <div className="relative">
                <input
                  id="field-isDisabled"
                  type="text"
                  readOnly
                  value={getLocalizedBoolean(String(details.isDisabled))}
                  aria-readonly="true"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F3F2F1] text-[#323130] border border-[#D1D1D1] cursor-default focus-visible:outline-none"
                />
                <span className="absolute rtl:left-2.5 ltr:right-2.5 top-2 text-[10px] text-[#605E5C] bg-[#EDEBE9] px-1">
                  DisabledPerson
                </span>
              </div>
            </div>

            {/* 9. Verification Date */}
            <div className="sm:col-span-2">
              <label htmlFor="field-verificationDate" className="block text-xs font-semibold text-[#605E5C] mb-1">
                {pt.personalDetails.verificationDate}
              </label>
              <div className="relative">
                <input
                  id="field-verificationDate"
                  type="text"
                  readOnly
                  value={details.verificationDate}
                  aria-readonly="true"
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#F3F2F1] text-[#323130] border border-[#D1D1D1] cursor-default focus-visible:outline-none"
                />
                <div className="absolute rtl:left-2.5 ltr:right-2.5 top-2 flex items-center gap-1 text-[10px] text-[#107C41]">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  <span>{pt.personalDetails.verifiedInD365}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="text-[11px] text-[#605E5C] flex items-center justify-between pt-1">
          <span>{pt.personalDetails.readyBanner}</span>
          <span className="font-mono">{pt.personalDetails.workerPrefix} {employee.id}</span>
        </div>
      </div>
    </D365Dialog>
  );
};
