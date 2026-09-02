import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { DayAttendance, SalaryConfig } from '../types';
import { formatVietnamMonth, getVietnamCurrentMonthKey } from '../utils/vietnamTime';
import { formatVND } from '../utils/salaryCalculator';

interface MonthSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonthKey: string; // YYYY-MM
  onSelectMonth: (monthKey: string) => void;
  attendances: Record<string, DayAttendance>;
  config?: SalaryConfig;
}

export const MonthSelectorModal: React.FC<MonthSelectorModalProps> = ({
  isOpen,
  onClose,
  currentMonthKey,
  onSelectMonth,
  attendances,
  config,
}) => {
  const currentVNMonthKey = getVietnamCurrentMonthKey();
  const [currentSelectedYear, currentSelectedMonth] = currentMonthKey.split('-').map(Number);
  const [currentVNYear, currentVNMonth] = currentVNMonthKey.split('-').map(Number);

  // Year state inside the modal
  const [viewYear, setViewYear] = useState<number>(currentSelectedYear || currentVNYear);

  // Compute stats for each month in the selected year (Months 1 to 12)
  const monthsStats = useMemo(() => {
    const shiftsPerStandardDay = config?.standardShiftsPerDay || 2;
    const stats: Record<
      number,
      {
        monthKey: string;
        totalShifts: number;
        standardDays: number;
        workedDays: number;
        hasData: boolean;
        isCurrentVNMonth: boolean;
        isSelected: boolean;
      }
    > = {};

    for (let m = 1; m <= 12; m++) {
      const monthStr = String(m).padStart(2, '0');
      const mKey = `${viewYear}-${monthStr}`;

      let totalShifts = 0;
      let workedDays = 0;

      // Scan all days in this month
      const totalDays = new Date(viewYear, m, 0).getDate();
      for (let d = 1; d <= totalDays; d++) {
        const dayStr = String(d).padStart(2, '0');
        const dateKey = `${mKey}-${dayStr}`;
        const att = attendances[dateKey];
        if (att) {
          let dayShifts = 0;
          if (att.morning) dayShifts++;
          if (att.afternoon) dayShifts++;
          if (att.evening) dayShifts++;

          if (dayShifts > 0 || (att.overtimeHours || 0) > 0) {
            workedDays++;
          }
          totalShifts += dayShifts;
        }
      }

      const standardDays = Number((totalShifts / shiftsPerStandardDay).toFixed(1));

      stats[m] = {
        monthKey: mKey,
        totalShifts,
        standardDays,
        workedDays,
        hasData: totalShifts > 0,
        isCurrentVNMonth: mKey === currentVNMonthKey,
        isSelected: mKey === currentMonthKey,
      };
    }

    return stats;
  }, [viewYear, attendances, config?.standardShiftsPerDay, currentVNMonthKey, currentMonthKey]);

  if (!isOpen) return null;

  const handlePickMonth = (m: number) => {
    const monthStr = String(m).padStart(2, '0');
    const newMonthKey = `${viewYear}-${monthStr}`;
    onSelectMonth(newMonthKey);
    onClose();
  };

  const handleJumpCurrentMonth = () => {
    onSelectMonth(currentVNMonthKey);
    onClose();
  };

  const handleJumpPrevMonth = () => {
    let [y, m] = currentMonthKey.split('-').map(Number);
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    const prevKey = `${y}-${String(m).padStart(2, '0')}`;
    onSelectMonth(prevKey);
    onClose();
  };

  const handleJumpNextMonth = () => {
    let [y, m] = currentMonthKey.split('-').map(Number);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    const nextKey = `${y}-${String(m).padStart(2, '0')}`;
    onSelectMonth(nextKey);
    onClose();
  };

  const quarters = [
    { label: 'Quý 1', months: [1, 2, 3] },
    { label: 'Quý 2', months: [4, 5, 6] },
    { label: 'Quý 3', months: [7, 8, 9] },
    { label: 'Quý 4', months: [10, 11, 12] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#111827] rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Bộ Chọn Kỳ Lương & Tháng Chấm Công
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/50 hidden sm:inline-block">
                  Tiện lợi & Nhanh chóng
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chọn trực tiếp tháng bất kỳ để xem lịch, sửa đổi số công hoặc tính lại lương.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Quick Jump Shortcuts Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap bg-[#0B0D11]/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handleJumpCurrentMonth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-bold transition-all shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tháng hiện tại ({formatVietnamMonth(currentVNMonthKey)})</span>
              </button>
              <button
                onClick={handleJumpPrevMonth}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Về 1 tháng trước"
              >
                ◀ Tháng trước
              </button>
              <button
                onClick={handleJumpNextMonth}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Sang 1 tháng sau"
              >
                Tháng sau ▶
              </button>
            </div>

            <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1">
              <span>Đang chọn:</span>
              <strong className="text-indigo-300 font-mono">{formatVietnamMonth(currentMonthKey)}</strong>
            </div>
          </div>

          {/* Year Switcher Header */}
          <div className="flex items-center justify-between bg-[#0F172A] p-2.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewYear((y) => y - 1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Năm trước"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Năm {viewYear - 1}</span>
            </button>

            <div className="flex items-center gap-2">
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-800 text-white font-extrabold text-base px-3 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer text-center"
              >
                {[viewYear - 2, viewYear - 1, viewYear, viewYear + 1, viewYear + 2].map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setViewYear((y) => y + 1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Năm sau"
            >
              <span>Năm {viewYear + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 12 Months Grid (4 Rows x 3 Cols or 3 Rows x 4 Cols) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const stat = monthsStats[m];
              const isSelected = stat.isSelected;
              const isCurrent = stat.isCurrentVNMonth;
              const hasData = stat.hasData;

              return (
                <button
                  key={m}
                  onClick={() => handlePickMonth(m)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                      : isCurrent
                      ? 'bg-emerald-950/40 text-slate-200 border-emerald-600/60 hover:bg-emerald-900/40'
                      : hasData
                      ? 'bg-[#0F172A] text-slate-200 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  {/* Top row of month card */}
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight">
                      Tháng {m}
                    </span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Tháng hiện tại" />
                    )}
                    {isSelected && !isCurrent && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                    )}
                  </div>

                  {/* Month data stats */}
                  <div className="mt-2 text-xs">
                    {hasData ? (
                      <div>
                        <p className={`font-mono font-bold ${isSelected ? 'text-white' : 'text-indigo-300'}`}>
                          {stat.standardDays} công <span className="text-[10px] font-normal opacity-80">({stat.totalShifts} ca)</span>
                        </p>
                        <p className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {stat.workedDays} ngày đi làm
                        </p>
                      </div>
                    ) : (
                      <p className={`text-[11px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                        Chưa có công
                      </p>
                    )}
                  </div>

                  {/* Badge indicator */}
                  {isCurrent && (
                    <div className="mt-2 pt-1 border-t border-emerald-800/40 flex items-center justify-between text-[10px] font-bold text-emerald-400">
                      <span>★ Hiện tại</span>
                      <span className="text-[9px] font-normal text-emerald-300">GMT+7</span>
                    </div>
                  )}
                  {isSelected && (
                    <div className="mt-2 pt-1 border-t border-indigo-400/40 flex items-center justify-between text-[10px] font-bold text-indigo-100">
                      <span>✓ Đang mở</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Quarter Selector Buttons */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Chọn Nhanh Theo Quý (Năm {viewYear})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quarters.map((q) => (
                <button
                  key={q.label}
                  onClick={() => handlePickMonth(q.months[0])}
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-between"
                >
                  <span>{q.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">T{q.months[0]}-T{q.months[2]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0F172A] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Quy chuẩn: 1 ca = 0.5 công, 2 ca = 1.0 công chuẩn</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
