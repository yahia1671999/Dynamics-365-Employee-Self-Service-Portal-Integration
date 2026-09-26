import React, { useState } from 'react';
import {
  Calendar,
  Award,
  AlertTriangle,
  Clock,
  Plus,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Activity,
  Layers,
  FileCheck,
  Send,
  UserCheck,
  Building,
  RefreshCw,
  FileSpreadsheet,
  Users,
  Eye,
  XCircle,
  User,
  Info,
  Building2,
  LogOut,
  ArrowUpLeft,
  Briefcase,
  Compass,
  CreditCard
} from 'lucide-react';
import { D365ActionBar } from '../common/D365ActionBar';
import { D365Dialog } from '../common/D365Dialog';
import { PersonalDetailsDialog } from './PersonalDetailsDialog';
import { UnifiedRequestItem } from '../../types/d365.types';
import { d365Service } from '../../services/d365Service';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations, formatString } from '../../i18n/popupTranslations';
import {
  Employee,
  LeaveBalance,
  LeaveRequest,
  Penalty,
  TrainingCourse,
  PerformanceEvaluation,
  MonitoringOperation
} from '../../types/d365.types';
import { QuickActionType } from '../requests/QuickActionDialog';

interface EmployeeDashboardViewProps {
  employee: Employee;
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  penalties: Penalty[];
  trainingCourses: TrainingCourse[];
  performanceEvaluations: PerformanceEvaluation[];
  monitoringOperations: MonitoringOperation[];
  unifiedRequests?: UnifiedRequestItem[];
  onOpenNewLeave: () => void;
  onOpenLeaveBalanceDialog: () => void;
  onOpenPenaltiesDialog: () => void;
  onOpenTrainingDialog: () => void;
  onOpenPerformanceDialog: () => void;
  onOpenMonitoringDialog: (initialMode?: 'records' | 'disclosure' | 'test') => void;
  onQuickAction: (actionType: QuickActionType) => void;
  onRefresh: () => void;
  onExportExcel: () => void;
  onNavigateToTeam?: () => void;
}

