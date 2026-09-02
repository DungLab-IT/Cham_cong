import React, { useState } from 'react';
import {
  Calculator,
  Wallet,
  TrendingUp,
  Award,
  ShieldAlert,
  Printer,
  Copy,
  CheckCircle2,
  DollarSign,
  Sun,
  Sunset,
  Moon,
  Clock,
  Utensils,
  Zap,
  Info,
  Building2,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { MonthSalarySummary, SalaryConfig } from '../../types';
import { formatVND, formatNumber } from '../../utils/salaryCalculator';

interface SalaryCalculationViewProps {
  summary: MonthSalarySummary;
  config: SalaryConfig;
  currentDateStr: string;
  onPrintSlip: () => void;
}

export const SalaryCalculationView: React.FC<SalaryCalculationViewProps> = ({
  summary,
  config,
  currentDateStr,
  onPrintSlip,
}) => {
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [yearStr, monthStr] = summary.monthKey.split('-');

  // Unit rate calculations
  const shiftRate =
    config.calculationMode === 'monthly_based'
      ? config.baseSalary / (config.standardDaysInMonth * (config.standardShiftsPerDay || 2))
      : config.ratePerShift;

  const splitShiftDayRate = shiftRate * (config.standardShiftsPerDay || 2);

  // Progress for attendance bonus
  const attendanceProgress = Math.min(
    100,
    Math.round((summary.projectedStandardDays / (config.attendanceRequiredDays || 24)) * 100)
  );

  const handleCopyTextSlip = () => {
    const text = `=== PHIẾU LƯƠNG THÁNG ${summary.monthKey} ===
Nhân viên: ${config.employeeName || 'Nhân viên'}
Nơi làm việc: ${config.workplace || 'Chi nhánh'}
Số ca đã làm: ${summary.projectedTotalShifts} ca (${summary.projectedStandardDays} công)
- Ca Sáng: ${summary.projectedMorningCount} ca
- Ca Chiều: ${summary.projectedAfternoonCount} ca
- Ca Tối: ${summary.projectedEveningCount} ca
- Giờ tăng ca (OT): ${summary.projectedOvertimeHours} giờ

CHI TIẾT THU NHẬP:
1. Lương ca cơ bản: ${formatVND(summary.projectedBaseSalary)}
2. Tiền tăng ca (OT): ${formatVND(summary.projectedOvertimeSalary)}
3. Tiền ăn ca: ${formatVND(summary.projectedMealAllowance)}
4. Phụ cấp cố định (Xăng xe, ĐT): ${formatVND(summary.projectedFixedAllowances)}
5. Thưởng chuyên cần: ${formatVND(summary.projectedAttendanceBonus)}
TỔNG THU NHẬP (GROSS): ${formatVND(summary.projectedGrossSalary)}

CÁC KHOẢN GIẢM TRỪ:
- Tạm ứng lương: -${formatVND(config.monthlyAdvance || 0)}
- Bảo hiểm / Công đoàn: -${formatVND(config.insuranceDeduction || 0)}
- Khấu trừ khác: -${formatVND(summary.accumulatedDeductions || 0)}

>>> THỰC LĨNH CẢ THÁNG (NET): ${formatVND(summary.projectedNetSalary)}`;

    navigator.clipboard.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#111827] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-emerald-900/40 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
              Chi Tiết Tính Lương
            </span>
            <span className="text-xs text-slate-400 font-medium">Kỳ {summary.monthKey}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Bảng Chiết Tính Lương & Phụ Cấp Ca Gãy
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Minh bạch toàn bộ cơ chế tính lương theo từng ca, quy đổi 2 ca = 1 công, tiền ăn ca gãy, hệ số ca tối và thưởng chuyên cần.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleCopyTextSlip}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all shadow-xs ${
              copiedSlip
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copiedSlip ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã sao chép phiếu!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Sao chép chữ phiếu lương</span>
              </>
            )}
          </button>

          <button
            onClick={onPrintSlip}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Phiếu Lương</span>
          </button>
        </div>
      </div>

      {/* Mechanism Explanation Box */}
      <div className="bg-[#111827] rounded-2xl p-5 border border-indigo-500/40 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Cơ Chế Tính Lương: 10.000.000 ₫ / Tháng (Làm Full 2 Ca/Ngày, Không Phụ Cấp)
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
            {formatVND(config.baseSalary)} / {config.standardDaysInMonth} công chuẩn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400">1. Quy đổi ca & công:</div>
            <div className="text-sm font-bold text-white mt-1">2 ca/ngày = 1 công chuẩn</div>
            <div className="text-[11px] text-slate-400 mt-0.5">1 ca đơn lẻ = 0.5 công (nửa ngày)</div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400">2. Đơn giá 1 ca (0.5 công):</div>
            <div className="text-sm font-bold text-indigo-300 font-mono mt-1">
              {formatVND(shiftRate)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              10.000.000 ₫ ÷ ({config.standardDaysInMonth} công × 2 ca)
            </div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400">3. Đơn giá ngày làm full 2 ca (1 công):</div>
            <div className="text-sm font-bold text-emerald-300 font-mono mt-1">
              {formatVND(splitShiftDayRate)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              10.000.000 ₫ ÷ {config.standardDaysInMonth} ngày công chuẩn
            </div>
          </div>

          <div className="bg-[#0F172A] p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400">4. Phụ cấp kèm theo:</div>
            <div className="text-sm font-bold text-amber-300 mt-1">0 ₫ (Không phụ cấp)</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Không tiền ăn, xăng xe, điện thoại</div>
          </div>
        </div>

        <div className="bg-indigo-950/30 p-3 rounded-xl border border-indigo-900/40 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <strong>💡 Công thức tính lương tháng:</strong>{' '}
            <span className="text-indigo-200">
              Tổng lương = (Số ca đã làm × {formatVND(shiftRate)}) + Tiền tăng ca OT (nếu có) + Thưởng - Phạt
            </span>
          </div>
          <div className="text-emerald-300 font-semibold shrink-0">
            Làm đủ {config.standardDaysInMonth * 2} ca = Đúng {formatVND(config.baseSalary)}
          </div>
        </div>
      </div>

      {/* 3 Formula & Unit Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unit Rate 1 Shift */}
        <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-indigo-900/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              Đơn Giá 1 Ca (0.5 Công)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40 font-semibold">
              Nửa ngày làm
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-indigo-300 font-mono">
              {formatVND(shiftRate)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {formatVND(config.baseSalary)} ÷ ({config.standardDaysInMonth} ngày × 2 ca)
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Chạy 1 ca (Sáng hoặc Đêm):</span>
            <span className="font-semibold text-indigo-300 font-mono">
              {formatVND(shiftRate)}
            </span>
          </div>
        </div>

        {/* Unit Rate 1 Split-Shift Day (2 shifts) */}
        <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-emerald-900/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              1 Ngày Làm Full 2 Ca (1 Công)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold">
              1 Ngày công chuẩn
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-300 font-mono">
              {formatVND(splitShiftDayRate)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Làm 2 ca trong ngày (VD: Sáng + Đêm hoặc Sáng + Chiều)
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Phụ cấp:</span>
            <span className="font-semibold text-slate-400 font-mono">
              0 ₫ (Không phụ cấp)
            </span>
          </div>
        </div>

        {/* Overtime Rate */}
        <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-amber-900/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Đơn Giá Tăng Ca (OT Ngoài Ca)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/40 font-semibold">
              Theo giờ
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-300 font-mono">
              {formatVND(config.overtimeRatePerHour || 48077)} / giờ
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tháng này đã làm: <strong className="text-white">{summary.projectedOvertimeHours} giờ</strong> OT
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Tổng tiền tăng ca:</span>
            <span className="font-semibold text-amber-300 font-mono">
              {formatVND(summary.projectedOvertimeSalary)}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Detailed Breakdown Table & Electronic Salary Slip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Detailed Line-Item Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>Bảng Kê Chi Tiết Thu Nhập Tháng {summary.monthKey}</span>
          </h3>

          <div className="divide-y divide-slate-800 text-xs">
            {/* Section A: Lương Ca Làm */}
            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-400 flex items-center justify-center text-[10px]">A</span>
                  1. Lương Theo Ca & Ngày Công
                </span>
                <span className="text-indigo-400 font-mono text-sm">
                  {formatVND(summary.projectedBaseSalary)}
                </span>
              </div>
              <div className="pl-6 space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>• Ca Sáng ({summary.projectedMorningCount} ca × {formatVND(shiftRate)}):</span>
                  <span className="font-mono text-slate-200">{formatVND(summary.projectedMorningCount * shiftRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Ca Chiều ({summary.projectedAfternoonCount} ca × {formatVND(shiftRate)}):</span>
                  <span className="font-mono text-slate-200">{formatVND(summary.projectedAfternoonCount * shiftRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Ca Tối ({summary.projectedEveningCount} ca × {formatVND(shiftRate * (config.eveningShiftMultiplier || 1.0))}):</span>
                  <span className="font-mono text-slate-200">{formatVND(summary.projectedEveningCount * shiftRate * (config.eveningShiftMultiplier || 1.0))}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>Tổng số ca quy đổi:</span>
                  <span className="font-semibold text-slate-300">{summary.projectedTotalShifts} ca = {summary.projectedStandardDays} công chuẩn</span>
                </div>
              </div>
            </div>

            {/* Section B: Tăng Ca OT */}
            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-amber-950 text-amber-400 flex items-center justify-center text-[10px]">B</span>
                  2. Tiền Tăng Ca (Overtime - OT)
                </span>
                <span className="text-amber-400 font-mono text-sm">
                  +{formatVND(summary.projectedOvertimeSalary)}
                </span>
              </div>
              <div className="pl-6 text-slate-400 flex justify-between">
                <span>• {summary.projectedOvertimeHours} giờ × {formatVND(config.overtimeRatePerHour || 40000)}/giờ:</span>
                <span className="font-mono text-slate-200">{formatVND(summary.projectedOvertimeSalary)}</span>
              </div>
            </div>

            {/* Section C: Tiền Ăn & Phụ Cấp */}
            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-950 text-emerald-400 flex items-center justify-center text-[10px]">C</span>
                  3. Tiền Ăn Ca & Phụ Cấp
                </span>
                <span className="text-emerald-400 font-mono text-sm">
                  +{formatVND(summary.projectedMealAllowance + summary.projectedFixedAllowances)}
                </span>
              </div>
              <div className="pl-6 space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>• Tiền ăn ca (hỗ trợ khi làm ca gãy):</span>
                  <span className="font-mono text-slate-200">+{formatVND(summary.projectedMealAllowance)}</span>
                </div>
                {config.travelAllowance > 0 && (
                  <div className="flex justify-between">
                    <span>• Phụ cấp xăng xe / đi lại:</span>
                    <span className="font-mono text-slate-200">+{formatVND(config.travelAllowance)}</span>
                  </div>
                )}
                {config.phoneAllowance > 0 && (
                  <div className="flex justify-between">
                    <span>• Phụ cấp điện thoại / trách nhiệm:</span>
                    <span className="font-mono text-slate-200">+{formatVND(config.phoneAllowance)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section D: Chuyên Cần */}
            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-purple-950 text-purple-400 flex items-center justify-center text-[10px]">D</span>
                  4. Thưởng Chuyên Cần
                </span>
                <span className={`font-mono text-sm ${summary.projectedAttendanceBonus > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {summary.projectedAttendanceBonus > 0 ? `+${formatVND(summary.projectedAttendanceBonus)}` : '0 ₫'}
                </span>
              </div>
              <div className="pl-6 space-y-1 text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Tiến độ đạt chuyên cần ({summary.projectedStandardDays}/{config.attendanceRequiredDays || 24} công):</span>
                  <span className="font-semibold text-indigo-400">{attendanceProgress}%</span>
                </div>
                <div className="w-full bg-[#0F172A] rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${attendanceProgress}%` }} />
                </div>
                {summary.projectedAttendanceBonus > 0 ? (
                  <p className="text-[11px] text-emerald-400">✓ Đã đủ điều kiện nhận thưởng chuyên cần ({formatVND(config.attendanceBonus)})</p>
                ) : (
                  <p className="text-[11px] text-slate-500">Cần thêm {Math.max(0, (config.attendanceRequiredDays || 24) - summary.projectedStandardDays)} công để đạt thưởng</p>
                )}
              </div>
            </div>

            {/* Section E: Giảm Trừ */}
            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between font-bold text-rose-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-rose-950 text-rose-400 flex items-center justify-center text-[10px]">E</span>
                  5. Các Khoản Giảm Trừ / Tạm Ứng
                </span>
                <span className="font-mono text-sm">
                  -{formatVND((config.monthlyAdvance || 0) + (config.insuranceDeduction || 0) + (summary.accumulatedDeductions || 0))}
                </span>
              </div>
              <div className="pl-6 space-y-1 text-slate-400">
                {config.monthlyAdvance > 0 && (
                  <div className="flex justify-between">
                    <span>• Đã tạm ứng lương trong tháng:</span>
                    <span className="font-mono text-rose-400">-{formatVND(config.monthlyAdvance)}</span>
                  </div>
                )}
                {config.insuranceDeduction > 0 && (
                  <div className="flex justify-between">
                    <span>• Bảo hiểm / Công đoàn:</span>
                    <span className="font-mono text-rose-400">-{formatVND(config.insuranceDeduction)}</span>
                  </div>
                )}
                {summary.accumulatedDeductions > 0 && (
                  <div className="flex justify-between">
                    <span>• Trừ phạt / Khác:</span>
                    <span className="font-mono text-rose-400">-{formatVND(summary.accumulatedDeductions)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Grand Total Net Summary */}
            <div className="pt-4 flex items-center justify-between font-black text-sm">
              <span className="text-white text-base">THỰC LĨNH DỰ KIẾN (NET):</span>
              <span className="text-emerald-400 text-xl font-mono">
                {formatVND(summary.projectedNetSalary)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Digital Electronic Payslip Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#111827] to-[#0F172A] rounded-2xl p-5 border border-indigo-900/40 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header of slip */}
            <div className="border-b border-dashed border-slate-700 pb-4 text-center">
              <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white uppercase tracking-wider mb-2">
                Phiếu Lương Điện Tử
              </div>
              <h4 className="text-base font-extrabold text-white">
                BẢNG THANH TOÁN LƯƠNG CA GÃY
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Tháng {monthStr} Năm {yearStr}</p>
            </div>

            {/* Employee info */}
            <div className="py-3 border-b border-dashed border-slate-700 text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Họ và tên:</span>
                <strong className="text-white">{config.employeeName || 'Nhân viên'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nơi làm việc:</span>
                <span>{config.workplace || 'Chi nhánh'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tổng ca làm:</span>
                <span className="font-mono font-bold text-indigo-400">
                  {summary.projectedTotalShifts} ca ({summary.projectedStandardDays} công)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tăng ca OT:</span>
                <span className="font-mono text-amber-400">{summary.projectedOvertimeHours} giờ</span>
              </div>
            </div>

            {/* Income breakdown mini */}
            <div className="py-3 border-b border-dashed border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Lương ca cơ bản:</span>
                <span className="font-mono text-slate-200">{formatVND(summary.projectedBaseSalary)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tiền tăng ca (OT):</span>
                <span className="font-mono text-amber-400">+{formatVND(summary.projectedOvertimeSalary)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tiền ăn ca gãy:</span>
                <span className="font-mono text-emerald-400">+{formatVND(summary.projectedMealAllowance)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Phụ cấp & Thưởng:</span>
                <span className="font-mono text-emerald-400">
                  +{formatVND(summary.projectedAttendanceBonus + summary.projectedFixedAllowances)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Tổng thu nhập (Gross):</span>
                <span className="font-mono font-bold text-white">{formatVND(summary.projectedGrossSalary)}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Giảm trừ & Tạm ứng:</span>
                <span className="font-mono">
                  -{formatVND((config.monthlyAdvance || 0) + (config.insuranceDeduction || 0))}
                </span>
              </div>
            </div>

            {/* Net Amount Highlight */}
            <div className="py-4 text-center bg-indigo-950/30 rounded-xl my-3 border border-indigo-900/50">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Số Tiền Thực Lĩnh (Net)
              </p>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
                {formatVND(summary.projectedNetSalary)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 italic">
                (Đã tính lương ca gãy 2 ca/ngày, tiền ăn & khấu trừ)
              </p>
            </div>
          </div>

          {/* Slip actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={onPrintSlip}
              className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu Này</span>
            </button>
            <button
              onClick={handleCopyTextSlip}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              title="Sao chép nội dung phiếu"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
