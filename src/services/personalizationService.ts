import {
  PersonalizationSettings,
  AccentColorKey,
  AccentColorConfig,
  CustomizableLabelItem,
} from '../types/personalization.types';

export const ACCENT_COLORS: Record<AccentColorKey, AccentColorConfig> = {
  blue: {
    key: 'blue',
    nameAr: 'أزرق Dynamics الكلاسيكي',
    nameEn: 'Dynamics Classic Blue',
    primary: '#0078D4',
    hover: '#106EBE',
    active: '#005A9E',
    lightBg: '#EFF6FC',
    lightBorder: '#C7E0F4',
    headerBg: '#0078D4',
    headerHover: '#005A9E',
    headerBorder: '#004E8C',
    headerSurface: '#005A9E',
  },
  teal: {
    key: 'teal',
    nameAr: 'أخضر زمردي / تركواز',
    nameEn: 'Emerald Teal',
    primary: '#008272',
    hover: '#006B5D',
    active: '#005449',
    lightBg: '#E6F4F2',
    lightBorder: '#B3DFD8',
    headerBg: '#008272',
    headerHover: '#006B5D',
    headerBorder: '#005449',
    headerSurface: '#006B5D',
  },
  green: {
    key: 'green',
    nameAr: 'أخضر غابي قياسي',
    nameEn: 'Forest Green',
    primary: '#107C41',
    hover: '#0E6A37',
    active: '#0B5A2F',
    lightBg: '#DFF6DD',
    lightBorder: '#92C353',
    headerBg: '#107C41',
    headerHover: '#0E6A37',
    headerBorder: '#0B5A2F',
    headerSurface: '#0E6A37',
  },
  purple: {
    key: 'purple',
    nameAr: 'أرجواني ملكي',
    nameEn: 'Royal Violet',
    primary: '#5C2D91',
    hover: '#4B2476',
    active: '#3A1B5C',
    lightBg: '#F3EFF8',
    lightBorder: '#D3C7E8',
    headerBg: '#5C2D91',
    headerHover: '#4B2476',
    headerBorder: '#3A1B5C',
    headerSurface: '#4B2476',
  },
  crimson: {
    key: 'crimson',
    nameAr: 'أحمر قرمزي / ياقوتي',
    nameEn: 'Ruby Crimson',
    primary: '#A80000',
    hover: '#8F0000',
    active: '#750000',
    lightBg: '#FDE7E9',
    lightBorder: '#F19999',
    headerBg: '#A80000',
    headerHover: '#8F0000',
    headerBorder: '#750000',
    headerSurface: '#8F0000',
  },
  orange: {
    key: 'orange',
    nameAr: 'برتقالي ترابي / تيراكوتا',
    nameEn: 'Terracotta Orange',
    primary: '#D83B01',
    hover: '#B83201',
    active: '#992901',
    lightBg: '#FDF3F2',
    lightBorder: '#F8D2CC',
    headerBg: '#D83B01',
    headerHover: '#B83201',
    headerBorder: '#992901',
    headerSurface: '#B83201',
  },
  navy: {
    key: 'navy',
    nameAr: 'كحلي داكن / نيفي',
    nameEn: 'Midnight Navy',
    primary: '#004E8C',
    hover: '#003E70',
    active: '#002E54',
    lightBg: '#EAF2F8',
    lightBorder: '#BDD6E9',
    headerBg: '#004E8C',
    headerHover: '#003E70',
    headerBorder: '#002E54',
    headerSurface: '#003E70',
  },
  charcoal: {
    key: 'charcoal',
    nameAr: 'رمادي فولاذي صلب',
    nameEn: 'Steel Charcoal',
    primary: '#4A4846',
    hover: '#3A3836',
    active: '#292827',
    lightBg: '#F4F4F3',
    lightBorder: '#D2D0CE',
    headerBg: '#4A4846',
    headerHover: '#3A3836',
    headerBorder: '#292827',
    headerSurface: '#3A3836',
  },
};

