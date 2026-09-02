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
}

export const ScheduleOverviewView: React.FC<ScheduleOverviewViewProps> = ({
  summary,
  config,
  currentDateStr,
  onUpdateDay,
  onOpenDayDetail,
  onBatchApply,
  todayAttendance,
}) => {
  const [yearStr, monthStr] = summary.monthKey.split('-');
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  // Calculate split-shift specifics (2 ca/ngày)
  const splitShiftDays = summary.daysDetail.filter((d) => d.totalShifts >= 2);
  const singleShiftDays = summary.daysDetail.filter((d) => d.totalShifts === 1);
  const offDays = summary.daysDetail.filter((d) => d.totalShifts === 0);

  // Specific 2-shift combinations
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
      {/* Top Banner / Headline */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-[#111827] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-indigo-900/40 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
              Tổng Quan Lịch Làm
            </span>
            <span className="text-xs text-slate-400 font-medium">Tháng {month}/{year}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Lịch Làm Việc & Phân Bổ Ca Gãy
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Theo dõi tổng thể chu kỳ làm việc 2 ca/ngày (Sáng & Tối, Sáng & Chiều, Chiều & Tối), tiến độ hoàn thành ca và các ngày sắp tới.
          </p>
        </div>

        {/* Quick batch tools */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => onBatchApply('morning_evening')}
            id="btn-schedule-batch-se"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-800/60 rounded-xl transition-all shadow-xs"
            title="Điền ca Sáng + Tối cho các ngày T2 - T7 cả tháng"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Điền nhanh ca gãy (Sáng+Tối) cả tháng</span>
          </button>
        </div>
      </div>

      {/* Quick Check-in Bar for Today */}
      <QuickCheckInBar
        todayStr={currentDateStr}
        todayAttendance={todayAttendance}
        onUpdateDay={onUpdateDay}
        config={config}
      />

      {/* 4 Shift Distribution Cards (2 ca/ngày breakdown) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Ca Gãy (2 ca/ngày) */}
        <div className="bg-[#111827] rounded-2xl p-4 border border-indigo-900/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Ca Gãy (≥2 ca/ngày)
            </span>
            <span className="w-6 h-6 rounded-lg bg-indigo-950/80 text-indigo-400 flex items-center justify-center text-xs font-bold">
              {splitShiftDays.length}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">{splitShiftDays.length} ngày</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              = {(splitShiftDays.length * 2)} ca chuẩn ({splitShiftDays.length} công)
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
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
        <div className="bg-[#111827] rounded-2xl p-4 border border-amber-900/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Ca Sáng ({config.hoursPerShift.morning}h)
            </span>
            <span className="w-6 h-6 rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center text-xs font-bold">
              {summary.projectedMorningCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-300 font-mono">
              {summary.projectedMorningCount} ca
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tổng giờ: {summary.projectedMorningCount * config.hoursPerShift.morning} giờ làm
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Đã hoàn thành:</span>
            <span className="font-semibold text-white">{summary.workedMorningCount} ca</span>
          </div>
        </div>

        {/* Card 3: Ca Chiều */}
        <div className="bg-[#111827] rounded-2xl p-4 border border-orange-900/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              Ca Chiều ({config.hoursPerShift.afternoon}h)
            </span>
            <span className="w-6 h-6 rounded-lg bg-orange-950/80 text-orange-400 flex items-center justify-center text-xs font-bold">
              {summary.projectedAfternoonCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-orange-300 font-mono">
              {summary.projectedAfternoonCount} ca
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tổng giờ: {summary.projectedAfternoonCount * config.hoursPerShift.afternoon} giờ làm
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Đã hoàn thành:</span>
            <span className="font-semibold text-white">{summary.workedAfternoonCount} ca</span>
          </div>
        </div>

        {/* Card 4: Ca Tối (Phụ cấp) */}
        <div className="bg-[#111827] rounded-2xl p-4 border border-indigo-900/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Ca Tối (x{config.eveningShiftMultiplier || 1.0})
            </span>
            <span className="w-6 h-6 rounded-lg bg-indigo-950/80 text-indigo-400 flex items-center justify-center text-xs font-bold">
              {summary.projectedEveningCount}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-300 font-mono">
              {summary.projectedEveningCount} ca
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tổng giờ: {summary.projectedEveningCount * config.hoursPerShift.evening} giờ làm
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
            <span>Đã hoàn thành:</span>
            <span className="font-semibold text-white">{summary.workedEveningCount} ca</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Calendar View */}
      <CalendarMonthView
        summary={summary}
        config={config}
        currentDateStr={currentDateStr}
        onUpdateDay={onUpdateDay}
        onOpenDayDetail={onOpenDayDetail}
      />

      {/* Schedule Highlights / Tips for Split Shifts */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-800/50">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-white">Quy chuẩn tính công ca gãy</p>
            <p className="text-slate-400 text-[11px]">
              Mỗi ngày làm 2 ca (VD: Sáng 8h-12h và Tối 18h-22h) = 1 ngày công chuẩn. Làm từ 2 ca/ngày sẽ được tự động cộng thêm phụ cấp tiền ăn ({formatVND(config.mealAllowancePerDayOrShift)}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
