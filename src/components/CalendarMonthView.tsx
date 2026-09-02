import React from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Plus,
  Info,
  Sparkles,
  Layers,
  Utensils,
  Zap,
} from 'lucide-react';
import { MonthSalarySummary, SalaryConfig, DayAttendance, DaySalaryDetail } from '../types';
import { formatVND } from '../utils/salaryCalculator';

interface CalendarMonthViewProps {
  summary: MonthSalarySummary;
  config: SalaryConfig;
  currentDateStr: string;
  onUpdateDay: (date: string, updates: Partial<DayAttendance>) => void;
  onOpenDayDetail: (day: DaySalaryDetail) => void;
}

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  summary,
  config,
  currentDateStr,
  onUpdateDay,
  onOpenDayDetail,
}) => {
  const [yearStr, monthStr] = summary.monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const shiftsPerStandard = config.standardShiftsPerDay || 2;

  // First day of month day-of-week (0 is Sun, 1 is Mon, ...)
  const firstDayObj = new Date(year, month - 1, 1);
  let firstDayIndex = firstDayObj.getDay(); // 0 = Sun, 1 = Mon ...
  // Convert so Mon is 0, Sun is 6
  let startingCol = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const cycleShift = (day: DaySalaryDetail) => {
    const { morning, afternoon, evening } = day.dayAttendance;
    // Cycle pattern:
    // None -> Sáng + Đêm (1 công) -> Chạy Sáng (0.5 công) -> Chạy Đêm (0.5 công) -> Sáng + Chiều (1 công) -> Cả 3 ca (1.5 công) -> Nghỉ
    if (!morning && !afternoon && !evening) {
      onUpdateDay(day.dayAttendance.date, { morning: true, afternoon: false, evening: true, note: 'Ca gãy: Sáng + Đêm (1 công)' });
    } else if (morning && !afternoon && evening) {
      onUpdateDay(day.dayAttendance.date, { morning: true, afternoon: false, evening: false, note: 'Chạy ca sáng (0.5 công)' });
    } else if (morning && !afternoon && !evening) {
      onUpdateDay(day.dayAttendance.date, { morning: false, afternoon: false, evening: true, note: 'Chạy ca đêm (0.5 công)' });
    } else if (!morning && !afternoon && evening) {
      onUpdateDay(day.dayAttendance.date, { morning: true, afternoon: true, evening: false, note: 'Ca liền: Sáng + Chiều (1 công)' });
    } else if (morning && afternoon && !evening) {
      onUpdateDay(day.dayAttendance.date, { morning: true, afternoon: true, evening: true, note: 'Cả 3 ca (1.5 công)' });
    } else {
      onUpdateDay(day.dayAttendance.date, { morning: false, afternoon: false, evening: false, note: '' });
    }
  };

  return (
    <div className="bg-[#111827] rounded-2xl shadow-xs border border-slate-800 overflow-hidden">
      {/* Calendar Header & Legend */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#111827] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              Lịch Làm Việc & Ca Gãy Tháng {month}/{year}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              {summary.projectedStandardDays} công chuẩn ({summary.projectedTotalShifts} ca)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bấm vào ô ngày để chuyển nhanh (Sáng+Đêm: 1 công ➔ Chạy Sáng: 0.5 công ➔ Chạy Đêm: 0.5 công ➔ 3 ca ➔ Nghỉ).
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/50">
            <Sun className="w-3 h-3 text-amber-400" /> Sáng (0.5 công)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/50">
            <Moon className="w-3 h-3 text-indigo-400" /> Đêm (0.5 công)
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/60 font-bold">
            <Zap className="w-3 h-3 text-purple-400" /> 2 ca = 1 công chuẩn
          </span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-[#0F172A] text-center text-xs font-bold text-slate-400 py-2.5">
        {WEEKDAYS.map((wd, index) => (
          <div key={wd} className={index === 6 ? 'text-rose-400' : ''}>
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-800 bg-slate-950/30">
        {/* Leading empty cells */}
        {Array.from({ length: startingCol }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[105px] sm:min-h-[125px] bg-[#0B0D11]/60 p-2 opacity-30" />
        ))}

        {/* Month Day Cells */}
        {summary.daysDetail.map((detail) => {
          const day = detail.dayAttendance;
          const isToday = detail.isToday;
          const isSunday = detail.dayOfWeek === 'Chủ Nhật';
          const hasWorked = detail.totalShifts > 0;
          const dayStandardDays = Number((detail.totalShifts / shiftsPerStandard).toFixed(1));

          return (
            <div
              key={day.date}
              className={`min-h-[105px] sm:min-h-[125px] p-2 flex flex-col justify-between transition-all group relative border-b border-r border-slate-800 ${
                isToday
                  ? 'bg-indigo-950/40 ring-2 ring-indigo-500/50 ring-inset z-10'
                  : hasWorked
                  ? 'bg-[#111827] hover:bg-slate-800/50'
                  : isSunday
                  ? 'bg-slate-900/40'
                  : 'bg-[#111827]/80 hover:bg-slate-800/40'
              }`}
            >
              {/* Day Top Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isSunday
                        ? 'text-rose-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {detail.dayNumber}
                  </span>
                  {day.isHoliday && (
                    <span className="text-[10px] font-bold text-rose-300 bg-rose-950/60 border border-rose-800/50 px-1 rounded">
                      Lễ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {hasWorked && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        detail.totalShifts >= 2
                          ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                      }`}
                    >
                      {dayStandardDays} công
                    </span>
                  )}
                  {/* Edit details button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDayDetail(detail);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-opacity"
                    title="Chỉnh sửa chi tiết"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Center: Shift badges */}
              <div
                onClick={() => cycleShift(detail)}
                className="my-1.5 cursor-pointer select-none flex-1 flex flex-col justify-center space-y-1"
                title="Bấm để đổi ca"
              >
                {hasWorked ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      {day.morning && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/50 text-amber-300 border border-amber-800/50">
                          <Sun className="w-2.5 h-2.5 text-amber-400" /> Sáng
                        </span>
                      )}
                      {day.afternoon && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-950/50 text-orange-300 border border-orange-800/50">
                          <Sunset className="w-2.5 h-2.5 text-orange-400" /> Chiều
                        </span>
                      )}
                      {day.evening && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/50 text-indigo-300 border border-indigo-800/50">
                          <Moon className="w-2.5 h-2.5 text-indigo-400" /> Đêm/Tối
                        </span>
                      )}
                    </div>

                    {detail.isSplitShift ? (
                      <div className="text-[10px] font-bold text-purple-300 flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 text-purple-400" />
                        <span>Ca gãy (1 công)</span>
                      </div>
                    ) : (
                      <div className="text-[10px] font-medium text-amber-400">
                        Nửa công (0.5)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600 italic text-center py-2 group-hover:text-slate-400">
                    + Chấm ca
                  </div>
                )}
              </div>

              {/* Day Bottom: Pay & OT */}
              <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                {detail.totalDayEarnings > 0 ? (
                  <span className="font-bold text-indigo-400 font-mono">
                    {formatVND(detail.totalDayEarnings)}
                  </span>
                ) : (
                  <span className="text-slate-500">Nghỉ</span>
                )}

                {day.overtimeHours > 0 && (
                  <span className="text-amber-400 font-medium text-[10px]">
                    +{day.overtimeHours}h OT
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