export const CUSTOMIZABLE_LABELS: CustomizableLabelItem[] = [
  // Navigation Tabs
  {
    key: 'nav.dashboard',
    category: 'nav',
    categoryTitleAr: 'تبويبات التنقل الرئيسية',
    categoryTitleEn: 'Main Navigation Tabs',
    defaultAr: 'لوحة المعلومات',
    defaultEn: 'Dashboard',
  },
  {
    key: 'nav.myTeam',
    category: 'nav',
    categoryTitleAr: 'تبويبات التنقل الرئيسية',
    categoryTitleEn: 'Main Navigation Tabs',
    defaultAr: 'معلومات فريقي',
    defaultEn: 'My Team',
  },
  {
    key: 'nav.leaveBalance',
    category: 'nav',
    categoryTitleAr: 'تبويبات التنقل الرئيسية',
    categoryTitleEn: 'Main Navigation Tabs',
    defaultAr: 'أرصدة الإجازات',
    defaultEn: 'Leave Balances',
  },
  {
    key: 'nav.leaveRequests',
    category: 'nav',
    categoryTitleAr: 'تبويبات التنقل الرئيسية',
    categoryTitleEn: 'Main Navigation Tabs',
    defaultAr: 'طلبات الإجازة',
    defaultEn: 'Leave Requests',
  },
  {
    key: 'nav.penalties',
    category: 'nav',
    categoryTitleAr: 'تبويبات التنقل الرئيسية',
    categoryTitleEn: 'Main Navigation Tabs',
    defaultAr: 'الجزاءات',
    defaultEn: 'Penalties',
  },
  {
    key: 'nav.trainingCourses',
    category: 'nav',
    categoryTitleAr: 'تبويبات التنقل الرئيسية',
    categoryTitleEn: 'Main Navigation Tabs',
    defaultAr: 'الدورات التدريبية',
    defaultEn: 'Training Courses',
  },
  {
    key: 'nav.performance',
    category: 'nav',
    categoryTitleAr: 'تبويبات التنقل الرئيسية',
    categoryTitleEn: 'Main Navigation Tabs',
    defaultAr: 'تقييمات الأداء',
    defaultEn: 'Performance Evaluations',
  },
  {
    key: 'nav.monitoring',
    category: 'nav',
    categoryTitleAr: 'تبويبات التنقل الرئيسية',
    categoryTitleEn: 'Main Navigation Tabs',
    defaultAr: 'عمليات المراقبة',
    defaultEn: 'Monitoring Operations',
  },

  // KPI Tiles
  {
    key: 'kpi.leaveBalance',
    category: 'kpi',
    categoryTitleAr: 'بطاقات المؤشرات الرئيسية (KPIs)',
    categoryTitleEn: 'Key Performance Indicators (KPIs)',
    defaultAr: 'رصيد الإجازات',
    defaultEn: 'Leave Balance',
  },
  {
    key: 'kpi.penalties',
    category: 'kpi',
    categoryTitleAr: 'بطاقات المؤشرات الرئيسية (KPIs)',
    categoryTitleEn: 'Key Performance Indicators (KPIs)',
    defaultAr: 'الجزاءات',
    defaultEn: 'Penalties',
  },
  {
    key: 'kpi.trainingCourses',
    category: 'kpi',
    categoryTitleAr: 'بطاقات المؤشرات الرئيسية (KPIs)',
    categoryTitleEn: 'Key Performance Indicators (KPIs)',
    defaultAr: 'الدورات التدريبية',
    defaultEn: 'Training Courses',
  },
  {
    key: 'kpi.performance',
    category: 'kpi',
    categoryTitleAr: 'بطاقات المؤشرات الرئيسية (KPIs)',
    categoryTitleEn: 'Key Performance Indicators (KPIs)',
    defaultAr: 'تقييمات الأداء',
    defaultEn: 'Performance Reviews',
  },
  {
    key: 'kpi.monitoring',
    category: 'kpi',
    categoryTitleAr: 'بطاقات المؤشرات الرئيسية (KPIs)',
    categoryTitleEn: 'Key Performance Indicators (KPIs)',
    defaultAr: 'عمليات المراقبة',
    defaultEn: 'Monitoring Operations',
  },

  // Employee Profile Card Fields
  {
    key: 'profile.personalDetails',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'البيانات الشخصية',
    defaultEn: 'Personal Details',
  },
  {
    key: 'profile.jobTitle',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'الوظيفة',
    defaultEn: 'Job Title',
  },
  {
    key: 'profile.jobGrade',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'المستوى الوظيفي',
    defaultEn: 'Job Grade',
  },
  {
    key: 'profile.department',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'الإدارة',
    defaultEn: 'Department',
  },
  {
    key: 'profile.directManager',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'المدير المباشر',
    defaultEn: 'Direct Manager',
  },
  {
    key: 'profile.yearsOfService',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'سنوات الخدمة',
    defaultEn: 'Years of Service',
  },
  {
    key: 'profile.empStatus',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'حالة الموظف',
    defaultEn: 'Employee Status',
  },
  {
    key: 'profile.jobGroup',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'المجموعة الوظيفية',
    defaultEn: 'Functional Group',
  },
  {
    key: 'profile.jobRole',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'المسمى الوظيفي',
    defaultEn: 'Role Title',
  },
  {
    key: 'profile.categoryGroup',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'المجموعة النوعية',
    defaultEn: 'Classification Group',
  },
  {
    key: 'profile.nationalId',
    category: 'profile',
    categoryTitleAr: 'حقول بطاقة الملف التعريفي للموظف',
    categoryTitleEn: 'Employee Profile Card Fields',
    defaultAr: 'الرقم القومي',
    defaultEn: 'National ID / Civil ID',
  },

  // Actions & Tables
  {
    key: 'action.quickActions',
    category: 'action',
    categoryTitleAr: 'الإجراءات والعمليات السريعة',
    categoryTitleEn: 'Quick Actions & Commands',
    defaultAr: 'الإجراءات السريعة',
    defaultEn: 'Quick Actions',
  },
  {
    key: 'action.requestLeave',
    category: 'action',
    categoryTitleAr: 'الإجراءات والعمليات السريعة',
    categoryTitleEn: 'Quick Actions & Commands',
    defaultAr: 'تقديم طلب إجازة',
    defaultEn: 'Request Leave',
  },
  {
    key: 'action.requestPermission',
    category: 'action',
    categoryTitleAr: 'الإجراءات والعمليات السريعة',
    categoryTitleEn: 'Quick Actions & Commands',
    defaultAr: 'تقديم طلب إذن',
    defaultEn: 'Request Permission',
  },
  {
    key: 'action.requestSecondment',
    category: 'action',
    categoryTitleAr: 'الإجراءات والعمليات السريعة',
    categoryTitleEn: 'Quick Actions & Commands',
    defaultAr: 'تقديم طلب ندب',
    defaultEn: 'Request Secondment',
  },
  {
    key: 'action.requestLoan',
    category: 'action',
    categoryTitleAr: 'الإجراءات والعمليات السريعة',
    categoryTitleEn: 'Quick Actions & Commands',
    defaultAr: 'تقديم طلب إعارة',
    defaultEn: 'Request Loan',
  },
  {
    key: 'action.requestTransfer',
    category: 'action',
    categoryTitleAr: 'الإجراءات والعمليات السريعة',
    categoryTitleEn: 'Quick Actions & Commands',
    defaultAr: 'تقديم طلب نقل',
    defaultEn: 'Request Transfer',
  },
  {
    key: 'action.financialDisclosure',
    category: 'action',
    categoryTitleAr: 'الإجراءات والعمليات السريعة',
    categoryTitleEn: 'Quick Actions & Commands',
    defaultAr: 'إقرارات الذمة المالية',
    defaultEn: 'Financial Disclosures',
  },
  {
    key: 'action.drugTest',
    category: 'action',
    categoryTitleAr: 'الإجراءات والعمليات السريعة',
    categoryTitleEn: 'Quick Actions & Commands',
    defaultAr: 'اختبار المخدرات',
    defaultEn: 'Drug Screening',
  },
  {
    key: 'table.recentRequests',
    category: 'table',
    categoryTitleAr: 'جدول وسجلات الطلبات',
    categoryTitleEn: 'Requests Table & Grid',
    defaultAr: 'الطلبات المقدمة مؤخراً',
    defaultEn: 'Recent Requests',
  },
];

