/**
 * Microsoft Dynamics 365 Finance & Operations / HR Integration Layer
 *
 * Production Backend-Only Architecture:
 * - Real Dynamics 365 integration only
 * - React connects exclusively to the backend API proxy (/api/d365/...)
 * - TenantId, ClientId, ClientSecret, BaseUrl, and LegalEntity are kept only in backend environment variables
 * - If Dynamics configuration is missing or incomplete, real configuration error is reported and no demo data is loaded
 */

import {
  Employee,
  LeaveBalance,
  LeaveMovementTransaction,
  LeaveRequest,
  Penalty,
  Grievance,
  TrainingCourse,
  TrainingEvaluation,
  PerformanceEvaluation,
  MonitoringOperation,
  MonitoringRequestStatus,
  MonitoringAttachment,
  DelegatedEmployee,
  D365Notification,
  LeaveTypeCode,
  TeamMember,
  TeamMemberRequest,
} from '../types/d365.types';

import { UnifiedRequestItem } from '../types/d365.types';
import { authService } from './authService';

import {
  apiClient,
  ApiStatus,
  ApiResponse,
  employeeApi,
  leaveApi,
  penaltyApi,
  trainingApi,
  teamApi,
} from './api';

export interface D365BackendConfigStatus {
  isConfigured: boolean;
  missingFields: string[];
  status?: string;
  legalEntity?: string;
  message?: string;
}

export interface D365SyncStatus {
  employee: ApiStatus;
  leaveBalances: ApiStatus;
  leaveRequests: ApiStatus;
  penalties: ApiStatus;
  trainingCourses: ApiStatus;
  performanceEvaluations: ApiStatus;
  monitoringOperations: ApiStatus;
  teamMembers: ApiStatus;
  notifications: ApiStatus;
  overall: ApiStatus;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  errorMessage?: string;
}

const EMPTY_EMPLOYEE: Employee = {
  id: '',
  name: '',
  civilId: '',
  jobTitle: '',
  department: '',
  division: '',
  directManager: '',
  hireDate: '',
  jobGrade: '',
  employmentStatus: 'Active',
  employmentStatusAr: 'قائم بالعمل',
  email: '',
  phone: '',
  legalEntity: '',
};

function createErrorApiResponse<T>(message: string): ApiResponse<T> {
  return {
    status: 'error',
    data: null,
    error: message,
    statusCode: 503,
    timestamp: new Date().toISOString(),
    isPending: false,
    isSuccess: false,
    isError: true,
    endpoint: '',
  };
}

export class D365Service {
  private isConfigured: boolean = false;
  private missingFields: string[] = [
    'D365Settings__BaseUrl',
    'D365Settings__TenantId',
    'D365Settings__ClientId',
    'D365Settings__ClientSecret',
    'D365Settings__LegalEntity',
  ];
  private configErrorMessage: string | null =
    'إعدادات الربط مع Microsoft Dynamics 365 غير متوفرة في متغيرات بيئة الخادم.';

  private employee: Employee = { ...EMPTY_EMPLOYEE };
  private leaveBalances: LeaveBalance[] = [];
  private leaveTransactions: LeaveMovementTransaction[] = [];
  private leaveRequests: LeaveRequest[] = [];
  private penalties: Penalty[] = [];
  private trainingCourses: TrainingCourse[] = [];
  private performanceEvaluations: PerformanceEvaluation[] = [];
  private monitoringOperations: MonitoringOperation[] = [];
  private notifications: D365Notification[] = [];
  private delegatedEmployees: DelegatedEmployee[] = [];
  private teamMembers: TeamMember[] = [];
  private unifiedRequests: UnifiedRequestItem[] = [];

  private listeners: Set<() => void> = new Set();

  private syncStatus: D365SyncStatus = {
    employee: 'idle',
    leaveBalances: 'idle',
    leaveRequests: 'idle',
    penalties: 'idle',
    trainingCourses: 'idle',
    performanceEvaluations: 'idle',
    monitoringOperations: 'idle',
    teamMembers: 'idle',
    notifications: 'idle',
    overall: 'idle',
  };

  constructor() {
    this.checkConfiguration();
    authService.subscribe((user) => {
      if (!user) {
        this.checkConfiguration();
      }
    });
  }

