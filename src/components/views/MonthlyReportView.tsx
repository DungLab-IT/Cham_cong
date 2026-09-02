import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Clock,
  Utensils,
  Award,
  Zap,
  Edit3,
  Sparkles,
  ArrowRight,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
  Building2,
  User,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { MonthSalarySummary, SalaryConfig, DaySalaryDetail, DayAttendance } from '../../types';
import { formatVND, formatNumber } from '../../utils/salaryCalculator';
import { formatVietnamMonth, getAvailableMonthsList, getVietnamCurrentMonthKey } from '../../utils/vietnamTime';

interface MonthlyReportViewProps {
  summary: MonthSalarySummary;
  config: SalaryConfig;
  currentMonthKey: string;
  onMonthChange: (newMonthKey: string) => void;
  onOpenDayDetail: (day: DaySalaryDetail) => void;
  onBatchApply: (pattern: 'morning_evening' | 'morning_afternoon' | 'afternoon_evening' | 'clear') => void;
  onExportExcel: () => void;
  onPrint: () => void;
  onNavigateToTab: (tab: 'schedule' | 'salary' | 'comprehensive') => void;
}

const COLORS = {
  morning: '#F59E0B', // Amber
  afternoon: '#F97316', // Orange
  evening: '#6366F1', // Indigo
  overtime: '#EC4899', // Pink
};

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  summary,
  config,
  currentMonthKey,
  onMonthChange,
  onOpenDayDetail,
  onBatchApply,
  onExportExcel,
  onPrint,
  onNavigateToTab,
}) => {
  const currentVNMonth = getVietnamCurrentMonthKey();
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const isPastMonth = currentMonthKey < currentVNMonth;
  const isCurrentMonth = currentMonthKey === currentVNMonth;
  const isFutureMonth = currentMonthKey > currentVNMonth;

  // Month navigation helpers
  const handlePrevMonth = () => {
    let prevM = month - 1;
    let prevY = year;
    if (prevM < 1) {
      prevM = 12;
      prevY -= 1;
    }
    onMonthChange(`${prevY}-${String(prevM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let nextM = month + 1;
    let nextY = year;
    if (nextM > 12) {
      nextM = 1;
      nextY += 1;
    }
    onMonthChange(`${nextY}-${String(nextM).padStart(2, '0')}`);
  };

  // Pie chart data for shift distribution
  const shiftDistributionData = [
    { name: 'Ca Sáng', value: summary.projectedMorningCount, color: COLORS.morning },
    { name: 'Ca Chiều', value: summary.projectedAfternoonCount, color: COLORS.afternoon },
    { name: 'Ca Tối', value: summary.projectedEveningCount, color: COLORS.evening },
  ].filter((item) => item.value > 0);

  // Income composition breakdown
  const incomeComposition = [
    { name: 'Lương ca cơ bản', value: summary.projectedBaseSalary, fill: '#6366F1' },
    { name: 'Tăng ca OT', value: summary.projectedOvertimeSalary, fill: '#EC4899' },
    { name: 'Tiền ăn ca gãy', value: summary.projectedMealAllowance, fill: '#10B981' },
    { name: 'Phụ cấp cố định', value: summary.projectedFixedAllowances, fill: '#3B82F6' },
    { name: 'Thưởng chuyên cần', value: summary.projectedAttendanceBonus, fill: '#F59E0B' },
  ].filter((item) => item.value > 0);

  // Split-shift count (Days with >= 2 shifts)
  const splitShiftDaysCount = summary.daysDetail.filter((d) => d.totalShifts >= 2).length;
  const singleShiftDaysCount = summary.daysDetail.filter((d) => d.totalShifts === 1).length;
  const offDaysCount = summary.daysDetail.filter((d) => d.totalShifts === 0).length;

  const availableMonths = getAvailableMonthsList(currentVNMonth);

  return (
    <div className="space-y-6">
      {/* Month Selector Bar */}
      <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-xs">
              Báo Cáo Chi Tiết Tháng
            </span>
            {isPastMonth && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/50">
                Tháng đã qua (Có thể sửa lại công)
              </span>
            )}
            {isCurrentMonth && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tháng hiện tại
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
            <span>Báo Cáo Kỳ Lương Tháng {month}/{year}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Xem lại chi tiết số ca làm việc, ngày công chuẩn, phụ cấp tiền ăn và thực lĩnh của bất kỳ tháng nào.
          </p>
        </div>

        {/* Month controls & Actions */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center bg-[#0F172A] rounded-xl p-1 border border-slate-700">
            <button
              onClick={handlePrevMonth}
              id="btn-report-prev-month"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <select
              value={currentMonthKey}
              onChange={(e) => onMonthChange(e.target.value)}
              id="select-report-month"
              className="bg-transparent text-xs font-bold text-white px-2 py-1 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((mKey) => (
                <option key={mKey} value={mKey} className="bg-[#111827] text-white">
                  {formatVietnamMonth(mKey)} {mKey === currentVNMonth ? '(Hiện tại)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleNextMonth}
              id="btn-report-next-month"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onExportExcel}
            id="btn-report-export-excel"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={onPrint}
            id="btn-report-print"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Retroactive Editing Notice (Sửa lại công tháng trước) */}
      {isPastMonth && (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-amber-200">
                Bạn đang xem báo cáo của tháng trước (Tháng {month}/{year})
              </p>
              <p className="text-slate-400 mt-0.5">
                Bạn có thể sửa lại số ca, số công, giờ OT hoặc tiền ăn của tháng này bất cứ lúc nào. Mọi số liệu và lương sẽ được tự động tính toán lại ngay lập tức.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToTab('comprehensive')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors shadow-xs"
            >
              Chỉnh sửa trên Sheet
            </button>
          </div>
        </div>
      )}

      {/* Empty month notification & Quick actions */}
      {summary.projectedTotalShifts === 0 && (
        <div className="bg-[#111827] rounded-2xl p-6 border border-dashed border-slate-700 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Chưa có dữ liệu chấm công cho Tháng {month}/{year}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Tháng này chưa được điền ca làm việc. Bạn có thể áp dụng nhanh mẫu làm việc ca gãy 2 ca/ngày hoặc chấm từng ngày.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button
              onClick={() => onBatchApply('morning_evening')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-md shadow-indigo-600/20"
            >
              ⚡ Áp dụng nhanh 2 ca/ngày (Sáng + Tối T2-T7)
            </button>
            <button
              onClick={() => onNavigateToTab('schedule')}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
            >
              Vào Lịch Chấm Từng Ngày
            </button>
          </div>
        </div>
      )}

      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Salary */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Lương Thực Nhận (Net)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {formatVND(summary.projectedNetSalary)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tổng thu nhập: <span className="text-slate-300 font-mono">{formatVND(summary.projectedGrossSalary)}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Standard Days & Total Shifts */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Ngày Công Quy Đổi</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-300 font-mono tracking-tight">
              {summary.projectedStandardDays} <span className="text-sm font-normal text-slate-400">công</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              = <span className="text-indigo-400 font-semibold">{summary.projectedTotalShifts} ca làm</span> ({config.standardShiftsPerDay || 2} ca/công)
            </p>
          </div>
        </div>

        {/* Card 3: Split Shifts & Meal Allowance */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Ca Gãy & Tiền Ăn</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
              {formatVND(summary.projectedMealAllowance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Từ <span className="text-amber-300 font-semibold">{splitShiftDaysCount} ngày</span> làm ca gãy (2 ca/ngày)
            </p>
          </div>
        </div>

        {/* Card 4: Overtime OT & Attendance Bonus */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tăng Ca & Chuyên Cần</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
              {summary.projectedOvertimeHours} <span className="text-sm font-normal text-slate-400">giờ OT</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Chuyên cần: {summary.hasEarnedAttendanceBonus ? (
                <span className="text-emerald-400 font-semibold">Đạt (+{formatVND(summary.projectedAttendanceBonus)})</span>
              ) : (
                <span className="text-slate-500">Chưa đạt ({summary.projectedStandardDays}/{config.attendanceRequiredDays} công)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Ca làm việc (Shifts distribution) */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Phân Bổ Ca Làm Việc Tháng {month}</span>
          </h3>

          {summary.projectedTotalShifts > 0 ? (
            <div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={shiftDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {shiftDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} ca`, '']}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
                <div className="p-1.5 rounded-lg bg-amber-950/20 border border-amber-900/30">
                  <span className="text-amber-400 font-semibold">Sáng</span>
                  <p className="font-bold text-white font-mono">{summary.projectedMorningCount} ca</p>
                </div>
                <div className="p-1.5 rounded-lg bg-orange-950/20 border border-orange-900/30">
                  <span className="text-orange-400 font-semibold">Chiều</span>
                  <p className="font-bold text-white font-mono">{summary.projectedAfternoonCount} ca</p>
                </div>
                <div className="p-1.5 rounded-lg bg-indigo-950/20 border border-indigo-900/30">
                  <span className="text-indigo-400 font-semibold">Tối</span>
                  <p className="font-bold text-white font-mono">{summary.projectedEveningCount} ca</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
              Chưa có dữ liệu ca làm
            </div>
          )}
        </div>

        {/* Chart 2: Cơ cấu thu nhập (Income Composition) */}
        <div className="lg:col-span-2 bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Cơ Cấu Thu Nhập & Phụ Cấp Tháng {month}/{year}</span>
          </h3>

          {incomeComposition.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeComposition} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                  <XAxis type="number" tickFormatter={(val) => `${val / 1000000}M`} stroke="#64748B" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={110} />
                  <Tooltip
                    formatter={(val: any) => [formatVND(Number(val)), 'Số tiền']}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {incomeComposition.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-500 text-xs">
              Chưa có dữ liệu thu nhập
            </div>
          )}
        </div>
      </div>

      {/* Detailed Days Attendance Table for this Month */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Bảng Chi Tiết Ngày Làm Việc & Thu Nhập Tháng {month}/{year}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bấm vào bất kỳ dòng nào để sửa lại ca làm, giờ OT, phụ cấp hoặc ghi chú của ngày đó.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Tổng cộng:</span>
            <strong className="text-emerald-400 font-mono">{formatVND(summary.projectedNetSalary)}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-2.5 px-3">Ngày</th>
                <th className="py-2.5 px-3 text-center">Sáng</th>
                <th className="py-2.5 px-3 text-center">Chiều</th>
                <th className="py-2.5 px-3 text-center">Tối</th>
                <th className="py-2.5 px-3 text-center">Tăng ca (OT)</th>
                <th className="py-2.5 px-3 text-center">Phụ cấp ăn</th>
                <th className="py-2.5 px-3 text-right">Lương ca</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-300">Tổng ngày</th>
                <th className="py-2.5 px-3">Ghi chú</th>
                <th className="py-2.5 px-2 text-center">Sửa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {summary.daysDetail.map((d) => {
                const isSun = d.dayOfWeek === 'Chủ Nhật';
                const hasShift = d.totalShifts > 0;

                return (
                  <tr
                    key={d.dayAttendance.date}
                    onClick={() => onOpenDayDetail(d)}
                    className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      isSun ? 'bg-rose-950/10' : hasShift ? '' : 'text-slate-500'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold ${isSun ? 'text-rose-400' : 'text-slate-300'}`}>
                          {String(d.dayNumber).padStart(2, '0')}
                        </span>
                        <span className="text-[11px] text-slate-400">({d.dayOfWeek})</span>
                        {d.isSplitShift && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                            Ca gãy
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {d.dayAttendance.morning ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/40">
                          Sáng
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {d.dayAttendance.afternoon ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-950/60 text-orange-300 border border-orange-800/40">
                          Chiều
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {d.dayAttendance.evening ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                          Tối
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      {d.dayAttendance.overtimeHours > 0 ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-950/60 text-pink-300 border border-pink-800/40">
                          +{d.dayAttendance.overtimeHours}h
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono">
                      {d.mealAllowance > 0 ? (
                        <span className="text-emerald-400 text-[11px] font-semibold">
                          +{formatVND(d.mealAllowance)}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {d.shiftSalary > 0 ? formatVND(d.shiftSalary) : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {d.totalDayEarnings > 0 ? formatVND(d.totalDayEarnings) : '-'}
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[150px] text-[11px]">
                      {d.dayAttendance.note || '-'}
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDayDetail(d);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors"
                        title="Sửa ngày này"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