export const DEFAULT_SETTINGS: PersonalizationSettings = {
  themeMode: 'light',
  accentColor: 'blue',
  language: 'ar',
  direction: 'rtl',
  customLabels: {},
};

class PersonalizationService {
  private getStorageKey(userId?: string): string {
    const effectiveId = userId || 'current_user';
    return `d365_personalization_${effectiveId}`;
  }

  public getSettings(userId?: string): PersonalizationSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        customLabels: { ...parsed.customLabels },
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  public saveSettings(userId: string | undefined, settings: PersonalizationSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(settings));
      this.applyThemeToDom(settings);
    } catch (e) {
      console.error('Failed to save personalization settings', e);
    }
  }

  public resetSettings(userId?: string): PersonalizationSettings {
    const defaults = { ...DEFAULT_SETTINGS };
    this.saveSettings(userId, defaults);
    return defaults;
  }

  public applyThemeToDom(settings: PersonalizationSettings): void {
    if (typeof document === 'undefined') return;

    // 1. Language & Direction
    const doc = document.documentElement;
    doc.lang = settings.language;
    doc.dir = settings.direction;

    // 2. Light / Dark mode class
    if (settings.themeMode === 'dark') {
      doc.classList.add('dark');
      doc.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#1B1A19';
      document.body.style.color = '#F3F2F1';
    } else {
      doc.classList.remove('dark');
      doc.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#F5F5F5';
      document.body.style.color = '#323130';
    }

    // 3. Dynamic Accent & Header Color CSS Variables
    const colorConfig = ACCENT_COLORS[settings.accentColor] || ACCENT_COLORS.blue;
    doc.style.setProperty('--d365-primary', colorConfig.primary);
    doc.style.setProperty('--d365-primary-hover', colorConfig.hover);
    doc.style.setProperty('--d365-primary-active', colorConfig.active);
    doc.style.setProperty('--d365-primary-light-bg', colorConfig.lightBg);
    doc.style.setProperty('--d365-primary-light-border', colorConfig.lightBorder);
    doc.style.setProperty('--d365-header-bg', colorConfig.headerBg);
    doc.style.setProperty('--d365-header-hover', colorConfig.headerHover);
    doc.style.setProperty('--d365-header-border', colorConfig.headerBorder);
    doc.style.setProperty('--d365-header-surface', colorConfig.headerSurface);
  }
}

export const personalizationService = new PersonalizationService();
