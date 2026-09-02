import React from 'react';
import {
  FileSpreadsheet,
  Copy,
  Printer,
  CheckCircle2,
  Table as TableIcon,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MonthSalarySummary, SalaryConfig, DayAttendance, DaySalaryDetail } from '../../types';
import { SalaryStatsCards } from '../SalaryStatsCards';
import { SheetTableView } from '../SheetTableView';
import { QuickCheckInBar } from '../QuickCheckInBar';

interface ComprehensiveDashboardViewProps {
  summary: MonthSalarySummary;
  config: SalaryConfig;
  currentDateStr: string;
  onUpdateDay: (date: string, updates: Partial<DayAttendance>) => void;
  onBatchApply: (pattern: 'morning_evening' | 'morning_afternoon' | 'afternoon_evening' | 'clear') => void;
  onOpenDayDetail: (day: DaySalaryDetail) => void;
  onExportExcel: () => void;
  onCopyGoogleSheet: () => void;
  onPrint: () => void;
  copySuccess: boolean;
  todayAttendance: DayAttendance | undefined;
}

export const ComprehensiveDashboardView: React.FC<ComprehensiveDashboardViewProps> = ({
  summary,
  config,
  currentDateStr,
  onUpdateDay,
  onBatchApply,
  onOpenDayDetail,
  onExportExcel,
  onCopyGoogleSheet,
  onPrint,
  copySuccess,
  todayAttendance,
}) => {
  const [yearStr, monthStr] = summary.monthKey.split('-');

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-[#111827] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-indigo-900/40 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
              Tổng Thể Toàn Diện
            </span>
            <span className="text-xs text-slate-400 font-medium">Tháng {monthStr}/{yearStr}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Tổng Thể Lương & Lịch Chấm Công
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Bảng tính đầy đủ kết hợp cả Lịch làm 3 ca, Lương theo ngày, Phụ cấp tiền ăn, Tăng ca OT và Xuất báo cáo trực tiếp sang Excel / Google Sheets.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={onCopyGoogleSheet}
            id="btn-dash-copy-sheet"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all shadow-xs ${
              copySuccess
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copySuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy dán Google Sheet</span>
              </>
            )}
          </button>

          <button
            onClick={onExportExcel}
            id="btn-dash-export-excel"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Quick Check-in for Today */}
      <QuickCheckInBar
        todayStr={currentDateStr}
        todayAttendance={todayAttendance}
        onUpdateDay={onUpdateDay}
        config={config}
      />

      {/* 4 KPI Summary Stats Cards */}
      <SalaryStatsCards
        summary={summary}
        config={config}
        currentDateStr={currentDateStr}
      />

      {/* Full Sheet Table View */}
      <SheetTableView
        summary={summary}
        config={config}
        currentDateStr={currentDateStr}
        onUpdateDay={onUpdateDay}
        onBatchApply={onBatchApply}
        onOpenDayDetail={onOpenDayDetail}
      />
    </div>
  );
};
