import React, { useState } from 'react';
import {
  X,
  Sun,
  Sunset,
  Moon,
  Clock,
  Utensils,
  Sparkles,
  AlertCircle,
  Save,
  Check,
  Zap,
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
  const [isHoliday, setIsHoliday] = useState(day.isHoliday || false);
  const [holidayMultiplier, setHolidayMultiplier] = useState(day.holidayMultiplier || 2.0);
  const [note, setNote] = useState(day.note || '');

  // Calculate live shift count and standard days
  let activeShifts = 0;
  if (morning) activeShifts++;
  if (afternoon) activeShifts++;
  if (evening) activeShifts++;

  const shiftsPerStandard = config.standardShiftsPerDay || 2;
  const calculatedStandardDays = Number((activeShifts / shiftsPerStandard).toFixed(1));

  const handleSave = () => {
    onSave(day.date, {
      morning,
      afternoon,
      evening,
      overtimeHours,
      dailyBonus,
      dailyDeduction,
      isHoliday,
      holidayMultiplier,
      note,
    });
    onClose();
  };

  const setSplitShift = (preset: 'morning_evening' | 'morning_afternoon' | 'afternoon_evening' | 'only_morning' | 'only_evening' | 'all' | 'off') => {
    if (preset === 'morning_evening') {
      setMorning(true);
      setAfternoon(false);
      setEvening(true);
      setNote('Ca gãy: Sáng + Đêm (1 công chuẩn)');
    } else if (preset === 'morning_afternoon') {
      setMorning(true);
      setAfternoon(true);
      setEvening(false);
      setNote('Ca liền: Sáng + Chiều (1 công chuẩn)');
    } else if (preset === 'afternoon_evening') {
      setMorning(false);
      setAfternoon(true);
      setEvening(true);
      setNote('Ca gãy: Chiều + Đêm (1 công chuẩn)');
    } else if (preset === 'only_morning') {
      setMorning(true);
      setAfternoon(false);
      setEvening(false);
      setNote('Chạy ca sáng (0.5 công / nửa công)');
    } else if (preset === 'only_evening') {
      setMorning(false);
      setAfternoon(false);
      setEvening(true);
      setNote('Chạy ca đêm (0.5 công / nửa công)');
    } else if (preset === 'all') {
      setMorning(true);
      setAfternoon(true);
      setEvening(true);
      setNote('Làm cả 3 ca (1.5 công)');
    } else {
      setMorning(false);
      setAfternoon(false);
      setEvening(false);
      setNote('Nghỉ (0 công)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#111827] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-[#E2E8F0]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Chấm công ngày {day.date.split('-').reverse().join('/')}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                {calculatedStandardDays} công ({activeShifts} ca)
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
          {/* Work formula hint box */}
          <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-200">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Quy đổi công: <strong>1 ca = 0.5 công</strong> (nửa công) • <strong>2 ca = 1.0 công chuẩn</strong>
              </span>
            </div>
            <span className="font-mono font-bold text-amber-300">
              {calculatedStandardDays} công
            </span>
          </div>

          {/* Quick Presets for Driver & Shift Workers */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Chọn nhanh mẫu ca làm
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSplitShift('morning_evening')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  morning && !afternoon && evening
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                ☀️🌙 Sáng + Đêm
                <span className="block text-[10px] opacity-80 font-bold mt-0.5">1.0 công chuẩn</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitShift('only_morning')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  morning && !afternoon && !evening
                    ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                ☀️ Chạy Sáng
                <span className="block text-[10px] opacity-80 font-bold mt-0.5">0.5 công (nửa)</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitShift('only_evening')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  !morning && !afternoon && evening
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                🌙 Chạy Đêm
                <span className="block text-[10px] opacity-80 font-bold mt-0.5">0.5 công (nửa)</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitShift('morning_afternoon')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  morning && afternoon && !evening
                    ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                ☀️🌤️ Sáng + Chiều
                <span className="block text-[10px] opacity-80 font-bold mt-0.5">1.0 công chuẩn</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitShift('all')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  morning && afternoon && evening
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                ☀️🌤️🌙 Cả 3 ca
                <span className="block text-[10px] opacity-80 font-bold mt-0.5">1.5 công</span>
              </button>

              <button
                type="button"
                onClick={() => setSplitShift('off')}
                className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                  !morning && !afternoon && !evening
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                🌴 Nghỉ làm
                <span className="block text-[10px] opacity-80 font-bold mt-0.5">0 công</span>
              </button>
            </div>
          </div>

          {/* 3 Shifts Switches */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Từng ca chi tiết (1 ca = 0.5 công)
            </label>
            
            {/* Ca sáng */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-amber-900/40 bg-amber-950/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-900/50 text-amber-300 flex items-center justify-center border border-amber-800/50">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-200">Ca Sáng (0.5 công)</p>
                  <p className="text-[11px] text-slate-400">{config.hoursPerShift.morning} giờ làm</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={morning}
                onChange={(e) => setMorning(e.target.checked)}
                className="w-5 h-5 text-amber-500 bg-slate-900 rounded border-slate-700 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            {/* Ca chiều */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-orange-900/40 bg-orange-950/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-900/50 text-orange-300 flex items-center justify-center border border-orange-800/50">
                  <Sunset className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-200">Ca Chiều (0.5 công)</p>
                  <p className="text-[11px] text-slate-400">{config.hoursPerShift.afternoon} giờ làm</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={afternoon}
                onChange={(e) => setAfternoon(e.target.checked)}
                className="w-5 h-5 text-orange-500 bg-slate-900 rounded border-slate-700 focus:ring-orange-500 cursor-pointer"
              />
            </div>

            {/* Ca tối / Đêm */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-900/40 bg-indigo-950/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-900/50 text-indigo-300 flex items-center justify-center border border-indigo-800/50">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-200">Ca Đêm / Tối (0.5 công)</p>
                  <p className="text-[11px] text-slate-400">
                    {config.hoursPerShift.evening} giờ làm
                    {config.eveningShiftMultiplier > 1 && (
                      <span className="text-indigo-400 font-semibold ml-1">
                        (Hệ số x{config.eveningShiftMultiplier})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={evening}
                onChange={(e) => setEvening(e.target.checked)}
                className="w-5 h-5 text-indigo-500 bg-slate-900 rounded border-slate-700 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Overtime & Holiday */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Giờ tăng ca ngoài ca (OT)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono bg-[#0F172A] text-white"
                  placeholder="0.0"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">giờ</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Thưởng nóng / Tip ngày
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="10000"
                  value={dailyBonus}
                  onChange={(e) => setDailyBonus(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono bg-[#0F172A] text-white"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">đ</span>
              </div>
            </div>
          </div>

          {/* Holiday Toggle */}
          <div className="p-3 rounded-xl border border-slate-800 bg-[#0F172A] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-200">Ngày Lễ / Tết (Hệ số đặc biệt)</p>
              <p className="text-[11px] text-slate-400">Nhân hệ số lương ngày lễ x2 hoặc x3</p>
            </div>
            <div className="flex items-center gap-2">
              {isHoliday && (
                <select
                  value={holidayMultiplier}
                  onChange={(e) => setHolidayMultiplier(parseFloat(e.target.value))}
                  className="text-xs bg-slate-800 text-white rounded-lg border border-slate-700 px-2 py-1"
                >
                  <option value={1.5}>x1.5</option>
                  <option value={2.0}>x2.0</option>
                  <option value={3.0}>x3.0</option>
                </select>
              )}
              <input
                type="checkbox"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="w-5 h-5 text-indigo-500 bg-slate-900 rounded border-slate-700 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Ghi chú công việc trong ngày
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Chạy xe ca đêm, chuyến khách xa, tăng ca..."
              className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 bg-[#0F172A] text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Chấm Công</span>
          </button>
        </div>
      </div>
    </div>
  );
};
