import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations } from '../../i18n/popupTranslations';

interface D365DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionDisabled?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  tertiaryActionLabel?: string;
  onTertiaryAction?: () => void;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const D365Dialog: React.FC<D365DialogProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  primaryActionLabel,
  onPrimaryAction,
  primaryActionDisabled = false,
  secondaryActionLabel,
  onSecondaryAction,
  tertiaryActionLabel,
  onTertiaryAction,
  maxWidth = '2xl',
}) => {
  const { language, direction, accentConfig } = usePersonalization();
  const pt = getPopupTranslations(language);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolvedSecondaryActionLabel =
    secondaryActionLabel !== undefined
      ? secondaryActionLabel
      : pt.common.cancel;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      dir={direction}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/65 backdrop-blur-[3px] animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[calc(100vw-1.25rem)] sm:w-[92vw] md:w-[88vw] lg:w-[86vw] xl:w-[85vw] max-w-[1480px] bg-white border border-[#8A8886] border-t-4 shadow-[0_32px_72px_-12px_rgba(0,0,0,0.48),0_16px_32px_-6px_rgba(0,0,0,0.28),0_4px_12px_rgba(0,0,0,0.16),0_0_0_1px_rgba(255,255,255,0.3)_inset] flex flex-col max-h-[92vh] sm:max-h-[90vh] text-start rounded-sm my-auto transition-all duration-200"
        style={{ borderTopColor: accentConfig.primary }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* D365 Dialog Header - Premium Dynamics 365 Styling */}
        <div
          className="text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b-2 gap-3 shrink-0 shadow-xs transition-colors"
          style={{
            backgroundColor: accentConfig.headerBg,
            borderBottomColor: accentConfig.headerBorder,
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-3 h-3 shrink-0 ring-1 ring-white/35 shadow-xs bg-white"
              aria-hidden="true"
            ></div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold tracking-tight truncate text-white">{title}</h2>
              {subtitle && <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 truncate font-normal tracking-wide">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/15 text-white/85 hover:text-white rounded-xs transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none cursor-pointer"
            title={pt.common.closeEsc}
            aria-label={pt.common.closeDialogAria}
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
          </button>
        </div>

        {/* Dialog Body (Scrollable) */}
        <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto flex-1 text-xs text-[#201F1E] bg-[#FAF9F8]">
          {children}
        </div>

        {/* D365 Dialog Footer */}
        <div className="bg-[#F3F2F1] border-t border-[#D2D0CE] px-4 sm:px-6 py-3 sm:py-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shrink-0 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]">
          <div className="w-full sm:w-auto">
            {tertiaryActionLabel && onTertiaryAction && (
              <button
                type="button"
                onClick={onTertiaryAction}
                className="w-full sm:w-auto px-4 py-2 min-h-[36px] bg-white hover:bg-[#EDEBE9] border border-[#8A8886] hover:border-[#323130] text-xs font-semibold text-[#201F1E] transition-all duration-150 flex items-center justify-center focus-visible:ring-2 focus-visible:outline-none shadow-2xs hover:shadow-xs cursor-pointer rounded-xs"
              >
                {tertiaryActionLabel}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {primaryActionLabel && onPrimaryAction && (
              <button
                type="button"
                onClick={onPrimaryAction}
                disabled={primaryActionDisabled}
                style={{ backgroundColor: primaryActionDisabled ? undefined : accentConfig.primary }}
                onMouseEnter={(e) => {
                  if (!primaryActionDisabled) e.currentTarget.style.backgroundColor = accentConfig.hover;
                }}
                onMouseLeave={(e) => {
                  if (!primaryActionDisabled) e.currentTarget.style.backgroundColor = accentConfig.primary;
                }}
                className="flex-1 sm:flex-initial px-5 py-2 min-h-[36px] text-white disabled:bg-[#C8C6C4] disabled:text-[#605E5C] text-xs font-bold transition-all duration-150 shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center focus-visible:ring-2 focus-visible:outline-none cursor-pointer rounded-xs"
              >
                {primaryActionLabel}
              </button>
            )}

            <button
              type="button"
              onClick={onSecondaryAction || onClose}
              className="flex-1 sm:flex-initial px-5 py-2 min-h-[36px] bg-white hover:bg-[#EDEBE9] border border-[#8A8886] hover:border-[#323130] text-xs font-semibold text-[#201F1E] transition-all duration-150 flex items-center justify-center focus-visible:ring-2 focus-visible:outline-none shadow-2xs hover:shadow-xs cursor-pointer rounded-xs"
            >
              {resolvedSecondaryActionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
