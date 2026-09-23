/**
 * Microsoft Dynamics 365 Finance & Operations
 * Service Layer (HcmWorker / ESS Data Access Service)
 *
 * Implements clean OData v4 REST abstraction ready for D365 backend endpoints:
 * - GET  /data/Employees(WorkerPersonnelNumber='EMP-10492')
 * - GET  /data/LeaveAndAbsenceBankTransactions
 * - POST /data/LeaveAndAbsenceRequests
 * - GET  /data/DisciplinaryActions
 * - POST /data/DisciplinaryGrievances
 * - GET  /data/CourseAttendances
 * - POST /data/CourseEvaluations
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
  TeamPosition,
  TeamMemberRequest,
} from '../types/d365.types';
import { INITIAL_TEAM_MEMBERS } from '../data/teamData';

// Initial Mock Seed Data representing Microsoft Dynamics 365 Human Resources entities
const INITIAL_EMPLOYEE: Employee = {
  id: 'EMP-10492',
  name: 'هدى فتحي عبد المجيد',
  jobTitle: 'محلل نظم أول',
  department: 'تكنولوجيا المعلومات',
  division: 'وظائف متخصصة',
  hireDate: '2020-01-15',
  directManager: 'مدير عام الإدارة العامة لتكنولوجيا المعلومات',
  jobGrade: 'الدرجة الأولى أ',
  employmentStatus: 'Active',
  employmentStatusAr: 'قائم بالعمل',
  email: 'hoda.fathi@contoso.gov.eg',
  phone: '+20 10 1234 5678',
  legalEntity: 'EG01 - الإدارة العامة للتحول الرقمي',
  civilId: '28509180102934',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
};

const INITIAL_LEAVE_BALANCES: LeaveBalance[] = [
  {
    id: 'BAL-001',
    leaveTypeCode: 'ANNUAL',
    leaveTypeTitle: 'اجازة اعتيادي',
    unit: 'أيام',
    currentBalance: 24.0,
    allocatedBalance: 30.0,
    consumedBalance: 6.0,
    pendingBalance: 0,
    accrualRate: '30.00 الأيام / سنوياً',
    asOfDate: '2025-09-18',
    accrualPlanId: 'PLAN-ANN-30',
  },
  {
    id: 'BAL-002',
    leaveTypeCode: 'CASUAL',
    leaveTypeTitle: 'اجازة عارضة',
    unit: 'أيام',
    currentBalance: 4.0,
    allocatedBalance: 6.0,
    consumedBalance: 2.0,
    pendingBalance: 0,
    accrualRate: '6.00 الأيام / سنوياً',
    asOfDate: '2025-09-18',
    accrualPlanId: 'PLAN-CAS-06',
  },
  {
    id: 'BAL-003',
    leaveTypeCode: 'SICK',
    leaveTypeTitle: 'اجازة مرضي',
    unit: 'أيام',
    currentBalance: 120.0,
    allocatedBalance: 120.0,
    consumedBalance: 0,
    pendingBalance: 0,
    accrualRate: '120.00 الأيام / سنوياً',
    asOfDate: '2025-09-18',
    accrualPlanId: 'PLAN-SICK-120',
  },
  {
    id: 'BAL-004',
    leaveTypeCode: 'MATERNITY',
    leaveTypeTitle: 'اجازة وضع',
    unit: 'أيام',
    currentBalance: 120.0,
    allocatedBalance: 120.0,
    consumedBalance: 0,
    pendingBalance: 0,
    accrualRate: 'بلا',
    asOfDate: '2025-09-18',
    accrualPlanId: 'PLAN-MAT-120',
  },
  {
    id: 'BAL-005',
    leaveTypeCode: 'PERMISSION',
    leaveTypeTitle: 'اذن غياب',
    unit: 'ساعات',
    currentBalance: 24.39,
    allocatedBalance: 72.0,
    consumedBalance: 47.61,
    pendingBalance: 0,
    accrualRate: '6.00 ساعات / شهري',
    asOfDate: '2025-09-18',
    accrualPlanId: 'PLAN-PERM-06',
  },
  {
    id: 'BAL-006',
    leaveTypeCode: 'FAMILY_CARE',
    leaveTypeTitle: 'رعاية اسرة',
    unit: 'ساعات',
    currentBalance: 0.0,
    allocatedBalance: 0.0,
    consumedBalance: 0,
    pendingBalance: 0,
    accrualRate: 'بلا',
    asOfDate: '2025-09-18',
    accrualPlanId: 'PLAN-FAM-00',
  },
  {
    id: 'BAL-007',
    leaveTypeCode: 'CHILD_CARE',
    leaveTypeTitle: 'رعاية طفل',
    unit: 'أيام',
    currentBalance: 2190.0,
    allocatedBalance: 2190.0,
    consumedBalance: 0,
    pendingBalance: 0,
    accrualRate: 'بلا',
    asOfDate: '2025-09-18',
    accrualPlanId: 'PLAN-CHILD-2190',
  },
];

const INITIAL_LEAVE_TRANSACTIONS: LeaveMovementTransaction[] = [
  {
    id: 'TXN-901',
    transactionDate: '2026-09-01',
    transactionType: 'استحقاق دوري',
    amount: 2.5,
    balanceAfter: 24,
    referenceNumber: 'ACCR-SEP-2026',
    notes: 'استحقاق الرصيد الشهري الدوري لشهر سبتمبر 2026',
  },
  {
    id: 'TXN-902',
    transactionDate: '2026-08-15',
    transactionType: 'خصم إجازة معتمدة',
    amount: -3,
    balanceAfter: 21.5,
    referenceNumber: 'LR-2026-042',
    notes: 'إجازة اعتيادية معتمدة بقرار رقم 8812',
  },
  {
    id: 'TXN-903',
    transactionDate: '2026-08-01',
    transactionType: 'استحقاق دوري',
    amount: 2.5,
    balanceAfter: 24.5,
    referenceNumber: 'ACCR-AUG-2026',
    notes: 'استحقاق الرصيد الشهري الدوري لشهر أغسطس 2026',
  },
  {
    id: 'TXN-904',
    transactionDate: '2026-07-20',
    transactionType: 'خصم إجازة معتمدة',
    amount: -2,
    balanceAfter: 22,
    referenceNumber: 'LR-2026-031',
    notes: 'إجازة عارضة معتمدة',
  },
  {
    id: 'TXN-905',
    transactionDate: '2026-01-01',
    transactionType: 'ترحيل سنوي',
    amount: 15,
    balanceAfter: 15,
    referenceNumber: 'YREND-CARRY-2025',
    notes: 'ترحيل الرصيد المتبقي من العام السابق 2025 بحد أقصى مسموح',
  },
];

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'REQ-2025-001',
    employeeId: 'EMP-10492',
    employeeName: 'هدى فتحي عبد المجيد',
    leaveTypeCode: 'ANNUAL',
    leaveTypeTitle: 'طلب إجازة اعتيادي',
    startDate: '2025-08-15',
    endDate: '2025-08-20',
    requestedDays: 5,
    delegatedEmployeeId: 'EMP-10773',
    delegatedEmployeeName: 'أحمد المحمدي',
    delegatedEmployeeTitle: 'محلل نظم',
    socialInsuranceOption: true,
    healthInsuranceOption: true,
    attachments: [],
    notes: 'إجازة اعتيادية سنوية معتمدة.',
    submissionDate: '2025-08-15',
    status: 'Approved',
    statusAr: 'تمت الموافقة',
    workflowStep: 'معتمد نهائياً',
    d365SyncStatus: 'Synced',
  },
  {
    id: 'REQ-2025-002',
    employeeId: 'EMP-10492',
    employeeName: 'هدى فتحي عبد المجيد',
    leaveTypeCode: 'PERMISSION',
    leaveTypeTitle: 'طلب إذن',
    startDate: '2025-09-10',
    endDate: '2025-09-10',
    requestedDays: 1,
    delegatedEmployeeId: 'EMP-10773',
    delegatedEmployeeName: 'أحمد المحمدي',
    delegatedEmployeeTitle: 'محلل نظم',
    socialInsuranceOption: true,
    healthInsuranceOption: true,
    attachments: [],
    notes: 'إذن انصراف مبكر لظرف طارئ.',
    submissionDate: '2025-09-10',
    status: 'Approved',
    statusAr: 'تمت الموافقة',
    workflowStep: 'معتمد نهائياً',
    d365SyncStatus: 'Synced',
  },
  {
    id: 'REQ-2025-003',
    employeeId: 'EMP-10492',
    employeeName: 'هدى فتحي عبد المجيد',
    leaveTypeCode: 'SICK',
    leaveTypeTitle: 'طلب إجازة مرضي',
    startDate: '2025-09-18',
    endDate: '2025-09-19',
    requestedDays: 2,
    delegatedEmployeeId: 'EMP-10812',
    delegatedEmployeeName: 'سارة العبدالله',
    delegatedEmployeeTitle: 'مهندسة برمجيات',
    socialInsuranceOption: true,
    healthInsuranceOption: true,
    attachments: [],
    notes: 'إجازة مرضية بموجب تقرير طبي مصدق.',
    submissionDate: '2025-09-18',
    status: 'InReview',
    statusAr: 'قيد المراجعة',
    workflowStep: 'في انتظار مراجعة الشؤون الإدارية',
    d365SyncStatus: 'Synced',
  },
];

const INITIAL_PENALTIES: Penalty[] = [
  {
    id: 'DISC-UAT-000031',
    penaltyNumber: 'UAT-000031',
    penaltyStatus: 'Active',
    penaltyStatusAr: 'سارية',
    hearingStatus: 'الإحالة لمحكمة تأديبية',
    penaltySigningDate: '2025-09-07',
    penaltyStartDate: '2025-09-07',
    penaltyRemovalDate: '2026-09-07',
    action: 'إنذار',
    penaltyDetails: 'ملاحظة إدارية بشأن التوقيع بدفتر الحضور والانصراف تم إحالتها لإجراءات التحقيق.',
    investigationAuthority: 'الشئون القانونية',
    employeePenalty: 'إنذار',
    duration: '-',
    hasGrievance: false,
  },
  {
    id: 'DISC-UAT-000022',
    penaltyNumber: 'UAT-000022',
    penaltyStatus: 'UnderGrievance',
    penaltyStatusAr: 'سارية',
    hearingStatus: 'الإحالة لمحكمة تأديبية',
    penaltySigningDate: '2025-06-06',
    penaltyStartDate: '2025-06-06',
    penaltyRemovalDate: '2027-06-06',
    action: 'خصم أجر 3 أيام',
    penaltyDetails: 'تأخر في تسليم تقرير متابعة الأداء الفصلي.',
    investigationAuthority: 'الشئون القانونية',
    employeePenalty: 'خصم 3 أيام',
    duration: 'خصم 3 أيام',
    hasGrievance: true,
    grievanceId: 'GRV-2025-001',
    grievanceStatus: 'تم تقديم طلب تظلم وقيد الدراسة بلجنة التظلمات',
  },
];

const INITIAL_TRAINING_COURSES: TrainingCourse[] = [
  {
    id: 'TRN-DAT-000001',
    courseId: 'DAT-000001',
    courseTitle: 'التحول الرقمي',
    provider: 'مركز التطوير الإداري وتكنولوجيا المعلومات',
    location: 'قاعة التدريب المركزية',
    startDate: '2025-01-26',
    endDate: '2025-01-26',
    durationHours: 8,
    attendanceStatus: 'Attended',
    attendanceStatusAr: 'تم الحضور',
    generalEvaluationStatus: 'Evaluated',
    generalEvaluationScore: 'جيد',
    evaluationAfter3MonthsStatus: 'Completed',
    evaluationAfter3MonthsScore: 'جيد جداً',
  },
  {
    id: 'TRN-HR-000015',
    courseId: 'HR-000015',
    courseTitle: 'مهارات العرض والتواصل الفعال',
    provider: 'أكاديمية القيادة والتطوير المؤسسي',
    location: 'تدريب مباشر وتفاعلي',
    startDate: '2025-08-10',
    endDate: '2025-08-12',
    durationHours: 18,
    attendanceStatus: 'Attended',
    attendanceStatusAr: 'تم الحضور',
    generalEvaluationStatus: 'PendingEvaluation',
    evaluationAfter3MonthsStatus: 'Pending',
  },
  {
    id: 'TRN-IT-000030',
    courseId: 'IT-000030',
    courseTitle: 'أمن المعلومات وحماية البيانات الحكومية',
    provider: 'الهيئة العامة للأمن السيبراني',
    location: 'عن بعد (Microsoft Teams)',
    startDate: '2025-03-01',
    endDate: '2025-03-05',
    durationHours: 20,
    attendanceStatus: 'Attended',
    attendanceStatusAr: 'تم الحضور',
    generalEvaluationStatus: 'Evaluated',
    generalEvaluationScore: 'ممتاز',
    evaluationAfter3MonthsStatus: 'Completed',
    evaluationAfter3MonthsScore: 'ممتاز',
  },
  {
    id: 'TRN-SYS-000042',
    courseId: 'SYS-000042',
    courseTitle: 'تحليل النظم المؤسسية عبر مايكروسوفت داينامكس',
    provider: 'مايكروسوفت الشرق الأوسط',
    location: 'قاعة المحاكاة الرقمية',
    startDate: '2025-04-14',
    endDate: '2025-04-18',
    durationHours: 30,
    attendanceStatus: 'Attended',
    attendanceStatusAr: 'تم الحضور',
    generalEvaluationStatus: 'Evaluated',
    generalEvaluationScore: 'جيد جداً',
    evaluationAfter3MonthsStatus: 'Completed',
    evaluationAfter3MonthsScore: 'جيد جداً',
  },
  {
    id: 'TRN-GOV-000055',
    courseId: 'GOV-000055',
    courseTitle: 'الحوكمة المؤسسية واللوائح التنظيمية',
    provider: 'معهد الإدارة العامة',
    location: 'المقر الرئيسي',
    startDate: '2025-05-20',
    endDate: '2025-05-22',
    durationHours: 15,
    attendanceStatus: 'Attended',
    attendanceStatusAr: 'تم الحضور',
    generalEvaluationStatus: 'Evaluated',
    generalEvaluationScore: 'ممتاز',
    evaluationAfter3MonthsStatus: 'Completed',
    evaluationAfter3MonthsScore: 'جيد جداً',
  },
];

const INITIAL_PERFORMANCE_EVALUATIONS: PerformanceEvaluation[] = [
  {
    id: 'EVAL-2025',
    year: '2025',
    cycle: 'التقييم السنوي الشامل للأداء المؤسسي 2025',
    rating: 'يتجاوز التوقعات بدرجة تميز (4.85 / 5.00)',
    reviewerName: 'د. سامي فهد العمر',
    reviewDate: '2025-12-28',
    status: 'معتمد نهائياً',
    competenciesScore: 97,
    goalsAchievedCount: 6,
    totalGoalsCount: 6,
  },
  {
    id: 'EVAL-2024',
    year: '2024',
    cycle: 'التقييم السنوي الشامل للأداء المؤسسي 2024',
    rating: 'يتجاوز التوقعات (4.70 / 5.00)',
    reviewerName: 'د. سامي فهد العمر',
    reviewDate: '2024-12-25',
    status: 'معتمد نهائياً',
    competenciesScore: 94,
    goalsAchievedCount: 5,
    totalGoalsCount: 5,
  },
];

const INITIAL_MONITORING_OPERATIONS: MonitoringOperation[] = [
  {
    id: 'MON-REQ-FD-2026-001',
    timestamp: '2026-09-10 09:00:00',
    operationType: 'FINANCIAL_DISCLOSURE',
    actionTitle: 'طلب استكمال إقرار الذمة المالية الدوري (2026)',
    category: 'إقرار ذمة مالية',
    referenceNumber: 'REQ-FD-2026-081',
    entity: 'إدارة الكسب غير المشروع - وزارة العدل',
    details: 'مطلوب من الموظف استكمال وتحديث بيانات الإقرار وحصر الأملاك والأرصدة البنكية وتقديم المرفقات الرسمية المؤيدة قبل انقضاء المهلة المقررة.',
    dueDate: '2026-10-15',
    user: 'أحمد محمد عبد الله',
    status: 'استكمل المطلوب',
    requiredAttachmentsList: [
      'كشف حسابات بنكية معتمد حديث لآخر 6 أشهر',
      'صورة بطاقة الرقم القومي سارية',
      'عقود وإثباتات الملكية العقارية أو الحيازات',
    ],
    attachments: [],
    attachmentsCount: 0,
    history: [
      {
        date: '2026-09-10 09:00',
        status: 'استكمل المطلوب',
        note: 'تم إصدار التكليف الدوري بتقديم إقرار الذمة المالية للموظف',
        by: 'نظام الامتثال والرقابة',
      },
    ],
  },
  {
    id: 'MON-REQ-DT-2026-005',
    timestamp: '2026-09-12 11:30:00',
    operationType: 'DRUG_TEST',
    actionTitle: 'طلب إجراء وتقديم نتيجة فحص كشف المخدرات الدوري',
    category: 'اختبار كشف ومخدرات',
    referenceNumber: 'REQ-DT-2026-149',
    entity: 'صندوق مكافحة وعلاج الإدمان - المعامل المركزية',
    details: 'تكليف الموظف بإجراء فحص الكشف الطبي الدوري للمخدرات بالمعامل المركزية المعتمدة وتقديم التقرير والمرفقات الرسمية.',
    dueDate: '2026-10-01',
    user: 'أحمد محمد عبد الله',
    status: 'استكمل المطلوب',
    requiredAttachmentsList: [
      'أصل تقرير نتيجة التحليل الصادر من المعامل المركزية المعتمدة',
      'إفادة الحضور وسحب العينة الرسمية',
    ],
    attachments: [],
    attachmentsCount: 0,
    history: [
      {
        date: '2026-09-12 11:30',
        status: 'استكمل المطلوب',
        note: 'تم توجيه طلب إجراء الفحص الدوري للكشف عن المواد المخدرة',
        by: 'اللجنة الطبية المشتركة',
      },
    ],
  },
  {
    id: 'MON-FD-2026-002',
    timestamp: '2026-09-18 14:20:00',
    operationType: 'FINANCIAL_DISCLOSURE',
    actionTitle: 'إقرار الذمة المالية - تم التقديم ورفع المرفقات',
    category: 'إقرار ذمة مالية',
    referenceNumber: 'REQ-FD-2026-052',
    entity: 'إدارة الكسب غير المشروع - وزارة العدل',
    details: 'قام الموظف باستكمال البيانات وحصر الأصول ورفع كشوف الحسابات والإقرار موقعاً إلكترونياً، والطلب بانتظار بدء التدقيق والمراجعة.',
    user: 'أحمد محمد عبد الله',
    status: 'تم التقديم',
    attachmentsCount: 2,
    attachments: [
      {
        id: 'ATT-1',
        fileName: 'كشف_حسابات_البنك_الاهلي_2026.pdf',
        fileSize: '1.4 MB',
        uploadDate: '2026-09-18',
        category: 'حسابات بنكية',
      },
      {
        id: 'ATT-2',
        fileName: 'نموذج_اقرار_الذمة_الموقع.pdf',
        fileSize: '850 KB',
        uploadDate: '2026-09-18',
        category: 'نموذج إقرار',
      },
    ],
    history: [
      {
        date: '2026-09-01 10:00',
        status: 'استكمل المطلوب',
        note: 'تم إشعار الموظف بحلول موعد تقديم إقرار الذمة المالية',
        by: 'نظام الامتثال',
      },
      {
        date: '2026-09-18 14:20',
        status: 'تم التقديم',
        note: 'قام الموظف باستكمال البيانات ورفع المرفقات المطلوبة',
        by: 'أحمد محمد عبد الله (الموظف)',
      },
    ],
  },
  {
    id: 'MON-DT-2026-003',
    timestamp: '2026-09-14 10:00:00',
    operationType: 'DRUG_TEST',
    actionTitle: 'نتيجة فحص المخدرات الدوري - قيد الفحص والتدقيق',
    category: 'اختبار كشف ومخدرات',
    referenceNumber: 'REQ-DT-2026-088',
    entity: 'صندوق مكافحة وعلاج الإدمان والتعاطي',
    details: 'تم استلام التقرير الطبي ونتيجة الفحص المخبري، وجاري مطابقة العينة والاعتماد من قبل اللجنة الطبية الثلاثية المختصة.',
    result: 'جاري فحص العينة',
    user: 'أحمد محمد عبد الله',
    status: 'جاري المراجعة',
    attachmentsCount: 1,
    attachments: [
      {
        id: 'ATT-3',
        fileName: 'تقرير_معامل_وزارة_الصحة_المعتمد.pdf',
        fileSize: '2.1 MB',
        uploadDate: '2026-09-14',
        category: 'تقرير طبي',
      },
    ],
    history: [
      {
        date: '2026-09-05 08:30',
        status: 'استكمل المطلوب',
        note: 'إشعار طلب إجراء فحص المخدرات الدوري',
        by: 'صندوق مكافحة الإدمان',
      },
      {
        date: '2026-09-12 12:00',
        status: 'تم التقديم',
        note: 'تم تسليم نتيجة التحليل والتقرير الطبي من قبل الموظف',
        by: 'أحمد محمد عبد الله',
      },
      {
        date: '2026-09-14 10:00',
        status: 'جاري المراجعة',
        note: 'أحيلت الأوراق إلى اللجنة الطبية الثلاثية للتدقيق والاعتماد',
        by: 'لجنة الفحص والاعتماد',
      },
    ],
  },
  {
    id: 'MON-FD-2025-001',
    timestamp: '2025-11-15 10:30:00',
    operationType: 'FINANCIAL_DISCLOSURE',
    actionTitle: 'إقرار الذمة المالية الدوري (كل 5 سنوات)',
    category: 'إقرار ذمة مالية',
    referenceNumber: 'FD-2025-0982',
    entity: 'إدارة الكسب غير المشروع - وزارة العدل',
    details: 'تم إيداع إقرار الذمة المالية الإلزامي الخامس لعام 2025 مع كشف الحسابات البنكية والممتلكات العقارية والمنقولة واكتمال التدقيق.',
    result: 'مستوفى ومطابق للشروط الرقابية والقانونية',
    validUntil: '2030-11-15',
    user: 'أحمد محمد عبد الله',
    status: 'مكتمل / مستوفي',
    attachmentsCount: 3,
    attachments: [
      {
        id: 'ATT-4',
        fileName: 'اعتماد_إدارة_الكسب_غير_المشروع.pdf',
        fileSize: '980 KB',
        uploadDate: '2025-11-15',
        category: 'إفادة رسمية',
      },
      {
        id: 'ATT-5',
        fileName: 'كشف_الحسابات_المصرفية_2025.pdf',
        fileSize: '1.8 MB',
        uploadDate: '2025-11-15',
        category: 'حسابات بنكية',
      },
      {
        id: 'ATT-6',
        fileName: 'حصر_الممتلكات_العقارية.pdf',
        fileSize: '1.2 MB',
        uploadDate: '2025-11-15',
        category: 'أصول عقارية',
      },
    ],
    history: [
      {
        date: '2025-10-01 09:00',
        status: 'استكمل المطلوب',
        note: 'طلب إقرار الذمة المالية الدوري',
        by: 'نظام الامتثال',
      },
      {
        date: '2025-10-20 14:00',
        status: 'تم التقديم',
        note: 'تم تقديم الإقرار وجميع كشوف الحسابات',
        by: 'الموظف',
      },
      {
        date: '2025-11-05 11:00',
        status: 'جاري المراجعة',
        note: 'بدء أعمال فحص الأصول والحسابات المالية',
        by: 'إدارة الكسب غير المشروع',
      },
      {
        date: '2025-11-15 10:30',
        status: 'مكتمل / مستوفي',
        note: 'تم اعتماد الإقرار رسمياً وأرشفته بالملف الوظيفي',
        by: 'إدارة الكسب غير المشروع - وزارة العدل',
      },
    ],
  },
  {
    id: 'MON-DT-2026-002',
    timestamp: '2026-05-18 09:15:00',
    operationType: 'DRUG_TEST',
    actionTitle: 'نتيجة الفحص الدوري الشامل للكشف عن المخدرات',
    category: 'اختبار كشف ومخدرات',
    referenceNumber: 'DT-KSA-88319',
    entity: 'صندوق مكافحة وعلاج الإدمان والتعاطي - المعامل المركزية',
    details: 'الفحص الدوري الإلزامي المفاجئ طبقاً لقانون الكشف عن تعاطي المخدرات بالجهاز الإداري للدولة - مستوفى ومعتمد نهائياً.',
    result: 'سلبي (لائق طبياً وخالٍ من السموم)',
    validUntil: '2027-05-18',
    user: 'أحمد محمد عبد الله',
    status: 'مكتمل / مستوفي',
    attachmentsCount: 1,
    attachments: [
      {
        id: 'ATT-7',
        fileName: 'تقرير_تحليل_السموم_المعتمد.pdf',
        fileSize: '1.6 MB',
        uploadDate: '2026-05-18',
        category: 'تقرير طبي',
      },
    ],
    history: [
      {
        date: '2026-05-02 09:00',
        status: 'استكمل المطلوب',
        note: 'تكليف الموظف بسحب عينة الفحص الدوري للمخدرات',
        by: 'صندوق مكافحة الإدمان',
      },
      {
        date: '2026-05-10 13:00',
        status: 'تم التقديم',
        note: 'تقديم تقرير المعامل المركزية',
        by: 'الموظف',
      },
      {
        date: '2026-05-14 11:30',
        status: 'جاري المراجعة',
        note: 'مراجعة وتدقيق نتيجة العينة باللجنة الطبية',
        by: 'اللجنة الطبية',
      },
      {
        date: '2026-05-18 09:15',
        status: 'مكتمل / مستوفي',
        note: 'اعتماد النتيجة سلبية (لائق طبياً) وحفظها بسجل الموظف',
        by: 'صندوق مكافحة وعلاج الإدمان',
      },
    ],
  },
];

const DELEGATED_EMPLOYEES: DelegatedEmployee[] = [
  {
    id: 'EMP-10001',
    workerNumber: 'EMP-10001',
    name: 'موظف 1 (أحمد المحمدي)',
    jobTitle: 'محلل نظم',
    department: 'تكنولوجيا المعلومات',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 'EMP-10812',
    workerNumber: 'EMP-10812',
    name: 'سارة العبدالله',
    jobTitle: 'مهندسة برمجيات',
    department: 'تكنولوجيا المعلومات',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80',
  },
  {
    id: 'EMP-10904',
    workerNumber: 'EMP-10904',
    name: 'خالد القحطاني',
    jobTitle: 'أخصائي قواعد بيانات',
    department: 'تكنولوجيا المعلومات',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
  },
];

const INITIAL_NOTIFICATIONS: D365Notification[] = [
  {
    id: 'NOTIF-1',
    title: 'سير العمل: إشعار استلام طلب الإجازة',
    message: 'تم إرسال طلب الإجازة الاعتيادية (LR-2026-089) بنجاح إلى صندوق مهام مديرك المباشر د. سامي العمر.',
    timestamp: 'منذ ساعتين',
    isRead: false,
    type: 'info',
  },
  {
    id: 'NOTIF-2',
    title: 'تذكير تدريبي: تقييم دورة D365 معلق',
    message: 'يرجى استكمال استبيان تقييم دورة "معمارية وتطوير حلول Microsoft Dynamics 365" لتمكين إصدار الشهادة.',
    timestamp: 'منذ يوم واحد',
    isRead: false,
    type: 'warning',
  },
  {
    id: 'NOTIF-3',
    title: 'تحديث الرصيد الدوري',
    message: 'تم إضافة استحقاق شهر سبتمبر (2.5 يوم) لرصيد إجازتك الاعتيادية بنجاح.',
    timestamp: 'منذ 3 أيام',
    isRead: true,
    type: 'success',
  },
];

type ServiceListener = () => void;

class D365Service {
  private employee: Employee = { ...INITIAL_EMPLOYEE };
  private leaveBalances: LeaveBalance[] = [...INITIAL_LEAVE_BALANCES];
  private leaveTransactions: LeaveMovementTransaction[] = [...INITIAL_LEAVE_TRANSACTIONS];
  private leaveRequests: LeaveRequest[] = [...INITIAL_LEAVE_REQUESTS];
  private penalties: Penalty[] = [...INITIAL_PENALTIES];
  private grievances: Grievance[] = [];
  private trainingCourses: TrainingCourse[] = [...INITIAL_TRAINING_COURSES];
  private trainingEvaluations: TrainingEvaluation[] = [];
  private performanceEvaluations: PerformanceEvaluation[] = [...INITIAL_PERFORMANCE_EVALUATIONS];
  private monitoringOperations: MonitoringOperation[] = [...INITIAL_MONITORING_OPERATIONS];
  private notifications: D365Notification[] = [...INITIAL_NOTIFICATIONS];
  private delegatedEmployees: DelegatedEmployee[] = [...DELEGATED_EMPLOYEES];
  private teamMembers: TeamMember[] = [...INITIAL_TEAM_MEMBERS];

  private listeners: Set<ServiceListener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedRequests = localStorage.getItem('d365_leave_requests');
      if (storedRequests) {
        this.leaveRequests = JSON.parse(storedRequests);
      }
      const storedCourses = localStorage.getItem('d365_training_courses');
      if (storedCourses) {
        this.trainingCourses = JSON.parse(storedCourses);
      }
      const storedPenalties = localStorage.getItem('d365_penalties');
      if (storedPenalties) {
        this.penalties = JSON.parse(storedPenalties);
      }
    } catch {
      // fallback to initial mock memory state
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('d365_leave_requests', JSON.stringify(this.leaveRequests));
      localStorage.setItem('d365_training_courses', JSON.stringify(this.trainingCourses));
      localStorage.setItem('d365_penalties', JSON.stringify(this.penalties));
    } catch {
      // Ignore quota errors in storage
    }
  }

  public subscribe(listener: ServiceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener());
  }

  // Employee Methods
  public getEmployee(): Employee {
    return { ...this.employee };
  }

  // Leave Balances & Transactions
  public getLeaveBalances(): LeaveBalance[] {
    return [...this.leaveBalances];
  }

  public getLeaveTransactions(leaveTypeCode?: LeaveTypeCode): LeaveMovementTransaction[] {
    return [...this.leaveTransactions];
  }

  // Leave Requests
  public getLeaveRequests(): LeaveRequest[] {
    return [...this.leaveRequests];
  }

  public submitLeaveRequest(data: {
    leaveTypeCode: LeaveTypeCode;
    startDate: string;
    endDate: string;
    delegatedEmployeeId: string;
    socialInsuranceOption: boolean;
    healthInsuranceOption: boolean;
    attachments: Array<{ id: string; fileName: string; fileSize: string; uploadDate: string }>;
    notes: string;
  }): LeaveRequest {
    // Calculate days between dates
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const timeDiff = Math.max(0, end.getTime() - start.getTime());
    const days = Math.round(timeDiff / (1000 * 3600 * 24)) + 1;

    const delegated = this.delegatedEmployees.find((e) => e.id === data.delegatedEmployeeId) || this.delegatedEmployees[0];
    const balance = this.leaveBalances.find((b) => b.leaveTypeCode === data.leaveTypeCode) || this.leaveBalances[0];

    const newRequest: LeaveRequest = {
      id: `LR-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      employeeId: this.employee.id,
      employeeName: this.employee.name,
      leaveTypeCode: data.leaveTypeCode,
      leaveTypeTitle: balance.leaveTypeTitle,
      startDate: data.startDate,
      endDate: data.endDate,
      requestedDays: days,
      delegatedEmployeeId: delegated.id,
      delegatedEmployeeName: delegated.name,
      delegatedEmployeeTitle: delegated.jobTitle,
      socialInsuranceOption: data.socialInsuranceOption,
      healthInsuranceOption: data.healthInsuranceOption,
      attachments: data.attachments,
      notes: data.notes,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'InReview',
      statusAr: 'قيد الاعتماد من المدير المباشر',
      workflowStep: 'في انتظار اعتماد رئيس القسم',
      d365SyncStatus: 'Synced',
    };

    // Update pending balance
    balance.pendingBalance += days;

    this.leaveRequests.unshift(newRequest);

    this.notify();
    return newRequest;
  }

  public saveLeaveRequestDraft(data: {
    leaveTypeCode: LeaveTypeCode;
    startDate: string;
    endDate: string;
    delegatedEmployeeId: string;
    socialInsuranceOption: boolean;
    healthInsuranceOption: boolean;
    attachments: Array<{ id: string; fileName: string; fileSize: string; uploadDate: string }>;
    notes: string;
  }): LeaveRequest {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const timeDiff = Math.max(0, end.getTime() - start.getTime());
    const days = Math.round(timeDiff / (1000 * 3600 * 24)) + 1;

    const delegated = this.delegatedEmployees.find((e) => e.id === data.delegatedEmployeeId) || this.delegatedEmployees[0];
    const balance = this.leaveBalances.find((b) => b.leaveTypeCode === data.leaveTypeCode) || this.leaveBalances[0];

    const draftRequest: LeaveRequest = {
      id: `DRF-2026-${String(Math.floor(100 + Math.random() * 900))}`,
      employeeId: this.employee.id,
      employeeName: this.employee.name,
      leaveTypeCode: data.leaveTypeCode,
      leaveTypeTitle: balance.leaveTypeTitle,
      startDate: data.startDate,
      endDate: data.endDate,
      requestedDays: days,
      delegatedEmployeeId: delegated.id,
      delegatedEmployeeName: delegated.name,
      delegatedEmployeeTitle: delegated.jobTitle,
      socialInsuranceOption: data.socialInsuranceOption,
      healthInsuranceOption: data.healthInsuranceOption,
      attachments: data.attachments,
      notes: data.notes,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      statusAr: 'مسودة غير مرسلة',
      workflowStep: 'لم يتم الإرسال لسير العمل',
      d365SyncStatus: 'Pending',
    };

    this.leaveRequests.unshift(draftRequest);

    this.notify();
    return draftRequest;
  }

  public cancelLeaveRequest(requestId: string): boolean {
    const req = this.leaveRequests.find((r) => r.id === requestId);
    if (!req) return false;
    const wasInReview = req.status === 'InReview';
    req.status = 'Canceled';
    req.statusAr = 'ملغى من قبل الموظف';
    req.workflowStep = 'تم إنهاء سير العمل بالإلغاء';

    // Release pending balance if was in review
    const balance = this.leaveBalances.find((b) => b.leaveTypeCode === req.leaveTypeCode);
    if (balance && wasInReview) {
      balance.pendingBalance = Math.max(0, balance.pendingBalance - req.requestedDays);
    }

    this.notify();
    return true;
  }

  // Penalties & Grievances
  public getPenalties(): Penalty[] {
    return [...this.penalties];
  }

  public submitGrievance(data: {
    penaltyId: string;
    grievanceDate: string;
    grievanceSubject: string;
    grievanceDetails: string;
    attachments: Array<{ id: string; fileName: string; fileSize: string }>;
  }): Grievance {
    const penalty = this.penalties.find((p) => p.id === data.penaltyId);
    if (penalty) {
      penalty.penaltyStatus = 'UnderGrievance';
      penalty.penaltyStatusAr = 'قيد التظلم والمراجعة';
      penalty.hasGrievance = true;
      penalty.grievanceId = `GRV-2026-${String(Math.floor(100 + Math.random() * 900))}`;
      penalty.grievanceStatus = 'تم قيد التظلم وإحالته للجنة النظر في التظلمات';
    }

    const newGrievance: Grievance = {
      id: penalty?.grievanceId || `GRV-2026-${Date.now()}`,
      penaltyId: data.penaltyId,
      penaltyNumber: penalty?.penaltyNumber || '',
      grievanceDate: data.grievanceDate,
      grievanceSubject: data.grievanceSubject,
      grievanceDetails: data.grievanceDetails,
      attachments: data.attachments,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      statusAr: 'قيد دراسة لجنة التظلمات المستقلة',
    };

    this.grievances.unshift(newGrievance);

    this.notify();
    return newGrievance;
  }

  // Training Courses & Evaluations
  public getTrainingCourses(): TrainingCourse[] {
    return [...this.trainingCourses];
  }

  public submitTrainingEvaluation(data: {
    courseId: string;
    trainerKnowledge: 'ممتاز' | 'جيد جداً' | 'جيد' | 'متوسط' | 'ضعيف';
    trainerEngagement: 'ممتاز' | 'جيد جداً' | 'جيد' | 'متوسط' | 'ضعيف';
    courseContent: 'ممتاز' | 'جيد جداً' | 'جيد' | 'متوسط' | 'ضعيف';
    overallProgramEvaluation: 'ممتاز' | 'جيد جداً' | 'جيد' | 'متوسط' | 'ضعيف';
    programDuration: 'ممتاز' | 'جيد جداً' | 'جيد' | 'متوسط' | 'ضعيف';
    positiveFeedback?: string;
    improvementFeedback?: string;
  }): TrainingEvaluation {
    const course = this.trainingCourses.find((c) => c.courseId === data.courseId);
    if (course) {
      course.generalEvaluationStatus = 'Evaluated';
      course.generalEvaluationScore = data.overallProgramEvaluation;
      course.evaluationId = `EVAL-${Date.now()}`;
    }

    const evaluation: TrainingEvaluation = {
      id: `EVAL-${Date.now()}`,
      courseId: data.courseId,
      courseTitle: course?.courseTitle || '',
      submissionDate: new Date().toISOString().split('T')[0],
      trainerKnowledge: data.trainerKnowledge,
      trainerEngagement: data.trainerEngagement,
      courseContent: data.courseContent,
      overallProgramEvaluation: data.overallProgramEvaluation,
      programDuration: data.programDuration,
      positiveFeedback: data.positiveFeedback,
      improvementFeedback: data.improvementFeedback,
    };

    this.trainingEvaluations.unshift(evaluation);

    this.notify();
    return evaluation;
  }

  // Performance Evaluations & Monitoring
  public getPerformanceEvaluations(): PerformanceEvaluation[] {
    return [...this.performanceEvaluations];
  }

  public getMonitoringOperations(): MonitoringOperation[] {
    return [...this.monitoringOperations];
  }

  public completeMonitoringRequest(
    requestId: string,
    submittedData: any,
    attachments: MonitoringAttachment[] = []
  ): MonitoringOperation {
    const req = this.monitoringOperations.find((o) => o.id === requestId);
    if (!req) {
      throw new Error(`لم يتم العثور على الطلب رقم ${requestId}`);
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    req.status = 'تم التقديم';
    req.submittedData = { ...submittedData };
    req.attachments = [...(req.attachments || []), ...attachments];
    req.attachmentsCount = req.attachments.length;

    if (req.operationType === 'FINANCIAL_DISCLOSURE') {
      req.details = `تم استكمال إقرار الذمة المالية وتقديم الأصول والبيانات المالية: العقارات (${submittedData.realEstateSummary || 'لا يوجد'})، الحسابات البنكية (${submittedData.cashAndDepositsSummary || 'مستوفاة'})`;
      req.result = 'تم التقديم - بانتظار بدء التدقيق';
    } else {
      req.details = `تم تقديم التقرير الطبي ونتيجة الفحص المخبري رقم ${submittedData.reportNumber || req.referenceNumber} الصادر من ${submittedData.entity || req.entity}، النتيجة: ${submittedData.medicalResult || 'سلبي (لائق طبياً)'}`;
      req.result = submittedData.medicalResult || 'سلبي (لائق طبياً)';
    }

    if (!req.history) req.history = [];
    req.history.push({
      date: timestamp.substring(0, 16),
      status: 'تم التقديم',
      note: 'قام الموظف باستكمال كافة البيانات المطلوبة ورفع المرفقات المؤيدة بنجاح',
      by: `${this.employee.name} (الموظف)`,
    });

    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `تم استكمال وتقديم الطلب (${req.referenceNumber})`,
      message: `تم تقديم طلب ${req.category} ورفع ${req.attachmentsCount} مرفقات بنجاح، وأحيل الطلب لسير المراجعة.`,
      timestamp: 'الآن',
      isRead: false,
      type: 'success',
    });

    this.notify();
    return req;
  }

  public updateMonitoringRequestStatus(
    requestId: string,
    newStatus: MonitoringRequestStatus,
    note?: string
  ): MonitoringOperation {
    const req = this.monitoringOperations.find((o) => o.id === requestId);
    if (!req) {
      throw new Error(`لم يتم العثور على الطلب رقم ${requestId}`);
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    req.status = newStatus;

    if (newStatus === 'مكتمل / مستوفي') {
      req.result = req.operationType === 'FINANCIAL_DISCLOSURE' 
        ? 'مستوفى ومطابق للشروط الرقابية والقانونية' 
        : (req.result || 'سلبي (لائق طبياً وخالٍ من السموم)');
      if (!req.validUntil) {
        req.validUntil = req.operationType === 'FINANCIAL_DISCLOSURE' ? '2031-12-31' : '2027-12-31';
      }
    }

    if (!req.history) req.history = [];
    req.history.push({
      date: timestamp.substring(0, 16),
      status: newStatus,
      note: note || `تم تحديث حالة الطلب إلى "${newStatus}" في نظام الامتثال الرقابي`,
      by: newStatus === 'تم التقديم' ? this.employee.name : 'إدارة الامتثال والمراجعة الرقابية',
    });

    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `تحديث حالة طلب ${req.category}`,
      message: `تم تغيير حالة الطلب ${req.referenceNumber} إلى "${newStatus}".`,
      timestamp: 'الآن',
      isRead: false,
      type: newStatus === 'مكتمل / مستوفي' ? 'success' : 'info',
    });

    this.notify();
    return req;
  }

  public submitFinancialDisclosure(data: {
    disclosureType: string;
    filingYear: string;
    entity: string;
    movableAssetsSummary: string;
    realEstateSummary: string;
    cashAndDepositsSummary: string;
    debtsAndLiabilitiesSummary: string;
    notes?: string;
    attachments?: MonitoringAttachment[];
    attachmentsCount?: number;
  }): MonitoringOperation {
    const newOperation: MonitoringOperation = {
      id: `MON-FD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operationType: 'FINANCIAL_DISCLOSURE',
      actionTitle: `تقديم إقرار ذمة مالية (${data.disclosureType})`,
      category: 'إقرار ذمة مالية',
      referenceNumber: `FD-${data.filingYear}-${Math.floor(1000 + Math.random() * 9000)}`,
      entity: data.entity || 'إدارة الكسب غير المشروع - وزارة العدل',
      details: `تم إيداع إقرار الذمة المالية لعام ${data.filingYear}. الأصول والعقارات: ${data.realEstateSummary || 'لا يوجد'}، الحسابات والودائع: ${data.cashAndDepositsSummary || 'مستوفاة'}`,
      result: 'تم التقديم - قيد المراجعة الرقابية',
      validUntil: `${parseInt(data.filingYear || '2026') + 5}-12-31`,
      user: this.employee.name,
      status: 'تم التقديم',
      attachments: data.attachments || [
        {
          id: `ATT-${Date.now()}-1`,
          fileName: `إقرار_الذمة_المالية_${data.filingYear}.pdf`,
          fileSize: '1.2 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          category: 'نموذج إقرار',
        },
      ],
      attachmentsCount: (data.attachments && data.attachments.length) || data.attachmentsCount || 1,
      submittedData: {
        disclosureType: data.disclosureType,
        filingYear: data.filingYear,
        realEstateSummary: data.realEstateSummary,
        movableAssetsSummary: data.movableAssetsSummary,
        cashAndDepositsSummary: data.cashAndDepositsSummary,
        debtsAndLiabilitiesSummary: data.debtsAndLiabilitiesSummary,
      },
      history: [
        {
          date: new Date().toISOString().substring(0, 16).replace('T', ' '),
          status: 'تم التقديم',
          note: 'تم استكمال الإقرار وتقديم كافة البيانات المالية والمرفقات من قبل الموظف',
          by: `${this.employee.name} (الموظف)`,
        },
      ],
    };

    this.monitoringOperations.unshift(newOperation);
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'تم تقديم إقرار ذمة مالية جديد بنجاح',
      message: `تم تسجيل إقرار الذمة المالية برقم مرجعي ${newOperation.referenceNumber} وحالته (تم التقديم) وإحالته للمراجعة الرقابية.`,
      timestamp: 'الآن',
      isRead: false,
      type: 'success',
    });

    this.notify();
    return newOperation;
  }

  public submitDrugOrMedicalTest(data: {
    testType: string;
    testDate: string;
    entity: string;
    reportNumber: string;
    result: string;
    notes?: string;
    attachments?: MonitoringAttachment[];
    attachmentsCount?: number;
  }): MonitoringOperation {
    const newOperation: MonitoringOperation = {
      id: `MON-DT-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operationType: 'DRUG_TEST',
      actionTitle: `تقديم نتيجة اختبار (${data.testType})`,
      category: 'اختبار كشف ومخدرات',
      referenceNumber: data.reportNumber || `DT-KSA-${Math.floor(10000 + Math.random() * 90000)}`,
      entity: data.entity || 'صندوق مكافحة وعلاج الإدمان - المعامل المركزية',
      details: `تقرير الفحص الدوري المعتمد بتاريخ ${data.testDate} من ${data.entity}، النتيجة: ${data.result}${data.notes ? ` - ملاحظات: ${data.notes}` : ''}`,
      result: data.result,
      validUntil: `${new Date().getFullYear() + 1}-06-30`,
      user: this.employee.name,
      status: 'تم التقديم',
      attachments: data.attachments || [
        {
          id: `ATT-${Date.now()}-2`,
          fileName: `تقرير_المعمل_المركزي_${data.reportNumber || 'فحص_طبي'}.pdf`,
          fileSize: '1.8 MB',
          uploadDate: new Date().toISOString().split('T')[0],
          category: 'تقرير طبي',
        },
      ],
      attachmentsCount: (data.attachments && data.attachments.length) || data.attachmentsCount || 1,
      submittedData: {
        testType: data.testType,
        testDate: data.testDate,
        reportNumber: data.reportNumber,
        medicalResult: data.result,
        testNotes: data.notes,
      },
      history: [
        {
          date: new Date().toISOString().substring(0, 16).replace('T', ' '),
          status: 'تم التقديم',
          note: 'تم تقديم التقرير الطبي ومرفق نتيجة تحليل السموم والمخدرات',
          by: `${this.employee.name} (الموظف)`,
        },
      ],
    };

    this.monitoringOperations.unshift(newOperation);
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'تم تقديم نتيجة اختبار الكشف والمخدرات',
      message: `تم حفظ تقرير الاختبار رقم ${newOperation.referenceNumber} وحالته (تم التقديم) بانتظار استكمال التدقيق.`,
      timestamp: 'الآن',
      isRead: false,
      type: 'success',
    });

    this.notify();
    return newOperation;
  }

  public getDelegatedEmployees(): DelegatedEmployee[] {
    return [...this.delegatedEmployees];
  }

  public getNotifications(): D365Notification[] {
    return [...this.notifications];
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.notify();
    }
  }

  // Dynamics 365 OData Payload generation preview (for API integration inspect)
  public generateODataPayload(entityName: 'HcmLeaveRequest' | 'HcmDisciplinaryGrievance' | 'HcmCourseEvaluation', recordData: any) {
    const timestamp = new Date().toISOString();
    switch (entityName) {
      case 'HcmLeaveRequest':
        return {
          '@odata.context': 'https://contoso.operations.dynamics.com/data/$metadata#LeaveAndAbsenceRequests/$entity',
          dataAreaId: 'usmf',
          PersonnelNumber: this.employee.id,
          LeaveTypeId: recordData.leaveTypeCode || 'ANNUAL',
          StartDate: recordData.startDate,
          EndDate: recordData.endDate,
          RequestedDays: recordData.requestedDays || 1,
          DelegatedWorkerPersonnelNumber: recordData.delegatedEmployeeId || 'EMP-10773',
          SocialInsuranceOption: recordData.socialInsuranceOption ? 'Yes' : 'No',
          HealthInsuranceOption: recordData.healthInsuranceOption ? 'Yes' : 'No',
          Comment: recordData.notes || '',
          SubmittedDateTime: timestamp,
          WorkflowState: 'Submitted',
        };
      case 'HcmDisciplinaryGrievance':
        return {
          '@odata.context': 'https://contoso.operations.dynamics.com/data/$metadata#DisciplinaryGrievances/$entity',
          dataAreaId: 'usmf',
          DisciplinaryActionId: recordData.penaltyId,
          PersonnelNumber: this.employee.id,
          GrievanceDate: recordData.grievanceDate,
          GrievanceSubject: recordData.grievanceSubject,
          JustificationNotes: recordData.grievanceDetails,
          Status: 'InReview',
        };
      case 'HcmCourseEvaluation':
        return {
          '@odata.context': 'https://contoso.operations.dynamics.com/data/$metadata#CourseEvaluations/$entity',
          dataAreaId: 'usmf',
          CourseId: recordData.courseId,
          PersonnelNumber: this.employee.id,
          EvaluationCriteria: [
            { CriterionId: 'CRIT-1', Name: 'Trainer Knowledge', Rating: recordData.trainerKnowledge },
            { CriterionId: 'CRIT-2', Name: 'Trainer Engagement', Rating: recordData.trainerEngagement },
            { CriterionId: 'CRIT-3', Name: 'Course Content', Rating: recordData.courseContent },
            { CriterionId: 'CRIT-4', Name: 'Overall Program', Rating: recordData.overallProgramEvaluation },
            { CriterionId: 'CRIT-5', Name: 'Program Duration', Rating: recordData.programDuration },
          ],
          SubmittedDateTime: timestamp,
        };
    }
  }

  // ==========================================
  // Manager Self-Service: Team Management Methods
  // ==========================================

  public getTeamMembers(): TeamMember[] {
    return this.teamMembers;
  }

  public getTeamMemberById(id: string): TeamMember | undefined {
    return this.teamMembers.find((m) => m.id === id);
  }

  public getTeamPositions(): TeamPosition[] {
    return this.teamMembers.map((m) => m.position);
  }

  public getTeamRequests(): TeamMemberRequest[] {
    return this.teamMembers.flatMap((m) => m.requests);
  }

  public approveTeamRequest(requestId: string, managerNotes?: string) {
    let affectedMemberName = '';
    let reqType = '';
    this.teamMembers = this.teamMembers.map((member) => {
      const updatedRequests = member.requests.map((req) => {
        if (req.id === requestId) {
          affectedMemberName = member.name;
          reqType = req.requestType;
          return {
            ...req,
            status: 'معتمد' as const,
            decisionDate: new Date().toISOString().split('T')[0],
            managerNotes: managerNotes || 'تمت الموافقة والاعتماد من قبل المدير المباشر.',
          };
        }
        return req;
      });
      return {
        ...member,
        requests: updatedRequests,
      };
    });

    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'اعتماد طلب مرؤوس',
      message: `تم اعتماد ${reqType} للموظف (${affectedMemberName}) بنجاح وإرسال الإشعار لجهات الاختصاص.`,
      timestamp: 'الآن',
      isRead: false,
      type: 'success',
    });

    this.notify();
  }

  public rejectTeamRequest(requestId: string, reason: string) {
    let affectedMemberName = '';
    let reqType = '';
    this.teamMembers = this.teamMembers.map((member) => {
      const updatedRequests = member.requests.map((req) => {
        if (req.id === requestId) {
          affectedMemberName = member.name;
          reqType = req.requestType;
          return {
            ...req,
            status: 'مرفوض' as const,
            decisionDate: new Date().toISOString().split('T')[0],
            managerNotes: reason,
          };
        }
        return req;
      });
      return {
        ...member,
        requests: updatedRequests,
      };
    });

    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'رفض طلب مرؤوس',
      message: `تم رفض ${reqType} للموظف (${affectedMemberName}) مع تدوين أسباب عدم الموافقة.`,
      timestamp: 'الآن',
      isRead: false,
      type: 'warning',
    });

    this.notify();
  }

  public submitLeaveOnBehalf(
    memberId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    days: number,
    notes?: string
  ) {
    const member = this.teamMembers.find((m) => m.id === memberId);
    if (!member) return;

    const newReqId = `REQ-TM-${Date.now().toString().slice(-4)}`;
    const newRequest: TeamMemberRequest = {
      id: newReqId,
      employeeId: member.id,
      employeeName: member.name,
      employeeJobTitle: member.jobTitle,
      requestType: leaveType as any,
      details: `طلب ${leaveType} مقدم نيابة عن الموظف بواسطة المشرف المباشر`,
      submissionDate: new Date().toISOString().split('T')[0],
      dates: `${startDate} إلى ${endDate}`,
      duration: `${days} يوم`,
      status: 'معتمد',
      decisionDate: new Date().toISOString().split('T')[0],
      managerNotes: notes || 'تم تقديم الطلب واعتماده مباشرة من قبل المشرف',
    };

    this.teamMembers = this.teamMembers.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          requests: [newRequest, ...m.requests],
          leaves: {
            ...m.leaves,
            annualAvailable: Math.max(0, m.leaves.annualAvailable - (leaveType.includes('اعتيادي') ? days : 0)),
            casualAvailable: Math.max(0, m.leaves.casualAvailable - (leaveType.includes('عارض') ? days : 0)),
            recentLeaves: [
              {
                id: `LR-${Date.now()}`,
                leaveType,
                startDate,
                endDate,
                days,
                status: 'معتمد',
                notes: notes || 'مقدمة بمعرفة المشرف المباشر',
              },
              ...m.leaves.recentLeaves,
            ],
          },
        };
      }
      return m;
    });

    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'تسجيل إجازة لموظف في الفريق',
      message: `تم تسجيل واعتماد طلب إجازة (${leaveType}) للموظف ${member.name} بنجاح.`,
      timestamp: 'الآن',
      isRead: false,
      type: 'success',
    });

    this.notify();
  }

  public submitAbsenceOnBehalf(memberId: string, duration: string, date: string, reason: string) {
    const member = this.teamMembers.find((m) => m.id === memberId);
    if (!member) return;

    const newReqId = `REQ-ABS-${Date.now().toString().slice(-4)}`;
    const newRequest: TeamMemberRequest = {
      id: newReqId,
      employeeId: member.id,
      employeeName: member.name,
      employeeJobTitle: member.jobTitle,
      requestType: 'إذن غياب',
      details: `إذن غياب رسمي: ${reason}`,
      submissionDate: new Date().toISOString().split('T')[0],
      dates: `${date} (${duration})`,
      duration,
      status: 'معتمد',
      decisionDate: new Date().toISOString().split('T')[0],
      managerNotes: 'إذن معتمد من المشرف المباشر',
    };

    this.teamMembers = this.teamMembers.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          requests: [newRequest, ...m.requests],
        };
      }
      return m;
    });

    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'تسجيل إذن غياب لموظف',
      message: `تم تسجيل إذن غياب رسمي (${duration}) للموظف ${member.name}.`,
      timestamp: 'الآن',
      isRead: false,
      type: 'info',
    });

    this.notify();
  }

  public resetAllToDefault() {
    localStorage.removeItem('d365_leave_requests');
    localStorage.removeItem('d365_training_courses');
    localStorage.removeItem('d365_penalties');
    this.employee = { ...INITIAL_EMPLOYEE };
    this.leaveBalances = [...INITIAL_LEAVE_BALANCES];
    this.leaveTransactions = [...INITIAL_LEAVE_TRANSACTIONS];
    this.leaveRequests = [...INITIAL_LEAVE_REQUESTS];
    this.penalties = [...INITIAL_PENALTIES];
    this.trainingCourses = [...INITIAL_TRAINING_COURSES];
    this.monitoringOperations = [...INITIAL_MONITORING_OPERATIONS];
    this.notify();
  }
}

export const d365Service = new D365Service();
