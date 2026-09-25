import React, { useState } from 'react';
import {
  Grid,
  Search,
  Bell,
  Settings,
  HelpCircle,
  Building2,
  ChevronDown,
  Check,
  LogOut
} from 'lucide-react';
import { Employee, D365Notification } from '../../types/d365.types';
import { usePersonalization } from '../../context/PersonalizationContext';

interface D365HeaderProps {
  employee: Employee;
  notifications: D365Notification[];
  onOpenODataInspector: () => void;
  onSearchChange?: (query: string) => void;
  activeModuleTitle: string;
  onLogout?: () => void;
  onOpenPersonalization?: () => void;
}

export const D365Header: React.FC<D365HeaderProps> = ({
  employee,
  notifications,
  onOpenODataInspector,
  onSearchChange,
  activeModuleTitle,
  onLogout,
  onOpenPersonalization,
}) => {
  const { accentConfig, language, isDark, direction } = usePersonalization();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState('USMF');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const legalEntities = [
    {
      code: 'USMF',
      name: language === 'en' ? 'Contoso Entertainment System USA' : 'الشركة العامة للحلول التقنية والخدمات الرقمية',
      country: language === 'en' ? 'Saudi Arabia / Global' : 'المملكة العربية السعودية',
    },
    {
      code: 'PROD',
      name: language === 'en' ? 'Unified Enterprise Production Environment' : 'بيئة الإنتاج الموحدة للخدمات المؤسسية',
      country: language === 'en' ? 'Headquarters' : 'المركز الرئيسي',
    },
  ];

  return (
    <header
      className="sticky top-0 z-40 text-white shadow-xs transition-colors duration-200 select-none"
      style={{
        backgroundColor: accentConfig.headerBg,
        borderBottom: `1px solid ${accentConfig.headerBorder}`,
      }}
    >
      <div className="flex items-center justify-between px-2 sm:px-3 h-12">
        {/* Right Section in RTL / Left in LTR: Waffle + App Name + Legal Entity */}
        <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse min-w-0">
          {/* App Launcher / Waffle */}
          <button
            type="button"
            title={language === 'en' ? 'App Launcher' : 'مشغل التطبيقات'}
            aria-label={language === 'en' ? 'App Launcher' : 'مشغل التطبيقات'}
            className="w-8 h-8 sm:w-9 sm:h-9 transition-colors rounded-none flex items-center justify-center text-white shrink-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentConfig.headerHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Grid className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* D365 Brand Title */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 rtl:pr-1 ltr:pl-1 rtl:border-r ltr:border-l truncate"
            style={{ borderColor: accentConfig.headerBorder }}
          >
            <span className="font-semibold text-xs sm:text-sm tracking-wide text-white whitespace-nowrap">Dynamics 365</span>
            <span className="text-xs text-white/75 hidden sm:inline">|</span>
            <span className="text-xs font-normal text-white/90 hidden lg:inline truncate">
              {language === 'en'
                ? 'Finance & Operations - Human Resources & ESS'
                : 'Finance & Operations - الموارد البشرية والخدمة الذاتية'}
            </span>
          </div>

          {/* Legal Entity Switcher (DataAreaId in D365) */}
          <div className="relative hidden md:block shrink-0">
            <button
              type="button"
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              className="flex items-center gap-2 px-2.5 py-1 text-xs text-white border transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
              style={{
                backgroundColor: accentConfig.headerSurface,
                borderColor: accentConfig.headerBorder,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentConfig.headerHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = accentConfig.headerSurface)}
              title={language === 'en' ? 'Change Legal Entity (DataAreaId)' : 'تغيير الكيان القانوني (DataAreaId)'}
              aria-label={language === 'en' ? 'Change Legal Entity' : 'تغيير الكيان القانوني'}
              aria-expanded={showCompanyMenu}
              aria-haspopup="true"
            >
              <Building2 className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              <span className="font-mono font-bold text-white">{selectedEntity}</span>
              <span className="text-[11px] text-white/90 max-w-[170px] truncate">
                {legalEntities.find((e) => e.code === selectedEntity)?.name}
              </span>
              <ChevronDown className="w-3 h-3 text-white/80" aria-hidden="true" />
            </button>

            {showCompanyMenu && (
              <div className="absolute rtl:right-0 ltr:left-0 mt-1 w-72 max-w-[calc(100vw-2rem)] bg-white text-[#323130] border border-[#D1D1D1] shadow-lg py-1 z-50 text-start">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#605E5C] border-b border-[#EDEBE9] bg-[#F5F5F5]">
                  {language === 'en' ? 'Select Legal Entity (Company):' : 'اختر الكيان القانوني (Company / Legal Entity):'}
                </div>
                {legalEntities.map((entity) => (
                  <button
                    type="button"
                    key={entity.code}
                    onClick={() => {
                      setSelectedEntity(entity.code);
                      setShowCompanyMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F3F2F1] transition-colors text-start cursor-pointer ${
                      selectedEntity === entity.code ? 'bg-[#EDEBE9] font-semibold' : ''
                    }`}
                    style={{
                      color: selectedEntity === entity.code ? accentConfig.primary : undefined,
                    }}
                  >
                    <div>
                      <div className="font-mono text-xs font-bold" style={{ color: accentConfig.primary }}>{entity.code}</div>
                      <div className="text-[11px] text-[#323130]">{entity.name}</div>
                      <div className="text-[10px] text-[#605E5C]">{entity.country}</div>
                    </div>
                    {selectedEntity === entity.code && <Check className="w-4 h-4" style={{ color: accentConfig.primary }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center spacer */}
        <div className="flex-1 max-w-md mx-2 hidden xl:block"></div>

        {/* Left Section in RTL / Right in LTR: Quick Utilities & Employee Avatar */}
        <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse shrink-0">
          {/* Notifications Flyout Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 sm:w-9 sm:h-9 text-white relative transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentConfig.headerHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              title={language === 'en' ? 'Notifications Center' : 'مركز الإشعارات والتنبيهات'}
              aria-label={`${language === 'en' ? 'Notifications' : 'مركز الإشعارات والتنبيهات'}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-1 rtl:right-1 ltr:left-1 w-3.5 h-3.5 bg-[#D13438] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute rtl:left-0 ltr:right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white text-[#323130] border border-[#D1D1D1] shadow-xl z-50 text-start">
                <div className="px-3 py-2 bg-[#F3F2F1] border-b border-[#D1D1D1] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#323130]">
                    {language === 'en' ? 'Workflow Notifications' : 'إشعارات سير العمل (Workflow)'}
                  </span>
                  <span className="text-[10px] bg-[#EDEBE9] px-1.5 py-0.5 font-medium" style={{ color: accentConfig.primary }}>
                    {unreadCount} {language === 'en' ? 'unread' : 'غير مقروء'}
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#EDEBE9]">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2.5 text-xs hover:bg-[#F3F2F1] transition-colors cursor-pointer ${
                        !notif.isRead ? 'bg-[#EFF6FC]' : ''
                      }`}
                    >
                      <div className="font-semibold mb-0.5" style={{ color: accentConfig.primary }}>{notif.title}</div>
                      <div className="text-[#605E5C] text-[11px] leading-relaxed mb-1">{notif.message}</div>
                      <div className="text-[10px] text-[#605E5C]">{notif.timestamp}</div>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-[#F5F5F5] border-t border-[#D1D1D1] text-center">
                  <span className="text-[11px] hover:underline cursor-pointer" style={{ color: accentConfig.primary }}>
                    {language === 'en' ? 'View all workflow items in Action Center' : 'عرض جميع مهام سير العمل في مركز الإجراءات'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Help & Settings / Personalization */}
          <button
            type="button"
            onClick={onOpenPersonalization}
            className="w-8 h-8 sm:w-9 sm:h-9 text-white transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentConfig.headerHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title={language === 'en' ? 'Personalization & System Preferences' : 'إضفاء طابع شخصي وإعدادات النظام (Personalization)'}
            aria-label={language === 'en' ? 'Personalization' : 'إضفاء طابع شخصي'}
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onOpenODataInspector}
            className="w-8 h-8 sm:w-9 sm:h-9 text-white transition-colors hidden sm:flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentConfig.headerHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title={language === 'en' ? 'Dynamics 365 Architecture & OData Inspector' : 'فحص معمارية الربط و OData v4'}
            aria-label={language === 'en' ? 'Architecture Inspector' : 'فحص المعمارية'}
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Employee Profile Chip */}
          <div
            className="relative rtl:pr-1 ltr:pl-1 rtl:border-r ltr:border-l"
            style={{ borderColor: accentConfig.headerBorder }}
          >
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 transition-colors text-start focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentConfig.headerHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              title={language === 'en' ? 'Employee Profile' : 'الملف الشخصي للموظف'}
              aria-label={language === 'en' ? 'Employee Profile' : 'الملف الشخصي للموظف'}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <div
                className="w-7 h-7 rounded-none border flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-2xs"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  backgroundColor: accentConfig.headerSurface,
                }}
              >
                {employee.name.slice(0, 1)}
              </div>
              <div className="hidden md:block text-start">
                <div className="text-xs font-medium text-white truncate max-w-[130px]">{employee.name}</div>
                <div className="text-[10px] text-[#C8C6C4]">{employee.id}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#C8C6C4]" aria-hidden="true" />
            </button>

            {showUserMenu && (
              <div className="absolute rtl:left-0 ltr:right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white text-[#323130] border border-[#D1D1D1] shadow-xl p-3 z-50 text-start">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#EDEBE9]">
                  <div
                    className="w-10 h-10 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: accentConfig.primary }}
                  >
                    {employee.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-[#323130] truncate">{employee.name}</div>
                    <div className="text-[11px] text-[#605E5C] truncate">{employee.jobTitle}</div>
                    <div className="text-[10px] font-mono" style={{ color: accentConfig.primary }}>{employee.id}</div>
                  </div>
                </div>
                <div className="py-2 text-[11px] space-y-1 text-[#605E5C]">
                  <div>
                    <strong className="text-[#323130]">{language === 'en' ? 'Civil ID:' : 'رقم البطاقة:'}</strong>{' '}
                    <span className="font-mono" style={{ color: accentConfig.primary }}>{employee.civilId || '—'}</span>
                  </div>
                  <div className="truncate"><strong className="text-[#323130]">{language === 'en' ? 'Department:' : 'الإدارة:'}</strong> {employee.department}</div>
                  <div className="truncate"><strong className="text-[#323130]">{language === 'en' ? 'Email:' : 'البريد:'}</strong> {employee.email}</div>
                  <div>
                    <strong className="text-[#323130]">{language === 'en' ? 'Status:' : 'الحالة:'}</strong>{' '}
                    <span className="font-semibold text-[#107C41]">{employee.employmentStatusAr}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#EDEBE9] flex items-center justify-between">
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="text-xs text-[#A80000] hover:text-[#D13438] hover:bg-[#FDE7E9] px-2 py-1 font-semibold flex items-center gap-1 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#A80000] focus-visible:outline-none"
                      title={language === 'en' ? 'Sign out' : 'تسجيل الخروج من البوابة'}
                      aria-label={language === 'en' ? 'Sign out' : 'تسجيل الخروج'}
                    >
                      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{language === 'en' ? 'Sign Out' : 'تسجيل الخروج'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(false)}
                    className="text-xs hover:underline p-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none"
                    style={{ color: accentConfig.primary }}
                  >
                    {language === 'en' ? 'Close' : 'إغلاق'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Header Logout Button */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title={language === 'en' ? 'Sign out of portal' : 'تسجيل الخروج من النظام'}
              aria-label={language === 'en' ? 'Sign out' : 'تسجيل الخروج'}
              className="p-1.5 sm:p-2 hover:bg-[#A80000]/70 text-[#FFA39E] hover:text-white transition-colors flex items-center gap-1 text-xs focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xl:inline text-[11px]">{language === 'en' ? 'Exit' : 'خروج'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar / Breadcrumb Bar with Dynamic Accent Line */}
      <div
        className="min-h-8 py-1 bg-[#F3F2F1] text-[#323130] px-3 sm:px-4 flex items-center justify-between gap-2 border-t border-[#D1D1D1] text-xs transition-colors"
        style={{
          borderTopColor: isDark ? '#3B3A39' : '#D1D1D1',
          borderBottom: `2.5px solid ${accentConfig.primary}`,
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 text-[#605E5C] text-[11px] sm:text-xs min-w-0 overflow-hidden truncate">
          <span className="hover:underline cursor-pointer shrink-0" style={{ color: accentConfig.primary }}>
            {language === 'en' ? 'Home' : 'الرئيسية'}
          </span>
          <span className="shrink-0">/</span>
          <span className="hover:underline cursor-pointer shrink-0 hidden sm:inline">
            {language === 'en' ? 'Human Resources' : 'الموارد البشرية'}
          </span>
          <span className="shrink-0 hidden sm:inline">/</span>
          <span className="font-semibold truncate" style={{ color: accentConfig.primary }}>
            {activeModuleTitle}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-[#605E5C] shrink-0 font-mono">
          <span className="hidden min-[400px]:inline">{language === 'en' ? 'System Date: ' : 'تاريخ النظام: '}</span>
          <strong className="text-[#323130]">2026-09-21</strong>
        </div>
      </div>
    </header>
  );
};
