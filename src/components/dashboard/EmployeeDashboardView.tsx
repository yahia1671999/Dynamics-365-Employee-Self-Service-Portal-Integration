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
  Users
} from 'lucide-react';
import { D365ActionBar } from '../common/D365ActionBar';
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
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Active annual leave balance
  const annualBalance = leaveBalances.find((b) => b.leaveTypeCode === 'ANNUAL')?.currentBalance || 24;
  const activePenaltiesCount = penalties.filter((p) => p.penaltyStatus === 'Active' || p.hearingStatus).length || 1;

  return (
    <div className="space-y-4">
      {/* Dynamics Action Bar */}
      <D365ActionBar
        onNew={onOpenNewLeave}
        newButtonLabel="تقديم طلب إجازة"
        onRefresh={onRefresh}
      />

      {/* 1. Employee Information Card (Matching Screenshot 7) */}
      <div className="bg-white border border-[#D1D1D1] p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-[#EDEBE9]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#002050] text-[#69AFE5] border border-[#0078D4] flex items-center justify-center font-bold text-2xl font-sans select-none overflow-hidden shrink-0">
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
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#323130]">{employee.name}</h1>
              </div>
              <div className="text-xs text-[#605E5C] mt-0.5">
                المستوى الوظيفي: {employee.jobGrade} | الوظيفة: {employee.jobTitle}
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs text-[#605E5C]">
            <div className="px-2.5 py-1 bg-[#F5F5F5] border border-[#D1D1D1]">
              <span>حالة الموظف: </span>
              <strong className="text-[#107C41]">{employee.employmentStatusAr}</strong>
            </div>
          </div>
        </div>

        {/* 8 Distinct Employee Info Grid (Matching Screenshot 7) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div className="p-2 bg-[#F9F9F9] border border-[#EDEBE9]">
            <span className="text-[11px] text-[#605E5C] block">المستوى الوظيفي:</span>
            <strong className="text-[#323130] block mt-0.5">{employee.jobGrade}</strong>
          </div>

          <div className="p-2 bg-[#F9F9F9] border border-[#EDEBE9]">
            <span className="text-[11px] text-[#605E5C] block">الوظيفة:</span>
            <strong className="text-[#323130] block mt-0.5">{employee.jobTitle}</strong>
          </div>

          <div className="p-2 bg-[#F9F9F9] border border-[#EDEBE9]">
            <span className="text-[11px] text-[#605E5C] block">حالة الموظف:</span>
            <strong className="text-[#107C41] block mt-0.5">{employee.employmentStatusAr}</strong>
          </div>

          <div className="p-2 bg-[#F9F9F9] border border-[#EDEBE9]">
            <span className="text-[11px] text-[#605E5C] block">الإدارة:</span>
            <strong className="text-[#323130] block mt-0.5">{employee.department}</strong>
          </div>

          <div className="p-2 bg-[#F9F9F9] border border-[#EDEBE9]">
            <span className="text-[11px] text-[#605E5C] block">المجموعة الوظيفية:</span>
            <strong className="text-[#323130] block mt-0.5">{employee.department}</strong>
          </div>

          <div className="p-2 bg-[#F9F9F9] border border-[#EDEBE9]">
            <span className="text-[11px] text-[#605E5C] block">المسمى الوظيفي:</span>
            <strong className="text-[#323130] block mt-0.5">محلل نظم</strong>
          </div>

          <div className="p-2 bg-[#F9F9F9] border border-[#EDEBE9]">
            <span className="text-[11px] text-[#605E5C] block">المجموعة النوعية:</span>
            <strong className="text-[#323130] block mt-0.5">{employee.division}</strong>
          </div>

          <div className="p-2 bg-[#F9F9F9] border border-[#EDEBE9]">
            <span className="text-[11px] text-[#605E5C] block">الرقم القومي:</span>
            <span className="font-mono text-[#0078D4] block mt-0.5">{employee.civilId || '28509180102934'}</span>
          </div>
        </div>
      </div>

      {/* 2. 5 KPI Cards in One Line (Matching Screenshot 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: رصيد الإجازات */}
        <div
          onClick={onOpenLeaveBalanceDialog}
          className="bg-white border border-[#D1D1D1] hover:border-[#0078D4] p-3 cursor-pointer transition-all hover:shadow-sm group text-right"
        >
          <div className="flex items-center justify-between text-xs text-[#605E5C] mb-2">
            <span className="font-bold text-[#323130]">رصيد الإجازات</span>
            <Calendar className="w-4 h-4 text-[#0078D4]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0078D4] group-hover:scale-105 transition-transform">
            {annualBalance}
          </div>
          <div className="text-[11px] text-[#8A8886] mt-1 flex items-center justify-between">
            <span>يوم متاح</span>
            <span className="text-[#0078D4] text-[10px] group-hover:underline">عرض الأرصدة &larr;</span>
          </div>
        </div>

        {/* Card 2: الجزاءات */}
        <div
          onClick={onOpenPenaltiesDialog}
          className="bg-white border border-[#D1D1D1] hover:border-[#0078D4] p-3 cursor-pointer transition-all hover:shadow-sm group text-right"
        >
          <div className="flex items-center justify-between text-xs text-[#605E5C] mb-2">
            <span className="font-bold text-[#323130]">الجزاءات</span>
            <AlertTriangle className="w-4 h-4 text-[#D83B01]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#D83B01] group-hover:scale-105 transition-transform">
            {activePenaltiesCount}
          </div>
          <div className="text-[11px] text-[#8A8886] mt-1 flex items-center justify-between">
            <span>قرار مسجل</span>
            <span className="text-[#0078D4] text-[10px] group-hover:underline">عرض الجزاءات &larr;</span>
          </div>
        </div>

        {/* Card 3: الدورات التدريبية */}
        <div
          onClick={onOpenTrainingDialog}
          className="bg-white border border-[#D1D1D1] hover:border-[#0078D4] p-3 cursor-pointer transition-all hover:shadow-sm group text-right"
        >
          <div className="flex items-center justify-between text-xs text-[#605E5C] mb-2">
            <span className="font-bold text-[#323130]">الدورات التدريبية</span>
            <Award className="w-4 h-4 text-[#0078D4]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0078D4] group-hover:scale-105 transition-transform">
            {trainingCourses.length}
          </div>
          <div className="text-[11px] text-[#8A8886] mt-1 flex items-center justify-between">
            <span>دورات مسجلة</span>
            <span className="text-[#0078D4] text-[10px] group-hover:underline">استعراض الدورات &larr;</span>
          </div>
        </div>

        {/* Card 4: تقييمات الأداء */}
        <div
          onClick={onOpenPerformanceDialog}
          className="bg-white border border-[#D1D1D1] hover:border-[#0078D4] p-3 cursor-pointer transition-all hover:shadow-sm group text-right"
        >
          <div className="flex items-center justify-between text-xs text-[#605E5C] mb-2">
            <span className="font-bold text-[#323130]">تقييمات الأداء</span>
            <ShieldCheck className="w-4 h-4 text-[#107C41]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#107C41] group-hover:scale-105 transition-transform">
            {performanceEvaluations.length}
          </div>
          <div className="text-[11px] text-[#8A8886] mt-1 flex items-center justify-between">
            <span>تقارير معتمدة</span>
            <span className="text-[#0078D4] text-[10px] group-hover:underline">عرض التقييمات &larr;</span>
          </div>
        </div>

        {/* Card 5: عمليات المراقبة */}
        <div
          onClick={() => onOpenMonitoringDialog('records')}
          className="bg-white border border-[#D1D1D1] hover:border-[#0078D4] p-3 cursor-pointer transition-all hover:shadow-sm group text-right"
        >
          <div className="flex items-center justify-between text-xs text-[#605E5C] mb-2">
            <span className="font-bold text-[#323130]">عمليات المراقبة</span>
            <Activity className="w-4 h-4 text-[#0078D4]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-[#0078D4] group-hover:scale-105 transition-transform">
              {monitoringOperations.length}
            </div>
            {monitoringOperations.filter((o) => o.status === 'استكمل المطلوب').length > 0 && (
              <span className="bg-[#FFF4CE] text-[#D83B01] border border-[#FFB900] text-[10px] px-1.5 py-0.5 font-bold">
                {monitoringOperations.filter((o) => o.status === 'استكمل المطلوب').length} مطلوب استكماله
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#8A8886] mt-1 flex items-center justify-between">
            <span>إقرارات واختبارات</span>
            <span className="text-[#0078D4] text-[10px] group-hover:underline">تقديم واستكمال &larr;</span>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions Row (Matching Screenshot 7) */}
      <div className="bg-white border border-[#D1D1D1] p-3">
        <div className="text-xs font-bold text-[#323130] mb-2.5 flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-[#0078D4]"></div>
          <span>الإجراءات السريعة:</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 text-xs">
          <button
            onClick={onOpenNewLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0078D4] text-white hover:bg-[#106EBE] font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تقديم طلب إجازة</span>
          </button>

          <button
            onClick={() => onQuickAction('PERMISSION')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F3F2F1] text-[#323130] border border-[#8A8886] transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-[#0078D4]" />
            <span>تقديم طلب إذن</span>
          </button>

          <button
            onClick={() => onQuickAction('SECONDMENT')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F3F2F1] text-[#323130] border border-[#8A8886] transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#0078D4]" />
            <span>تقديم طلب ندب</span>
          </button>

          <button
            onClick={() => onQuickAction('LOAN')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F3F2F1] text-[#323130] border border-[#8A8886] transition-colors"
          >
            <Building className="w-3.5 h-3.5 text-[#0078D4]" />
            <span>تقديم طلب إعارة</span>
          </button>

          <button
            onClick={() => onQuickAction('TRANSFER')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F3F2F1] text-[#323130] border border-[#8A8886] transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#0078D4]" />
            <span>تقديم طلب نقل</span>
          </button>

          <button
            onClick={() => onOpenMonitoringDialog('records')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F3F2F1] text-[#323130] border border-[#8A8886] transition-colors"
            title="طلبات إقرارات الذمة المالية ضمن عمليات المراقبة"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#0078D4]" />
            <span>إقرارات الذمة المالية</span>
          </button>

          <button
            onClick={() => onOpenMonitoringDialog('records')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F3F2F1] text-[#323130] border border-[#8A8886] transition-colors"
            title="طلبات اختبارات الكشف والمخدرات ضمن عمليات المراقبة"
          >
            <Activity className="w-3.5 h-3.5 text-[#107C41]" />
            <span>اختبار المخدرات</span>
          </button>

          {onNavigateToTeam && (
            <button
              onClick={onNavigateToTeam}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FC] hover:bg-[#DEECF9] text-[#0078D4] border border-[#0078D4] font-semibold transition-colors"
              title="الانتقال إلى شاشة فريقي لمتابعة المرؤوسين"
            >
              <Users className="w-3.5 h-3.5" />
              <span>معلومات فريقي (18)</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Recent Requests Table (Matching Screenshot 7) */}
      <div className="bg-white border border-[#D1D1D1]">
        <div className="p-3 border-b border-[#EDEBE9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-[#0078D4]"></div>
            <h2 className="text-xs font-bold text-[#323130]">الطلبات المقدمة مؤخراً</h2>
          </div>
          <span className="text-[11px] text-[#605E5C] font-mono">
            {leaveRequests.length} طلبات مسجلة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right border-collapse">
            <thead>
              <tr className="bg-[#F3F2F1] border-b border-[#D1D1D1] text-[#323130] font-semibold">
                <th className="p-2.5 border-l border-[#D1D1D1]">نوع الطلب</th>
                <th className="p-2.5 border-l border-[#D1D1D1]">تاريخ التقديم</th>
                <th className="p-2.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((req) => {
                const isApproved = req.status === 'Approved';
                return (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="border-b border-[#EDEBE9] hover:bg-[#FAF9F8] cursor-pointer transition-colors"
                  >
                    <td className="p-2.5 border-l border-[#EDEBE9] font-semibold text-[#323130]">
                      {req.leaveTypeTitle}
                    </td>
                    <td className="p-2.5 border-l border-[#EDEBE9] font-mono text-[#605E5C]">
                      {req.submissionDate}
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold ${
                          isApproved ? 'bg-[#DFF6DD] text-[#107C41]' : 'bg-[#FFF4CE] text-[#797673]'
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {req.statusAr}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
