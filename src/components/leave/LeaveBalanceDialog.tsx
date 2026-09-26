import React, { useState } from 'react';
import {
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { D365Dialog } from '../common/D365Dialog';
import { D365Tabs, TabItem } from '../common/D365Tabs';
import { D365DataGrid, Column } from '../common/D365DataGrid';
import { LeaveBalance, LeaveRequest, LeaveTypeCode, Employee } from '../../types/d365.types';
import { d365Service } from '../../services/d365Service';
import { exportToCsv } from '../../utils/exportUtils';
import { usePersonalization } from '../../context/PersonalizationContext';
import { getPopupTranslations, formatString } from '../../i18n/popupTranslations';

interface LeaveBalanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leaveBalances: LeaveBalance[];
  onOpenNewLeave: (leaveTypeCode?: LeaveTypeCode) => void;
  onRefresh?: () => void;
  employee?: Employee;
}

const LEAVE_TYPE_NAMES: Record<LeaveTypeCode, { ar: string; en: string }> = {
  ANNUAL: { ar: 'إجازة اعتيادية', en: 'Annual Leave' },
  CASUAL: { ar: 'إجازة عارضة', en: 'Casual Leave' },
  SICK: { ar: 'إجازة مرضية', en: 'Sick Leave' },
  MATERNITY: { ar: 'إجازة وضع', en: 'Maternity Leave' },
  PERMISSION: { ar: 'إذن انصراف', en: 'Exit Permission' },
  FAMILY_CARE: { ar: 'رعاية أسرة', en: 'Family Care' },
  CHILD_CARE: { ar: 'رعاية طفل', en: 'Child Care' },
  COMPENSATORY: { ar: 'إجازة تعويضية', en: 'Compensatory Leave' },
  HAJJ: { ar: 'إجازة حج', en: 'Hajj Leave' },
  BEREAVEMENT: { ar: 'إجازة وفاة', en: 'Bereavement Leave' },
};

