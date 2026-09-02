import React from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayAttendance, SalaryConfig } from '../types';
import { calculateDaySalary, formatVND } from '../utils/salaryCalculator';

interface QuickCheckInBarProps {
  todayStr: string; // YYYY-MM-DD
  todayAttendance: DayAttendance | undefined;
  onUpdateDay: (date: string, updates: Partial<DayAttendance>) => void;
  config: SalaryConfig;
}

export const QuickCheckInBar: React.FC<QuickCheckInBarProps> = ({
  todayStr,
  todayAttendance,
  onUpdateDay,
  config,
}) => {
  const currentAttendance: DayAttendance = todayAttendance || {
    date: todayStr,
    morning: false,
    afternoon: false,
    evening: false,
    overtimeHours: 0,
    dailyBonus: 0,
    dailyDeduction: 0,
    note: '',
  };

  const todaySalary = calculateDaySalary(currentAttendance, config, todayStr);
  const shiftsPerStandard = config.standardShiftsPerDay || 2;
  const todayStandardDays = Number((todaySalary.totalShifts / shiftsPerStandard).toFixed(1));

  const applyPreset = (m: boolean, a: boolean, e: boolean, noteName?: string) => {
    onUpdateDay(todayStr, {
      morning: m,
      afternoon: a,
      evening: e,
      note: noteName || currentAttendance.note,
    });

    if (m || a || e) {
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b'],
        });
      } catch {
        // Ignore in restricted environments
      }
    }
  };

  const isMorningNight = currentAttendance.morning && !currentAttendance.afternoon && currentAttendance.evening;
  const isMorningAfternoon = currentAttendance.morning && currentAttendance.afternoon && !currentAttendance.evening;
  const isAfternoonNight = !currentAttendance.morning && currentAttendance.afternoon && currentAttendance.evening;
  const isOnlyMorning = currentAttendance.morning && !currentAttendance.afternoon && !currentAttendance.evening;
  const isOnlyEvening = !currentAttendance.morning && !currentAttendance.afternoon && currentAttendance.evening;
  const isOnlyAfternoon = !currentAttendance.morning && currentAttendance.afternoon && !currentAttendance.evening;
  const isAllThree = currentAttendance.morning && currentAttendance.afternoon && currentAttendance.evening;
  const isDayOff = !currentAttendance.morning && !currentAttendance.afternoon && !currentAttendance.evening;

  return (
    <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-800 mb-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Left header & Standard day formula explanation */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/50 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-800/50">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white">
                Chấm công hôm nay ({todayStr.split('-').reverse().join('/')})
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                Hôm nay
              </span>
              {todaySalary.totalShifts > 0 ? (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                  {todayStandardDays} công ({todaySalary.totalShifts} ca)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Chưa chấm công
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Đang chọn: <strong className="text-slate-200 font-semibold">{todaySalary.shiftNameDisplay}</strong></span>
              {todaySalary.totalDayEarnings > 0 && (
                <span className="text-emerald-400 font-medium"> • Thu nhập ngày: {formatVND(todaySalary.totalDayEarnings)}</span>
              )}
              <span className="text-amber-400/90 text-[11px] font-medium hidden md:inline">
                (Quy ước: 1 ca = 0.5 công, 2 ca = 1 công chuẩn)
              </span>
            </p>
          </div>
        </div>

        {/* Quick Shift Selection Presets for Driving / Split-shift */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset: Sáng + Tối (1 Công chuẩn) */}
          <button
            onClick={() => applyPreset(true, false, true, 'Ca gãy: Sáng + Đêm')}
            id="btn-preset-morning-evening"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border shadow-xs ${
              isMorningNight
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'bg-indigo-950/30 text-indigo-300 border-indigo-800/50 hover:bg-indigo-900/40'
            }`}
            title="Chạy xe 2 ca: Sáng + Đêm (Tính 1 công chuẩn)"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>+</span>
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sáng & Đêm</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-200 ml-1">1 công</span>
            {isMorningNight && <Check className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Preset: Chỉ chạy ca Sáng (0.5 Công) */}
          <button
            onClick={() => applyPreset(true, false, false, 'Chạy ca sáng (0.5 công)')}
            id="btn-preset-only-morning"
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-xs ${
              isOnlyMorning
                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20'
                : 'bg-amber-950/30 text-amber-300 border-amber-800/50 hover:bg-amber-900/40'
            }`}
            title="Chỉ chạy ca sáng (Tính nửa công - 0.5 công)"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Chạy Sáng</span>
            <span className="text-[10px] px-1 rounded bg-amber-900 text-amber-200">0.5 công</span>
            {isOnlyMorning && <Check className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Preset: Chỉ chạy ca Đêm / Tối (0.5 Công) */}
          <button
            onClick={() => applyPreset(false, false, true, 'Chạy ca đêm (0.5 công)')}
            id="btn-preset-only-evening"
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-xs ${
              isOnlyEvening
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800 text-indigo-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Chỉ chạy ca đêm / ca tối (Tính nửa công - 0.5 công)"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Chạy Đêm</span>
            <span className="text-[10px] px-1 rounded bg-slate-900 text-indigo-200">0.5 công</span>
            {isOnlyEvening && <Check className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Preset: Sáng + Chiều (1 Công) */}
          <button
            onClick={() => applyPreset(true, true, false, 'Ca liền: Sáng + Chiều')}
            id="btn-preset-morning-afternoon"
            className={`hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-xs ${
              isMorningAfternoon
                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Ca liền: Sáng + Chiều (1 công)"
          >
            <span>Sáng+Chiều</span>
            <span className="text-[10px] px-1 rounded bg-slate-900 text-slate-300">1 công</span>
          </button>

          {/* Preset: Cả 3 ca (1.5 Công) */}
          <button
            onClick={() => applyPreset(true, true, true, 'Làm cả 3 ca (1.5 công)')}
            id="btn-preset-all-shifts"
            className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isAllThree
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Làm cả 3 ca: Sáng, Chiều, Tối (1.5 công)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3 ca (1.5 công)</span>
          </button>

          {/* Individual Shift Toggles & Off day */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <button
              onClick={() => onUpdateDay(todayStr, { morning: !currentAttendance.morning })}
              id="btn-toggle-morning"
              className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                currentAttendance.morning
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="Bật/Tắt ca Sáng (0.5 công)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onUpdateDay(todayStr, { afternoon: !currentAttendance.afternoon })}
              id="btn-toggle-afternoon"
              className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                currentAttendance.afternoon
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="Bật/Tắt ca Chiều (0.5 công)"
            >
              <Sunset className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onUpdateDay(todayStr, { evening: !currentAttendance.evening })}
              id="btn-toggle-evening"
              className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                currentAttendance.evening
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="Bật/Tắt ca Đêm / Tối (0.5 công)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            {/* Off Day */}
            <button
              onClick={() => applyPreset(false, false, false, 'Nghỉ')}
              id="btn-preset-off"
              className={`px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                isDayOff
                  ? 'bg-rose-950/50 text-rose-300 border-rose-800/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="Đánh dấu ngày nghỉ (0 công)"
            >
              Nghỉ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
