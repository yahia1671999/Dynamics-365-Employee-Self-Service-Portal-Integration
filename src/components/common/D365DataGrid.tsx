import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usePersonalization } from '../../context/PersonalizationContext';
import { exportToCsv } from '../../utils/exportUtils';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface D365DataGridProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowSelect?: (item: T) => void;
  selectedIds?: string[];
  emptyMessage?: string;
  searchPlaceholder?: string;
  filterProperty?: (item: T, query: string) => boolean;
  actions?: (row: T) => React.ReactNode;
  title?: string;
  enableExport?: boolean;
  pageSize?: number;
}

export function D365DataGrid<T>({
  columns,
  data,
  keyExtractor,
  onRowSelect,
  selectedIds = [],
  emptyMessage = 'لا توجد سجلات مطابقة في النظام.',
  searchPlaceholder = 'تصفية وبحث في السجلات...',
  filterProperty,
  actions,
  title,
  enableExport = true,
  pageSize: initialPageSize = 10,
}: D365DataGridProps<T>) {
  const { accentConfig } = usePersonalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(initialPageSize);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    if (filterProperty) {
      return data.filter((item) => filterProperty(item, searchQuery.toLowerCase()));
    }
    return data.filter((item: any) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery, filterProperty]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortAsc ? -1 : 1;
      return sortAsc ? 1 : -1;
    });
  }, [filteredData, sortKey, sortAsc]);

  // Reset to page 1 on filter or sort
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortKey, sortAsc, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const paginatedData = useMemo(() => {
    if (rowsPerPage >= 1000) return sortedData;
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    const filename = title ? title.replace(/\s+/g, '_') : 'D365_Export';
    exportToCsv(filename, sortedData as any);
  };

  return (
    <div className="bg-white border border-[#D2D0CE] text-xs shadow-[0_2px_5px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Grid Toolbar */}
      <div className="bg-[#FAF9F8] border-b border-[#D2D0CE] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4.5 shrink-0" style={{ backgroundColor: accentConfig.primary }}></div>
          {title ? (
            <span className="font-bold text-xs sm:text-sm text-[#201F1E] tracking-tight">{title}</span>
          ) : (
            <span className="font-bold text-xs sm:text-sm text-[#201F1E] tracking-tight">سجلات البيانات</span>
          )}
        </div>

        <div className="flex items-center gap-2.5 mr-auto w-full sm:w-auto">
          {/* Search box with clear button */}
          <div className="relative flex-1 sm:w-64 max-w-full">
            <input
              type="text"
              aria-label={searchPlaceholder || 'بحث في السجلات'}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-7 pr-3 text-xs bg-white text-[#201F1E] placeholder-[#605E5C] border border-[#8A8886] hover:border-[#323130] focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] outline-none transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="w-4 h-4 absolute left-2 top-2 text-[#605E5C] hover:text-[#201F1E] flex items-center justify-center cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-[#605E5C] pointer-events-none" aria-hidden="true" />
            )}
          </div>

          {/* Export to Excel action button (Dynamics 365 standard) */}
          {enableExport && sortedData.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              className="h-8 px-3 bg-white hover:bg-[#F3F2F1] text-[#201F1E] border border-[#8A8886] hover:border-[#323130] font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer focus-visible:outline-none"
              title="تصدير السجلات إلى Microsoft Excel (.csv)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#107C41]" aria-hidden="true" />
              <span className="hidden md:inline">تصدير لـ Excel</span>
            </button>
          )}

          {/* Records Count Badge */}
          <div className="h-8 text-xs text-[#605E5C] font-mono font-bold px-2.5 bg-white border border-[#D2D0CE] shrink-0 shadow-2xs flex items-center gap-1">
            <span>السجلات:</span>
            <strong className="text-[#201F1E] font-bold tabular-nums">{sortedData.length}</strong>
          </div>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="overflow-x-auto [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
        <table className="w-full text-right border-collapse min-w-[620px]">
          <thead>
            <tr className="bg-[#F3F2F1] border-b-2 border-[#D2D0CE] text-[#201F1E]">
              <th className="w-12 px-3 py-3 text-center border-l border-[#EDEBE9]">
                <span className="text-[10px] font-mono font-bold text-[#605E5C]">#</span>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  onKeyDown={(e) => {
                    if (col.sortable !== false && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(col.key);
                    }
                  }}
                  tabIndex={col.sortable !== false ? 0 : undefined}
                  role={col.sortable !== false ? 'button' : undefined}
                  aria-label={col.sortable !== false ? `ترتيب حسب ${col.header}` : undefined}
                  className={`px-4 py-3 font-bold text-xs text-[#201F1E] border-l border-[#EDEBE9] focus-visible:ring-2 focus-visible:ring-[#0078D4] focus-visible:outline-none select-none ${
                    col.sortable !== false ? 'cursor-pointer hover:bg-[#EDEBE9] transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="truncate">{col.header}</span>
                    {col.sortable !== false && (
                      <span className="text-[#605E5C] shrink-0">
                        {sortKey === col.key ? (
                          sortAsc ? (
                            <ChevronUp className="w-3.5 h-3.5" style={{ color: accentConfig.primary }} />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" style={{ color: accentConfig.primary }} />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-35 hover:opacity-100 transition-opacity" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="w-28 px-4 py-3 font-bold text-xs text-[#201F1E] text-center border-l border-[#EDEBE9]">
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEBE9]">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 2 : 1)}
                  className="py-12 text-center text-[#605E5C] bg-[#FAF9F8]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-none bg-white border border-[#D2D0CE] flex items-center justify-center shadow-2xs">
                      <Filter className="w-5 h-5 text-[#8A8886]" />
                    </div>
                    <span className="text-xs font-semibold text-[#323130]">{emptyMessage}</span>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{ color: accentConfig.primary }}
                        className="text-[11px] font-semibold hover:underline mt-0.5 cursor-pointer"
                      >
                        إعادة ضبط عامل التصفية والبحث
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowKey = keyExtractor(row);
                const isSelected = selectedIds.includes(rowKey);
                const actualIndex = (currentPage - 1) * rowsPerPage + idx + 1;
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowSelect?.(row)}
                    style={isSelected ? { backgroundColor: accentConfig.lightBg } : undefined}
                    className={`transition-colors border-b border-[#EDEBE9] ${
                      isSelected
                        ? 'border-r-4'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-[#FAF9F8]'
                    } hover:bg-[#EFF6FC] cursor-pointer group`}
                  >
                    <td className="w-12 px-3 py-3 text-center text-xs font-mono font-bold text-[#8A8886] border-l border-[#EDEBE9] tabular-nums group-hover:text-[#201F1E]">
                      {actualIndex}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-xs text-[#201F1E] border-l border-[#EDEBE9] truncate max-w-xs align-middle"
                      >
                        {col.render ? col.render(row, idx) : (row as any)[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td
                        className="px-4 py-3 text-xs text-center whitespace-nowrap border-l border-[#EDEBE9] align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Bar with Pagination & Summary */}
      <div className="bg-[#FAF9F8] border-t border-[#D2D0CE] px-3.5 py-2.5 flex items-center justify-between text-[11px] text-[#605E5C] flex-wrap gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span>عرض</span>
            <strong className="text-[#201F1E] font-bold font-mono tabular-nums">{paginatedData.length}</strong>
            <span>من أصل</span>
            <strong className="text-[#201F1E] font-bold font-mono tabular-nums">{sortedData.length}</strong>
            <span>سجل</span>
          </span>

          {sortedData.length > 10 && (
            <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-[#D2D0CE]">
              <span>صفوف الصفحة:</span>
              <select
                aria-label="عدد الصفوف لكل صفحة"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-white border border-[#8A8886] text-xs px-1.5 py-0.5 text-[#201F1E] outline-none shadow-2xs font-mono"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={1000}>الكل</option>
              </select>
            </div>
          )}
        </div>

        {/* Pagination controls when data exceeds page size */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 bg-white border border-[#D2D0CE] hover:border-[#8A8886] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[#201F1E] shadow-2xs"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono font-semibold text-[#201F1E] tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 bg-white border border-[#D2D0CE] hover:border-[#8A8886] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[#201F1E] shadow-2xs"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <span className="font-mono text-[#8A8886] text-[10.5px]">
          Microsoft Dynamics 365 Data Grid · Enterprise Edition
        </span>
      </div>
    </div>
  );
}
