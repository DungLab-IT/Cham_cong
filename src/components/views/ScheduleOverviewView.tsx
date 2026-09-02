import React from 'react';
import {
  CalendarDays,
  Sun,
  Sunset,
  Moon,
  Zap,
  Coffee,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { MonthSalarySummary, SalaryConfig, DayAttendance, DaySalaryDetail } from '../../types';
import { CalendarMonthView } from '../CalendarMonthView';
import { QuickCheckInBar } from '../QuickCheckInBar';
import { formatVND } from '../../utils/salaryCalculator';

interface ScheduleOverviewViewProps {
  summary: MonthSalarySummary;
  config: SalaryConfig;
  currentDateStr: string;
  onUpdateDay: (date: string, updates: Partial<DayAttendance>) => void;
  onOpenDayDetail: (day: DaySalaryDetail) => void;
  onBatchApply: (pattern: 'morning_evening' | 'morning_afternoon' | 'afternoon_evening' | 'clear') => void;
  todayAttendance: DayAttendance | undefined;
  attendances: Record<string, DayAttendance>;
}

export const ScheduleOverviewView: React.FC<ScheduleOverviewViewProps> = ({
  summary,
  config,
  currentDateStr,
  onUpdateDay,
  onOpenDayDetail,
  onBatchApply,
  todayAttendance,
  attendances,
}) => {
  const [yearStr, monthStr] = summary.monthKey.split('-');
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  // Split-shift groupings
  const splitShiftDays = summary.daysDetail.filter((d) => d.totalShifts >= 2);
  const singleShiftDays = summary.daysDetail.filter((d) => d.totalShifts === 1);
  const offDays = summary.daysDetail.filter((d) => d.totalShifts === 0);

  // 2-shift combinations
  const morningNightDays = summary.daysDetail.filter(
    (d) => d.dayAttendance.morning && !d.dayAttendance.afternoon && d.dayAttendance.evening
  );
  const morningAfternoonDays = summary.daysDetail.filter(
    (d) => d.dayAttendance.morning && d.dayAttendance.afternoon && !d.dayAttendance.evening
  );
  const afternoonNightDays = summary.daysDetail.filter(
    (d) => !d.dayAttendance.morning && d.dayAttendance.afternoon && d.dayAttendance.evening
  );
  const allThreeDays = summary.daysDetail.filter(
    (d) => d.dayAttendance.morning && d.dayAttendance.afternoon && d.dayAttendance.evening
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Info */}
      <div className="bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
              Lịch Làm Việc
            </span>
            <span className="text-xs text-slate-400 font-medium">Tháng {month}/{year}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Phân Bổ Ca Làm & Lịch Chấm Công
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Cơ chế tính chuẩn 10 triệu / tháng (2 ca/ngày = 1 công). Chọn ca cho ngày mới hoặc chuyển đổi nhanh trực tiếp trên lịch.
          </p>
        </div>

        {/* Quick Batch Fill Tools */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => onBatchApply('morning_evening')}
            id="btn-schedule-batch-se"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-300 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-800/60 rounded-xl transition-all shadow-xs"
            title="Điền ca Sáng + Tối cho các ngày T2 - T7 cả tháng"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Điền nhanh Sáng + Tối (T2-T7)</span>
          </button>
          <button
            onClick={() => onBatchApply('clear')}
            id="btn-schedule-batch-clear"
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            title="Xóa trắng lịch tháng"
          >
            Xóa trắng
          </button>
        </div>
      </div>

      {/* Quick Check-In Widget (Chấm công ngày mới) */}
      <QuickCheckInBar
        todayStr={currentDateStr}
        attendances={attendances}
        onUpdateDay={onUpdateDay}
        config={config}
      />

      {/* 4 Shift Distribution & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Ngày làm 2 ca (1 công) */}
        <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Làm 2 ca (1.0 công)
            </span>
            <span className="w-6 h-6 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center justify-center text-xs font-bold">
              {splitShiftDays.length}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono">{splitShiftDays.length} ngày</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              = {(splitShiftDays.length * 2)} ca chuẩn ({splitShiftDays.length} công)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>☀️🌙 Sáng + Tối:</span>
              <span className="font-semibold text-slate-200">{morningNightDays.length} ngày</span>
            </div>
            <div className="flex justify-between">
              <span>☀️🌤️ Sáng + Chiều:</span>
              <span className="font-semibold text-slate-200">{morningAfternoonDays.length} ngày</span>
            </div>
            <div className="flex justify-between">
              <span>🌤️🌙 Chiều + Tối:</span>
              <span className="font-semibold text-slate-200">{afternoonNightDays.length} ngày</span>
            </div>
          </div>
        </div>

        {/* Card 2: Ca Sáng */}
        <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Tổng Ca Sáng
            </span>
            <span className="w-6 h-6 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center justify-center text-xs font-bold">
              {summary.projectedMorningCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-300 font-mono">
              {summary.projectedMorningCount} ca
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              = {summary.projectedMorningCount * 0.5} ngày công
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Đã làm:</span>
            <span className="font-semibold text-white">{summary.workedMorningCount} ca</span>
          </div>
        </div>

        {/* Card 3: Ca Chiều */}
        <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              Tổng Ca Chiều
            </span>
            <span className="w-6 h-6 rounded-lg bg-orange-950/80 text-orange-300 border border-orange-800/60 flex items-center justify-center text-xs font-bold">
              {summary.projectedAfternoonCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-orange-300 font-mono">
              {summary.projectedAfternoonCount} ca
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              = {summary.projectedAfternoonCount * 0.5} ngày công
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Đã làm:</span>
            <span className="font-semibold text-white">{summary.workedAfternoonCount} ca</span>
          </div>
        </div>

        {/* Card 4: Ca Tối / Đêm */}
        <div className="bg-[#111827] rounded-2xl p-4 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Tổng Ca Tối
            </span>
            <span className="w-6 h-6 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center justify-center text-xs font-bold">
              {summary.projectedEveningCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-300 font-mono">
              {summary.projectedEveningCount} ca
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              = {summary.projectedEveningCount * 0.5} ngày công
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Đã làm:</span>
            <span className="font-semibold text-white">{summary.workedEveningCount} ca</span>
          </div>
        </div>
      </div>

      {/* Interactive Calendar Month Grid */}
      <CalendarMonthView
        summary={summary}
        config={config}
        currentDateStr={currentDateStr}
        onUpdateDay={onUpdateDay}
        onOpenDayDetail={onOpenDayDetail}
      />
    </div>
  );
};