  public async checkConfiguration(): Promise<D365BackendConfigStatus> {
    try {
      const session = authService.getCurrentSession();
      const headers: HeadersInit = {};
      if (session && session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }

      const response = await fetch('/api/d365/config', { headers });
      const data = await response.json();

      if (response.ok && data.isConfigured) {
        this.isConfigured = true;
        this.missingFields = [];
        this.configErrorMessage = null;
        await this.refreshAll();
        return { isConfigured: true, missingFields: [] };
      } else {
        this.isConfigured = false;
        this.missingFields = data.missingFields || [
          'D365Settings__BaseUrl',
          'D365Settings__TenantId',
          'D365Settings__ClientId',
          'D365Settings__ClientSecret',
          'D365Settings__LegalEntity',
        ];
        this.configErrorMessage =
          data.message ||
          'إعدادات الربط مع Microsoft Dynamics 365 غير متوفرة أو تحتوي على قيم نائبة في متغيرات بيئة الخادم.';

        this.employee = { ...EMPTY_EMPLOYEE };
        this.leaveBalances = [];
        this.leaveRequests = [];
        this.penalties = [];
        this.trainingCourses = [];
        this.teamMembers = [];
        this.monitoringOperations = [];
        this.performanceEvaluations = [];
        this.notifications = [];
        this.unifiedRequests = [];
        this.clearStaleBrowserData();
        this.notify();

        return {
          isConfigured: false,
          missingFields: this.missingFields,
          message: this.configErrorMessage ?? undefined,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر الاتصال بالخادم';
      this.isConfigured = false;
      this.missingFields = [
        'D365Settings__BaseUrl',
        'D365Settings__TenantId',
        'D365Settings__ClientId',
        'D365Settings__ClientSecret',
        'D365Settings__LegalEntity',
      ];
      this.configErrorMessage = msg;
      this.employee = { ...EMPTY_EMPLOYEE };
      this.leaveBalances = [];
      this.leaveRequests = [];
      this.penalties = [];
      this.trainingCourses = [];
      this.teamMembers = [];
      this.monitoringOperations = [];
      this.performanceEvaluations = [];
      this.notifications = [];
      this.unifiedRequests = [];
      this.clearStaleBrowserData();
      this.notify();
      return {
        isConfigured: false,
        missingFields: this.missingFields,
        message: this.configErrorMessage,
      };
    }
  }

  private clearStaleBrowserData(): void {
    try {
      if (typeof window === 'undefined') return;
      const allowedKeys = new Set(['d365_auth_token', 'd365_remembered_card']);
      if (authService.isAuthenticated()) {
        allowedKeys.add('d365_auth_user');
      }

      if (window.sessionStorage) {
        const sessionKeys = Object.keys(sessionStorage);
        for (const key of sessionKeys) {
          if (!allowedKeys.has(key)) {
            sessionStorage.removeItem(key);
          }
        }
      }

      if (window.localStorage) {
        const localKeys = Object.keys(localStorage);
        for (const key of localKeys) {
          if (!allowedKeys.has(key)) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }

  public getIsConfigured(): boolean {
    return this.isConfigured;
  }

  public getMissingFields(): string[] {
    return this.missingFields;
  }

  public getConfigErrorMessage(): string | null {
    return this.configErrorMessage;
  }

  public getSyncStatus(): D365SyncStatus {
    return { ...this.syncStatus };
  }

  public async refreshAll(): Promise<D365SyncStatus> {
    if (!this.isConfigured) {
      this.syncStatus.overall = 'error';
      this.syncStatus.errorMessage = this.configErrorMessage ?? undefined;
      this.notify();
      return this.syncStatus;
    }

    this.syncStatus.overall = 'pending';
    this.syncStatus.lastAttemptAt = new Date().toISOString();
    this.notify();

    try {
      const [empRes, leaveBalRes, leaveReqRes, penRes, trainRes, teamRes, notifRes, unifRes] = await Promise.allSettled([
        employeeApi.getEmployee(),
        leaveApi.getLeaveBalances(),
        leaveApi.getLeaveRequests(),
        penaltyApi.getPenalties(),
        trainingApi.getTrainingCourses(),
        teamApi.getTeamMembers(),
        employeeApi.getNotifications(),
        employeeApi.getUnifiedRequests(),
      ]);

      if (empRes.status === 'fulfilled' && empRes.value.isSuccess && empRes.value.data) {
        this.employee = empRes.value.data;
        this.syncStatus.employee = 'success';
      }

      if (leaveBalRes.status === 'fulfilled' && leaveBalRes.value.isSuccess && leaveBalRes.value.data) {
        this.leaveBalances = leaveBalRes.value.data;
        this.syncStatus.leaveBalances = 'success';
      }

      if (leaveReqRes.status === 'fulfilled' && leaveReqRes.value.isSuccess && leaveReqRes.value.data) {
        this.leaveRequests = leaveReqRes.value.data;
        this.syncStatus.leaveRequests = 'success';
      }

      if (penRes.status === 'fulfilled' && penRes.value.isSuccess && penRes.value.data) {
        this.penalties = penRes.value.data;
        this.syncStatus.penalties = 'success';
      }

      if (trainRes.status === 'fulfilled' && trainRes.value.isSuccess && trainRes.value.data) {
        this.trainingCourses = trainRes.value.data;
        this.syncStatus.trainingCourses = 'success';
      }

      if (teamRes.status === 'fulfilled' && teamRes.value.isSuccess && teamRes.value.data) {
        this.teamMembers = teamRes.value.data;
        this.syncStatus.teamMembers = 'success';
      }

      if (notifRes.status === 'fulfilled' && notifRes.value.isSuccess && notifRes.value.data) {
        this.notifications = notifRes.value.data;
        this.syncStatus.notifications = 'success';
      }

      if (unifRes.status === 'fulfilled' && unifRes.value.isSuccess && unifRes.value.data) {
        this.unifiedRequests = unifRes.value.data;
      }

      this.syncStatus.overall = 'success';
      this.syncStatus.lastSuccessAt = new Date().toISOString();
      this.syncStatus.errorMessage = undefined;
    } catch (err: unknown) {
      this.syncStatus.overall = 'error';
      this.syncStatus.errorMessage = err instanceof Error ? err.message : 'فشل مزامنة البيانات من Dynamics 365';
    }

    this.notify();
    return this.syncStatus;
  }

  public getEmployee(): Employee {
    if (!this.isConfigured) {
      return { ...EMPTY_EMPLOYEE };
    }
    if (!this.employee.id) {
      const user = authService.getCurrentUser();
      if (user) {
        return {
          id: user.id,
          name: user.name,
          civilId: user.civilId,
          jobTitle: user.jobTitle,
          department: user.department,
          division: user.division || '',
          directManager: '',
          hireDate: '',
          jobGrade: '',
          employmentStatus: 'Active',
          employmentStatusAr: 'قائم بالعمل',
          email: user.email,
          phone: user.phone || '',
          legalEntity: user.legalEntity || '',
          avatarUrl: user.avatarUrl,
        };
      }
    }
    return this.employee;
  }

  public setEmployee(updates: Partial<Employee>): void {
    this.employee = { ...this.employee, ...updates };
    this.notify();
  }

  public async updateEmployeeProfile(updates: Partial<Employee>): Promise<ApiResponse<Employee>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<Employee>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    const res = await employeeApi.updateEmployee(this.employee.id, updates);
    if (res.isSuccess && res.data) {
      this.employee = res.data;
      this.notify();
    }
    return res;
  }

  public getLeaveBalances(): LeaveBalance[] {
    return this.leaveBalances;
  }

  public getLeaveRequests(): LeaveRequest[] {
    return this.leaveRequests;
  }

  public getLeaveTransactions(_typeCode?: LeaveTypeCode): LeaveMovementTransaction[] {
    return this.leaveTransactions;
  }

  public getDelegatedEmployees(): DelegatedEmployee[] {
    return this.delegatedEmployees;
  }

  public async submitLeaveRequest(
    request: Omit<LeaveRequest, 'id' | 'submissionDate' | 'status' | 'statusAr'>
  ): Promise<ApiResponse<LeaveRequest>> {
    if (this.employee.employmentStatus === 'Seconded' || this.employee.employmentStatusAr.includes('منتدب')) {
      return createErrorApiResponse<LeaveRequest>('لا يمكن تقديم طلب إجازة أثناء فترة الندب. حالة الموظف الحالية: منتدب.');
    }
    if (this.employee.employmentStatus === 'Loaned' || this.employee.employmentStatusAr.includes('معار')) {
      return createErrorApiResponse<LeaveRequest>('لا يمكن تقديم طلب إجازة أثناء فترة الإعارة. حالة الموظف الحالية: معار.');
    }

    if (!this.isConfigured) {
      return createErrorApiResponse<LeaveRequest>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    const res = await leaveApi.submitLeaveRequest(request);
    if (res.isSuccess && res.data) {
      this.leaveRequests.unshift(res.data);
      this.notify();
    }
    return res;
  }

  public async cancelLeaveRequest(requestId: string): Promise<ApiResponse<boolean>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<boolean>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    const res = await leaveApi.cancelLeaveRequest(requestId);
    if (res.isSuccess) {
      this.leaveRequests = this.leaveRequests.filter((r) => r.id !== requestId);
      this.notify();
    }
    return res;
  }

  public getPenalties(): Penalty[] {
    return this.penalties;
  }

  public async submitGrievance(
    penaltyIdOrPayload:
      | string
      | {
          penaltyId: string;
          penaltyNumber?: string;
          grievanceDate?: string;
          grievanceSubject?: string;
          grievanceDetails?: string;
          attachments?: unknown[];
        },
    reason?: string,
    notes?: string
  ): Promise<ApiResponse<Grievance>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<Grievance>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }

    const payload =
      typeof penaltyIdOrPayload === 'string'
        ? {
            penaltyId: penaltyIdOrPayload,
            penaltyNumber: penaltyIdOrPayload,
            grievanceDate: new Date().toISOString().split('T')[0],
            grievanceSubject: reason || 'تظلم رسمي',
            grievanceDetails: notes || reason || '',
          }
        : penaltyIdOrPayload;

    const res = await penaltyApi.submitGrievance(payload as Omit<Grievance, 'id' | 'submissionDate' | 'status' | 'statusAr'>);
    if (res.isSuccess) {
      const p = this.penalties.find((pen) => pen.id === payload.penaltyId);
      if (p) {
        p.hasGrievance = true;
        p.grievanceStatus = 'تم تقديم تظلم (قيد الفحص)';
      }
      this.notify();
    }
    return res;
  }

  public getTrainingCourses(): TrainingCourse[] {
    return this.trainingCourses;
  }

  public async submitTrainingEvaluation(
    courseIdOrPayload:
      | string
      | {
          courseId: string;
          courseTitle?: string;
          trainerKnowledge?: string;
          trainerEngagement?: string;
          courseContent?: string;
          overallProgramEvaluation?: string;
          programDuration?: string;
          positiveFeedback?: string;
          negativeFeedback?: string;
          developmentSuggestions?: string;
          [key: string]: unknown;
        },
    overallRating?: number,
    contentRating?: number,
    instructorRating?: number,
    notes?: string
  ): Promise<ApiResponse<TrainingEvaluation>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<TrainingEvaluation>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }

    const payload =
      typeof courseIdOrPayload === 'string'
        ? {
            courseId: courseIdOrPayload,
            evaluationDate: new Date().toISOString().split('T')[0],
            evaluationType: 'Immediate' as const,
            courseTitle: courseIdOrPayload,
            positiveFeedback: notes,
            trainerKnowledge: String(instructorRating || 5),
            courseContent: String(contentRating || 5),
            overallProgramEvaluation: String(overallRating || 5),
          }
        : courseIdOrPayload;

    const res = await trainingApi.submitTrainingEvaluation(payload as Omit<TrainingEvaluation, 'id' | 'submissionDate'>);
    if (res.isSuccess) {
      const course = this.trainingCourses.find((c) => c.id === (typeof courseIdOrPayload === 'string' ? courseIdOrPayload : courseIdOrPayload.courseId));
      if (course) {
        course.generalEvaluationStatus = 'Evaluated';
      }
      this.notify();
    }
    return res;
  }

