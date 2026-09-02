import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Layers,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  ArrowUpRight,
  Award,
  Clock,
  Utensils,
  Zap,
  Edit3,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { SalaryConfig, DayAttendance, MonthSalarySummary } from '../../types';
import { calculateMonthSummary, formatVND, formatNumber } from '../../utils/salaryCalculator';
import { formatVietnamMonth, getVietnamCurrentMonthKey } from '../../utils/vietnamTime';
import * as XLSX from 'xlsx';

interface AllTimeSalaryViewProps {
  attendances: Record<string, DayAttendance>;
  config: SalaryConfig;
  currentDateStr: string;
  onSelectMonthToEdit: (monthKey: string) => void;
  onNavigateToTab: (tab: 'schedule' | 'salary' | 'comprehensive' | 'monthly_report') => void;
}

export const AllTimeSalaryView: React.FC<AllTimeSalaryViewProps> = ({
  attendances,
  config,
  currentDateStr,
  onSelectMonthToEdit,
  onNavigateToTab,
}) => {
  const currentVNMonth = getVietnamCurrentMonthKey();
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');

  // Discover all months that exist in attendances or around the current date
  const allDiscoveredMonthKeys = useMemo(() => {
    const monthKeysSet = new Set<string>();
    
    // Always include current month and past 6 months
    const [currY, currM] = currentVNMonth.split('-').map(Number);
    for (let i = -6; i <= 2; i++) {
      const d = new Date(currY, currM - 1 + i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthKeysSet.add(k);
    }

    // Add any months from attendances
    Object.keys(attendances).forEach((dateKey) => {
      const mKey = dateKey.substring(0, 7);
      if (mKey && mKey.length === 7) {
        monthKeysSet.add(mKey);
      }
    });

    return Array.from(monthKeysSet).sort();
  }, [attendances, currentVNMonth]);

  // Compute month summary for each discovered month
  const allMonthsSummaries = useMemo(() => {
    return allDiscoveredMonthKeys.map((mKey) => {
      return calculateMonthSummary(mKey, attendances, config, currentDateStr);
    });
  }, [allDiscoveredMonthKeys, attendances, config, currentDateStr]);

  // Extract available years for filter
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    allDiscoveredMonthKeys.forEach((k) => {
      years.add(k.substring(0, 4));
    });
    return Array.from(years).sort().reverse();
  }, [allDiscoveredMonthKeys]);

  // Filtered summaries according to selected year
  const filteredSummaries = useMemo(() => {
    if (selectedYearFilter === 'all') {
      return allMonthsSummaries;
    }
    return allMonthsSummaries.filter((s) => s.monthKey.startsWith(selectedYearFilter));
  }, [allMonthsSummaries, selectedYearFilter]);

  // Months with actual shifts or data
  const activeMonths = useMemo(() => {
    return filteredSummaries.filter((s) => s.projectedTotalShifts > 0);
  }, [filteredSummaries]);

  // Aggregate grand totals across active months
  const grandTotals = useMemo(() => {
    let totalNet = 0;
    let totalGross = 0;
    let totalShifts = 0;
    let totalStandardDays = 0;
    let totalWorkedDays = 0;
    let totalOvertimeHours = 0;
    let totalMealAllowance = 0;
    let totalAttendanceBonus = 0;
    let totalBaseSalary = 0;
    let totalOvertimeSalary = 0;

    activeMonths.forEach((s) => {
      totalNet += s.projectedNetSalary;
      totalGross += s.projectedGrossSalary;
      totalShifts += s.projectedTotalShifts;
      totalStandardDays += s.projectedStandardDays;
      totalWorkedDays += s.projectedDaysCount;
      totalOvertimeHours += s.projectedOvertimeHours;
      totalMealAllowance += s.projectedMealAllowance;
      totalAttendanceBonus += s.projectedAttendanceBonus;
      totalBaseSalary += s.projectedBaseSalary;
      totalOvertimeSalary += s.projectedOvertimeSalary;
    });

    const totalMonthsCount = activeMonths.length || 1;
    const avgMonthlyNet = totalNet / totalMonthsCount;
    const avgMonthlyShifts = totalShifts / totalMonthsCount;

    return {
      totalNet,
      totalGross,
      totalShifts,
      totalStandardDays: Number(totalStandardDays.toFixed(1)),
      totalWorkedDays,
      totalOvertimeHours,
      totalMealAllowance,
      totalAttendanceBonus,
      totalBaseSalary,
      totalOvertimeSalary,
      monthsCount: activeMonths.length,
      avgMonthlyNet,
      avgMonthlyShifts: Number(avgMonthlyShifts.toFixed(1)),
    };
  }, [activeMonths]);

  // Chart data for monthly trend
  const monthlyChartData = useMemo(() => {
    return filteredSummaries.map((s) => {
      const [y, m] = s.monthKey.split('-');
      const label = `T${parseInt(m, 10)}/${y.slice(2)}`;

      return {
        monthKey: s.monthKey,
        label,
        netSalary: s.projectedNetSalary,
        grossSalary: s.projectedGrossSalary,
        baseSalary: s.projectedBaseSalary,
        otSalary: s.projectedOvertimeSalary,
        mealAllowance: s.projectedMealAllowance,
        bonus: s.projectedAttendanceBonus + s.projectedFixedAllowances,
        shifts: s.projectedTotalShifts,
        standardDays: s.projectedStandardDays,
      };
    });
  }, [filteredSummaries]);

  // Export full table to Excel
  const handleExportAllToExcel = () => {
    const rows = filteredSummaries.map((s) => {
      const [y, m] = s.monthKey.split('-');
      const splitDays = s.daysDetail.filter((d) => d.totalShifts >= 2).length;

      return {
        'Kỳ Lương': `Tháng ${m}/${y}`,
        'Số Ngày Làm': s.projectedDaysCount,
        'Số Ngày Ca Gãy': splitDays,
        'Tổng Số Ca Làm': s.projectedTotalShifts,
        'Số Công Chuẩn': s.projectedStandardDays,
        'Lương Ca Cơ Bản': s.projectedBaseSalary,
        'Tiền Tăng Ca (OT)': s.projectedOvertimeSalary,
        'Tiền Ăn Ca Gãy': s.projectedMealAllowance,
        'Phụ Cấp Cố Định': s.projectedFixedAllowances,
        'Thưởng Chuyên Cần': s.projectedAttendanceBonus,
        'Khấu Trừ / Tạm Ứng': s.projectedDeductions,
        'LƯƠNG THỰC LĨNH (NET)': s.projectedNetSalary,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tong_Hop_Luong_Tat_Ca_Thang');
    XLSX.writeFile(workbook, `Bao_Cao_Tong_Hop_Luong_${selectedYearFilter}_${config.employeeName || 'Nhan_Vien'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#111827] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-emerald-900/40 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
              Báo Cáo Toàn Bộ Lương
            </span>
            <span className="text-xs text-slate-400 font-medium">Tổng quan nhiều tháng & Toàn thời gian</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Tổng Hợp Toàn Bộ Thu Nhập & Lịch Sử Công
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Bảng so sánh thu nhập qua các tháng, tổng lương tích lũy, số công đã cày và cho phép chọn sửa lại bất kỳ tháng cũ nào.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Year Filter */}
          <div className="flex items-center gap-1.5 bg-[#0F172A] px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Năm:</span>
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#111827] text-white">Tất cả các năm</option>
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-[#111827] text-white">Năm {y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportAllToExcel}
            id="btn-export-all-salary-excel"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel Bảng Tổng</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards for All-Time Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Net Earnings */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tổng Thu Nhập Đã Nhận</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {formatVND(grandTotals.totalNet)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Trung bình: <span className="text-emerald-300 font-mono font-semibold">{formatVND(grandTotals.avgMonthlyNet)}/tháng</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Shifts & Standard Days */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tổng Số Ca & Công</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-300 font-mono tracking-tight">
              {grandTotals.totalStandardDays} <span className="text-sm font-normal text-slate-400">công</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              = <span className="text-indigo-400 font-semibold">{grandTotals.totalShifts} ca làm</span> ({grandTotals.monthsCount} tháng có dữ liệu)
            </p>
          </div>
        </div>

        {/* Card 3: Total Meal Allowance */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tổng Tiền Ăn Ca Gãy</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
              {formatVND(grandTotals.totalMealAllowance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Phụ cấp cơm ca hỗ trợ làm 2 ca/ngày
            </p>
          </div>
        </div>

        {/* Card 4: Total Overtime OT */}
        <div className="bg-[#111827] p-5 rounded-2xl border border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tổng Giờ Tăng Ca (OT)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-300 font-mono tracking-tight">
              {grandTotals.totalOvertimeHours} <span className="text-sm font-normal text-slate-400">giờ OT</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Thành tiền: <span className="text-purple-400 font-mono">{formatVND(grandTotals.totalOvertimeSalary)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Salary Trend Visual Chart */}
      <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Biểu Đồ So Sánh Thu Nhập Thực Lĩnh Qua Các Tháng</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi biến động thu nhập và số công làm việc từng tháng
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-300">Lương thực lĩnh (Net)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span className="text-slate-300">Lương ca cơ bản</span>
            </div>
          </div>
        </div>

        <div className="h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickFormatter={(val) => `${val / 1000000}M`}
              />
              <Tooltip
                formatter={(val: any, name: string) => [
                  formatVND(Number(val)),
                  name === 'netSalary' ? 'Lương thực lĩnh' : name === 'baseSalary' ? 'Lương ca' : 'Tiền ăn',
                ]}
                labelFormatter={(label) => `Kỳ lương: ${label}`}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="baseSalary" name="baseSalary" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="netSalary" name="netSalary" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complete Month-by-Month Table with Direct Edit Actions */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-sm overflow-hidden space-y-3">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Bảng Tổng Hợp Chi Tiết Từng Tháng (Month-by-Month Breakdown)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bấm nút <strong className="text-indigo-400 font-semibold">"Sửa lại tháng này"</strong> ở bất kỳ hàng nào để vào chỉnh sửa lại số ca, công và tính lại lương của tháng đó.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Hiển thị: <strong className="text-white">{filteredSummaries.length} kỳ lương</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-slate-400 border-b border-slate-800 font-semibold">
                <th className="py-3 px-3.5">Kỳ Lương (Tháng)</th>
                <th className="py-3 px-3 text-center">Số Ngày Làm</th>
                <th className="py-3 px-3 text-center">Ca Gãy</th>
                <th className="py-3 px-3 text-center">Tổng Ca Làm</th>
                <th className="py-3 px-3 text-center font-bold text-indigo-300">Công Chuẩn</th>
                <th className="py-3 px-3 text-right">Lương Ca</th>
                <th className="py-3 px-3 text-right">Tăng Ca (OT)</th>
                <th className="py-3 px-3 text-right">Tiền Ăn</th>
                <th className="py-3 px-3 text-right">Thưởng CC</th>
                <th className="py-3 px-3.5 text-right font-black text-emerald-400">Thực Lĩnh (Net)</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3.5 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredSummaries.map((s) => {
                const [y, m] = s.monthKey.split('-');
                const isCurrent = s.monthKey === currentVNMonth;
                const isPast = s.monthKey < currentVNMonth;
                const splitDays = s.daysDetail.filter((d) => d.totalShifts >= 2).length;
                const hasData = s.projectedTotalShifts > 0;

                return (
                  <tr
                    key={s.monthKey}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isCurrent ? 'bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Month Label */}
                    <td className="py-3 px-3.5 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{formatVietnamMonth(s.monthKey)}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Hiện tại
                          </span>
                        )}
                        {isPast && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium text-slate-400 bg-slate-800">
                            Đã qua
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Worked Days */}
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {hasData ? `${s.projectedDaysCount} ngày` : '-'}
                    </td>

                    {/* Split Shift Days */}
                    <td className="py-3 px-3 text-center font-mono">
                      {splitDays > 0 ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/50 text-amber-300 border border-amber-800/40">
                          {splitDays} ngày
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Total Shifts */}
                    <td className="py-3 px-3 text-center font-mono text-slate-200">
                      {hasData ? `${s.projectedTotalShifts} ca` : '-'}
                    </td>

                    {/* Standard Days */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-300">
                      {hasData ? `${s.projectedStandardDays} công` : '-'}
                    </td>

                    {/* Base Shift Salary */}
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {s.projectedBaseSalary > 0 ? formatVND(s.projectedBaseSalary) : '-'}
                    </td>

                    {/* OT Salary */}
                    <td className="py-3 px-3 text-right font-mono text-pink-300">
                      {s.projectedOvertimeSalary > 0 ? formatVND(s.projectedOvertimeSalary) : '-'}
                    </td>

                    {/* Meal Allowance */}
                    <td className="py-3 px-3 text-right font-mono text-amber-400 font-semibold">
                      {s.projectedMealAllowance > 0 ? formatVND(s.projectedMealAllowance) : '-'}
                    </td>

                    {/* Attendance Bonus */}
                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {s.projectedAttendanceBonus > 0 ? (
                        <span className="text-emerald-400 font-semibold">+{formatVND(s.projectedAttendanceBonus)}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Net Salary */}
                    <td className="py-3 px-3.5 text-right font-mono font-black text-sm text-emerald-400 whitespace-nowrap">
                      {hasData ? formatVND(s.projectedNetSalary) : '0 ₫'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      {s.hasEarnedAttendanceBonus ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                          Đạt CC
                        </span>
                      ) : hasData ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-slate-800 text-slate-400">
                          Bình thường
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-600 bg-slate-900 border border-slate-800">
                          Trống
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectMonthToEdit(s.monthKey)}
                          id={`btn-edit-month-${s.monthKey}`}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
                          title="Chuyển sang tháng này để sửa đổi số ca, số công"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa lại tháng này</span>
                        </button>
                      </div>
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
