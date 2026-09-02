import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileSpreadsheet,
  Copy,
  Printer,
  Sparkles,
  Menu,
  CheckCircle2,
  CalendarDays,
  Calculator,
  LayoutDashboard,
  FileText,
  BarChart3,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { SalaryConfig, MonthSalarySummary } from '../types';
import { ActiveTabKey } from './Sidebar';
import { VietnamClock } from './VietnamClock';
import { formatVietnamMonth } from '../utils/vietnamTime';

interface HeaderProps {
  currentMonthKey: string; // YYYY-MM
  onMonthChange: (newMonthKey: string) => void;
  config: SalaryConfig;
  activeTab: ActiveTabKey;
  onOpenMobileSidebar: () => void;
  onOpenAiAssistant: () => void;
  onExportExcel: () => void;
  onCopyGoogleSheet: () => void;
  onPrint: () => void;
  copySuccess: boolean;
  summary: MonthSalarySummary;
  onOpenMonthSelector: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthKey,
  onMonthChange,
  config,
  activeTab,
  onOpenMobileSidebar,
  onOpenAiAssistant,
  onExportExcel,
  onCopyGoogleSheet,
  onPrint,
  copySuccess,
  summary,
  onOpenMonthSelector,
}) => {
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'schedule':
        return {
          title: 'Tổng Quan Lịch Làm Việc',
          subtitle: `Phân bổ ca làm & lịch Tháng ${month}/${year}`,
          icon: CalendarDays,
          badge: `${summary.projectedDaysCount} ngày đi làm`,
        };
      case 'salary':
        return {
          title: 'Tính Lương Chi Tiết',
          subtitle: `Chiết tính lương ca, tăng ca OT, tiền ăn Tháng ${month}/${year}`,
          icon: Calculator,
          badge: `${summary.projectedTotalShifts} ca = ${summary.projectedStandardDays} công`,
        };
      case 'comprehensive':
        return {
          title: 'Tổng Thể Lương & Lịch Chấm Công',
          subtitle: `Bảng sheet chấm công & chỉ số KPI Tháng ${month}/${year}`,
          icon: LayoutDashboard,
          badge: 'Đầy đủ dữ liệu',
        };
      case 'monthly_report':
        return {
          title: 'Báo Cáo Từng Tháng',
          subtitle: `Phân tích chi tiết thu nhập & in báo cáo Tháng ${month}/${year}`,
          icon: FileText,
          badge: `Kỳ ${month}/${year}`,
        };
      case 'all_time':
        return {
          title: 'Báo Cáo Toàn Bộ Lương (Tab Tổng)',
          subtitle: 'So sánh lương qua các tháng & sửa lại công các kỳ trước',
          icon: BarChart3,
          badge: 'Tất cả các tháng',
        };
      case 'settings':
        return {
          title: 'Cài Đặt & Mức Lương',
          subtitle: 'Cấu hình lương cơ bản & mô phỏng thu nhập theo kịch bản',
          icon: Settings,
          badge: config.calculationMode === 'monthly_based' ? 'Theo tháng' : 'Theo ca',
        };
      default:
        return {
          title: 'Chấm Công Ca Gãy',
          subtitle: 'Quản lý 2 ca/ngày',
          icon: CalendarDays,
          badge: '',
        };
    }
  };

  const currentTabInfo = getTabTitle();
  const TabIcon = currentTabInfo.icon;

  return (
    <header className="bg-[#111827] border-b border-[#1E293B] sticky top-0 z-20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex items-center justify-between gap-3">
          {/* Left: Mobile hamburger & Active Tab Header */}
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger button */}
            <button
              onClick={onOpenMobileSidebar}
              id="btn-mobile-menu"
              className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Tab Title info */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <TabIcon className="w-4 h-4 text-indigo-400 hidden sm:inline" />
                  <span>{currentTabInfo.title}</span>
                </h2>
                {currentTabInfo.badge && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-800/50">
                    {currentTabInfo.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {currentTabInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right Action buttons & Month Quick Switcher */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Direct Month Selector Trigger in Top Header */}
            <div className="flex items-center bg-[#0F172A] rounded-xl p-1 border border-slate-800 shadow-xs">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenMonthSelector}
                id="btn-open-month-selector-header"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-indigo-300 hover:text-white hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                title="Bấm để mở bảng chọn 12 tháng hoàn chỉnh"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formatVietnamMonth(currentMonthKey)}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Live Vietnam Real-Time Clock */}
            <VietnamClock compact={true} />

            {/* AI Assistant Button */}
            <button
              onClick={onOpenAiAssistant}
              id="btn-ai-assistant-top"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-950/50 hover:bg-purple-900/60 rounded-xl border border-purple-800/60 transition-colors shadow-xs"
              title="Nhập ca bằng chat AI thông minh"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Trợ lý</span>
            </button>

            {/* Copy Google Sheet */}
            <button
              onClick={onCopyGoogleSheet}
              id="btn-copy-sheet-top"
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all shadow-xs ${
                copySuccess
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Sao chép bảng để dán vào Google Sheets"
            >
              {copySuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã copy!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Sheet</span>
                </>
              )}
            </button>

            {/* Export Excel */}
            <button
              onClick={onExportExcel}
              id="btn-export-excel-top"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-md shadow-emerald-600/20"
              title="Tải về file Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>

            {/* Print Slip */}
            <button
              onClick={onPrint}
              id="btn-print-top"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
              title="In phiếu lương"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">In</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