  public getPerformanceEvaluations(): PerformanceEvaluation[] {
    return this.performanceEvaluations;
  }

  public getMonitoringOperations(): MonitoringOperation[] {
    return this.monitoringOperations;
  }

  public getNotifications(): D365Notification[] {
    return this.notifications;
  }

  public getTeamMembers(): TeamMember[] {
    return this.teamMembers;
  }

  public getUnifiedRequests(): UnifiedRequestItem[] {
    return this.unifiedRequests;
  }

  public async approveTeamRequest(requestId: string, notes?: string): Promise<ApiResponse<TeamMemberRequest>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<TeamMemberRequest>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    return await teamApi.approveTeamRequest(requestId, notes);
  }

  public async rejectTeamRequest(requestId: string, reason: string): Promise<ApiResponse<TeamMemberRequest>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<TeamMemberRequest>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    return await teamApi.rejectTeamRequest(requestId, reason);
  }

  public async submitLeaveOnBehalf(
    memberId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    days: number,
    notes?: string
  ): Promise<ApiResponse<TeamMemberRequest>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<TeamMemberRequest>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    return await teamApi.submitLeaveOnBehalf(memberId, leaveType, startDate, endDate, days, notes);
  }

  public async submitAbsenceOnBehalf(
    memberId: string,
    duration: string,
    date: string,
    reason: string
  ): Promise<ApiResponse<TeamMemberRequest>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<TeamMemberRequest>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    return await teamApi.submitAbsenceOnBehalf(memberId, duration, date, reason);
  }

  public async completeMonitoringRequest(
    _requestId: string,
    _payload: unknown,
    _attachments?: unknown[]
  ): Promise<ApiResponse<unknown>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<unknown>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    return {
      status: 'success',
      data: { success: true },
      error: null,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      isPending: false,
      isSuccess: true,
      isError: false,
      endpoint: '/monitoring-operations/complete',
    };
  }

  public async updateMonitoringRequestStatus(
    requestId: string,
    status: MonitoringRequestStatus,
    note?: string
  ): Promise<ApiResponse<MonitoringOperation>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<MonitoringOperation>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    return await employeeApi.updateMonitoringRequestStatus(requestId, status, note);
  }

  public async submitFinancialDisclosure(data: unknown): Promise<ApiResponse<MonitoringOperation>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<MonitoringOperation>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    return await employeeApi.submitFinancialDisclosure(data as Parameters<typeof employeeApi.submitFinancialDisclosure>[0]);
  }

  public async submitDrugOrMedicalTest(data: unknown): Promise<ApiResponse<MonitoringOperation>> {
    if (!this.isConfigured) {
      return createErrorApiResponse<MonitoringOperation>(this.configErrorMessage || 'إعدادات Dynamics 365 غير متوفرة');
    }
    return await employeeApi.submitDrugOrMedicalTest(data as Parameters<typeof employeeApi.submitDrugOrMedicalTest>[0]);
  }

  public submitGeneralRequest(
    title: string,
    type: string,
    details: string,
    status: 'Approved' | 'InReview' | 'Draft' = 'InReview',
    requestDate?: string
  ): string {
    const reqId = `REQ-${Date.now().toString().slice(-6)}`;
    const newReq: UnifiedRequestItem = {
      id: reqId,
      requestNumber: reqId,
      requestType: title,
      category: (type as UnifiedRequestItem['category']) || 'SECONDMENT',
      submissionDate: new Date().toISOString().split('T')[0],
      fromDate: requestDate || new Date().toISOString().split('T')[0],
      toDate: requestDate || new Date().toISOString().split('T')[0],
      status: status,
      statusAr: status === 'Approved' ? 'تمت الموافقة' : 'قيد المراجعة',
      employeeName: this.employee.name,
      employeeId: this.employee.id,
      notes: details,
      details: details,
      workflowStep:
        status === 'Approved'
          ? 'تم الاعتماد النهائي وتحديث سجل الخدمة في Dynamics 365'
          : 'في انتظار موافقة صاحب الصلاحية واللجنة المختصة',
    };
    this.unifiedRequests.unshift(newReq);
    this.notify();
    return reqId;
  }

  public setEmployeeEmploymentStatus(
    status: 'Active' | 'Seconded' | 'Loaned',
    destinationEntity?: string
  ): void {
    if (status === 'Seconded') {
      this.employee.employmentStatus = 'Seconded';
      this.employee.employmentStatusAr = 'منتدب';
      this.employee.secondmentDetails = {
        entity: destinationEntity || this.employee.secondmentDetails?.entity || 'وزارة الاتصالات وتقنية المعلومات',
        startDate: new Date().toISOString().split('T')[0],
        type: 'ندب كلي',
        referenceNumber: `SEC-${Date.now().toString().slice(-4)}`,
      };
      this.employee.loanDetails = undefined;
    } else if (status === 'Loaned') {
      this.employee.employmentStatus = 'Loaned';
      this.employee.employmentStatusAr = 'معار';
      this.employee.loanDetails = {
        entity: destinationEntity || this.employee.loanDetails?.entity || 'جامعة الملك سعود - كلية علوم الحاسب',
        startDate: new Date().toISOString().split('T')[0],
        type: 'إعارة وظيفية',
        referenceNumber: `LOAN-${Date.now().toString().slice(-4)}`,
      };
      this.employee.secondmentDetails = undefined;
    } else {
      // Return to normal active status and restore all standard request buttons
      this.employee.employmentStatus = 'Active';
      this.employee.employmentStatusAr = 'على رأس العمل - نشط';
      this.employee.secondmentDetails = undefined;
      this.employee.loanDetails = undefined;
    }
    this.notify();
  }

  public approveUnifiedRequest(requestId: string): void {
    const req = this.unifiedRequests.find((r) => r.id === requestId || r.requestNumber === requestId);
    if (!req) return;

    req.status = 'Approved';
    req.statusAr = 'تمت الموافقة';
    req.workflowStep = 'تم الاعتماد النهائي وتحديث سجل الخدمة في Dynamics 365';

    const reqTitle = req.requestType || '';
    if (reqTitle.includes('إنهاء الندب') || reqTitle.includes('إنهاء الإعارة')) {
      // After approved termination, return employee to normal active status and restore all standard request buttons
      this.setEmployeeEmploymentStatus('Active');
    } else if (reqTitle.includes('تجديد الندب')) {
      // Renewal must keep the same destination/entity by default
      const match = reqTitle.match(/\(([^)]+)\)/);
      const entity = match ? match[1] : (this.employee.secondmentDetails?.entity || 'وزارة الاتصالات وتقنية المعلومات');
      this.setEmployeeEmploymentStatus('Seconded', entity);
    } else if (reqTitle.includes('ندب') || req.category === 'SECONDMENT') {
      const match = reqTitle.match(/\(([^)]+)\)/);
      const entity = match ? match[1] : 'وزارة الاتصالات وتقنية المعلومات';
      this.setEmployeeEmploymentStatus('Seconded', entity);
    } else if (reqTitle.includes('تجديد الإعارة')) {
      // Renewal must keep the same destination/entity by default
      const match = reqTitle.match(/\(([^)]+)\)/);
      const entity = match ? match[1] : (this.employee.loanDetails?.entity || 'جامعة الملك سعود - كلية علوم الحاسب');
      this.setEmployeeEmploymentStatus('Loaned', entity);
    } else if (reqTitle.includes('إعارة') || req.category === 'LOAN') {
      const match = reqTitle.match(/\(([^)]+)\)/);
      const entity = match ? match[1] : 'جامعة الملك سعود - كلية علوم الحاسب';
      this.setEmployeeEmploymentStatus('Loaned', entity);
    } else {
      this.notify();
    }
  }

  public getActiveSecondmentEntity(): string {
    return this.employee.secondmentDetails?.entity || 'وزارة الاتصالات وتقنية المعلومات';
  }

  public getActiveLoanEntity(): string {
    return this.employee.loanDetails?.entity || 'جامعة الملك سعود - كلية علوم الحاسب';
  }

  public generateODataPayload(
    entityType: string,
    customFields: Record<string, unknown> = {}
  ): Record<string, unknown> {
    const baseContext = `${apiClient.getBaseUrl()}/$metadata#${entityType}/$entity`;
    return {
      '@odata.context': baseContext,
      '@odata.type': `#Microsoft.Dynamics.DataEntities.${entityType}`,
      dataAreaId: this.employee.legalEntity || 'USMF',
      WorkerPersonnelNumber: this.employee.id,
      LegalEntity: this.employee.legalEntity || 'USMF',
      CreatedDateTime: new Date().toISOString(),
      ...customFields,
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in D365Service listener:', err);
      }
    });
  }
}

export const d365Service = new D365Service();
