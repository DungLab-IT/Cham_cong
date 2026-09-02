import React, { useState } from 'react';
import {
  X,
  Sun,
  Sunset,
  Moon,
  Clock,
  Save,
  Check,
  Zap,
  Coffee,
  Layers,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { DaySalaryDetail, SalaryConfig, DayAttendance } from '../types';
import { formatVND } from '../utils/salaryCalculator';

interface DayEditModalProps {
  dayDetail: DaySalaryDetail | null;
  config: SalaryConfig;
  onClose: () => void;
  onSave: (date: string, updates: Partial<DayAttendance>) => void;
}

export const DayEditModal: React.FC<DayEditModalProps> = ({
  dayDetail,
  config,
  onClose,
  onSave,
}) => {
  if (!dayDetail) return null;

  const day = dayDetail.dayAttendance;
  const [morning, setMorning] = useState(day.morning);
  const [afternoon, setAfternoon] = useState(day.afternoon);
  const [evening, setEvening] = useState(day.evening);
  const [overtimeHours, setOvertimeHours] = useState(day.overtimeHours || 0);
  const [dailyBonus, setDailyBonus] = useState(day.dailyBonus || 0);
  const [dailyDeduction, setDailyDeduction] = useState(day.dailyDeduction || 0);
  const [note, setNote] = useState(day.note || '');

  // Live count
  let activeShifts = 0;
  if (morning) activeShifts++;
  if (afternoon) activeShifts++;
  if (evening) activeShifts++;

  const shiftsPerStandard = config.standardShiftsPerDay || 2;
  const standardDays = Number((activeShifts / shiftsPerStandard).toFixed(1));

  // Shift rate calculation
  const shiftRate = Math.round(config.baseSalary / ((config.standardDaysInMonth || 26) * 2));
  const otRate = config.overtimeRatePerHour || 48077;
  const calculatedDayEarnings =
    activeShifts * shiftRate + overtimeHours * otRate + dailyBonus - dailyDeduction;

  const handleSave = () => {
    onSave(day.date, {
      morning,
      afternoon,
      evening,
      overtimeHours,
      dailyBonus,
      dailyDeduction,
      note,
    });
    onClose();
  };

  const applyPreset = (mVal: boolean, aVal: boolean, eVal: boolean, noteVal: string) => {
    setMorning(mVal);
    setAfternoon(aVal);
    setEvening(eVal);
    setNote(noteVal);
  };

  const isMorningNight = morning && !afternoon && evening;
  const isMorningAfternoon = morning && afternoon && !evening;
  const isAfternoonNight = !morning && afternoon && evening;
  const isOnlyMorning = morning && !afternoon && !evening;
  const isOnlyAfternoon = !morning && afternoon && !evening;
  const isOnlyEvening = !morning && !afternoon && evening;
  const isAllThree = morning && afternoon && evening;
  const isDayOff = !morning && !afternoon && !evening;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#111827] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Chấm Công: Ngày {day.date.split('-').reverse().join('/')}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                {standardDays} công ({activeShifts} ca)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{dayDetail.dayOfWeek}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Select: 2 Ca (1 công) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Chọn nhanh 2 ca làm việc (1.0 công chuẩn)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset(true, false, true, 'Ca gãy: Sáng + Tối (1 công)')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  isMorningNight
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                    : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">Sáng + Tối</div>
                <div className="text-[10px] opacity-75 mt-0.5">Ca gãy • 1 công</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(true, true, false, 'Ca liền: Sáng + Chiều (1 công)')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  isMorningAfternoon
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                    : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">Sáng + Chiều</div>
                <div className="text-[10px] opacity-75 mt-0.5">Ca ngày • 1 công</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(false, true, true, 'Ca chiều tối: Chiều + Tối (1 công)')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  isAfternoonNight
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                    : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">Chiều + Tối</div>
                <div className="text-[10px] opacity-75 mt-0.5">Chiều tối • 1 công</div>
              </button>
            </div>
          </div>

          {/* Quick Select: 1 Ca (0.5 công) & Khác */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-indigo-400" />
              <span>Chọn 1 ca đơn lẻ (0.5 công) hoặc Tùy chọn khác</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset(true, false, false, 'Chỉ làm ca Sáng (0.5 công)')}
                className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                  isOnlyMorning
                    ? 'bg-amber-600 text-white border-amber-400'
                    : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>Chỉ Sáng</div>
                <div className="text-[10px] opacity-75">0.5 công</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(false, true, false, 'Chỉ làm ca Chiều (0.5 công)')}
                className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                  isOnlyAfternoon
                    ? 'bg-orange-600 text-white border-orange-400'
                    : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>Chỉ Chiều</div>
                <div className="text-[10px] opacity-75">0.5 công</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(false, false, true, 'Chỉ làm ca Tối (0.5 công)')}
                className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                  isOnlyEvening
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>Chỉ Tối</div>
                <div className="text-[10px] opacity-75">0.5 công</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(true, true, true, 'Làm cả 3 ca (1.5 công)')}
                className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                  isAllThree
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>Cả 3 ca</div>
                <div className="text-[10px] opacity-75">1.5 công</div>
              </button>

              <button
                type="button"
                onClick={() => applyPreset(false, false, false, 'Nghỉ')}
                className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                  isDayOff
                    ? 'bg-rose-950/70 text-rose-300 border-rose-800'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>Nghỉ</div>
                <div className="text-[10px] opacity-75">0 công</div>
              </button>
            </div>
          </div>

          {/* Individual Shift Switches */}
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <span className="text-xs font-semibold text-slate-400">Tùy chọn từng ca:</span>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={morning}
                  onChange={(e) => setMorning(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium text-slate-300">Ca Sáng</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={afternoon}
                  onChange={(e) => setAfternoon(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <Sunset className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium text-slate-300">Ca Chiều</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={evening}
                  onChange={(e) => setEvening(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-medium text-slate-300">Ca Tối</span>
              </label>
            </div>
          </div>

          {/* OT and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tăng ca OT ngoài ca (giờ)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="16"
                  step="0.5"
                  value={overtimeHours || ''}
                  placeholder="0"
                  onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">giờ</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Ghi chú ngày
              </label>
              <input
                type="text"
                value={note}
                placeholder="VD: Đổi ca, làm bù..."
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Earnings summary preview */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-300">Thu nhập dự tính ngày này:</span>
            <span className="font-bold text-base text-emerald-400 font-mono">
              {formatVND(calculatedDayEarnings)}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0F172A] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Chấm Công</span>
          </button>
        </div>
      </div>
    </div>
  );
};
