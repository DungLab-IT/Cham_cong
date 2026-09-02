import React from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Plus,
  Info,
  Sparkles,
  Layers,
  Zap,
  Edit2,
  CheckCircle2,
  Coffee,
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
  let firstDayIndex = firstDayObj.getDay();
  let startingCol = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Seamless cycle through the standard shift combinations requested by the user:
  // 1. Sáng + Tối (1 công)
  // 2. Sáng + Chiều (1 công)
  // 3. Chiều + Tối (1 công)
  // 4. Chỉ Sáng (0.5 công)
  // 5. Chỉ Chiều (0.5 công)
  // 6. Chỉ Tối (0.5 công)
  // 7. Cả 3 ca (1.5 công)
  // 8. Nghỉ (0 công)
  const cycleShift = (day: DaySalaryDetail) => {
    const { morning, afternoon, evening } = day.dayAttendance;

    if (!morning && !afternoon && !evening) {
      // 1. Sáng + Tối
      onUpdateDay(day.dayAttendance.date, {
        morning: true,
        afternoon: false,
        evening: true,
        note: 'Ca gãy: Sáng + Tối (1 công)',
      });
    } else if (morning && !afternoon && evening) {
      // 2. Sáng + Chiều
      onUpdateDay(day.dayAttendance.date, {
        morning: true,
        afternoon: true,
        evening: false,
        note: 'Ca liền: Sáng + Chiều (1 công)',
      });
    } else if (morning && afternoon && !evening) {
      // 3. Chiều + Tối
      onUpdateDay(day.dayAttendance.date, {
        morning: false,
        afternoon: true,
        evening: true,
        note: 'Ca chiều tối: Chiều + Tối (1 công)',
      });
    } else if (!morning && afternoon && evening) {
      // 4. Chỉ Sáng
      onUpdateDay(day.dayAttendance.date, {
        morning: true,
        afternoon: false,
        evening: false,
        note: 'Chỉ làm ca Sáng (0.5 công)',
      });
    } else if (morning && !afternoon && !evening) {
      // 5. Chỉ Chiều
      onUpdateDay(day.dayAttendance.date, {
        morning: false,
        afternoon: true,
        evening: false,
        note: 'Chỉ làm ca Chiều (0.5 công)',
      });
    } else if (!morning && afternoon && !evening) {
      // 6. Chỉ Tối
      onUpdateDay(day.dayAttendance.date, {
        morning: false,
        afternoon: false,
        evening: true,
        note: 'Chỉ làm ca Tối (0.5 công)',
      });
    } else if (!morning && !afternoon && evening) {
      // 7. Cả 3 ca
      onUpdateDay(day.dayAttendance.date, {
        morning: true,
        afternoon: true,
        evening: true,
        note: 'Làm cả 3 ca (1.5 công)',
      });
    } else {
      // 8. Nghỉ
      onUpdateDay(day.dayAttendance.date, {
        morning: false,
        afternoon: false,
        evening: false,
        note: '',
      });
    }
  };

  return (
    <div className="bg-[#111827] rounded-2xl shadow-xs border border-slate-800 overflow-hidden">
      {/* Calendar Header & Legend */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#111827] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              Lịch Chấm Công Tháng {month}/{year}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
              {summary.projectedStandardDays} công ({summary.projectedTotalShifts} ca)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bấm nhanh vào ô ngày để chuyển đổi ca (Sáng+Tối ➔ Sáng+Chiều ➔ Chiều+Tối ➔ Chỉ Sáng ➔ Chỉ Chiều ➔ Chỉ Tối ➔ 3 ca ➔ Nghỉ).
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 font-medium">
            <Zap className="w-3 h-3 text-indigo-400" /> 2 ca = 1.0 công
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            <Sun className="w-3 h-3 text-amber-400" /> 1 ca = 0.5 công
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-medium">
            <Layers className="w-3 h-3 text-emerald-400" /> 3 ca = 1.5 công
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
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-800 bg-slate-950/20">
        {/* Leading empty cells */}
        {Array.from({ length: startingCol }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[105px] sm:min-h-[125px] bg-[#0B0F17]/60 p-2 opacity-30" />
        ))}

        {/* Month Day Cells */}
        {summary.daysDetail.map((detail) => {
          const day = detail.dayAttendance;
          const isToday = detail.isToday;
          const isSunday = detail.dayOfWeek === 'Chủ Nhật';
          const hasWorked = detail.totalShifts > 0;
          const dayStandardDays = Number((detail.totalShifts / shiftsPerStandard).toFixed(1));

          const m = day.morning;
          const a = day.afternoon;
          const e = day.evening;

          // Shift Label Description
          let shiftLabel = 'Nghỉ';
          let shiftBadgeStyle = 'text-slate-500 bg-slate-900/50 border-slate-800';

          if (m && !a && e) {
            shiftLabel = 'Sáng + Tối';
            shiftBadgeStyle = 'text-indigo-300 bg-indigo-950/80 border-indigo-800/60 font-semibold';
          } else if (m && a && !e) {
            shiftLabel = 'Sáng + Chiều';
            shiftBadgeStyle = 'text-indigo-300 bg-indigo-950/80 border-indigo-800/60 font-semibold';
          } else if (!m && a && e) {
            shiftLabel = 'Chiều + Tối';
            shiftBadgeStyle = 'text-indigo-300 bg-indigo-950/80 border-indigo-800/60 font-semibold';
          } else if (m && a && e) {
            shiftLabel = 'Cả 3 ca';
            shiftBadgeStyle = 'text-emerald-300 bg-emerald-950/80 border-emerald-800/60 font-bold';
          } else if (m && !a && !e) {
            shiftLabel = 'Chỉ Sáng';
            shiftBadgeStyle = 'text-amber-300 bg-amber-950/60 border-amber-800/50';
          } else if (!m && a && !e) {
            shiftLabel = 'Chỉ Chiều';
            shiftBadgeStyle = 'text-orange-300 bg-orange-950/60 border-orange-800/50';
          } else if (!m && !a && e) {
            shiftLabel = 'Chỉ Tối';
            shiftBadgeStyle = 'text-indigo-300 bg-indigo-950/60 border-indigo-800/50';
          }

          return (
            <div
              key={day.date}
              className={`min-h-[105px] sm:min-h-[125px] p-2 flex flex-col justify-between transition-all group relative border-b border-r border-slate-800 ${
                isToday
                  ? 'bg-indigo-950/30 ring-2 ring-indigo-500/60 ring-inset z-10'
                  : hasWorked
                  ? 'bg-[#111827] hover:bg-slate-800/40'
                  : isSunday
                  ? 'bg-slate-900/30 hover:bg-slate-850'
                  : 'bg-[#111827]/80 hover:bg-slate-800/30'
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
                        ? 'text-rose-400 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    {detail.dayOfMonth}
                  </span>
                  {isToday && (
                    <span className="hidden sm:inline text-[9px] px-1 rounded bg-indigo-900 text-indigo-200">
                      Nay
                    </span>
                  )}
                </div>

                {/* Edit details pencil button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDayDetail(detail);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all"
                  title="Chỉnh sửa chi tiết (OT, ghi chú)"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>

              {/* Day Body: Clickable to Cycle Shift */}
              <div
                onClick={() => cycleShift(detail)}
                className="my-1.5 cursor-pointer select-none space-y-1"
                title="Bấm để chuyển ca"
              >
                {/* Shift Label Badge */}
                <div className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md border text-center truncate ${shiftBadgeStyle}`}>
                  {shiftLabel}
                </div>

                {/* Shift Icons Indicator */}
                <div className="flex items-center justify-center gap-1 text-[10px]">
                  {m && (
                    <span className="p-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40" title="Ca Sáng">
                      <Sun className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {a && (
                    <span className="p-0.5 rounded bg-orange-950/60 text-orange-400 border border-orange-800/40" title="Ca Chiều">
                      <Sunset className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {e && (
                    <span className="p-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/40" title="Ca Tối">
                      <Moon className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {!hasWorked && (
                    <span className="text-slate-600 text-[10px]">-</span>
                  )}
                </div>

                {/* Overtime indicator if present */}
                {(day.overtimeHours || 0) > 0 && (
                  <div className="text-[10px] text-center font-semibold text-amber-400 bg-amber-950/40 rounded px-1 border border-amber-900/40">
                    +{day.overtimeHours}h OT
                  </div>
                )}
              </div>

              {/* Day Bottom: Công & Thu nhập ngày */}
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60 text-slate-400">
                <span>{hasWorked ? `${dayStandardDays} công` : '0 công'}</span>
                <span className={`font-mono font-medium ${hasWorked ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {hasWorked ? formatVND(detail.totalDayEarnings) : '0 ₫'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
