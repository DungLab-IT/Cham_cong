import React from 'react';
import {
  Wallet,
  TrendingUp,
  Clock,
  Utensils,
  CheckCircle2,
  CalendarDays,
  Zap,
  ArrowUpRight,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { MonthSalarySummary, SalaryConfig } from '../types';
import { formatVND, formatNumber } from '../utils/salaryCalculator';

interface SalaryStatsCardsProps {
  summary: MonthSalarySummary;
  config: SalaryConfig;
  currentDateStr: string;
}

export const SalaryStatsCards: React.FC<SalaryStatsCardsProps> = ({
  summary,
  config,
  currentDateStr,
}) => {
  const [_, monthStr] = summary.monthKey.split('-');
  const todayNum = new Date().getDate();
  const isCurrentMonth = summary.monthKey === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  // Progress percentage
  const progressPercent = summary.projectedNetSalary > 0
    ? Math.min(100, Math.round((summary.accumulatedNetSalary / summary.projectedNetSalary) * 100))
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Lương tính đến hôm nay (PRIMARY HERO) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-[#111827] to-[#0F172A] text-white rounded-2xl p-5 shadow-lg border border-indigo-500/30 flex flex-col justify-between">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-900/60 text-indigo-200 border border-indigo-500/40">
              <Zap className="w-3 h-3 text-amber-300" />
              {isCurrentMonth ? `Đến hôm nay (${todayNum}/${monthStr})` : 'Lũy kế thực tế'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-3">Lương tích lũy đến hiện tại</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1 font-mono">
            {formatVND(summary.accumulatedNetSalary)}
          </h2>
        </div>

        <div className="pt-4 mt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div>
            <span>Đã làm: </span>
            <strong className="text-white font-semibold">{summary.workedStandardDays} công</strong>
            <span className="text-slate-400"> ({summary.workedTotalShifts} ca)</span>
          </div>
          {summary.workedOvertimeHours > 0 && (
            <span className="text-amber-400 font-medium">+{summary.workedOvertimeHours}h tăng ca</span>
          )}
        </div>
      </div>

      {/* Card 2: Lương dự kiến cả tháng */}
      <div className="bg-[#111827] rounded-2xl p-5 shadow-xs border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-800/50">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Cả tháng {monthStr}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-3">Lương thực nhận dự kiến</p>
          <h3 className="text-2xl font-bold tracking-tight text-emerald-400 mt-1 font-mono">
            {formatVND(summary.projectedNetSalary)}
          </h3>
        </div>

        {/* Progress bar */}
        <div className="pt-3 mt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Tiến độ lương</span>
            <span className="font-semibold text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-[#0F172A] border border-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
            <span>Kế hoạch: {summary.projectedStandardDays} công</span>
            <span>Chuẩn: {config.standardDaysInMonth} công</span>
          </p>
        </div>
      </div>

      {/* Card 3: Chi tiết các ca làm */}
      <div className="bg-[#111827] rounded-2xl p-5 shadow-xs border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-950/50 text-indigo-300 border border-indigo-800/50">
              <Clock className="w-3 h-3 text-indigo-400" />
              Thống kê ca
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/40 text-indigo-400 border border-indigo-800/30 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-3">Tổng số ca đã chấm</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-indigo-400 font-mono">
              {summary.projectedTotalShifts}
            </span>
            <span className="text-xs text-slate-500">/ {config.standardDaysInMonth * (config.standardShiftsPerDay || 2)} ca chuẩn</span>
          </div>
        </div>

        {/* Shift pills breakdown */}
        <div className="pt-3 mt-2 border-t border-slate-800 grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-amber-950/30 rounded-lg p-1.5 border border-amber-800/40">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-amber-300">
              <Sun className="w-3 h-3 text-amber-400" />
              Sáng
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">{summary.projectedMorningCount}</p>
          </div>
          <div className="bg-orange-950/30 rounded-lg p-1.5 border border-orange-800/40">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-orange-300">
              <Sunset className="w-3 h-3 text-orange-400" />
              Chiều
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">{summary.projectedAfternoonCount}</p>
          </div>
          <div className="bg-indigo-950/30 rounded-lg p-1.5 border border-indigo-800/40">
            <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-indigo-300">
              <Moon className="w-3 h-3 text-indigo-400" />
              Tối
            </div>
            <p className="text-xs font-bold text-slate-200 mt-0.5">{summary.projectedEveningCount}</p>
          </div>
        </div>
      </div>

      {/* Card 4: Phụ cấp & Thưởng */}
      <div className="bg-[#111827] rounded-2xl p-5 shadow-xs border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/50">
              <Utensils className="w-3 h-3 text-amber-400" />
              Phụ cấp & Thưởng
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/30 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium mt-3">Tiền ăn & phụ cấp khác</p>
          <h3 className="text-2xl font-bold tracking-tight text-amber-400 mt-1 font-mono">
            {formatVND(
              summary.projectedMealAllowance +
              summary.projectedFixedAllowances +
              summary.projectedAttendanceBonus +
              summary.projectedOvertimeSalary
            )}
          </h3>
        </div>

        <div className="pt-3 mt-2 border-t border-slate-800 space-y-1 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Tiền ăn ca:</span>
            <span className="font-semibold text-slate-200 font-mono">{formatVND(summary.projectedMealAllowance)}</span>
          </div>
          {summary.projectedAttendanceBonus > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Chuyên cần:
              </span>
              <span className="font-semibold font-mono">+{formatVND(summary.projectedAttendanceBonus)}</span>
            </div>
          )}
          {summary.projectedOvertimeSalary > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Lương tăng ca:</span>
              <span className="font-semibold font-mono">+{formatVND(summary.projectedOvertimeSalary)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
