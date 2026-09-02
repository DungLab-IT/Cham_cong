import React from 'react';
import {
  CalendarDays,
  Calculator,
  LayoutDashboard,
  Settings,
  Sparkles,
  Printer,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers,
  User,
  Building2,
  Calendar,
  FileText,
  BarChart3,
  Clock,
} from 'lucide-react';
import { SalaryConfig, MonthSalarySummary } from '../types';
import { formatVND } from '../utils/salaryCalculator';
import { formatVietnamMonth, getAvailableMonthsList, getVietnamCurrentMonthKey } from '../utils/vietnamTime';
import { VietnamClock } from './VietnamClock';

export type ActiveTabKey =
  | 'schedule'
  | 'salary'
  | 'comprehensive'
  | 'monthly_report'
  | 'all_time'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTabKey;
  onTabChange: (tab: ActiveTabKey) => void;
  currentMonthKey: string;
  onMonthChange: (monthKey: string) => void;
  config: SalaryConfig;
  summary: MonthSalarySummary;
  onOpenAiAssistant: () => void;
  onPrintSlip: () => void;
  onExportExcel: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenMonthSelector: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentMonthKey,
  onMonthChange,
  config,
  summary,
  onOpenAiAssistant,
  onPrintSlip,
  onExportExcel,
  isMobileOpen,
  setIsMobileOpen,
  onOpenMonthSelector,
}) => {
  const currentVNMonth = getVietnamCurrentMonthKey();
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const availableMonths = getAvailableMonthsList(currentVNMonth);

  const handlePrevMonth = () => {
    let prevM = month - 1;
    let prevY = year;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    onMonthChange(`${prevY}-${String(prevM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let nextM = month + 1;
    let nextY = year;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    onMonthChange(`${nextY}-${String(nextM).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    onMonthChange(currentVNMonth);
  };

  const isCurrentMonth = currentMonthKey === currentVNMonth;
  const isPastMonth = currentMonthKey < currentVNMonth;

  const navItems = [
    {
      key: 'schedule' as ActiveTabKey,
      label: 'Lịch Làm Việc',
      sublabel: 'Tổng quan ca & lịch tháng',
      icon: CalendarDays,
      badge: `${summary.projectedDaysCount} ngày`,
      color: 'text-indigo-400',
    },
    {
      key: 'salary' as ActiveTabKey,
      label: 'Tính Lương Chi Tiết',
      sublabel: 'Công thức, phụ cấp & phiếu',
      icon: Calculator,
      badge: formatVND(summary.projectedNetSalary),
      badgeColor: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
      color: 'text-emerald-400',
    },
    {
      key: 'comprehensive' as ActiveTabKey,
      label: 'Tổng Thể Lương & Lịch',
      sublabel: 'Bảng sheet & chỉ số KPI',
      icon: LayoutDashboard,
      badge: `${summary.projectedTotalShifts} ca`,
      color: 'text-amber-400',
    },
    {
      key: 'monthly_report' as ActiveTabKey,
      label: 'Báo Cáo Từng Tháng',
      sublabel: 'Chi tiết từng kỳ & in ấn',
      icon: FileText,
      badge: `Tháng ${month}/${year}`,
      badgeColor: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
      color: 'text-blue-400',
    },
    {
      key: 'all_time' as ActiveTabKey,
      label: 'Báo Cáo Toàn Bộ Lương',
      sublabel: 'Tổng hợp mọi tháng & sửa công cũ',
      icon: BarChart3,
      badge: 'Tab Tổng',
      badgeColor: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
      color: 'text-purple-400',
    },
    {
      key: 'settings' as ActiveTabKey,
      label: 'Cài Đặt & Mức Lương',
      sublabel: 'Cấu hình & mô phỏng thu nhập',
      icon: Settings,
      badge: config.calculationMode === 'monthly_based' ? 'Theo tháng' : 'Theo ca',
      color: 'text-rose-400',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111827] text-[#E2E8F0] border-r border-[#1E293B] select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#1E293B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none">
                Chấm Công Ca Gãy
              </h1>
              <p className="text-[11px] text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                <span>⚡ 2 Ca / Ngày</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Việt Nam GMT+7</span>
              </p>
            </div>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User profile snippet card */}
        <div className="mt-4 p-2.5 rounded-xl bg-[#0F172A] border border-slate-800/80 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <p className="font-bold text-slate-200 truncate">{config.employeeName || 'Nhân viên'}</p>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <Building2 className="w-2.5 h-2.5 text-slate-500" />
                {config.workplace || 'Chưa đặt chi nhánh'}
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/40 shrink-0">
            {config.standardShiftsPerDay || 2} ca/công
          </span>
        </div>
      </div>

      {/* Month Navigator with Dropdown Jump */}
      <div className="p-3 border-b border-[#1E293B] bg-[#0B0D11]/40 space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>Kỳ Đang Xem / Sửa</span>
          {!isCurrentMonth ? (
            <button
              onClick={handleCurrentMonth}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
            >
              về tháng này
            </button>
          ) : (
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Tháng hiện tại
            </span>
          )}
        </div>

        <div className="flex items-center justify-between bg-[#0F172A] rounded-xl p-1 border border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Tháng trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenMonthSelector}
            className="flex items-center gap-1 text-xs font-bold text-white hover:text-indigo-300 px-2 py-1 transition-colors cursor-pointer"
            title="Bấm để mở bảng chọn 12 tháng đầy đủ"
          >
            <Calendar className="w-3 h-3 text-indigo-400" />
            <span>{formatVietnamMonth(currentMonthKey)}</span>
          </button>

          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onOpenMonthSelector}
          id="btn-open-month-grid-sidebar"
          className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/50 text-[11px] font-semibold text-indigo-300 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Calendar className="w-3 h-3 text-indigo-400" />
          <span>Mở bảng chọn 12 tháng</span>
        </button>

        {isPastMonth && (
          <div className="text-[10px] text-amber-400/90 px-1 font-medium text-center">
            ↺ Bạn đang sửa dữ liệu tháng cũ
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
          Chức Năng Chính
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => {
                onTabChange(item.key);
                setIsMobileOpen(false);
              }}
              id={`nav-tab-${item.key}`}
              className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {item.label}
                  </p>
                  <p className={`text-[10px] leading-tight mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {item.sublabel}
                  </p>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-1 ${
                    isActive
                      ? 'bg-black/25 text-white border border-white/20'
                      : item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Real-time Vietnam Clock widget inside sidebar */}
        <div className="pt-2">
          <VietnamClock />
        </div>
      </nav>

      {/* Action Buttons Footer */}
      <div className="p-3 border-t border-[#1E293B] space-y-2 bg-[#0B0D11]/30">
        {/* AI Assistant */}
        <button
          onClick={onOpenAiAssistant}
          id="btn-sidebar-ai"
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 text-xs font-semibold transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Trợ Lý Chấm Ca Gãy</span>
        </button>

        {/* Quick Tools Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPrintSlip}
            id="btn-sidebar-print"
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            title="In phiếu lương & bảng chấm công"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Phiếu</span>
          </button>
          <button
            onClick={onExportExcel}
            id="btn-sidebar-excel"
            className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium transition-colors"
            title="Xuất file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
