import React, { useState } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  Coffee,
  DollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayAttendance, SalaryConfig } from '../types';
import { calculateDaySalary, formatVND } from '../utils/salaryCalculator';
import { getVietnamTodayStr } from '../utils/vietnamTime';

interface QuickCheckInBarProps {
  todayStr: string; // YYYY-MM-DD
  attendances: Record<string, DayAttendance>;
  onUpdateDay: (date: string, updates: Partial<DayAttendance>) => void;
  config: SalaryConfig;
}

export const QuickCheckInBar: React.FC<QuickCheckInBarProps> = ({
  todayStr,
  attendances,
  onUpdateDay,
  config,
}) => {
  // Allow user to toggle between Today, Tomorrow, Yesterday, or pick any date (e.g. 03/09)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const isSelectedToday = selectedDate === todayStr;
  
  // Safe date arithmetic without timezone shift
  const changeDateByOffset = (offsetDays: number) => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const targetDate = new Date(y, m - 1, d + offsetDays);
      const yStr = targetDate.getFullYear();
      const mStr = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(targetDate.getDate()).padStart(2, '0');
      setSelectedDate(`${yStr}-${mStr}-${dStr}`);
    } catch {
      // fallback
    }
  };

  // Dynamically look up the attendance record for the selected date
  const currentAttendance: DayAttendance = attendances[selectedDate] || {
    date: selectedDate,
    morning: false,
    afternoon: false,
    evening: false,
    overtimeHours: 0,
    dailyBonus: 0,
    dailyDeduction: 0,
    note: '',
  };

  const todaySalary = calculateDaySalary(currentAttendance, config, selectedDate);
  const shiftsPerStandard = config.standardShiftsPerDay || 2;
  const standardDays = Number((todaySalary.totalShifts / shiftsPerStandard).toFixed(1));

  // Determine active preset state
  const m = currentAttendance.morning;
  const a = currentAttendance.afternoon;
  const e = currentAttendance.evening;

  const isMorningNight = m && !a && e; // Sáng + Tối (1 công)
  const isMorningAfternoon = m && a && !e; // Sáng + Chiều (1 công)
  const isAfternoonNight = !m && a && e; // Chiều + Tối (1 công)
  const isOnlyMorning = m && !a && !e; // Chỉ Sáng (0.5 công)
  const isOnlyAfternoon = !m && a && !e; // Chỉ Chiều (0.5 công)
  const isOnlyEvening = !m && !a && e; // Chỉ Tối (0.5 công)
  const isAllThree = m && a && e; // 3 ca (1.5 công)
  const isDayOff = !m && !a && !e; // Nghỉ (0 công)

  const applyShiftPreset = (
    morningVal: boolean,
    afternoonVal: boolean,
    eveningVal: boolean,
    noteText: string
  ) => {
    onUpdateDay(selectedDate, {
      morning: morningVal,
      afternoon: afternoonVal,
      evening: eveningVal,
      note: noteText,
    });

    if (morningVal || afternoonVal || eveningVal) {
      try {
        confetti({
          particleCount: 20,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b'],
        });
      } catch {
        // Safe catch
      }
    }
  };

  // Helper strings for quick day navigation
  const getOffsetDateStr = (offsetDays: number) => {
    try {
      const [y, m, d] = todayStr.split('-').map(Number);
      const targetDate = new Date(y, m - 1, d + offsetDays);
      const yStr = targetDate.getFullYear();
      const mStr = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(targetDate.getDate()).padStart(2, '0');
      return `${yStr}-${mStr}-${dStr}`;
    } catch {
      return todayStr;
    }
  };

  const yesterdayStr = getOffsetDateStr(-1);
  const tomorrowStr = getOffsetDateStr(1);

  // Format date display (e.g. Thứ 4, 02/09/2026)
  const [selY, selM, selD] = selectedDate.split('-').map(Number);
  const dateObj = new Date(selY, selM - 1, selD);
  const weekdayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayName = weekdayNames[dateObj.getDay()] || 'Hôm nay';
  const dateFormatted = `${String(selD).padStart(2, '0')}/${String(selM).padStart(2, '0')}/${selY}`;

  return (
    <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-4">
      {/* Top Header Row: Date selector & Status summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">
                Chấm Công Nhanh: <span className="text-indigo-300">{dayName} ({dateFormatted})</span>
              </h3>
              
              {/* Quick Date Chips */}
              <div className="inline-flex items-center gap-1.5 ml-1">
                <button
                  onClick={() => setSelectedDate(yesterdayStr)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    selectedDate === yesterdayStr
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  Hôm qua
                </button>
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    selectedDate === todayStr
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  onClick={() => setSelectedDate(tomorrowStr)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    selectedDate === tomorrowStr
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  Ngày mai
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn nhanh ca làm việc. Đơn giá chuẩn 10 triệu / 28 ngày công (2 ca = 1 công = 357.143 ₫, không tăng ca).
            </p>
          </div>
        </div>

        {/* Date Navigation and Earnings summary */}
        <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
          {/* Shift change date arrows */}
          <div className="flex items-center bg-[#0F172A] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => changeDateByOffset(-1)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 px-2 py-0.5 font-mono focus:outline-hidden cursor-pointer"
            />
            <button
              onClick={() => changeDateByOffset(1)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Ngày sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0F172A] border border-slate-800">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Công ngày:</div>
              <div className="text-xs font-bold text-indigo-300">
                {standardDays} công ({todaySalary.totalShifts} ca)
              </div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Thu nhập:</div>
              <div className="text-xs font-bold font-mono text-emerald-400">
                {formatVND(todaySalary.totalDayEarnings)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Shift Selection Area (Organized into 2-shift and 1-shift groups) */}
      <div className="space-y-3">
        {/* Section 1: Làm 2 ca (1 công chuẩn = 357.143 ₫) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Làm 2 ca / ngày (Đủ 1 công chuẩn • {formatVND(10000000 / (config.standardDaysInMonth || 28))})</span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Phổ biến nhất: Sáng + Tối</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Sáng + Tối */}
            <button
              onClick={() => applyShiftPreset(true, false, true, 'Ca gãy: Sáng + Tối (1 công)')}
              id="btn-shift-morning-evening"
              className={`p-3 rounded-xl border text-left transition-all relative flex items-center justify-between ${
                isMorningNight
                  ? 'bg-indigo-600/90 text-white border-indigo-400 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-400'
                  : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isMorningNight ? 'bg-indigo-700' : 'bg-slate-800'}`}>
                  <div className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] text-slate-400">+</span>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>Sáng & Tối</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-200 border border-indigo-700/50">
                      Ca gãy
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">1 công chuẩn • 2 ca</div>
                </div>
              </div>
              {isMorningNight && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
            </button>

            {/* 2. Sáng + Chiều */}
            <button
              onClick={() => applyShiftPreset(true, true, false, 'Ca liền: Sáng + Chiều (1 công)')}
              id="btn-shift-morning-afternoon"
              className={`p-3 rounded-xl border text-left transition-all relative flex items-center justify-between ${
                isMorningAfternoon
                  ? 'bg-indigo-600/90 text-white border-indigo-400 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-400'
                  : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isMorningAfternoon ? 'bg-indigo-700' : 'bg-slate-800'}`}>
                  <div className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] text-slate-400">+</span>
                    <Sunset className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>Sáng & Chiều</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-200 border border-indigo-700/50">
                      Ca ngày
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">1 công chuẩn • 2 ca</div>
                </div>
              </div>
              {isMorningAfternoon && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
            </button>

            {/* 3. Chiều + Tối */}
            <button
              onClick={() => applyShiftPreset(false, true, true, 'Ca chiều đêm: Chiều + Tối (1 công)')}
              id="btn-shift-afternoon-evening"
              className={`p-3 rounded-xl border text-left transition-all relative flex items-center justify-between ${
                isAfternoonNight
                  ? 'bg-indigo-600/90 text-white border-indigo-400 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-400'
                  : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${isAfternoonNight ? 'bg-indigo-700' : 'bg-slate-800'}`}>
                  <div className="flex items-center gap-1">
                    <Sunset className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-[10px] text-slate-400">+</span>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>Chiều & Tối</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950/80 text-indigo-200 border border-indigo-700/50">
                      Chiều đêm
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">1 công chuẩn • 2 ca</div>
                </div>
              </div>
              {isAfternoonNight && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
            </button>
          </div>
        </div>

        {/* Section 2: Làm 1 ca & Tùy chọn khác */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Sun className="w-3.5 h-3.5 text-indigo-400" />
              <span>Làm 1 ca đơn lẻ (0.5 công / nửa ngày • {formatVND(10000000 / ((config.standardDaysInMonth || 28) * 2))}) hoặc Nghỉ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* Chỉ Sáng */}
            <button
              onClick={() => applyShiftPreset(true, false, false, 'Chỉ làm ca Sáng (0.5 công)')}
              id="btn-shift-only-morning"
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isOnlyMorning
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm shadow-amber-600/20'
                  : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs font-bold">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Chỉ Sáng</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">0.5 công</div>
            </button>

            {/* Chỉ Chiều */}
            <button
              onClick={() => applyShiftPreset(false, true, false, 'Chỉ làm ca Chiều (0.5 công)')}
              id="btn-shift-only-afternoon"
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isOnlyAfternoon
                  ? 'bg-orange-600 text-white border-orange-400 shadow-sm shadow-orange-600/20'
                  : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs font-bold">
                <Sunset className="w-3.5 h-3.5 text-orange-400" />
                <span>Chỉ Chiều</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">0.5 công</div>
            </button>

            {/* Chỉ Tối */}
            <button
              onClick={() => applyShiftPreset(false, false, true, 'Chỉ làm ca Tối (0.5 công)')}
              id="btn-shift-only-evening"
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isOnlyEvening
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-600/20'
                  : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs font-bold">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chỉ Tối</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">0.5 công</div>
            </button>

            {/* Cả 3 ca */}
            <button
              onClick={() => applyShiftPreset(true, true, true, 'Làm cả 3 ca (1.5 công)')}
              id="btn-shift-all-three"
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isAllThree
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm shadow-emerald-600/20'
                  : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs font-bold">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cả 3 ca</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">1.5 công</div>
            </button>

            {/* Nghỉ */}
            <button
              onClick={() => applyShiftPreset(false, false, false, 'Nghỉ')}
              id="btn-shift-day-off"
              className={`p-2.5 rounded-xl border text-center transition-all col-span-2 sm:col-span-1 ${
                isDayOff
                  ? 'bg-rose-950/70 text-rose-300 border-rose-800/80 ring-1 ring-rose-700/50'
                  : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-xs font-bold">
                <Coffee className="w-3.5 h-3.5 text-rose-400" />
                <span>Nghỉ</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">0 công</div>
            </button>
          </div>
        </div>

        {/* Section 3: Tinh chỉnh linh hoạt (Toggle ca riêng & Giờ OT & Ghi chú) */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 text-xs">Bật/Tắt ca tự do:</span>
            <button
              onClick={() => onUpdateDay(selectedDate, { morning: !m })}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                m
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Sáng {m ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => onUpdateDay(selectedDate, { afternoon: !a })}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                a
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                  : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              <span>Chiều {a ? '✓' : ''}</span>
            </button>

            <button
              onClick={() => onUpdateDay(selectedDate, { evening: !e })}
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                e
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tối {e ? '✓' : ''}</span>
            </button>
          </div>

          {/* Fixed shift notice */}
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>3 Ca cố định (Sáng - Chiều - Tối)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
