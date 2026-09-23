/**
 * Microsoft Dynamics 365 Finance & Operations
 * Employee Self-Service (ESS) Portal - Arabic RTL
 *
 * Implements full D365 F&O UX Architecture:
 * - D365 App Bar & Header
 * - Navigation Workspace Pivot Tabs
 * - D365 Action Ribbon
 * - Live Service Integration & Reactive Subscription
 * - Modules: Dashboard, Leave Balance, Leave Request, Penalties, Grievance, Training Courses, Training Evaluation
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  AlertTriangle,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Info,
  Users
} from 'lucide-react';
import { D365Header } from './components/common/D365Header';
import { D365Tabs, TabItem } from './components/common/D365Tabs';
import { EmployeeDashboardView } from './components/dashboard/EmployeeDashboardView';
import { LeaveBalanceView } from './components/leave/LeaveBalanceView';
import { LeaveBalanceDialog } from './components/leave/LeaveBalanceDialog';
import { LeaveRequestDialog } from './components/leave/LeaveRequestDialog';
import { PenaltiesView } from './components/penalties/PenaltiesView';
import { PenaltiesDialog } from './components/penalties/PenaltiesDialog';
import { TrainingCoursesView } from './components/training/TrainingCoursesView';
import { TrainingCoursesDialog } from './components/training/TrainingCoursesDialog';
import { PerformanceDialog } from './components/performance/PerformanceDialog';
import { MonitoringDialog } from './components/monitoring/MonitoringDialog';
import { QuickActionDialog, QuickActionType } from './components/requests/QuickActionDialog';
import { D365ApiInspectorDialog } from './components/integration/D365ApiInspectorDialog';
import { MyTeamView } from './components/team/MyTeamView';
import { LoginPage } from './components/auth/LoginPage';
import { d365Service } from './services/d365Service';
import { exportToCsv } from './utils/exportUtils';
import {
  Employee,
  LeaveBalance,
  LeaveRequest,
  Penalty,
  TrainingCourse,
  PerformanceEvaluation,
  MonitoringOperation,
  DelegatedEmployee,
  D365Notification,
  LeaveTypeCode,
  TeamMember
} from './types/d365.types';

type ActiveModule = 'dashboard' | 'team' | 'leave-balance' | 'penalties' | 'training';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('d365_is_authenticated') === 'true';
  });
  const [authenticatedCardId, setAuthenticatedCardId] = useState<string>(() => {
    return localStorage.getItem('d365_remembered_card') || '28509180102934';
  });

  // Service Data State
  const [employee, setEmployee] = useState<Employee>(d365Service.getEmployee());
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(d365Service.getLeaveBalances());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(d365Service.getLeaveRequests());
  const [penalties, setPenalties] = useState<Penalty[]>(d365Service.getPenalties());
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>(d365Service.getTrainingCourses());
  const [performanceEvaluations, setPerformanceEvaluations] = useState<PerformanceEvaluation[]>(
    d365Service.getPerformanceEvaluations()
  );
  const [monitoringOperations, setMonitoringOperations] = useState<MonitoringOperation[]>(
    d365Service.getMonitoringOperations()
  );
  const [notifications, setNotifications] = useState<D365Notification[]>(d365Service.getNotifications());
  const [delegatedEmployees, setDelegatedEmployees] = useState<DelegatedEmployee[]>(
    d365Service.getDelegatedEmployees()
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(d365Service.getTeamMembers());

  // Active View Module
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  // Dialogs State
  const [isLeaveBalanceDialogOpen, setIsLeaveBalanceDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isPenaltiesDialogOpen, setIsPenaltiesDialogOpen] = useState(false);
  const [isTrainingCoursesDialogOpen, setIsTrainingCoursesDialogOpen] = useState(false);
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false);
  const [isMonitoringDialogOpen, setIsMonitoringDialogOpen] = useState(false);
  const [monitoringMode, setMonitoringMode] = useState<'records' | 'disclosure' | 'test'>('records');
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionType | null>(null);

  const [initialLeaveTypeForDialog, setInitialLeaveTypeForDialog] = useState<LeaveTypeCode>('ANNUAL');
  const [isODataInspectorOpen, setIsODataInspectorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state with service subscriber
  useEffect(() => {
    const unsubscribe = d365Service.subscribe(() => {
      setEmployee(d365Service.getEmployee());
      setLeaveBalances(d365Service.getLeaveBalances());
      setLeaveRequests(d365Service.getLeaveRequests());
      setPenalties(d365Service.getPenalties());
      setTrainingCourses(d365Service.getTrainingCourses());
      setPerformanceEvaluations(d365Service.getPerformanceEvaluations());
      setMonitoringOperations(d365Service.getMonitoringOperations());
      setNotifications(d365Service.getNotifications());
      setDelegatedEmployees(d365Service.getDelegatedEmployees());
      setTeamMembers(d365Service.getTeamMembers());
    });
    return () => unsubscribe();
  }, []);

  const handleRefresh = () => {
    setEmployee(d365Service.getEmployee());
    setLeaveBalances(d365Service.getLeaveBalances());
    setLeaveRequests(d365Service.getLeaveRequests());
    setPenalties(d365Service.getPenalties());
    setTrainingCourses(d365Service.getTrainingCourses());
    setPerformanceEvaluations(d365Service.getPerformanceEvaluations());
    setMonitoringOperations(d365Service.getMonitoringOperations());
    setNotifications(d365Service.getNotifications());
    setTeamMembers(d365Service.getTeamMembers());
    showToast('تم تحديث البيانات بنجاح من خدمة Microsoft Dynamics 365.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLoginSuccess = (cardId: string) => {
    setIsAuthenticated(true);
    setAuthenticatedCardId(cardId);
    localStorage.setItem('d365_is_authenticated', 'true');
    showToast('تم تسجيل الدخول بنجاح عبر بطاقة الرقم القومي. مرحباً بك في بوابة Microsoft Dynamics 365.');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('d365_is_authenticated');
  };

  const handleOpenNewLeave = (type?: LeaveTypeCode) => {
    if (type) setInitialLeaveTypeForDialog(type);
    setIsLeaveDialogOpen(true);
  };

  // Export current active module data to Excel (CSV with UTF-8 BOM)
  const handleExportExcel = () => {
    switch (activeModule) {
      case 'dashboard':
      case 'leave-balance': {
        const rows = leaveRequests.map((r) => ({
          'رقم الطلب': r.id,
          'نوع الإجازة': r.leaveTypeTitle,
          'تاريخ البدء': r.startDate,
          'تاريخ الانتهاء': r.endDate,
          'الأيام المطلوبة': r.requestedDays,
          'الموظف البديل': r.delegatedEmployeeName,
          'تاريخ التقديم': r.submissionDate,
          'حالة الطلب': r.statusAr,
          'ملاحظات': r.notes,
        }));
        exportToCsv('D365_Leave_Requests', rows);
        showToast('تم تصدير سجل الطلبات إلى ملف Excel بنجاح.');
        break;
      }
      case 'penalties': {
        const rows = penalties.map((p) => ({
          'رقم الجزاء': p.penaltyNumber,
          'حالة الجزاء': p.penaltyStatusAr,
          'تاريخ التوقيع': p.penaltySigningDate,
          'تاريخ السريان': p.penaltyStartDate,
          'الإجراء المتخذ': p.action,
          'عقوبة الموظف': p.employeePenalty,
          'المدة': p.duration,
          'جهة التحقيق': p.investigationAuthority,
          'تفاصيل الجزاء': p.penaltyDetails,
        }));
        exportToCsv('D365_Penalties', rows);
        showToast('تم تصدير سجل الجزاءات إلى ملف Excel بنجاح.');
        break;
      }
      case 'training': {
        const rows = trainingCourses.map((c) => ({
          'رمز الدورة': c.courseId,
          'عنوان الدورة': c.courseTitle,
          'الجهة التدريبية': c.provider,
          'المقر': c.location,
          'تاريخ البدء': c.startDate,
          'تاريخ الانتهاء': c.endDate,
          'الساعات': c.durationHours,
          'التقييم العام': c.generalEvaluationScore || 'بانتظار التقييم',
          'تقييم أثر التدريب (3 أشهر)': c.evaluationAfter3MonthsScore || 'قيد الانتظار',
        }));
        exportToCsv('D365_Training_Courses', rows);
        showToast('تم تصدير سجل الدورات التدريبية إلى ملف Excel بنجاح.');
        break;
      }
    }
  };

  // Main Navigation Tabs
  const pendingTeamRequestsCount = teamMembers
    .flatMap((m) => m.requests)
    .filter((r) => r.status === 'في انتظار موافقة المدير').length;

  const navigationTabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'لوحة معلومات الموظف (Dashboard)',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'team',
      label: 'معلومات فريقي (My team)',
      icon: <Users className="w-3.5 h-3.5" />,
      count: pendingTeamRequestsCount > 0 ? pendingTeamRequestsCount : undefined,
    },
  ];

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'dashboard':
        return 'لوحة معلومات الموظف (Employee Dashboard)';
      case 'team':
        return 'معلومات فريقي (Manager Self-Service - My Team)';
      case 'leave-balance':
        return 'أرصدة الإجازات (Leave and Absence)';
      case 'penalties':
        return 'الجزاءات والعقوبات (Disciplinary Actions)';
      case 'training':
        return 'الدورات التدريبية (Training Courses)';
    }
  };

  // If user is not logged in, render the Enterprise Login Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        defaultCardId={authenticatedCardId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#323130] flex flex-col font-sans selection:bg-[#0078D4] selection:text-white">
      {/* 1. Microsoft Dynamics 365 Navigation & Header */}
      <D365Header
        employee={employee}
        notifications={notifications}
        onOpenODataInspector={() => setIsODataInspectorOpen(true)}
        activeModuleTitle={getModuleTitle()}
        onLogout={handleLogout}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="sticky top-16 z-30 mx-4 mt-2 p-2.5 bg-[#DFF6DD] border border-[#107C41] text-[#107C41] text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold hover:underline"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* 2. Workspace Navigation Bar (D365 Pivot Tabs) */}
      <nav className="bg-white border-b border-[#D1D1D1] sticky top-16 z-20 shadow-xs">
        <D365Tabs
          tabs={navigationTabs}
          activeTabId={activeModule}
          onTabChange={(id) => setActiveModule(id as ActiveModule)}
        />
      </nav>

      {/* 3. Main Workspace Canvas */}
      <main className="flex-1 p-3 sm:p-4 max-w-7xl w-full mx-auto">
        {activeModule === 'dashboard' && (
          <EmployeeDashboardView
            employee={employee}
            leaveBalances={leaveBalances}
            leaveRequests={leaveRequests}
            penalties={penalties}
            trainingCourses={trainingCourses}
            performanceEvaluations={performanceEvaluations}
            monitoringOperations={monitoringOperations}
            onOpenNewLeave={() => handleOpenNewLeave()}
            onOpenLeaveBalanceDialog={() => setIsLeaveBalanceDialogOpen(true)}
            onOpenPenaltiesDialog={() => setIsPenaltiesDialogOpen(true)}
            onOpenTrainingDialog={() => setIsTrainingCoursesDialogOpen(true)}
            onOpenPerformanceDialog={() => setIsPerformanceDialogOpen(true)}
            onOpenMonitoringDialog={(mode = 'records') => {
              setMonitoringMode(mode);
              setIsMonitoringDialogOpen(true);
            }}
            onQuickAction={(actionType) => setActiveQuickAction(actionType)}
            onRefresh={handleRefresh}
            onExportExcel={handleExportExcel}
            onNavigateToTeam={() => setActiveModule('team')}
          />
        )}

        {activeModule === 'team' && (
          <MyTeamView
            teamMembers={teamMembers}
            onRefresh={handleRefresh}
            onApproveRequest={(requestId, notes) => d365Service.approveTeamRequest(requestId, notes)}
            onRejectRequest={(requestId, reason) => d365Service.rejectTeamRequest(requestId, reason)}
            onSubmitLeaveOnBehalf={(memberId, leaveType, startDate, endDate, days, notes) =>
              d365Service.submitLeaveOnBehalf(memberId, leaveType, startDate, endDate, days, notes)
            }
            onSubmitAbsenceOnBehalf={(memberId, duration, date, reason) =>
              d365Service.submitAbsenceOnBehalf(memberId, duration, date, reason)
            }
            onShowToast={(msg) => showToast(msg)}
          />
        )}

        {activeModule === 'leave-balance' && (
          <LeaveBalanceView
            leaveBalances={leaveBalances}
            onOpenNewLeaveDialog={(type) => handleOpenNewLeave(type)}
            onRefresh={handleRefresh}
            onExportExcel={handleExportExcel}
          />
        )}

        {activeModule === 'penalties' && (
          <PenaltiesView
            penalties={penalties}
            onRefresh={handleRefresh}
            onExportExcel={handleExportExcel}
            onGrievanceSuccess={() => {
              showToast('تم تقديم التظلم بنجاح وإحالته إلى لجنة دراسة التظلمات.');
            }}
          />
        )}

        {activeModule === 'training' && (
          <TrainingCoursesView
            courses={trainingCourses}
            onRefresh={handleRefresh}
            onExportExcel={handleExportExcel}
            onEvaluationSuccess={() => {
              showToast('تم اعتماد تقييم الدورة التدريبية بنجاح وتسجيله في سجل الموظف.');
            }}
          />
        )}
      </main>

      {/* Dialog 1: Leave Balance Dialog (Screenshot 2) */}
      <LeaveBalanceDialog
        isOpen={isLeaveBalanceDialogOpen}
        onClose={() => setIsLeaveBalanceDialogOpen(false)}
        leaveBalances={leaveBalances}
        onOpenNewLeave={(type) => handleOpenNewLeave(type)}
        onRefresh={handleRefresh}
      />

      {/* Dialog 2: Leave Request Dialog (Screenshot 2 form) */}
      <LeaveRequestDialog
        isOpen={isLeaveDialogOpen}
        onClose={() => setIsLeaveDialogOpen(false)}
        onSuccess={(id) => {
          showToast(`تم إرسال طلب الإجازة بنجاح برقم: ${id}`);
        }}
        leaveBalances={leaveBalances}
        delegatedEmployees={delegatedEmployees}
        initialLeaveType={initialLeaveTypeForDialog}
      />

      {/* Dialog 3: Penalties Dialog (Screenshot 3 & 4) */}
      <PenaltiesDialog
        isOpen={isPenaltiesDialogOpen}
        onClose={() => setIsPenaltiesDialogOpen(false)}
        penalties={penalties}
        onRefresh={handleRefresh}
      />

      {/* Dialog 4: Training Courses Dialog (Screenshot 5 & 6) */}
      <TrainingCoursesDialog
        isOpen={isTrainingCoursesDialogOpen}
        onClose={() => setIsTrainingCoursesDialogOpen(false)}
        courses={trainingCourses}
        onRefresh={handleRefresh}
      />

      {/* Dialog 5: Performance Evaluations Dialog */}
      <PerformanceDialog
        isOpen={isPerformanceDialogOpen}
        onClose={() => setIsPerformanceDialogOpen(false)}
        evaluations={performanceEvaluations}
      />

      {/* Dialog 6: Monitoring Operations Dialog (Financial Disclosures & Drug/Medical Tests) */}
      <MonitoringDialog
        isOpen={isMonitoringDialogOpen}
        onClose={() => setIsMonitoringDialogOpen(false)}
        operations={monitoringOperations}
        initialMode={monitoringMode}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Dialog 7: Quick Actions Dialog (إذن, ندب, إعارة, نقل, ذمة مالية, اختبار مخدرات) */}
      <QuickActionDialog
        isOpen={!!activeQuickAction}
        onClose={() => setActiveQuickAction(null)}
        actionType={activeQuickAction}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* D365 API & OData Inspector Dialog */}
      <D365ApiInspectorDialog
        isOpen={isODataInspectorOpen}
        onClose={() => setIsODataInspectorOpen(false)}
      />
    </div>
  );
}
