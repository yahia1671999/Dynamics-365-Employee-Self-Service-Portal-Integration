import React from 'react';
import { LucideIcon, ArrowUpLeft } from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';

interface D365TileProps {
  title: string;
  count: number | string;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'primary' | 'warning' | 'success' | 'neutral' | 'info' | 'purple' | 'teal';
  onClick?: () => void;
  badge?: string;
}

export const D365Tile: React.FC<D365TileProps> = ({
  title,
  count,
  unit,
  subtitle,
  icon: Icon,
  variant = 'primary',
  onClick,
  badge,
}) => {
  const { accentConfig } = usePersonalization();

  const isThemeVariant = variant === 'primary' || variant === 'info';

  const getAccentColor = () => {
    switch (variant) {
      case 'warning':
        return '#D83B01';
      case 'success':
        return '#107C41';
      case 'purple':
        return '#5C2D91';
      case 'teal':
        return '#008272';
      case 'neutral':
        return '#8A8886';
      default:
        return accentConfig.primary;
    }
  };

  const getIconContainerStyle = () => {
    switch (variant) {
      case 'warning':
        return {
          backgroundColor: '#FDF3F2',
          borderColor: '#F8D2CC',
          color: '#D83B01',
        };
      case 'success':
        return {
          backgroundColor: '#F1F9F1',
          borderColor: '#C2E5C5',
          color: '#107C41',
        };
      case 'purple':
        return {
          backgroundColor: '#F3EFF8',
          borderColor: '#D3C7E8',
          color: '#5C2D91',
        };
      case 'teal':
        return {
          backgroundColor: '#E6F4F2',
          borderColor: '#B3DFD8',
          color: '#008272',
        };
      case 'neutral':
        return {
          backgroundColor: '#F3F2F1',
          borderColor: '#D2D0CE',
          color: '#605E5C',
        };
      default:
        return {
          backgroundColor: accentConfig.lightBg,
          borderColor: accentConfig.lightBorder,
          color: accentConfig.primary,
        };
    }
  };

  const accentColor = getAccentColor();

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${title}: ${count} ${unit || ''}` : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`bg-white border border-[#EDEBE9] rounded-[6px] p-4.5 sm:p-5 transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] relative flex flex-col justify-between min-h-[180px] overflow-hidden ${
        onClick
          ? 'cursor-pointer hover:bg-white hover:border-[#D2D0CE] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] hover:-translate-y-1 active:translate-y-0 group focus-visible:ring-2 focus-visible:outline-none select-none'
          : ''
      }`}
    >
      {/* Bottom accent colored line */}
      <div
        style={{ backgroundColor: accentColor }}
        className="absolute bottom-0 left-0 right-0 h-[4px]"
        aria-hidden="true"
      />

      {/* Top Header Row (RTL: square icon on right, arrow on top-left) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div
              style={getIconContainerStyle()}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-[6px] border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs"
              aria-hidden="true"
            >
              <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>
          )}
          <div className="min-w-0">
            <span className="font-bold text-xs sm:text-[13px] text-[#201F1E] group-hover:text-[#0078D4] transition-colors block truncate leading-tight">
              {title}
            </span>
            {badge && (
              <span
                style={{ color: accentColor }}
                className="text-[10px] font-bold px-1.5 py-0.2 bg-[#FAF9F8] border border-[#EDEBE9] rounded-[3px] inline-block mt-0.5"
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        {onClick && (
          <div
            style={{ color: accentColor }}
            className="w-8 h-8 rounded-full border border-[#EDEBE9] bg-[#FAF9F8] group-hover:bg-white flex items-center justify-center shrink-0 transition-all duration-150 shadow-2xs group-hover:border-[#C7E0F4]"
            aria-hidden="true"
          >
            <ArrowUpLeft className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
          </div>
        )}
      </div>

      {/* Prominent Centered Large KPI Number */}
      <div className="my-2.5 text-center">
        <div
          style={{ color: accentColor }}
          className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums leading-none"
        >
          {count}
          {unit && <span className="text-xs sm:text-sm font-bold text-[#605E5C] mr-1.5">{unit}</span>}
        </div>
        {subtitle && (
          <div className="text-xs text-[#605E5C] font-medium mt-2 truncate">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
