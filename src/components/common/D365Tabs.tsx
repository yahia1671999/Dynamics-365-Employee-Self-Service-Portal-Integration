import React from 'react';
import { usePersonalization } from '../../context/PersonalizationContext';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface D365TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const D365Tabs: React.FC<D365TabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
}) => {
  const { accentConfig } = usePersonalization();

  return (
    <div
      role="tablist"
      aria-label="أقسام النظام الرئيسية"
      className={`bg-[#F8F9FA] px-3 sm:px-6 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onTabChange(tab.id)}
            style={
              isActive
                ? {
                    color: accentConfig.primary,
                    borderColor: accentConfig.lightBorder,
                    backgroundColor: '#FFFFFF',
                  }
                : undefined
            }
            className={`group relative flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs rounded-[4px] whitespace-nowrap shrink-0 transition-all duration-150 outline-none cursor-pointer border select-none ${
              isActive
                ? 'font-bold shadow-[0_2px_4px_rgba(0,120,212,0.08),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[#0078D4]/15'
                : 'border-transparent text-[#605E5C] hover:text-[#201F1E] hover:bg-[#EDEBE9]/70 hover:border-[#D2D0CE]/60'
            }`}
          >
            {/* Active bottom accent bar */}
            {isActive && (
              <span
                style={{ backgroundColor: accentConfig.primary }}
                className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] rounded-t-sm"
                aria-hidden="true"
              />
            )}

            {tab.icon && (
              <span
                aria-hidden="true"
                className="shrink-0 transition-colors flex items-center justify-center"
                style={{ color: isActive ? accentConfig.primary : undefined }}
              >
                {tab.icon}
              </span>
            )}
            <span className="truncate tracking-tight font-medium group-[aria-selected=true]:font-bold">
              {tab.label}
            </span>
            {tab.count !== undefined && (
              <span
                style={
                  isActive
                    ? {
                        backgroundColor: accentConfig.primary,
                        color: '#FFFFFF',
                      }
                    : undefined
                }
                className={`text-[10px] px-1.5 py-0.5 rounded-[3px] font-bold font-mono shrink-0 transition-colors tabular-nums ${
                  isActive ? '' : 'bg-[#EDEBE9] text-[#605E5C] group-hover:bg-[#E1DFDD]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
