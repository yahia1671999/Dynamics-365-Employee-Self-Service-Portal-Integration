import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  History,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  ArrowRightLeft,
  Info,
  AlertTriangle
} from 'lucide-react';
import { D365ActionBar } from '../common/D365ActionBar';
import { D365Tabs, TabItem } from '../common/D365Tabs';
import { D365FastTab } from '../common/D365FastTab';
import { D365DataGrid, Column } from '../common/D365DataGrid';
import { D365Tile } from '../common/D365Tile';
import { LeaveBalance, LeaveMovementTransaction, LeaveTypeCode, Employee } from '../../types/d365.types';
import { d365Service } from '../../services/d365Service';

interface LeaveBalanceViewProps {
  leaveBalances: LeaveBalance[];
  onOpenNewLeaveDialog: (type?: LeaveTypeCode) => void;
  onRefresh: () => void;
  onExportExcel: () => void;
  employee?: Employee;
}

export const LeaveBalanceView: React.FC<LeaveBalanceViewProps> = ({
  leaveBalances,
  onOpenNewLeaveDialog,
  onRefresh,
  onExportExcel,
  employee,
}) => {
  const [selectedLeaveTypeCode, setSelectedLeaveTypeCode] = useState<string>('ALL');
  const [asOfDate, setAsOfDate] = useState('2026-09-21');

  const emp = employee || d365Service.getEmployee();
  const isSeconded = emp.employmentStatus === 'Seconded' || (emp.employmentStatusAr && emp.employmentStatusAr.includes('منتدب'));
  const isLoaned = emp.employmentStatus === 'Loaned' || (emp.employmentStatusAr && emp.employmentStatusAr.includes('معار'));
  const isNormalActive = !isSeconded && !isLoaned;

  const selectedBalance =
    leaveBalances.find((b) => b.leaveTypeCode === selectedLeaveTypeCode) || leaveBalances[0];

  const transactions =
    selectedLeaveTypeCode !== 'ALL'
      ? d365Service.getLeaveTransactions(selectedLeaveTypeCode as LeaveTypeCode)
      : [];

  // Tabs: All Balances overview + each leave type
  const tabs: TabItem[] = [
    {
      id: 'ALL',
      label: 'جميع الأرصدة (All Balances)',
      count: leaveBalances.length,
    },
    ...leaveBalances.map((b) => ({
      id: b.leaveTypeCode,
      label: b.leaveTypeTitle,
      count: b.currentBalance,
    })),
  ];

  // Overview Table Columns (When "All" is active)
  const overviewColumns: Column<LeaveBalance>[] = [
    {
      key: 'leaveTypeTitle',
      header: 'نوع الإجازة (Leave Type)',
      width: '180px',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs text-[#323130] block">{row.leaveTypeTitle}</span>
          <span className="font-mono text-[10px] text-[#8A8886]">{row.accrualPlanId}</span>
        </div>
      ),
    },
    {
      key: 'unit',
      header: 'الوحدة',
      width: '70px',
      render: (row) => <span className="text-xs text-[#605E5C]">{row.unit}</span>,
    },
    {
      key: 'allocatedBalance',
      header: 'المخصص السنوي',
      width: '95px',
      render: (row) => (
        <span className="font-mono text-xs text-[#323130] font-semibold">{row.allocatedBalance}</span>
      ),
    },
    {
      key: 'consumedBalance',
      header: 'المستهلك',
      width: '85px',
      render: (row) => (
        <span className="font-mono text-xs text-[#605E5C]">{row.consumedBalance}</span>
      ),
    },
    {
      key: 'pendingBalance',
      header: 'قيد الاعتماد',
      width: '90px',
      render: (row) => (
        <span className="font-mono text-xs text-[#D83B01] font-semibold">
          {row.pendingBalance > 0 ? `${row.pendingBalance}` : '0'}
        </span>
      ),
    },
    {
      key: 'currentBalance',
      header: 'الرصيد المتاح (Current)',
      width: '130px',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-sm text-[#0078D4] tabular-nums">{row.currentBalance}</span>
          <span className="text-[11px] text-[#605E5C] font-medium">{row.unit}</span>
        </div>
      ),
    },
    {
      key: 'accrualRate',
      header: 'معدل الاستحقاق (Accrual Rate)',
      width: '160px',
      render: (row) => <span className="text-[11px] text-[#323130] font-medium">{row.accrualRate}</span>,
    },
    {
      key: 'asOfDate',
      header: 'حتى تاريخ',
      width: '100px',
      render: () => <span className="font-mono text-[11px] text-[#605E5C] tabular-nums">{asOfDate}</span>,
    },
    {
      key: 'id',
      header: 'إجراء',
      width: '130px',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedLeaveTypeCode(row.leaveTypeCode)}
            className="px-2.5 py-1 bg-white hover:bg-[#FAF9F8] text-[#0078D4] border border-[#0078D4] text-[11px] font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer focus-visible:outline-none"
          >
            التفاصيل
          </button>
          {isNormalActive && (
            <button
              onClick={() => onOpenNewLeaveDialog(row.leaveTypeCode)}
              className="px-2.5 py-1 bg-[#0078D4] hover:bg-[#106EBE] text-white text-[11px] font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer focus-visible:outline-none"
            >
              طلب
            </button>
          )}
        </div>
      ),
    },
  ];

  // Transaction columns
  const txnColumns: Column<LeaveMovementTransaction>[] = [
    {
      key: 'referenceNumber',
      header: 'رقم المرجع (Ref #)',
      width: '140px',
      render: (row) => (
        <span className="font-mono text-[11px] text-[#0078D4] font-bold">{row.referenceNumber}</span>
      ),
    },
    {
      key: 'transactionDate',
      header: 'تاريخ الحركة',
      width: '110px',
      render: (row) => <span className="font-mono text-[11px]">{row.transactionDate}</span>,
    },
    {
      key: 'transactionType',
      header: 'نوع الحركة',
      width: '130px',
      render: (row) => {
        const isAddition = row.amount > 0;
        return (
          <span
            className={`px-1.5 py-0.5 text-[11px] font-medium ${
              isAddition
                ? 'bg-[#DFF6DD] text-[#107C41] border border-[#107C41]/30'
                : 'bg-[#EFF6FC] text-[#0078D4] border border-[#0078D4]/30'
            }`}
          >
            {row.transactionType}
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'الكمية (أيام)',
      width: '90px',
      render: (row) => (
        <span
          className={`font-mono font-bold text-xs ${
            row.amount > 0 ? 'text-[#107C41]' : 'text-[#A80000]'
          }`}
        >
          {row.amount > 0 ? `+${row.amount}` : row.amount}
        </span>
      ),
    },
    {
      key: 'balanceAfter',
      header: 'الرصيد بعد الحركة',
      width: '120px',
      render: (row) => (
        <span className="font-mono font-semibold text-xs text-[#323130]">{row.balanceAfter} يوم</span>
      ),
    },
    {
      key: 'notes',
      header: 'ملاحظات وتفاصيل الاستحقاق',
      render: (row) => <span className="text-[#605E5C] text-xs">{row.notes}</span>,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Dynamics Action Bar */}
      <D365ActionBar
        onNew={
          isNormalActive
            ? () =>
                onOpenNewLeaveDialog(
                  selectedLeaveTypeCode !== 'ALL' ? (selectedLeaveTypeCode as LeaveTypeCode) : undefined
                )
            : undefined
        }
        newButtonLabel={isNormalActive ? "طلب إجازة جديد" : undefined}
        onRefresh={onRefresh}
        onExportExcel={onExportExcel}
      />

      {/* Notice Banner when Seconded or Loaned */}
      {!isNormalActive && (
        <div className="p-3 bg-[#FFF4CE] border border-[#FFB900] text-[#7A4B00] text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D83B01] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block font-semibold">قاعدة الأعمال بنظام Dynamics 365:</strong>
            <span>
              حالة الموظف الحالية: <strong>({emp.employmentStatusAr})</strong>.
              وفقاً لقواعد الأعمال، يتم حجب تقديم طلبات الإجازات العادية أثناء فترة {isSeconded ? 'الندب' : 'الإعارة'}. يمكن استعراض الأرصدة وسجل الحركات المحاسبية فقط.
            </span>
          </div>
        </div>
      )}

      {/* Page Title & As-of Date Filter Bar */}
      <div className="bg-white border border-[#D1D1D1] p-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-[#323130] flex items-center gap-2">
            <span className="w-2 h-4 bg-[#0078D4]"></span>
            <span>استعلام أرصدة الإجازات (Leave and Absence Balances)</span>
          </h1>
          <p className="text-[11px] text-[#605E5C] mt-0.5">
            عرض أرصدة الاستحقاق ومعدلات التراكم وسجل الحركات المحاسبية من محرك الموارد البشرية لمايكروسوفت ديناميكس
          </p>
        </div>

        {/* As-of Date Filter Field */}
        <div className="flex items-center gap-2 bg-[#FAF9F8] p-1.5 border border-[#D2D0CE] shadow-2xs">
          <label className="text-xs font-bold text-[#323130] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0078D4]" />
            <span>حتى تاريخ (As-of Date):</span>
          </label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="h-7.5 px-2 bg-white text-xs text-[#201F1E] border border-[#8A8886] hover:border-[#323130] focus:border-[#0078D4] outline-none font-mono font-semibold shadow-2xs"
          />
        </div>
      </div>

      {/* Balance Tabs (D365 Pivot Style) */}
      <div className="bg-white border border-[#D2D0CE] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
        <D365Tabs
          tabs={tabs}
          activeTabId={selectedLeaveTypeCode}
          onTabChange={(id) => setSelectedLeaveTypeCode(id)}
        />

        {/* Tab 1: Overview Table for all leave balances */}
        {selectedLeaveTypeCode === 'ALL' && (
          <div className="p-3.5">
            <div className="mb-2.5 flex items-center justify-between text-xs text-[#605E5C] flex-wrap gap-2">
              <span className="font-bold text-xs text-[#201F1E]">
                جدول كشف أرصدة الإجازات المعتمدة (Leave Balances Summary Grid):
              </span>
              <span className="text-[11px]">الأرصدة محسوبة بدقة حتى: <strong className="font-mono text-[#201F1E] font-bold tabular-nums">{asOfDate}</strong></span>
            </div>
            <D365DataGrid
              columns={overviewColumns}
              data={leaveBalances}
              keyExtractor={(b) => b.id}
              searchPlaceholder="بحث في نوع الإجازة أو رمز الخطة..."
            />
          </div>
        )}

        {/* Tab 2: Selected Leave Detail Header Card */}
        {selectedLeaveTypeCode !== 'ALL' && selectedBalance && (
          <div>
            <div className="p-3.5 sm:p-4 bg-[#FAF9F8] border-b border-[#EDEBE9]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Tile 1: Current Balance */}
                <div className="bg-white border border-[#D2D0CE] border-t-[4px] border-t-[#0078D4] p-4 sm:p-5 shadow-[0_2px_5px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_10px_25px_rgba(0,0,0,0.10),0_3px_8px_rgba(0,0,0,0.05)] hover:border-[#B3B0AD] hover:-translate-y-1">
                  <div className="text-xs sm:text-[13px] text-[#605E5C] font-bold">الرصيد الحالي المتاح</div>
                  <div className="text-4xl sm:text-[44px] font-black font-mono text-[#0078D4] mt-2 tabular-nums leading-none">
                    {selectedBalance.currentBalance}
                    <span className="text-xs sm:text-sm font-semibold text-[#605E5C] mr-2">{selectedBalance.unit}</span>
                  </div>
                  <div className="text-xs text-[#8A8886] font-mono mt-3.5 pt-2.5 border-t border-[#EDEBE9]">
                    حتى تاريخ {asOfDate}
                  </div>
                </div>

                {/* Tile 2: Accrual Rate */}
                <div className="bg-white border border-[#D2D0CE] border-t-[4px] border-t-[#107C41] p-4 sm:p-5 shadow-[0_2px_5px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_10px_25px_rgba(0,0,0,0.10),0_3px_8px_rgba(0,0,0,0.05)] hover:border-[#B3B0AD] hover:-translate-y-1">
                  <div className="text-xs sm:text-[13px] text-[#605E5C] font-bold">معدل الاستحقاق السنوي</div>
                  <div className="text-base sm:text-lg font-bold text-[#107C41] mt-2 truncate" title={selectedBalance.accrualRate}>
                    {selectedBalance.accrualRate}
                  </div>
                  <div className="text-xs text-[#8A8886] mt-3.5 pt-2.5 border-t border-[#EDEBE9] truncate">
                    خطة الاستحقاق: <strong className="font-mono text-[#201F1E] font-bold">{selectedBalance.accrualPlanId}</strong>
                  </div>
                </div>

                {/* Tile 3: Consumed & Pending */}
                <div className="bg-white border border-[#D2D0CE] border-t-[4px] border-t-[#D83B01] p-4 sm:p-5 shadow-[0_2px_5px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_10px_25px_rgba(216,59,1,0.14),0_3px_8px_rgba(0,0,0,0.05)] hover:border-[#D83B01] hover:-translate-y-1">
                  <div className="text-xs sm:text-[13px] text-[#605E5C] font-bold">المستهلك والمعلق</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div>
                      <span className="text-xs text-[#8A8886]">المستهلك: </span>
                      <strong className="text-base font-black font-mono text-[#201F1E] tabular-nums">{selectedBalance.consumedBalance}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-[#8A8886]">قيد الاعتماد: </span>
                      <strong className="text-base font-black font-mono text-[#D83B01] tabular-nums">{selectedBalance.pendingBalance}</strong>
                    </div>
                  </div>
                  <div className="text-xs text-[#8A8886] mt-3.5 pt-2.5 border-t border-[#EDEBE9] truncate">
                    إجمالي المخصص: {selectedBalance.allocatedBalance} {selectedBalance.unit}
                  </div>
                </div>

                {/* Tile 4: Quick Action */}
                <div className="bg-white border border-[#D2D0CE] border-t-[4px] border-t-[#0078D4] p-4 sm:p-5 shadow-[0_2px_5px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between transition-all hover:shadow-[0_10px_25px_rgba(0,0,0,0.10),0_3px_8px_rgba(0,0,0,0.05)] hover:border-[#B3B0AD] hover:-translate-y-1">
                  <div>
                    <div className="text-xs sm:text-[13px] font-bold text-[#201F1E]">إجراء مباشر</div>
                    <div className="text-xs text-[#605E5C] mt-1">تقديم طلب على هذا الرصيد مباشرة</div>
                  </div>
                  <button
                    onClick={() => onOpenNewLeaveDialog(selectedBalance.leaveTypeCode)}
                    className="w-full mt-3 py-2 bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer focus-visible:outline-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>طلب إجازة {selectedBalance.leaveTypeTitle.split(' ')[0]}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FastTab 1: Movements History Grid */}
            <div className="p-3">
              <D365FastTab
                title={`سجل الحركات التاريخية للأرصدة (${selectedBalance?.leaveTypeTitle})`}
                summary={`${transactions.length} حركات مسجلة`}
                defaultExpanded={true}
              >
                <D365DataGrid
                  columns={txnColumns}
                  data={transactions}
                  keyExtractor={(t) => t.id}
                  searchPlaceholder="بحث في رقم المرجع أو نوع الحركة أو الملاحظات..."
                  emptyMessage="لا توجد حركات مسجلة لهذا النوع من الإجازات."
                />
              </D365FastTab>

              {/* FastTab 2: Accrual Policy & Rules */}
              <D365FastTab
                title="سياسات وشروط استحقاق الإجازات (Dynamics 365 Leave Policy)"
                summary="القواعد واللوائح التنظيمية"
                defaultExpanded={false}
              >
                <div className="text-xs text-[#605E5C] leading-relaxed space-y-2 p-2 bg-[#FAF9F8] border border-[#EDEBE9]">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#107C41] shrink-0 mt-0.5" />
                    <span>يتم احتساب الرصيد الدوري في اليوم الأول من كل شهر ميلادي بموجب جدول رواتب المؤسسة.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#107C41] shrink-0 mt-0.5" />
                    <span>الحد الأقصى للرصيد المرحل لنهاية العام المالي هو 15 يوماً فقط وفقاً لنظام العمل.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#107C41] shrink-0 mt-0.5" />
                    <span>يلزم تقديم طلب الإجازة الاعتيادية قبل 5 أيام عمل على الأقل لتمكين تسليم المهام للموظف البديل.</span>
                  </div>
                </div>
              </D365FastTab>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