export const EmployeeDashboardView: React.FC<EmployeeDashboardViewProps> = ({
  employee,
  leaveBalances,
  leaveRequests,
  penalties,
  trainingCourses,
  performanceEvaluations,
  monitoringOperations,
  unifiedRequests,
  onOpenNewLeave,
  onOpenLeaveBalanceDialog,
  onOpenPenaltiesDialog,
  onOpenTrainingDialog,
  onOpenPerformanceDialog,
  onOpenMonitoringDialog,
  onQuickAction,
  onRefresh,
  onExportExcel,
  onNavigateToTeam,
}) => {
  const [selectedUnifiedRequest, setSelectedUnifiedRequest] = useState<UnifiedRequestItem | null>(null);
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);

  const allRecentRequests = unifiedRequests && unifiedRequests.length > 0
    ? unifiedRequests
    : d365Service.getUnifiedRequests();

  // Active annual leave balance
  const annualBalance = leaveBalances.find((b) => b.leaveTypeCode === 'ANNUAL')?.currentBalance || 24;
  const activePenaltiesCount = penalties.filter((p) => p.penaltyStatus === 'Active' || p.hearingStatus).length || 1;

  // Personalization settings hook for dynamic labels and theme
  const { t, accentConfig, language } = usePersonalization();
  const pt = getPopupTranslations(language);

  // Secondment and Loan Business Rules State Detection
  const isSeconded = employee.employmentStatus === 'Seconded' || (employee.employmentStatusAr && employee.employmentStatusAr.includes('منتدب'));
  const isLoaned = employee.employmentStatus === 'Loaned' || (employee.employmentStatusAr && employee.employmentStatusAr.includes('معار'));
  const isNormalActive = !isSeconded && !isLoaned;

  return (
    <div className="space-y-4">
      {/* Dynamics Action Bar */}
      <D365ActionBar
        onNew={isNormalActive ? onOpenNewLeave : undefined}
        newButtonLabel={isNormalActive ? t('action.requestLeave', 'تقديم طلب إجازة', 'Request Leave') : undefined}
        onRefresh={onRefresh}
        customActions={
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Quick Status Review Switcher */}
            <div className="hidden sm:flex items-center gap-1 border border-[#D1D1D1] bg-white px-2 py-0.5 text-[11px]">
              <span className="text-[#605E5C] text-[10px] font-semibold">محاكاة الحالة:</span>
              <button
                type="button"
                onClick={() => d365Service.setEmployeeEmploymentStatus('Active')}
                className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
                  isNormalActive ? 'bg-[#107C41] text-white font-bold' : 'hover:bg-[#F3F2F1] text-[#323130]'
                }`}
                title="العودة للحالة الطبيعية واستعادة الطلبات القياسية"
              >
                نشط طبيعي
              </button>
              <button
                type="button"
                onClick={() => d365Service.setEmployeeEmploymentStatus('Seconded', 'وزارة الاتصالات وتقنية المعلومات')}
                className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
                  isSeconded ? 'bg-[#0078D4] text-white font-bold' : 'hover:bg-[#F3F2F1] text-[#323130]'
                }`}
                title="تفعيل حالة منتدب وحجب الطلبات العادية"
              >
                منتدب
              </button>
              <button
                type="button"
                onClick={() => d365Service.setEmployeeEmploymentStatus('Loaned', 'جامعة الملك سعود - كلية علوم الحاسب')}
                className={`px-1.5 py-0.5 transition-colors cursor-pointer ${
                  isLoaned ? 'bg-[#5C2D91] text-white font-bold' : 'hover:bg-[#F3F2F1] text-[#323130]'
                }`}
                title="تفعيل حالة معار وحجب الطلبات العادية"
              >
                معار
              </button>
            </div>

            {isSeconded && (
              <>
                <button
                  type="button"
                  onClick={() => onQuickAction('SECONDMENT_RENEW')}
                  className="flex items-center gap-1 px-2.5 py-1 min-h-[30px] bg-[#0078D4] text-white hover:bg-[#106EBE] font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                  title="تجديد فترة الندب مع الاحتفاظ بنفس الجهة تلقائياً"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-white" />
                  <span>تجديد الندب</span>
                </button>
                <button
                  type="button"
                  onClick={() => onQuickAction('SECONDMENT_TERMINATE')}
                  className="flex items-center gap-1 px-2.5 py-1 min-h-[30px] bg-[#A80000] text-white hover:bg-[#8A0000] font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                  title="إنهاء فترة الندب واستعادة الحالة النشطة الطبيعية"
                >
                  <XCircle className="w-3.5 h-3.5 text-white" />
                  <span>إنهاء الندب</span>
                </button>
              </>
            )}

            {isLoaned && (
              <>
                <button
                  type="button"
                  onClick={() => onQuickAction('LOAN_RENEW')}
                  className="flex items-center gap-1 px-2.5 py-1 min-h-[30px] bg-[#0078D4] text-white hover:bg-[#106EBE] font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                  title="تجديد فترة الإعارة مع الاحتفاظ بنفس الجهة المستعيرة تلقائياً"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-white" />
                  <span>تجديد الإعارة</span>
                </button>
                <button
                  type="button"
                  onClick={() => onQuickAction('LOAN_TERMINATE')}
                  className="flex items-center gap-1 px-2.5 py-1 min-h-[30px] bg-[#A80000] text-white hover:bg-[#8A0000] font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                  title="إنهاء فترة الإعارة واستعادة الحالة النشطة الطبيعية"
                >
                  <XCircle className="w-3.5 h-3.5 text-white" />
                  <span>إنهاء الإعارة</span>
                </button>
              </>
            )}
          </div>
        }
      />

      {/* 1. Enhanced Employee Profile Card (Full-width, Prominent, Professional Dynamics 365 RTL Design - Restored to Large Generous Size) */}
      <div
        style={{ borderTopColor: accentConfig.primary }}
        className="w-full bg-white border border-[#D2D0CE] border-t-4 p-5 sm:p-6 shadow-[0_2px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] transition-shadow duration-200"
      >
        {/* Top Header Row: Profile, Avatar & Key Summary Indicators */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-[#EDEBE9]">
          {/* Avatar & Employee Details */}
          <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
            <div
              style={{ backgroundColor: accentConfig.headerBg, borderColor: accentConfig.primary }}
              className="w-16 h-16 sm:w-20 sm:h-20 text-white border-2 flex items-center justify-center font-bold text-2xl sm:text-3xl font-sans overflow-hidden shrink-0 shadow-xs ring-2 ring-white/30"
            >
              {employee.avatarUrl ? (
                <img
                  src={employee.avatarUrl}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                employee.name.slice(0, 1)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-3">
                <h1 className="text-lg sm:text-xl font-bold text-[#201F1E] truncate tracking-tight">
                  {employee.name}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsPersonalDetailsOpen(true)}
                  style={{
                    color: accentConfig.primary,
                    backgroundColor: accentConfig.lightBg,
                    borderColor: accentConfig.lightBorder,
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border font-semibold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-1 shadow-2xs hover:shadow-xs hover:border-[#8A8886]"
                  title="عرض وتعديل البيانات الشخصية"
                >
                  <User className="w-3.5 h-3.5" style={{ color: accentConfig.primary }} />
                  <span>{t('profile.personalDetails', 'البيانات الشخصية', 'Personal Details')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Summary Highlights */}
          <div className="flex items-stretch flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            {/* Direct Manager */}
            <div className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#FAF9F8] border border-[#EDEBE9] hover:border-[#D2D0CE] transition-colors min-w-[140px] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#605E5C] block mb-1">{t('profile.directManager', 'المدير المباشر', 'Direct Manager')}</span>
              <strong className="text-xs sm:text-[13px] font-bold text-[#201F1E] block truncate" title={employee.directManager}>
                {employee.directManager}
              </strong>
            </div>

            {/* Years of Service */}
            <div className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#FAF9F8] border border-[#EDEBE9] hover:border-[#D2D0CE] transition-colors min-w-[120px] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#605E5C] block mb-1">{t('profile.yearsOfService', 'سنوات الخدمة', 'Years of Service')}</span>
              <strong className="text-xs sm:text-[13px] font-bold font-mono text-[#201F1E] block tabular-nums">
                {employee.yearsOfService || '6 سنوات'}
              </strong>
            </div>

            {/* Employment Status Badge */}
            <div
              className={`flex-1 sm:flex-initial px-4 py-2.5 border min-w-[150px] shadow-2xs transition-colors ${
                isSeconded
                  ? 'bg-[#EFF6FC] border-[#C7E0F4]'
                  : isLoaned
                  ? 'bg-[#F3EFF8] border-[#D3C7E8]'
                  : 'bg-[#F1F9F1] border-[#C2E5C5]'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#605E5C]">{t('profile.empStatus', 'حالة الموظف', 'Employee Status')}</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSeconded ? 'bg-[#0078D4]' : isLoaned ? 'bg-[#5C2D91]' : 'bg-[#107C41]'
                  }`}
                />
              </div>
              <strong
                className={`text-xs sm:text-[13px] font-bold block truncate ${
                  isSeconded ? 'text-[#0078D4]' : isLoaned ? 'text-[#5C2D91]' : 'text-[#107C41]'
                }`}
                title={
                  employee.employmentStatusAr +
                  (isSeconded && employee.secondmentDetails?.entity ? ` (${employee.secondmentDetails.entity})` : '') +
                  (isLoaned && employee.loanDetails?.entity ? ` (${employee.loanDetails.entity})` : '')
                }
              >
                {employee.employmentStatusAr}
                {isSeconded && employee.secondmentDetails?.entity ? ` (${employee.secondmentDetails.entity})` : ''}
                {isLoaned && employee.loanDetails?.entity ? ` (${employee.loanDetails.entity})` : ''}
              </strong>
            </div>
          </div>
        </div>

        {/* 10 Distinct Employee Info Grid (Modern Microsoft Dynamics 365 Info Cards with Refined Border & Fluent Icons) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-4 text-xs">
          {/* 1. Job Grade */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.jobGrade', 'المستوى الوظيفي', 'Job Grade')}:</span>
              <strong className="text-xs sm:text-[13px] text-[#201F1E] font-bold block truncate" title={employee.jobGrade}>
                {employee.jobGrade}
              </strong>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#EFF6FC] border border-[#C7E0F4] text-[#0078D4] flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* 2. Job Title */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.jobTitle', 'الوظيفة', 'Job Title')}:</span>
              <strong className="text-xs sm:text-[13px] text-[#201F1E] font-bold block truncate" title={employee.jobTitle}>
                {employee.jobTitle}
              </strong>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#F3EFF8] border border-[#D3C7E8] text-[#5C2D91] flex items-center justify-center shrink-0 shadow-2xs">
              <Briefcase className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* 3. Employment Status */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.employmentStatus', 'حالة الموظف', 'Employment Status')}:</span>
              <strong
                className={`text-xs sm:text-[13px] font-bold block truncate ${
                  isSeconded ? 'text-[#0078D4]' : isLoaned ? 'text-[#5C2D91]' : 'text-[#107C41]'
                }`}
                title={employee.employmentStatusAr}
              >
                {employee.employmentStatusAr}
              </strong>
            </div>
            <div
              className={`w-9 h-9 rounded-[4px] border flex items-center justify-center shrink-0 shadow-2xs ${
                isSeconded
                  ? 'bg-[#EFF6FC] border-[#C7E0F4] text-[#0078D4]'
                  : isLoaned
                  ? 'bg-[#F3EFF8] border-[#D3C7E8] text-[#5C2D91]'
                  : 'bg-[#F1F9F1] border-[#C2E5C5] text-[#107C41]'
              }`}
            >
              <Activity className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* 4. Years of Service */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.yearsOfService', 'سنوات الخدمة', 'Years of Service')}:</span>
              <strong className="text-xs sm:text-[13px] text-[#201F1E] font-mono font-bold block tabular-nums">
                {employee.yearsOfService || '6 سنوات'}
              </strong>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#FFF9E6] border border-[#FFE7A3] text-[#B48200] flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* 5. Direct Manager */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.directManager', 'المدير المباشر', 'Direct Manager')}:</span>
              <strong
                className="text-xs sm:text-[13px] text-[#201F1E] font-bold block truncate"
                title={employee.directManager}
              >
                {employee.directManager}
              </strong>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#EFF6FC] border border-[#C7E0F4] text-[#004E8C] flex items-center justify-center shrink-0 shadow-2xs">
              <User className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* 6. Department */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.department', 'الإدارة', 'Department')}:</span>
              <strong className="text-xs sm:text-[13px] text-[#201F1E] font-bold block truncate" title={employee.department}>
                {employee.department}
              </strong>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#E6F4F2] border border-[#B3DFD8] text-[#008272] flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* 7. Job Group */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.jobGroup', 'المجموعة الوظيفية', 'Job Group')}:</span>
              <strong className="text-xs sm:text-[13px] text-[#201F1E] font-bold block truncate" title={employee.department}>
                {employee.department}
              </strong>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5] flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* 8. Job Role */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.jobRole', 'المسمى الوظيفي', 'Job Role')}:</span>
              <strong className="text-xs sm:text-[13px] text-[#201F1E] font-bold block truncate" title="محلل نظم">
                محلل نظم
              </strong>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#EFF6FC] border border-[#C7E0F4] text-[#0078D4] flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* 9. Classification Group */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.classificationGroup', 'المجموعة النوعية', 'Classification Group')}:</span>
              <strong className="text-xs sm:text-[13px] text-[#201F1E] font-bold block truncate" title={employee.division}>
                {employee.division}
              </strong>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#FDF3F2] border border-[#F8D2CC] text-[#D83B01] flex items-center justify-center shrink-0 shadow-2xs">
              <Compass className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          {/* 10. Civil ID */}
          <div className="bg-white border border-[#EDEBE9] rounded-[4px] p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] hover:border-[#0078D4]/50 transition-all duration-150 flex items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] sm:text-[11.5px] text-[#605E5C] font-semibold block mb-0.5 truncate">{t('profile.civilId', 'الرقم القومي', 'National ID')}:</span>
              <span className="text-xs sm:text-[13px] font-mono font-bold block tracking-wider tabular-nums truncate text-[#201F1E]">
                {employee.civilId || '—'}
              </span>
            </div>
            <div className="w-9 h-9 rounded-[4px] bg-[#F3F2F1] border border-[#D2D0CE] text-[#494544] flex items-center justify-center shrink-0 shadow-2xs">
              <CreditCard className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. 5 Executive Dashboard KPI Cards (Modern Microsoft Dynamics 365 Style: Bottom Accent Line, Square Icon on Right, Action Arrow on Left, Centered Metric) */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Leave Balance - Accent: #0078D4 */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${t('kpi.leaveBalance', 'رصيد الإجازات', 'Leave Balance')}: ${annualBalance}`}
          onClick={onOpenLeaveBalanceDialog}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenLeaveBalanceDialog();
            }
          }}
          className="bg-white border border-[#EDEBE9] rounded-[6px] p-4.5 sm:p-5 cursor-pointer transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,120,212,0.12)] hover:-translate-y-1 active:translate-y-0 group relative flex flex-col justify-between min-h-[190px] overflow-hidden select-none focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none"
        >
          {/* Bottom Accent Line */}
          <div
            style={{ backgroundColor: accentConfig.primary }}
            className="absolute bottom-0 left-0 right-0 h-[4px]"
            aria-hidden="true"
          />

          {/* Top Header: Square Icon + Title (Right/Start in RTL) and Circular Arrow (Left/End) */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                style={{
                  backgroundColor: accentConfig.lightBg,
                  borderColor: accentConfig.lightBorder,
                  color: accentConfig.primary,
                }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-[6px] border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs"
              >
                <Calendar className="w-5 h-5 sm:w-5.5 sm:h-5.5" aria-hidden="true" />
              </div>
              <span className="font-bold text-xs sm:text-[13px] text-[#201F1E] group-hover:text-[#0078D4] transition-colors leading-tight truncate">
                {t('kpi.leaveBalance', 'رصيد الإجازات', 'Leave Balance')}
              </span>
            </div>

            <div
              style={{ color: accentConfig.primary }}
              className="w-8 h-8 rounded-full border border-[#EDEBE9] bg-[#FAF9F8] group-hover:bg-white flex items-center justify-center shrink-0 transition-all duration-150 shadow-2xs group-hover:border-[#C7E0F4]"
              aria-hidden="true"
            >
              <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
            </div>
          </div>

          {/* Centered Large KPI Metric & Descriptive Label */}
          <div className="my-2.5 text-center">
            <div
              className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums leading-none"
              style={{ color: accentConfig.primary }}
            >
              {annualBalance}
            </div>
            <div className="text-xs text-[#605E5C] font-medium mt-2 truncate">
              {t('kpi.availableDays', 'يوم متاح للاستخدام', 'Available Days')}
            </div>
          </div>
        </div>

        {/* Card 2: Penalties - Accent: #D83B01 */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${t('kpi.penalties', 'الجزاءات والعقوبات', 'Penalties')}: ${activePenaltiesCount}`}
          onClick={onOpenPenaltiesDialog}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenPenaltiesDialog();
            }
          }}
          className="bg-white border border-[#EDEBE9] rounded-[6px] p-4.5 sm:p-5 cursor-pointer transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(216,59,1,0.14)] hover:-translate-y-1 active:translate-y-0 group relative flex flex-col justify-between min-h-[190px] overflow-hidden select-none focus-visible:ring-2 focus-visible:ring-[#D83B01] focus-visible:outline-none"
        >
          {/* Bottom Accent Line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#D83B01]"
            aria-hidden="true"
          />

          {/* Top Header: Square Icon + Title (Right/Start in RTL) and Circular Arrow (Left/End) */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[6px] bg-[#FDF3F2] border border-[#F8D2CC] text-[#D83B01] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                <AlertTriangle className="w-5 h-5 sm:w-5.5 sm:h-5.5" aria-hidden="true" />
              </div>
              <span className="font-bold text-xs sm:text-[13px] text-[#201F1E] group-hover:text-[#D83B01] transition-colors leading-tight truncate">
                {t('kpi.penalties', 'الجزاءات', 'Penalties')}
              </span>
            </div>

            <div
              className="w-8 h-8 rounded-full border border-[#EDEBE9] bg-[#FAF9F8] group-hover:bg-white text-[#D83B01] flex items-center justify-center shrink-0 transition-all duration-150 shadow-2xs group-hover:border-[#F8D2CC]"
              aria-hidden="true"
            >
              <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
            </div>
          </div>

          {/* Centered Large KPI Metric & Descriptive Label */}
          <div className="my-2.5 text-center">
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums leading-none text-[#D83B01]">
              {activePenaltiesCount}
            </div>
            <div className="text-xs text-[#605E5C] font-medium mt-2 truncate">
              {t('kpi.recordedDecisions', 'قرار مسجل ساري', 'Recorded Decisions')}
            </div>
          </div>
        </div>

        {/* Card 3: Training Courses - Accent: #5C2D91 */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${t('kpi.trainingCourses', 'الدورات التدريبية', 'Training Courses')}: ${trainingCourses.length}`}
          onClick={onOpenTrainingDialog}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenTrainingDialog();
            }
          }}
          className="bg-white border border-[#EDEBE9] rounded-[6px] p-4.5 sm:p-5 cursor-pointer transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(92,45,145,0.14)] hover:-translate-y-1 active:translate-y-0 group relative flex flex-col justify-between min-h-[190px] overflow-hidden select-none focus-visible:ring-2 focus-visible:ring-[#5C2D91] focus-visible:outline-none"
        >
          {/* Bottom Accent Line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#5C2D91]"
            aria-hidden="true"
          />

          {/* Top Header: Square Icon + Title (Right/Start in RTL) and Circular Arrow (Left/End) */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[6px] bg-[#F3EFF8] border border-[#D3C7E8] text-[#5C2D91] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                <Award className="w-5 h-5 sm:w-5.5 sm:h-5.5" aria-hidden="true" />
              </div>
              <span className="font-bold text-xs sm:text-[13px] text-[#201F1E] group-hover:text-[#5C2D91] transition-colors leading-tight truncate">
                {t('kpi.trainingCourses', 'الدورات التدريبية', 'Training Courses')}
              </span>
            </div>

            <div
              className="w-8 h-8 rounded-full border border-[#EDEBE9] bg-[#FAF9F8] group-hover:bg-white text-[#5C2D91] flex items-center justify-center shrink-0 transition-all duration-150 shadow-2xs group-hover:border-[#D3C7E8]"
              aria-hidden="true"
            >
              <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
            </div>
          </div>

          {/* Centered Large KPI Metric & Descriptive Label */}
          <div className="my-2.5 text-center">
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums leading-none text-[#5C2D91]">
              {trainingCourses.length}
            </div>
            <div className="text-xs text-[#605E5C] font-medium mt-2 truncate">
              {t('kpi.registeredCourses', 'دورات مسجلة ومعتمدة', 'Registered Courses')}
            </div>
          </div>
        </div>

        {/* Card 4: Performance Evaluations - Accent: #107C41 */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${t('kpi.performanceEvaluations', 'تقييمات الأداء', 'Performance Evaluations')}: ${performanceEvaluations.length}`}
          onClick={onOpenPerformanceDialog}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenPerformanceDialog();
            }
          }}
          className="bg-white border border-[#EDEBE9] rounded-[6px] p-4.5 sm:p-5 cursor-pointer transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(16,124,65,0.14)] hover:-translate-y-1 active:translate-y-0 group relative flex flex-col justify-between min-h-[190px] overflow-hidden select-none focus-visible:ring-2 focus-visible:ring-[#107C41] focus-visible:outline-none"
        >
          {/* Bottom Accent Line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#107C41]"
            aria-hidden="true"
          />

          {/* Top Header: Square Icon + Title (Right/Start in RTL) and Circular Arrow (Left/End) */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[6px] bg-[#F1F9F1] border border-[#C2E5C5] text-[#107C41] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                <ShieldCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5" aria-hidden="true" />
              </div>
              <span className="font-bold text-xs sm:text-[13px] text-[#201F1E] group-hover:text-[#107C41] transition-colors leading-tight truncate">
                {t('kpi.performanceEvaluations', 'تقييمات الأداء', 'Performance Evaluations')}
              </span>
            </div>

            <div
              className="w-8 h-8 rounded-full border border-[#EDEBE9] bg-[#FAF9F8] group-hover:bg-white text-[#107C41] flex items-center justify-center shrink-0 transition-all duration-150 shadow-2xs group-hover:border-[#C2E5C5]"
              aria-hidden="true"
            >
              <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
            </div>
          </div>

          {/* Centered Large KPI Metric & Descriptive Label */}
          <div className="my-2.5 text-center">
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums leading-none text-[#107C41]">
              {performanceEvaluations.length}
            </div>
            <div className="text-xs text-[#605E5C] font-medium mt-2 truncate">
              {t('kpi.approvedReports', 'تقارير أداء سنوية معتمدة', 'Approved Reports')}
            </div>
          </div>
        </div>

        {/* Card 5: Monitoring Operations - Accent: #008272 */}
        <div
          role="button"
          tabIndex={0}
          aria-label={t('kpi.monitoringOperations', 'عمليات المراقبة والإقرارات', 'Monitoring Operations')}
          onClick={() => onOpenMonitoringDialog('records')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenMonitoringDialog('records');
            }
          }}
          className="bg-white border border-[#EDEBE9] rounded-[6px] p-4.5 sm:p-5 cursor-pointer transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(0,130,114,0.14)] hover:-translate-y-1 active:translate-y-0 group relative flex flex-col justify-between min-h-[190px] overflow-hidden select-none focus-visible:ring-2 focus-visible:ring-[#008272] focus-visible:outline-none"
        >
          {/* Bottom Accent Line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#008272]"
            aria-hidden="true"
          />

          {/* Top Header: Square Icon + Title (Right/Start in RTL) and Circular Arrow (Left/End) */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[6px] bg-[#E6F4F2] border border-[#B3DFD8] text-[#008272] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                <Activity className="w-5 h-5 sm:w-5.5 sm:h-5.5" aria-hidden="true" />
              </div>
              <span className="font-bold text-xs sm:text-[13px] text-[#201F1E] group-hover:text-[#008272] transition-colors leading-tight truncate">
                {t('kpi.monitoringOperations', 'عمليات المراقبة', 'Monitoring Operations')}
              </span>
            </div>

            <div
              className="w-8 h-8 rounded-full border border-[#EDEBE9] bg-[#FAF9F8] group-hover:bg-white text-[#008272] flex items-center justify-center shrink-0 transition-all duration-150 shadow-2xs group-hover:border-[#B3DFD8]"
              aria-hidden="true"
            >
              <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
            </div>
          </div>

          {/* Centered Large KPI Metric & Descriptive Label */}
          <div className="my-2.5 text-center">
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums leading-none text-[#008272]">
              {monitoringOperations.length}
            </div>
            <div className="text-xs text-[#605E5C] font-medium mt-2 truncate">
              {monitoringOperations.filter((o) => o.status === 'استكمل المطلوب').length > 0 ? (
                <span className="text-[#B48200] font-bold">
                  {monitoringOperations.filter((o) => o.status === 'استكمل المطلوب').length} طلب يتطلب الاستكمال
                </span>
              ) : (
                t('kpi.disclosuresAndTests', 'إقرارات وفحوصات دورية', 'Disclosures & Tests')
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Card (Matching Screenshot 7 & Elevated D365 Card Styling) */}
      <div
        style={{ borderTopColor: accentConfig.primary }}
        className="w-full bg-white border border-[#D2D0CE] border-t-[3px] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200"
      >
        <div className="text-xs font-bold text-[#323130] mb-3.5 flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#EDEBE9]">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4" style={{ backgroundColor: accentConfig.primary }}></div>
            <span className="text-xs sm:text-sm font-bold text-[#201F1E]">{t('action.quickActions', 'الإجراءات السريعة (Quick Actions):', 'Quick Actions:')}</span>
          </div>

          {/* Business rule status indicator tag */}
          {isSeconded && (
            <span className="text-[11px] bg-[#EFF6FC] text-[#0078D4] border border-[#C7E0F4] px-2.5 py-0.5 font-semibold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0078D4] animate-pulse"></span>
              <span>حالة الموظف: منتدب (تم حجب الطلبات العادية وتفعيل تجديد/إنهاء الندب)</span>
            </span>
          )}
          {isLoaned && (
            <span className="text-[11px] bg-[#F3EFF8] text-[#5C2D91] border border-[#D3C7E8] px-2.5 py-0.5 font-semibold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#5C2D91] animate-pulse"></span>
              <span>حالة الموظف: معار (تم حجب الطلبات العادية وتفعيل تجديد/إنهاء الإعارة)</span>
            </span>
          )}
        </div>

        {/* Informative Rule Notice Banner when Seconded */}
        {isSeconded && (
          <div className="mb-3.5 p-3 bg-[#EFF6FC] border-r-4 border-r-[#0078D4] border-y border-l border-[#C7E0F4] text-[#004578] text-xs flex items-start gap-2.5 shadow-2xs">
            <Info className="w-4 h-4 text-[#0078D4] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-semibold mb-0.5">قاعدة الأعمال بنظام Dynamics 365 (Business Rule Active):</strong>
              <span>
                الموظف منتدب حالياً لدى <strong>({employee.secondmentDetails?.entity || 'وزارة الاتصالات وتقنية المعلومات'})</strong>. 
                تم حجب كافة الطلبات العادية مثل (الإجازة، الإذن، النقل، الندب الجديد، الإعارة)، وحصر الإجراءات المتاحة في <strong>(تجديد الندب)</strong> مع الاحتفاظ بنفس الجهة تلقائياً أو <strong>(إنهاء الندب)</strong> للعودة للعمل الأصلي.
              </span>
            </div>
          </div>
        )}

        {/* Informative Rule Notice Banner when Loaned */}
        {isLoaned && (
          <div className="mb-3.5 p-3 bg-[#F3EFF8] border-r-4 border-r-[#5C2D91] border-y border-l border-[#D3C7E8] text-[#451E6B] text-xs flex items-start gap-2.5 shadow-2xs">
            <Info className="w-4 h-4 text-[#5C2D91] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-semibold mb-0.5">قاعدة الأعمال بنظام Dynamics 365 (Business Rule Active):</strong>
              <span>
                الموظف معار حالياً لدى <strong>({employee.loanDetails?.entity || 'جامعة الملك سعود - كلية علوم الحاسب'})</strong>. 
                تم حجب كافة الطلبات العادية مثل (الإجازة، الإذن، النقل، الندب، الإعارة الجديدة)، وحصر الإجراءات المتاحة في <strong>(تجديد الإعارة)</strong> مع الاحتفاظ بنفس الجهة المستعيرة تلقائياً أو <strong>(إنهاء الإعارة)</strong> للعودة للعمل الأصلي.
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center flex-wrap gap-2 text-xs pt-0.5">
          {/* Normal Requests: ONLY rendered when employee is NOT Seconded and NOT Loaned */}
          {isNormalActive && (
            <>
              <button
                onClick={onOpenNewLeave}
                style={{ backgroundColor: accentConfig.primary }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] text-white font-semibold transition-all duration-150 shrink-0 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('action.requestLeave', 'تقديم طلب إجازة', 'Request Leave')}</span>
              </button>

              <button
                onClick={() => onQuickAction('PERMISSION')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] bg-white hover:bg-[#FAF9F8] text-[#323130] border border-[#8A8886] hover:border-[#323130] font-semibold transition-all duration-150 shrink-0 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" style={{ color: accentConfig.primary }} aria-hidden="true" />
                <span>{t('action.requestPermission', 'تقديم طلب إذن', 'Request Permission')}</span>
              </button>

              <button
                onClick={() => onQuickAction('SECONDMENT')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] bg-white hover:bg-[#FAF9F8] text-[#323130] border border-[#8A8886] hover:border-[#323130] font-semibold transition-all duration-150 shrink-0 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" style={{ color: accentConfig.primary }} aria-hidden="true" />
                <span>{t('action.requestSecondment', 'تقديم طلب ندب', 'Request Secondment')}</span>
              </button>

              <button
                onClick={() => onQuickAction('LOAN')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] bg-white hover:bg-[#FAF9F8] text-[#323130] border border-[#8A8886] hover:border-[#323130] font-semibold transition-all duration-150 shrink-0 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
              >
                <Building className="w-3.5 h-3.5" style={{ color: accentConfig.primary }} aria-hidden="true" />
                <span>{t('action.requestLoan', 'تقديم طلب إعارة', 'Request Loan')}</span>
              </button>

              <button
                onClick={() => onQuickAction('TRANSFER')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] bg-white hover:bg-[#FAF9F8] text-[#323130] border border-[#8A8886] hover:border-[#323130] font-semibold transition-all duration-150 shrink-0 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" style={{ color: accentConfig.primary }} aria-hidden="true" />
                <span>{t('action.requestTransfer', 'تقديم طلب نقل', 'Request Transfer')}</span>
              </button>
            </>
          )}

          {/* When Seconded ("منتدب"): Replaces "تقديم طلب ندب" with "تجديد الندب" and "إنهاء الندب" */}
          {isSeconded && (
            <>
              <button
                onClick={() => onQuickAction('SECONDMENT_RENEW')}
                style={{ backgroundColor: accentConfig.primary }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] text-white font-semibold transition-all duration-150 shrink-0 focus-visible:ring-2 focus-visible:outline-none cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                title="تجديد فترة الندب مع الاحتفاظ بنفس الجهة تلقائياً"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                <span>{t('action.renewSecondment', 'تجديد الندب', 'Renew Secondment')}</span>
              </button>

              <button
                onClick={() => onQuickAction('SECONDMENT_TERMINATE')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] bg-white hover:bg-[#A80000] text-[#A80000] hover:text-white border border-[#A80000] font-semibold transition-all duration-150 shrink-0 focus-visible:ring-2 focus-visible:ring-[#A80000] focus-visible:outline-none cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                title="إنهاء فترة الندب واستعادة الحالة النشطة الطبيعية وكافة الأزرار القياسية"
              >
                <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('action.terminateSecondment', 'إنهاء الندب', 'Terminate Secondment')}</span>
              </button>
            </>
          )}

          {/* When Loaned ("معار"): Replaces "تقديم طلب إعارة" with "تجديد الإعارة" and "إنهاء الإعارة" */}
          {isLoaned && (
            <>
              <button
                onClick={() => onQuickAction('LOAN_RENEW')}
                style={{ backgroundColor: accentConfig.primary }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] text-white font-semibold transition-all duration-150 shrink-0 focus-visible:ring-2 focus-visible:outline-none cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                title="تجديد فترة الإعارة مع الاحتفاظ بنفس الجهة المستعيرة تلقائياً"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                <span>{t('action.renewLoan', 'تجديد الإعارة', 'Renew Loan')}</span>
              </button>

              <button
                onClick={() => onQuickAction('LOAN_TERMINATE')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] bg-white hover:bg-[#A80000] text-[#A80000] hover:text-white border border-[#A80000] font-semibold transition-all duration-150 shrink-0 focus-visible:ring-2 focus-visible:ring-[#A80000] focus-visible:outline-none cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
                title="إنهاء فترة الإعارة واستعادة الحالة النشطة الطبيعية وكافة الأزرار القياسية"
              >
                <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('action.terminateLoan', 'إنهاء الإعارة', 'Terminate Loan')}</span>
              </button>
            </>
          )}

          {/* Monitoring Actions (Available for all statuses) */}
          <button
            onClick={() => onOpenMonitoringDialog('records')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] bg-white hover:bg-[#FAF9F8] text-[#323130] border border-[#8A8886] hover:border-[#323130] font-semibold transition-all duration-150 shrink-0 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
            title="طلبات إقرارات الذمة المالية ضمن عمليات المراقبة"
          >
            <FileCheck className="w-3.5 h-3.5" style={{ color: accentConfig.primary }} aria-hidden="true" />
            <span>{t('action.financialDisclosure', 'إقرارات الذمة المالية', 'Financial Disclosures')}</span>
          </button>

          <button
            onClick={() => onOpenMonitoringDialog('records')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] bg-white hover:bg-[#FAF9F8] text-[#323130] border border-[#8A8886] hover:border-[#323130] font-semibold transition-all duration-150 shrink-0 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
            title="طلبات اختبارات الكشف والمخدرات ضمن عمليات المراقبة"
          >
            <Activity className="w-3.5 h-3.5 text-[#107C41]" aria-hidden="true" />
            <span>{t('action.drugTest', 'اختبار المخدرات', 'Drug & Medical Test')}</span>
          </button>

          {onNavigateToTeam && (
            <button
              onClick={onNavigateToTeam}
              style={{
                backgroundColor: accentConfig.lightBg,
                borderColor: accentConfig.primary,
                color: accentConfig.primary,
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 min-h-[32px] sm:min-h-[34px] border font-bold transition-all duration-150 shrink-0 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:outline-none cursor-pointer"
              title="الانتقال إلى شاشة فريقي لمتابعة المرؤوسين"
            >
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('nav.myTeam', 'معلومات فريقي', 'My Team')} (18)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Recent Requests Table Card (Unified Recent Requests Data Source - Enterprise D365 Grid Styling) */}
      <div
        style={{ borderTopColor: accentConfig.primary }}
        className="w-full bg-white border border-[#D2D0CE] border-t-4 shadow-[0_2px_5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-200"
      >
        <div className="p-4 border-b border-[#D2D0CE] bg-[#FAF9F8] flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 shrink-0" style={{ backgroundColor: accentConfig.primary }}></div>
            <h2 className="text-xs sm:text-sm font-bold text-[#201F1E] tracking-tight">{t('table.recentRequests', 'الطلبات المقدمة مؤخراً (Recent Requests)', 'Recent Requests')}</h2>
          </div>
          <span
            className="text-xs border px-3 py-1 font-bold font-mono shadow-2xs"
            style={{
              backgroundColor: accentConfig.lightBg,
              borderColor: accentConfig.lightBorder,
              color: accentConfig.primary,
            }}
          >
            {allRecentRequests.length} {t('table.recordedRequests', 'طلبات مسجلة', 'Requests Recorded')}
          </span>
        </div>

        <div className="overflow-x-auto [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
          <table className="w-full text-xs text-right border-collapse min-w-[780px]">
            <thead>
              <tr className="bg-[#F3F2F1] border-b-2 border-[#D2D0CE] text-[#201F1E] font-bold text-xs">
                <th className="px-4 py-3 border-l border-[#EDEBE9]">{t('table.requestNumber', 'رقم الطلب', 'Request ID')}</th>
                <th className="px-4 py-3 border-l border-[#EDEBE9]">{t('table.requestType', 'نوع الطلب', 'Request Type')}</th>
                <th className="px-4 py-3 border-l border-[#EDEBE9]">{t('table.employee', 'الموظف', 'Employee')}</th>
                <th className="px-4 py-3 border-l border-[#EDEBE9]">{t('table.submissionDate', 'تاريخ التقديم', 'Submission Date')}</th>
                <th className="px-4 py-3 border-l border-[#EDEBE9]">{t('table.period', 'الفترة (من - إلى)', 'Period (From - To)')}</th>
                <th className="px-4 py-3 border-l border-[#EDEBE9] text-center">{t('table.status', 'الحالة', 'Status')}</th>
                <th className="px-4 py-3 text-center">{t('table.actions', 'الإجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEBE9]">
              {allRecentRequests.map((req, idx) => {
                const reqNum = req.requestNumber || req.id;
                const empName = req.employeeName || employee.name;

                // Status styling helper
                const renderBadge = () => {
                  switch (req.status) {
                    case 'Approved':
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-bold bg-[#DFF6DD] text-[#107C41] border border-[#107C41]/35 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#107C41] shrink-0" />
                          <span>{req.statusAr || 'تمت الموافقة'}</span>
                        </span>
                      );
                    case 'PendingApproval':
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-bold bg-[#EFF6FC] text-[#0078D4] border border-[#0078D4]/35 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0078D4] shrink-0 animate-pulse" />
                          <span>{req.statusAr || 'بانتظار الموافقة'}</span>
                        </span>
                      );
                    case 'InReview':
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-bold bg-[#FFF4CE] text-[#797673] border border-[#FDE300]/60 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B48200] shrink-0" />
                          <span>{req.statusAr || 'قيد المراجعة'}</span>
                        </span>
                      );
                    case 'Draft':
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-bold bg-[#F3F2F1] text-[#605E5C] border border-[#D1D1D1] shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8A8886] shrink-0" />
                          <span>{req.statusAr || 'مسودة'}</span>
                        </span>
                      );
                    case 'Rejected':
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-bold bg-[#FDF3F2] text-[#A80000] border border-[#A80000]/35 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A80000] shrink-0" />
                          <span>{req.statusAr || 'مرفوض'}</span>
                        </span>
                      );
                    default:
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-bold bg-[#F3F2F1] text-[#605E5C] border border-[#EDEBE9]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8A8886] shrink-0" />
                          <span>{req.statusAr}</span>
                        </span>
                      );
                  }
                };

                // Period helper
                const renderPeriod = () => {
                  if (!req.fromDate && !req.toDate) {
                    return <span className="text-[#A19F9D]">غير منطبق</span>;
                  }
                  if (req.fromDate && req.toDate) {
                    if (req.fromDate === req.toDate) {
                      return <span className="font-mono text-[#323130] font-semibold tabular-nums">{req.fromDate}</span>;
                    }
                    return (
                      <span className="font-mono text-[#323130] text-xs font-semibold tabular-nums">
                        {req.fromDate} <span className="text-[#605E5C] font-sans font-normal">إلى</span> {req.toDate}
                      </span>
                    );
                  }
                  if (req.fromDate) {
                    return (
                      <span className="font-mono text-[#323130] text-xs font-semibold tabular-nums">
                        <span className="text-[#605E5C] font-sans font-normal">من</span> {req.fromDate}
                      </span>
                    );
                  }
                  return <span className="text-[#A19F9D]">غير منطبق</span>;
                };

                return (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedUnifiedRequest(req)}
                    className={`border-b border-[#EDEBE9] transition-colors cursor-pointer ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF9F8]'
                    } hover:bg-[#EFF6FC]`}
                  >
                    <td className="px-4 py-3 border-l border-[#EDEBE9] font-mono font-bold tabular-nums" style={{ color: accentConfig.primary }}>
                      {reqNum}
                    </td>
                    <td className="px-4 py-3 border-l border-[#EDEBE9] font-bold text-[#201F1E]">
                      {req.requestType}
                    </td>
                    <td className="px-4 py-3 border-l border-[#EDEBE9] text-[#201F1E] font-medium">
                      {empName}
                    </td>
                    <td className="px-4 py-3 border-l border-[#EDEBE9] font-mono text-[#605E5C] tabular-nums">
                      {req.submissionDate}
                    </td>
                    <td className="px-4 py-3 border-l border-[#EDEBE9]">
                      {renderPeriod()}
                    </td>
                    <td className="px-4 py-3 border-l border-[#EDEBE9] text-center">
                      {renderBadge()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUnifiedRequest(req);
                        }}
                        style={{
                          color: accentConfig.primary,
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white hover:bg-[#F3F2F1] border border-[#8A8886] hover:border-[#323130] font-bold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 shadow-2xs hover:shadow-xs"
                        title="عرض تفاصيل الطلب"
                      >
                        <Eye className="w-3.5 h-3.5" style={{ color: accentConfig.primary }} />
                        <span>عرض التفاصيل</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unified Request Details Dialog */}
      {selectedUnifiedRequest && (
        <D365Dialog
          isOpen={true}
          onClose={() => setSelectedUnifiedRequest(null)}
          title={pt.requestDetails.dialogTitle}
          subtitle={formatString(pt.requestDetails.dialogSubtitle, {
            requestNumber: selectedUnifiedRequest.requestNumber || selectedUnifiedRequest.id,
          })}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 p-4 bg-white border border-[#EDEBE9] shadow-2xs">
              <div>
                <span className="text-[#605E5C] block">{pt.requestDetails.requestIdLabel}</span>
                <strong className="text-[#0078D4] font-mono text-sm block mt-0.5">
                  {selectedUnifiedRequest.requestNumber || selectedUnifiedRequest.id}
                </strong>
              </div>
              <div>
                <span className="text-[#605E5C] block">{pt.requestDetails.requestTypeLabel}</span>
                <strong className="text-[#323130] text-sm block mt-0.5">
                  {selectedUnifiedRequest.requestType}
                </strong>
              </div>
              <div>
                <span className="text-[#605E5C] block">{pt.requestDetails.applicantLabel}</span>
                <strong className="text-[#323130] block mt-0.5">
                  {selectedUnifiedRequest.employeeName || employee.name}
                  <span className="text-[#605E5C] font-mono text-[11px] rtl:mr-1.5 ltr:ml-1.5 font-normal">
                    ({selectedUnifiedRequest.employeeId || employee.id})
                  </span>
                </strong>
              </div>
              <div>
                <span className="text-[#605E5C] block">{pt.requestDetails.submissionDateLabel}</span>
                <strong className="text-[#323130] font-mono block mt-0.5">
                  {selectedUnifiedRequest.submissionDate}
                </strong>
              </div>
              <div>
                <span className="text-[#605E5C] block">{pt.requestDetails.periodLabel}</span>
                <strong className="text-[#323130] font-mono block mt-0.5">
                  {selectedUnifiedRequest.fromDate && selectedUnifiedRequest.toDate
                    ? formatString(pt.requestDetails.periodFromTo, {
                        from: selectedUnifiedRequest.fromDate,
                        to: selectedUnifiedRequest.toDate,
                      })
                    : selectedUnifiedRequest.fromDate
                    ? formatString(pt.requestDetails.periodFrom, {
                        from: selectedUnifiedRequest.fromDate,
                      })
                    : pt.requestDetails.notApplicable}
                </strong>
              </div>
              <div>
                <span className="text-[#605E5C] block">{pt.requestDetails.statusLabel}</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold ${
                      selectedUnifiedRequest.status === 'Approved'
                        ? 'bg-[#DFF6DD] text-[#107C41] border border-[#92C353]'
                        : selectedUnifiedRequest.status === 'PendingApproval'
                        ? 'bg-[#EFF6FC] text-[#0078D4] border border-[#C7E0F4]'
                        : selectedUnifiedRequest.status === 'InReview'
                        ? 'bg-[#FFF4CE] text-[#797673] border border-[#FED9CC]'
                        : selectedUnifiedRequest.status === 'Draft'
                        ? 'bg-[#F3F2F1] text-[#605E5C] border border-[#C8C6C4]'
                        : 'bg-[#FDE7E9] text-[#A80000] border border-[#F19999]'
                    }`}
                  >
                    {language === 'ar' ? selectedUnifiedRequest.statusAr : (selectedUnifiedRequest.status || selectedUnifiedRequest.statusAr)}
                  </span>
                </div>
              </div>
            </div>

            {selectedUnifiedRequest.workflowStep && (
              <div className="p-2.5 bg-[#EFF6FC] border border-[#C7E0F4] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0078D4] shrink-0" />
                <div>
                  <span className="text-[#0078D4] font-semibold block text-[11px]">{pt.requestDetails.workflowStepTitle}</span>
                  <span className="text-[#323130]">{selectedUnifiedRequest.workflowStep}</span>
                </div>
              </div>
            )}

            {selectedUnifiedRequest.notes && (
              <div className="p-3 bg-white border border-[#EDEBE9]">
                <span className="text-[#605E5C] font-semibold block mb-1">{pt.requestDetails.notesLabel}</span>
                <p className="text-[#323130] leading-relaxed">{selectedUnifiedRequest.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#EDEBE9]">
              {(selectedUnifiedRequest.status === 'InReview' || selectedUnifiedRequest.status === 'PendingApproval') ? (
                <button
                  type="button"
                  onClick={() => {
                    d365Service.approveUnifiedRequest(selectedUnifiedRequest.id || selectedUnifiedRequest.requestNumber);
                    setSelectedUnifiedRequest(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#107C41] hover:bg-[#0E6C38] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  title={pt.requestDetails.approveNowTitle}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{pt.requestDetails.approveNowBtn}</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedUnifiedRequest(null)}
                className="px-4 py-1.5 bg-[#0078D4] hover:bg-[#106EBE] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {pt.common.close}
              </button>
            </div>
          </div>
        </D365Dialog>
      )}

      {/* Personal Details Dialog (Dynamics 365 HcmPersonPrivateDetails) */}
      <PersonalDetailsDialog
        isOpen={isPersonalDetailsOpen}
        onClose={() => setIsPersonalDetailsOpen(false)}
        employee={employee}
      />
    </div>
  );
};