export const LeaveBalanceDialog: React.FC<LeaveBalanceDialogProps> = ({
  isOpen,
  onClose,
  leaveBalances,
  onOpenNewLeave,
  onRefresh,
  employee,
}) => {
  const { language } = usePersonalization();
  const pt = getPopupTranslations(language);

  const [activeMainTab, setActiveMainTab] = useState<'BALANCES' | 'APPROVED_DAYS' | 'SUBMITTED_REQUESTS'>('BALANCES');
  const [asOfDate, setAsOfDate] = useState<string>('2025-09-18');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [selectedBalanceRow, setSelectedBalanceRow] = useState<LeaveBalance | null>(leaveBalances[0] || null);

  const emp = employee || d365Service.getEmployee();
  const isSeconded = emp.employmentStatus === 'Seconded' || (emp.employmentStatusAr && emp.employmentStatusAr.includes('منتدب'));
  const isLoaned = emp.employmentStatus === 'Loaned' || (emp.employmentStatusAr && emp.employmentStatusAr.includes('معار'));
  const isNormalActive = !isSeconded && !isLoaned;

  const allRequests = d365Service.getLeaveRequests();
  const approvedRequests = allRequests.filter((r) => r.status === 'Approved');

  const getLocalizedLeaveTitle = (code: LeaveTypeCode, fallbackAr: string): string => {
    const item = LEAVE_TYPE_NAMES[code];
    if (item) {
      return language === 'en' ? item.en : item.ar;
    }
    return fallbackAr;
  };

  const getLocalizedUnit = (unit: string): string => {
    if (unit === 'أيام' || unit === 'days' || unit === 'Days') {
      return pt.common.days;
    }
    return pt.common.hours;
  };

  const getLocalizedStatus = (status: string, statusAr: string): string => {
    if (language === 'ar') return statusAr;
    switch (status) {
      case 'Approved':
        return 'Approved';
      case 'InReview':
        return 'In Review';
      case 'PendingApproval':
        return 'Pending Approval';
      case 'Draft':
        return 'Draft';
      case 'Rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const mainTabs: TabItem[] = [
    {
      id: 'BALANCES',
      label: pt.leaveBalance.tabBalances,
      count: leaveBalances.length,
    },
    {
      id: 'APPROVED_DAYS',
      label: pt.leaveBalance.tabApprovedDays,
      count: approvedRequests.length,
    },
    {
      id: 'SUBMITTED_REQUESTS',
      label: pt.leaveBalance.tabSubmittedRequests,
      count: allRequests.length,
    },
  ];

  const handleApplyFilter = () => {
    if (onRefresh) onRefresh();
    setFeedbackNotice(formatString(pt.leaveBalance.filterFeedbackNotice, { date: asOfDate }));
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  const handleExportExcel = () => {
    if (activeMainTab === 'BALANCES') {
      exportToCsv(
        `Leave_Balances_${asOfDate}`,
        leaveBalances.map((b) => ({
          [pt.leaveBalance.colType]: getLocalizedLeaveTitle(b.leaveTypeCode, b.leaveTypeTitle),
          [pt.leaveBalance.colUnit]: getLocalizedUnit(b.unit),
          [pt.leaveBalance.colCurrentBalance]: b.currentBalance.toFixed(2),
          [pt.leaveBalance.colAccrualRate]: b.accrualRate,
          [pt.leaveBalance.asOfDateLabel]: asOfDate,
        }))
      );
    } else if (activeMainTab === 'APPROVED_DAYS') {
      exportToCsv(
        'Approved_Leave_Days',
        approvedRequests.map((r) => ({
          [pt.leaveBalance.colRequestId]: r.id,
          [pt.leaveBalance.colLeaveType]: getLocalizedLeaveTitle(r.leaveTypeCode, r.leaveTypeTitle),
          [pt.leaveBalance.colStartDate]: r.startDate,
          [pt.leaveBalance.colEndDate]: r.endDate,
          [pt.leaveBalance.colApprovedDays]: r.requestedDays,
          [pt.leaveBalance.colDelegatedEmployee]: r.delegatedEmployeeName,
          [pt.leaveBalance.colApprovalStatus]: getLocalizedStatus(r.status, r.statusAr),
        }))
      );
    } else {
      exportToCsv(
        'Submitted_Leave_Requests',
        allRequests.map((r) => ({
          [pt.leaveBalance.colRequestId]: r.id,
          [pt.leaveBalance.colLeaveType]: getLocalizedLeaveTitle(r.leaveTypeCode, r.leaveTypeTitle),
          [pt.leaveBalance.colSubmissionDate]: r.submissionDate,
          [pt.leaveBalance.colFromDate]: r.startDate,
          [pt.leaveBalance.colToDate]: r.endDate,
          [pt.leaveBalance.colDays]: r.requestedDays,
          [pt.leaveBalance.colStatus]: getLocalizedStatus(r.status, r.statusAr),
        }))
      );
    }
    setFeedbackNotice(pt.leaveBalance.exportFeedbackNotice);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // Columns for Tab 1: Balances
  const balancesColumns: Column<LeaveBalance>[] = [
    {
      key: 'leaveTypeTitle',
      header: pt.leaveBalance.colType,
      width: '180px',
      render: (row) => (
        <span className="font-semibold text-xs text-[#323130]">
          {getLocalizedLeaveTitle(row.leaveTypeCode, row.leaveTypeTitle)}
        </span>
      ),
    },
    {
      key: 'unit',
      header: pt.leaveBalance.colUnit,
      width: '100px',
      render: (row) => <span className="text-xs text-[#605E5C]">{getLocalizedUnit(row.unit)}</span>,
    },
    {
      key: 'currentBalance',
      header: pt.leaveBalance.colCurrentBalance,
      width: '130px',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-[#0078D4]">
          {row.currentBalance.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'accrualRate',
      header: pt.leaveBalance.colAccrualRate,
      render: (row) => (
        <span className="text-xs text-[#323130]">{row.accrualRate}</span>
      ),
    },
  ];

  // Columns for Tab 2: Approved Days
  const approvedDaysColumns: Column<LeaveRequest>[] = [
    {
      key: 'leaveTypeTitle',
      header: pt.leaveBalance.colLeaveType,
      width: '160px',
      render: (row) => (
        <span className="font-semibold text-xs text-[#323130]">
          {getLocalizedLeaveTitle(row.leaveTypeCode, row.leaveTypeTitle)}
        </span>
      ),
    },
    {
      key: 'startDate',
      header: pt.leaveBalance.colStartDate,
      width: '110px',
      render: (row) => <span className="font-mono text-xs text-[#605E5C]">{row.startDate}</span>,
    },
    {
      key: 'endDate',
      header: pt.leaveBalance.colEndDate,
      width: '110px',
      render: (row) => <span className="font-mono text-xs text-[#605E5C]">{row.endDate}</span>,
    },
    {
      key: 'requestedDays',
      header: pt.leaveBalance.colApprovedDays,
      width: '110px',
      render: (row) => (
        <span className="font-mono font-bold text-xs text-[#107C41]">
          {row.requestedDays} {pt.common.day}
        </span>
      ),
    },
    {
      key: 'delegatedEmployeeName',
      header: pt.leaveBalance.colDelegatedEmployee,
      width: '150px',
      render: (row) => <span className="text-xs text-[#323130]">{row.delegatedEmployeeName}</span>,
    },
    {
      key: 'statusAr',
      header: pt.leaveBalance.colApprovalStatus,
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-[#DFF6DD] text-[#107C41] font-semibold">
          <CheckCircle2 className="w-3 h-3" />
          {getLocalizedStatus(row.status, row.statusAr)}
        </span>
      ),
    },
  ];

  // Columns for Tab 3: Submitted Requests
  const submittedRequestsColumns: Column<LeaveRequest>[] = [
    {
      key: 'id',
      header: pt.leaveBalance.colRequestId,
      width: '120px',
      render: (row) => <span className="font-mono text-xs text-[#0078D4] font-semibold">{row.id}</span>,
    },
    {
      key: 'leaveTypeTitle',
      header: pt.leaveBalance.colLeaveType,
      width: '150px',
      render: (row) => (
        <span className="font-semibold text-xs text-[#323130]">
          {getLocalizedLeaveTitle(row.leaveTypeCode, row.leaveTypeTitle)}
        </span>
      ),
    },
    {
      key: 'submissionDate',
      header: pt.leaveBalance.colSubmissionDate,
      width: '110px',
      render: (row) => <span className="font-mono text-xs text-[#605E5C]">{row.submissionDate}</span>,
    },
    {
      key: 'startDate',
      header: pt.leaveBalance.colFromDate,
      width: '100px',
      render: (row) => <span className="font-mono text-xs text-[#605E5C]">{row.startDate}</span>,
    },
    {
      key: 'endDate',
      header: pt.leaveBalance.colToDate,
      width: '100px',
      render: (row) => <span className="font-mono text-xs text-[#605E5C]">{row.endDate}</span>,
    },
    {
      key: 'requestedDays',
      header: pt.leaveBalance.colDays,
      width: '80px',
      render: (row) => <span className="font-mono font-semibold text-xs text-[#323130]">{row.requestedDays}</span>,
    },
    {
      key: 'statusAr',
      header: pt.leaveBalance.colStatus,
      render: (row) => {
        const isApproved = row.status === 'Approved';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold ${
              isApproved ? 'bg-[#DFF6DD] text-[#107C41]' : 'bg-[#FFF4CE] text-[#797673]'
            }`}
          >
            {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {getLocalizedStatus(row.status, row.statusAr)}
          </span>
        );
      },
    },
  ];

  const selectedTitle = selectedBalanceRow
    ? getLocalizedLeaveTitle(selectedBalanceRow.leaveTypeCode, selectedBalanceRow.leaveTypeTitle)
    : '';

  const employeeStatusLabel = language === 'en'
    ? (emp.employmentStatus || 'Active')
    : (emp.employmentStatusAr || 'نشط');

  return (
    <D365Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={pt.leaveBalance.dialogTitle}
      subtitle={pt.leaveBalance.dialogSubtitle}
      maxWidth="4xl"
      primaryActionLabel={pt.leaveBalance.requestNewLeaveBtn}
      onPrimaryAction={() => {
        onClose();
        onOpenNewLeave(selectedBalanceRow?.leaveTypeCode || 'ANNUAL');
      }}
      secondaryActionLabel={pt.common.close}
      onSecondaryAction={onClose}
      tertiaryActionLabel={pt.common.exportExcel}
      onTertiaryAction={handleExportExcel}
    >
      <div className="space-y-3">
        {/* Feedback message banner if triggered */}
        {feedbackNotice && (
          <div className="p-2.5 bg-[#DFF6DD] border border-[#107C41] text-[#107C41] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackNotice}</span>
            </div>
            <button
              onClick={() => setFeedbackNotice(null)}
              className="text-xs hover:underline font-bold"
            >
              {pt.common.close}
            </button>
          </div>
        )}

        {/* 3 Main Tabs */}
        <div className="bg-white border border-[#D1D1D1]">
          <D365Tabs
            tabs={mainTabs}
            activeTabId={activeMainTab}
            onTabChange={(id) => setActiveMainTab(id as any)}
          />

          {/* As-of Date Filter Bar */}
          <div className="p-2 sm:p-3 bg-[#F9F9F9] border-t border-b border-[#EDEBE9] flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="asOfDateField" className="text-xs font-semibold text-[#323130] shrink-0">
                {pt.leaveBalance.asOfDateLabel}
              </label>
              <div className="flex items-center gap-1.5 bg-white px-2 py-1 border border-[#8A8886] focus-within:border-[#0078D4]">
                <Calendar className="w-3.5 h-3.5 text-[#0078D4] shrink-0" />
                <input
                  id="asOfDateField"
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="h-6 bg-transparent text-xs text-[#323130] outline-none font-mono"
                />
              </div>
              <button
                onClick={handleApplyFilter}
                className="px-3 py-1 min-h-[28px] bg-[#0078D4] hover:bg-[#106EBE] text-white text-xs font-semibold border border-[#0078D4] transition-colors cursor-pointer"
              >
                {pt.common.apply}
              </button>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 px-2.5 py-1 min-h-[28px] bg-white hover:bg-[#F3F2F1] text-xs text-[#107C41] border border-[#D1D1D1] transition-colors cursor-pointer"
                title={pt.leaveBalance.exportExcelTitle}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{pt.common.exportExcelShort}</span>
              </button>
              <button
                onClick={() => {
                  setAsOfDate('2025-09-18');
                  handleApplyFilter();
                }}
                className="flex items-center gap-1 px-2.5 py-1 min-h-[28px] bg-white hover:bg-[#F3F2F1] text-xs text-[#605E5C] border border-[#D1D1D1] transition-colors cursor-pointer"
                title={pt.leaveBalance.resetTitle}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{pt.common.reset}</span>
              </button>
            </div>
          </div>

          {/* Tab 1 Content: Balances Table */}
          {activeMainTab === 'BALANCES' && (
            <div className="p-3">
              <D365DataGrid
                columns={balancesColumns}
                data={leaveBalances}
                keyExtractor={(row) => row.id}
                onRowSelect={(row: LeaveBalance) => setSelectedBalanceRow(row)}
                selectedIds={selectedBalanceRow ? [selectedBalanceRow.id] : []}
                emptyMessage={pt.leaveBalance.emptyBalances}
              />

              {/* Selected Balance Quick Info Footer */}
              {selectedBalanceRow && (
                <div className="mt-3 p-3 bg-[#F3F2F1] border border-[#D1D1D1] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#0078D4] shrink-0" />
                      <span className="font-semibold text-[#323130]">
                        {pt.leaveBalance.selectedTypeLabel} {selectedTitle}
                      </span>
                    </div>
                    <span className="text-[#605E5C]">
                      {pt.leaveBalance.availableBalanceLabel} <strong className="text-[#0078D4] font-mono">{selectedBalanceRow.currentBalance.toFixed(2)} {getLocalizedUnit(selectedBalanceRow.unit)}</strong>
                    </span>
                    <span className="text-[#605E5C]">
                      {pt.leaveBalance.accrualRateLabel} {selectedBalanceRow.accrualRate}
                    </span>
                  </div>
                  {isNormalActive ? (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNewLeave(selectedBalanceRow.leaveTypeCode);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 min-h-[30px] bg-[#0078D4] text-white hover:bg-[#106EBE] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>{formatString(pt.leaveBalance.requestLeaveOfTypeBtn, { type: selectedTitle })}</span>
                      <ArrowUpRight className="w-3 h-3 rtl:rotate-[-90deg]" />
                    </button>
                  ) : (
                    <div className="text-[11px] text-[#A80000] font-semibold flex items-center gap-1.5 bg-[#FDF3F2] px-2.5 py-1 border border-[#F19999]">
                      <Info className="w-3.5 h-3.5" />
                      <span>{formatString(pt.leaveBalance.requestRestrictedStatusNotice, { status: employeeStatusLabel })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2 Content: Approved Days */}
          {activeMainTab === 'APPROVED_DAYS' && (
            <div className="p-3">
              <D365DataGrid
                columns={approvedDaysColumns}
                data={approvedRequests}
                keyExtractor={(row) => row.id}
                emptyMessage={pt.leaveBalance.emptyApprovedDays}
              />
            </div>
          )}

          {/* Tab 3 Content: Submitted Requests */}
          {activeMainTab === 'SUBMITTED_REQUESTS' && (
            <div className="p-3">
              <D365DataGrid
                columns={submittedRequestsColumns}
                data={allRequests}
                keyExtractor={(row) => row.id}
                emptyMessage={pt.leaveBalance.emptySubmittedRequests}
              />
            </div>
          )}
        </div>
      </div>
    </D365Dialog>
  );
};
