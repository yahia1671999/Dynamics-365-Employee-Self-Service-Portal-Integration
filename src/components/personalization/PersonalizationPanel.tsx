import React, { useState } from 'react';
import {
  X,
  Palette,
  Globe,
  Tag,
  RotateCcw,
  Check,
  Sun,
  Moon,
  Search,
  Sparkles,
  Info,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import {
  ACCENT_COLORS,
  CUSTOMIZABLE_LABELS
} from '../../services/personalizationService';
import { AccentColorKey } from '../../types/personalization.types';

interface PersonalizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userId?: string;
}

export const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({
  isOpen,
  onClose,
  userName,
  userId,
}) => {
  const {
    settings,
    accentConfig,
    isDark,
    language,
    direction,
    setThemeMode,
    setAccentColor,
    setLanguage,
    setCustomLabel,
    resetCustomLabel,
    restoreDefaults,
  } = usePersonalization();

  const [activeTab, setActiveTab] = useState<'theme' | 'language' | 'labels'>('theme');
  const [labelSearch, setLabelSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleRestoreDefaults = () => {
    restoreDefaults();
    showNotification(
      language === 'ar'
        ? 'تمت استعادة كافة إعدادات التخصيص الافتراضية لنظام Dynamics 365 بنجاح.'
        : 'All Dynamics 365 personalization defaults have been successfully restored.'
    );
  };

  const filteredLabels = CUSTOMIZABLE_LABELS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = labelSearch.toLowerCase().trim();
    if (!q) return matchesCategory;
    const customVal = (settings.customLabels[item.key] || '').toLowerCase();
    const nameAr = item.defaultAr.toLowerCase();
    const nameEn = item.defaultEn.toLowerCase();
    const keyStr = item.key.toLowerCase();
    return matchesCategory && (nameAr.includes(q) || nameEn.includes(q) || customVal.includes(q) || keyStr.includes(q));
  });

  const customLabelsCount = Object.keys(settings.customLabels).filter(
    (k) => settings.customLabels[k] && settings.customLabels[k].trim() !== ''
  ).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={language === 'ar' ? 'إضفاء طابع شخصي' : 'Personalization'}
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/60 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-xl md:max-w-2xl bg-white border-${direction === 'rtl' ? 'r' : 'l'} border-[#8A8886] shadow-2xl flex flex-col h-full text-${direction === 'rtl' ? 'right' : 'left'} animate-in slide-in-from-${direction === 'rtl' ? 'left' : 'right'} duration-200 z-50`}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: isDark ? '#201F1E' : '#FFFFFF',
          color: isDark ? '#F3F2F1' : '#323130',
        }}
      >
        {/* Top Header Bar */}
        <div
          className="px-4 sm:px-6 py-3.5 flex items-center justify-between border-b shrink-0 text-white shadow-xs"
          style={{
            backgroundColor: isDark ? '#141414' : '#002050',
            borderColor: isDark ? '#2D2C2C' : '#001838',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-3.5 h-3.5 shrink-0 ring-1 ring-white/30 shadow-xs"
              style={{ backgroundColor: accentConfig.primary }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight truncate text-white">
                  {language === 'ar' ? 'إضفاء طابع شخصي (Personalization)' : 'Personalization - User Options'}
                </h2>
                <span
                  className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: accentConfig.primary }}
                >
                  Dynamics 365
                </span>
              </div>
              <p className="text-[11px] text-[#C8C6C4] mt-0.5 truncate">
                {language === 'ar'
                  ? `تفضيلات العرض والسمات للمستخدم: ${userName || 'المستخدم الحالي'}`
                  : `Display & Theme Preferences for: ${userName || 'Current User'}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/15 text-[#E1DFDD] hover:text-white rounded-xs transition-colors shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            title={language === 'ar' ? 'إغلاق' : 'Close'}
            aria-label={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {notificationMsg && (
          <div className="mx-4 mt-3 p-2.5 bg-[#DFF6DD] border border-[#107C41] text-[#107C41] text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
            <button
              onClick={() => setNotificationMsg(null)}
              className="text-xs font-bold hover:underline"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        )}

        {/* Panel Tabs Navigation */}
        <div
          className="flex items-center border-b px-4 sm:px-6 text-xs font-semibold shrink-0 gap-1 overflow-x-auto"
          style={{
            backgroundColor: isDark ? '#292827' : '#FAF9F8',
            borderColor: isDark ? '#3B3A39' : '#EDEBE9',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'theme'
                ? 'font-bold'
                : 'border-transparent text-[#605E5C] hover:text-[#323130]'
            }`}
            style={{
              borderColor: activeTab === 'theme' ? accentConfig.primary : 'transparent',
              color: activeTab === 'theme' ? (isDark ? '#FFFFFF' : accentConfig.primary) : undefined,
            }}
          >
            <Palette className="w-4 h-4" />
            <span>{language === 'ar' ? 'المظهر واللون (Theme)' : 'Theme & Accent'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('language')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'language'
                ? 'font-bold'
                : 'border-transparent text-[#605E5C] hover:text-[#323130]'
            }`}
            style={{
              borderColor: activeTab === 'language' ? accentConfig.primary : 'transparent',
              color: activeTab === 'language' ? (isDark ? '#FFFFFF' : accentConfig.primary) : undefined,
            }}
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'ar' ? 'اللغة والاتجاه (Language)' : 'Language & Direction'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('labels')}
            className={`flex items-center gap-2 py-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'labels'
                ? 'font-bold'
                : 'border-transparent text-[#605E5C] hover:text-[#323130]'
            }`}
            style={{
              borderColor: activeTab === 'labels' ? accentConfig.primary : 'transparent',
              color: activeTab === 'labels' ? (isDark ? '#FFFFFF' : accentConfig.primary) : undefined,
            }}
          >
            <Tag className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسميات الحقول (Custom Labels)' : 'Custom Labels'}</span>
            {customLabelsCount > 0 && (
              <span
                className="px-1.5 py-0.2 text-[10px] font-bold text-white rounded-none"
                style={{ backgroundColor: accentConfig.primary }}
              >
                {customLabelsCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs"
          style={{
            backgroundColor: isDark ? '#201F1E' : '#FAF9F8',
          }}
        >
          {/* TAB 1: Theme & Accent Color */}
          {activeTab === 'theme' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Info banner */}
              <div
                className="p-3 border flex items-start gap-2.5"
                style={{
                  backgroundColor: isDark ? '#292827' : '#EFF6FC',
                  borderColor: isDark ? '#3B3A39' : '#C7E0F4',
                  color: isDark ? '#E1DFDD' : '#004578',
                }}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentConfig.primary }} />
                <div className="leading-relaxed">
                  <strong className="block font-semibold mb-0.5">
                    {language === 'ar' ? 'إعدادات سمة العرض (Visual Theme):' : 'Visual Theme Configuration:'}
                  </strong>
                  <span>
                    {language === 'ar'
                      ? 'تغيير السمة ولون التمييز ينعكس على واجهة المستخدم التقديمية فقط ويبقى محفوظاً لحسابك دون التأثير على قواعد الأعمال والتكاملات.'
                      : 'Changes to theme and accent colors affect presentation only and remain saved per user profile without altering business rules or integrations.'}
                  </span>
                </div>
              </div>

              {/* 1. Light / Dark Mode Selection */}
              <div
                className="p-4 border shadow-2xs"
                style={{
                  backgroundColor: isDark ? '#292827' : '#FFFFFF',
                  borderColor: isDark ? '#3B3A39' : '#EDEBE9',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sliders className="w-4 h-4" style={{ color: accentConfig.primary }} />
                  <span className="font-bold text-xs">
                    {language === 'ar' ? 'وضع العرض (Color Mode):' : 'Display Mode:'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Light Mode Card */}
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`p-3 border-2 flex items-center gap-3 transition-all cursor-pointer text-${direction === 'rtl' ? 'right' : 'left'}`}
                    style={{
                      borderColor: !isDark ? accentConfig.primary : (isDark ? '#3B3A39' : '#EDEBE9'),
                      backgroundColor: !isDark ? (isDark ? '#292827' : '#FFFFFF') : (isDark ? '#242322' : '#F8F9FA'),
                    }}
                  >
                    <div className="w-9 h-9 bg-[#F5F5F5] border border-[#D1D1D1] text-[#323130] flex items-center justify-center shrink-0 shadow-2xs">
                      <Sun className="w-5 h-5 text-[#0078D4]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{language === 'ar' ? 'الوضع الفاتح (Light)' : 'Light Mode'}</span>
                        {!isDark && <Check className="w-4 h-4" style={{ color: accentConfig.primary }} />}
                      </div>
                      <span className="text-[11px] text-[#605E5C] block mt-0.5">
                        {language === 'ar' ? 'مظهر Dynamics 365 النهاري القياسي' : 'Standard daytime enterprise UI'}
                      </span>
                    </div>
                  </button>

                  {/* Dark Mode Card */}
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`p-3 border-2 flex items-center gap-3 transition-all cursor-pointer text-${direction === 'rtl' ? 'right' : 'left'}`}
                    style={{
                      borderColor: isDark ? accentConfig.primary : (isDark ? '#3B3A39' : '#EDEBE9'),
                      backgroundColor: isDark ? '#292827' : '#FFFFFF',
                    }}
                  >
                    <div className="w-9 h-9 bg-[#1B1A19] border border-[#3B3A39] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Moon className="w-5 h-5 text-[#69AFE5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{language === 'ar' ? 'الوضع الداكن (Dark)' : 'Dark Mode'}</span>
                        {isDark && <Check className="w-4 h-4" style={{ color: accentConfig.primary }} />}
                      </div>
                      <span className="text-[11px] text-[#605E5C] block mt-0.5">
                        {language === 'ar' ? 'مظهر داكن عالي التباين ومريح للعين' : 'High-contrast dark enterprise UI'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Accent Color Swatches */}
              <div
                className="p-4 border shadow-2xs"
                style={{
                  backgroundColor: isDark ? '#292827' : '#FFFFFF',
                  borderColor: isDark ? '#3B3A39' : '#EDEBE9',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4" style={{ color: accentConfig.primary }} />
                  <span className="font-bold text-xs">
                    {language === 'ar' ? 'لون تمييز النظام (Accent Color):' : 'System Accent Color:'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(ACCENT_COLORS) as AccentColorKey[]).map((key) => {
                    const color = ACCENT_COLORS[key];
                    const isSelected = settings.accentColor === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setAccentColor(key)}
                        className={`p-3 border-2 flex items-center gap-3 transition-all cursor-pointer rounded-xs text-${direction === 'rtl' ? 'right' : 'left'} shadow-2xs hover:shadow-xs`}
                        style={{
                          borderColor: isSelected ? color.primary : (isDark ? '#3B3A39' : '#EDEBE9'),
                          backgroundColor: isSelected
                            ? (isDark ? '#333230' : color.lightBg)
                            : (isDark ? '#242322' : '#FFFFFF'),
                        }}
                      >
                        {/* Miniature Dynamics 365 UI Theme Swatch */}
                        <div
                          className="w-12 h-10 border border-[#D1D1D1] shrink-0 flex flex-col overflow-hidden shadow-xs"
                          style={{ borderColor: isSelected ? color.primary : '#D1D1D1' }}
                        >
                          {/* Top Bar Preview */}
                          <div
                            className="h-3.5 w-full flex items-center justify-between px-1"
                            style={{ backgroundColor: color.headerBg }}
                          >
                            <div className="w-1.5 h-1.5 bg-white/80 rounded-xs"></div>
                            <div className="w-4 h-1 bg-white/60 rounded-xs"></div>
                          </div>
                          {/* Body Preview with Tab Accent */}
                          <div className="flex-1 bg-white flex flex-col justify-between p-0.5">
                            <div
                              className="h-0.5 w-5"
                              style={{ backgroundColor: color.primary }}
                            ></div>
                            <div className="flex gap-0.5">
                              <div
                                className="w-2.5 h-1.5"
                                style={{ backgroundColor: color.lightBg }}
                              ></div>
                              <div className="w-3.5 h-1.5 bg-[#F3F2F1]"></div>
                            </div>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <strong className="block text-xs truncate text-[#201F1E] dark:text-white">
                              {language === 'ar' ? color.nameAr : color.nameEn}
                            </strong>
                            {isSelected && (
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
                                style={{ backgroundColor: color.primary }}
                              >
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-[#605E5C] font-mono block mt-0.5">
                            {color.primary}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Language & Direction */}
          {activeTab === 'language' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div
                className="p-3 border flex items-start gap-2.5"
                style={{
                  backgroundColor: isDark ? '#292827' : '#EFF6FC',
                  borderColor: isDark ? '#3B3A39' : '#C7E0F4',
                  color: isDark ? '#E1DFDD' : '#004578',
                }}
              >
                <Globe className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentConfig.primary }} />
                <div className="leading-relaxed">
                  <strong className="block font-semibold mb-0.5">
                    {language === 'ar' ? 'اللغة واتجاه الشاشة التلقائي:' : 'Language & Automatic Layout Direction:'}
                  </strong>
                  <span>
                    {language === 'ar'
                      ? 'عند اختيار اللغة العربية يتم تطبيق الاتجاه (RTL) تلقائياً، وعند اختيار الإنجليزية يتم تطبيق (LTR) فوراً مع ضبط كامل الحقول والمحاذاة.'
                      : 'Selecting Arabic automatically applies RTL direction; selecting English immediately applies LTR direction with aligned UI elements.'}
                  </span>
                </div>
              </div>

              {/* Language Radio Cards */}
              <div
                className="p-4 border shadow-2xs space-y-3"
                style={{
                  backgroundColor: isDark ? '#292827' : '#FFFFFF',
                  borderColor: isDark ? '#3B3A39' : '#EDEBE9',
                }}
              >
                {/* Arabic RTL Option */}
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`w-full p-3.5 border-2 flex items-center justify-between transition-all cursor-pointer text-right`}
                  style={{
                    borderColor: language === 'ar' ? accentConfig.primary : (isDark ? '#3B3A39' : '#EDEBE9'),
                    backgroundColor: language === 'ar'
                      ? (isDark ? '#333230' : accentConfig.lightBg)
                      : (isDark ? '#242322' : '#FFFFFF'),
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: accentConfig.primary }}
                    >
                      ع
                    </div>
                    <div>
                      <strong className="block text-xs">اللغة العربية (Arabic)</strong>
                      <span className="text-[11px] text-[#605E5C] block mt-0.5">
                        اتجاه الواجهة من اليمين إلى اليسار (RTL - Right to Left)
                      </span>
                    </div>
                  </div>
                  {language === 'ar' && (
                    <div
                      className="w-5 h-5 flex items-center justify-center text-white"
                      style={{ backgroundColor: accentConfig.primary }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>

                {/* English LTR Option */}
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`w-full p-3.5 border-2 flex items-center justify-between transition-all cursor-pointer text-left`}
                  style={{
                    borderColor: language === 'en' ? accentConfig.primary : (isDark ? '#3B3A39' : '#EDEBE9'),
                    backgroundColor: language === 'en'
                      ? (isDark ? '#333230' : accentConfig.lightBg)
                      : (isDark ? '#242322' : '#FFFFFF'),
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: accentConfig.primary }}
                    >
                      EN
                    </div>
                    <div>
                      <strong className="block text-xs">English (الإنجليزية)</strong>
                      <span className="text-[11px] text-[#605E5C] block mt-0.5">
                        Interface orientation Left-to-Right (LTR)
                      </span>
                    </div>
                  </div>
                  {language === 'en' && (
                    <div
                      className="w-5 h-5 flex items-center justify-center text-white"
                      style={{ backgroundColor: accentConfig.primary }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Customize Visible Labels */}
          {activeTab === 'labels' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div
                className="p-3 border flex items-start gap-2.5"
                style={{
                  backgroundColor: isDark ? '#292827' : '#EFF6FC',
                  borderColor: isDark ? '#3B3A39' : '#C7E0F4',
                  color: isDark ? '#E1DFDD' : '#004578',
                }}
              >
                <Tag className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentConfig.primary }} />
                <div className="leading-relaxed">
                  <strong className="block font-semibold mb-0.5">
                    {language === 'ar'
                      ? 'ميزة تخصيص التسميات المرئية (Customize Visible Labels):'
                      : 'Customize Visible Field Labels:'}
                  </strong>
                  <span>
                    {language === 'ar'
                      ? 'وفقاً لمعايير Dynamics 365 F&O، تتيح هذه اللوحة تعديل التسميات المعروضة أمامك على الشاشة (مثل تغيير "المستوى الوظيفي" إلى "الدرجة المالية") دون أي مساس بأسماء الحقول البرمجية أو قواعد البيانات.'
                      : 'In accordance with Dynamics 365 F&O personalization, you can modify any visible screen label without altering backend data fields, APIs, or integration mappings.'}
                  </span>
                </div>
              </div>

              {/* Search & Filter Header */}
              <div
                className="p-3 border shadow-2xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between"
                style={{
                  backgroundColor: isDark ? '#292827' : '#FFFFFF',
                  borderColor: isDark ? '#3B3A39' : '#EDEBE9',
                }}
              >
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#8A8886] absolute top-2.5 right-2.5" />
                  <input
                    type="text"
                    value={labelSearch}
                    onChange={(e) => setLabelSearch(e.target.value)}
                    placeholder={
                      language === 'ar' ? 'بحث عن حقل لتخصيص تسميته...' : 'Search field to customize label...'
                    }
                    className="w-full h-8 pr-8 pl-3 bg-transparent border border-[#8A8886] focus:border-[#0078D4] text-xs outline-none"
                    style={{
                      borderColor: isDark ? '#4A4846' : '#8A8886',
                      color: isDark ? '#FFFFFF' : '#323130',
                    }}
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                    { id: 'nav', labelAr: 'التبويبات', labelEn: 'Nav Tabs' },
                    { id: 'kpi', labelAr: 'المؤشرات', labelEn: 'KPIs' },
                    { id: 'profile', labelAr: 'الملف', labelEn: 'Profile' },
                    { id: 'action', labelAr: 'الإجراءات', labelEn: 'Actions' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer border ${
                        selectedCategory === cat.id
                          ? 'text-white'
                          : 'bg-transparent text-[#605E5C] border-[#EDEBE9] hover:bg-[#F3F2F1]'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === cat.id ? accentConfig.primary : undefined,
                        borderColor: selectedCategory === cat.id ? accentConfig.primary : (isDark ? '#3B3A39' : '#EDEBE9'),
                        color: selectedCategory === cat.id ? '#FFFFFF' : undefined,
                      }}
                    >
                      {language === 'ar' ? cat.labelAr : cat.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Labels List */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredLabels.map((item) => {
                  const defaultText = language === 'en' ? item.defaultEn : item.defaultAr;
                  const currentCustom = settings.customLabels[item.key] || '';
                  const isModified = currentCustom.trim() !== '';

                  return (
                    <div
                      key={item.key}
                      className="p-3 border shadow-2xs transition-colors"
                      style={{
                        backgroundColor: isDark ? '#292827' : '#FFFFFF',
                        borderColor: isModified ? accentConfig.primary : (isDark ? '#3B3A39' : '#EDEBE9'),
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 bg-[#FAF9F8] border border-[#EDEBE9] text-[#605E5C]"
                            style={{
                              backgroundColor: isDark ? '#1F1E1D' : '#FAF9F8',
                              borderColor: isDark ? '#3B3A39' : '#EDEBE9',
                              color: isDark ? '#A19F9D' : '#605E5C',
                            }}
                          >
                            {item.key}
                          </span>
                          <span className="text-[11px] font-semibold text-[#8A8886]">
                            {language === 'ar' ? item.categoryTitleAr : item.categoryTitleEn}
                          </span>
                        </div>

                        {isModified && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 text-white"
                            style={{ backgroundColor: accentConfig.primary }}
                          >
                            {language === 'ar' ? 'مخصصة' : 'Customized'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                        {/* Original default indicator */}
                        <div
                          className="px-2.5 py-1 text-xs border bg-[#F8F9FA] min-w-[140px] truncate"
                          style={{
                            backgroundColor: isDark ? '#1F1E1D' : '#F8F9FA',
                            borderColor: isDark ? '#3B3A39' : '#EDEBE9',
                            color: isDark ? '#A19F9D' : '#605E5C',
                          }}
                          title={`الاسم الافتراضي: ${defaultText}`}
                        >
                          <span className="text-[10px] block opacity-70">
                            {language === 'ar' ? 'التسمية الافتراضية:' : 'Default Label:'}
                          </span>
                          <span className="font-semibold text-xs block truncate">{defaultText}</span>
                        </div>

                        {/* Input for custom text */}
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={currentCustom}
                            onChange={(e) => setCustomLabel(item.key, e.target.value)}
                            placeholder={defaultText}
                            className="w-full h-8 px-2.5 text-xs border outline-none font-medium"
                            style={{
                              borderColor: isModified ? accentConfig.primary : (isDark ? '#4A4846' : '#8A8886'),
                              backgroundColor: isDark ? '#242322' : '#FFFFFF',
                              color: isDark ? '#FFFFFF' : '#323130',
                            }}
                          />
                        </div>

                        {/* Reset individual button */}
                        {isModified && (
                          <button
                            type="button"
                            onClick={() => {
                              resetCustomLabel(item.key);
                              showNotification(
                                language === 'ar'
                                  ? `تمت إعادة التسمية الافتراضية للحقل (${defaultText}).`
                                  : `Label reset to default (${defaultText}).`
                              );
                            }}
                            className="px-2.5 py-1 text-xs text-[#A80000] hover:bg-[#FDF3F2] border border-[#F19999] transition-colors cursor-pointer shrink-0"
                            title={language === 'ar' ? 'إعادة للاسم الافتراضي' : 'Reset to default'}
                          >
                            <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                            <span>{language === 'ar' ? 'إعادة' : 'Reset'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer Actions */}
        <div
          className="p-4 sm:px-6 border-t flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shrink-0"
          style={{
            backgroundColor: isDark ? '#141414' : '#F3F2F1',
            borderColor: isDark ? '#2D2C2C' : '#D2D0CE',
          }}
        >
          {/* Restore Defaults Button */}
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="w-full sm:w-auto px-4 py-2 min-h-[36px] bg-white hover:bg-[#EDEBE9] text-[#A80000] border border-[#A80000] hover:bg-[#A80000] hover:text-white text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer rounded-xs"
            title={
              language === 'ar'
                ? 'استعادة كافة الإعدادات والسمات والتسميات الافتراضية'
                : 'Restore all default settings, theme, and labels'
            }
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'استعادة الإعدادات الافتراضية' : 'Restore Defaults'}</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                showNotification(
                  language === 'ar'
                    ? 'تم حفظ تفضيلات التخصيص للمستخدم بنجاح.'
                    : 'Personalization preferences saved successfully.'
                );
                setTimeout(onClose, 600);
              }}
              className="flex-1 sm:flex-initial px-6 py-2 min-h-[36px] text-white text-xs font-bold transition-all duration-150 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer rounded-xs"
              style={{
                backgroundColor: accentConfig.primary,
              }}
            >
              <Check className="w-4 h-4" />
              <span>{language === 'ar' ? 'حفظ وتطبيق التفضيلات' : 'Save & Apply'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2 min-h-[36px] bg-white hover:bg-[#EDEBE9] border border-[#8A8886] hover:border-[#323130] text-xs font-semibold text-[#201F1E] transition-all duration-150 flex items-center justify-center shadow-2xs hover:shadow-xs cursor-pointer rounded-xs"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
