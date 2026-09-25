import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';

interface D365FastTabProps {
  title: string;
  summary?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export const D365FastTab: React.FC<D365FastTabProps> = ({
  title,
  summary,
  defaultExpanded = true,
  children,
  headerActions,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { accentConfig } = usePersonalization();

  return (
    <div className={`bg-white border border-[#D2D0CE] mb-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] ${className}`}>
      {/* FastTab Header Bar */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${title}، ${isExpanded ? 'موسع' : 'مطوي'}`}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="px-4 py-2.5 bg-white hover:bg-[#FAF9F8] cursor-pointer flex items-center justify-between transition-colors border-b border-transparent data-[expanded=true]:border-[#D2D0CE] focus-visible:ring-2 focus-visible:outline-none"
        data-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-5 h-5 flex items-center justify-center text-[#605E5C] transition-colors"
            aria-hidden="true"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" style={{ color: accentConfig.primary }} />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#605E5C]" />
            )}
          </span>
          <span className="font-bold text-xs text-[#201F1E] tracking-tight">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          {summary && !isExpanded && (
            <span className="text-[11px] font-semibold text-[#605E5C] bg-[#FAF9F8] px-2.5 py-0.5 border border-[#D2D0CE] truncate max-w-xs shadow-2xs">
              {summary}
            </span>
          )}
          {headerActions && (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {headerActions}
            </div>
          )}
        </div>
      </div>

      {/* FastTab Body */}
      {isExpanded && <div className="p-4 bg-white border-t border-[#EDEBE9] text-xs">{children}</div>}
    </div>
  );
};
