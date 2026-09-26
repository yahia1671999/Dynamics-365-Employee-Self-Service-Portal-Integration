import React from 'react';

interface D365StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export const D365StatusBadge: React.FC<D365StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
}) => {
  const normalized = (status || '').toLowerCase().trim();

  const getBadgeConfig = () => {
    switch (normalized) {
      case 'approved':
      case 'معتمد':
      case 'completed':
      case 'مكتمل':
      case 'attended':
      case 'تم الحضور':
      case 'نجاح':
        return {
          style: 'bg-[#DFF6DD] text-[#107C41] border-[#107C41]/35',
          dot: 'bg-[#107C41]',
        };

      case 'inreview':
      case 'submitted':
      case 'قيد الاعتماد':
      case 'قيد المراجعة':
      case 'قيد الدراسة':
      case 'قيد التظلم والمراجعة':
      case 'قيد المعالجة':
        return {
          style: 'bg-[#EFF6FC] text-[#0078D4] border-[#0078D4]/35',
          dot: 'bg-[#0078D4] animate-pulse',
        };

      case 'draft':
      case 'مسودة':
      case 'pending':
      case 'معلق':
      case 'pendingevaluation':
        return {
          style: 'bg-[#FFF4CE] text-[#797673] border-[#FDE300]/60',
          dot: 'bg-[#B48200]',
        };

      case 'rejected':
      case 'مرفوض':
      case 'canceled':
      case 'ملغى':
      case 'error':
        return {
          style: 'bg-[#FDF3F2] text-[#A80000] border-[#A80000]/35',
          dot: 'bg-[#A80000]',
        };

      case 'active':
      case 'نافذ':
      case 'على رأس العمل - نشط':
        return {
          style: 'bg-[#EFF6FC] text-[#005A9E] border-[#0078D4]/35 font-semibold',
          dot: 'bg-[#005A9E]',
        };

      default:
        return {
          style: 'bg-[#F3F2F1] text-[#605E5C] border-[#D1D1D1]',
          dot: 'bg-[#8A8886]',
        };
    }
  };

  const { style, dot } = getBadgeConfig();
  const displayLabel = label || status;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11.5px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold border shadow-2xs whitespace-nowrap ${sizeClasses} ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};
