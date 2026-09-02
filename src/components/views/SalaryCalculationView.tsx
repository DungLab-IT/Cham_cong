import React, { useState } from 'react';
import {
  Calculator,
  Wallet,
  TrendingUp,
  Printer,
  Copy,
  CheckCircle2,
  DollarSign,
  Sun,
  Sunset,
  Moon,
  Zap,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';
import { MonthSalarySummary, SalaryConfig } from '../../types';
import { formatVND } from '../../utils/salaryCalculator';

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

  const standardDays = config.standardDaysInMonth || 28;
  const shiftsPerStandard = config.standardShiftsPerDay || 2;
  const shiftRate = Math.round(config.baseSalary / (standardDays * shiftsPerStandard));
  const splitShiftDayRate = shiftRate * shiftsPerStandard;

  const handleCopyTextSlip = () => {
    const text = `=== PHIẾU LƯƠNG THÁNG ${summary.monthKey} ===
Họ và tên: ${config.employeeName || 'Nhân viên'}
Nơi làm việc: ${config.workplace || 'Chi nhánh'}
Mức lương cơ bản: ${formatVND(config.baseSalary)} / ${standardDays} ngày công chuẩn (2 ca = 1 công)

THỐNG KÊ CÔNG & CA LÀM:
- Tổng số ca: ${summary.projectedTotalShifts} ca (${summary.projectedStandardDays} công)
- Ca Sáng: ${summary.projectedMorningCount} ca
- Ca Chiều: ${summary.projectedAfternoonCount} ca
- Ca Tối: ${summary.projectedEveningCount} ca
- Số ngày nghỉ trong tháng: ${summary.daysDetail.filter((d) => d.totalShifts === 0).length} ngày

CHI TIẾT THU NHẬP:
1. Lương ca & ngày công: ${formatVND(summary.projectedBaseSalary)}
2. Tiền ăn & phụ cấp: 0 ₫
3. Tăng ca: 0 ₫ (3 ca cố định)
4. Tạm ứng / Giảm trừ: -${formatVND(summary.projectedDeductions || 0)}

>>> THỰC LĨNH CẢ THÁNG (NET): ${formatVND(summary.projectedNetSalary)}`;

    navigator.clipboard.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#111827] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-emerald-900/40 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
              Chi Tiết Tính Lương
            </span>
            <span className="text-xs text-slate-400 font-medium">Kỳ {summary.monthKey}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Bảng Chiết Tính Lương 28 Ngày Công
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Chuẩn lương 10.000.000 ₫ / 28 ngày công (nghỉ 2 ngày), 2 ca/ngày = 1 công = 357.143 ₫, 1 ca lẻ = 0.5 công = 178.571 ₫, không tăng ca.
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
            id="btn-view-print-slip"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Phiếu Lương / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Mechanism Explanation Box */}
      <div className="bg-[#111827] rounded-2xl p-5 border border-indigo-500/40 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Quy Chuẩn Tính Lương 28 Ngày Công & 3 Ca Cố Định
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
            {formatVND(config.baseSalary)} / {standardDays} công chuẩn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              1. Tháng 30/31 ngày chuẩn 28 công
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Mỗi tháng được nghỉ 2 ngày. Tháng 30 ngày làm 28 ngày nghỉ 2 ngày; tháng 31 ngày làm 28 ngày nghỉ 3 ngày (hoặc làm thêm tính thêm công).
            </p>
          </div>

          <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              2. Đơn giá công & ca làm
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              • 1 ngày làm full 2 ca = <strong>1 công</strong> = <span className="text-white font-mono">{formatVND(splitShiftDayRate)}</span>.<br />
              • 1 ca đơn lẻ = <strong>0.5 công</strong> = <span className="text-white font-mono">{formatVND(shiftRate)}</span>.
            </p>
          </div>

          <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5" />
              3. Hệ thống 3 ca cố định
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ca Sáng, Ca Chiều, Ca Tối được phân bổ cố định trong ngày, không có tăng ca OT ngoài giờ.
            </p>
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
              {formatVND(config.baseSalary)} ÷ ({standardDays} ngày × 2 ca)
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Chạy 1 ca (Sáng / Chiều / Tối):</span>
            <span className="font-semibold text-indigo-300 font-mono">
              {formatVND(shiftRate)}
            </span>
          </div>
        </div>

        {/* Unit Rate 1 Full Day (2 shifts) */}
        <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-emerald-900/40 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              1 Ngày Làm 2 Ca (1.0 Công)
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
              Làm 2 ca trong ngày (Sáng + Tối hoặc Sáng + Chiều...)
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Phụ cấp & Tiền ăn:</span>
            <span className="font-semibold text-slate-400 font-mono">
              0 ₫ (Không phụ cấp)
            </span>
          </div>
        </div>

        {/* Standard Base Salary Card */}
        <div className="bg-[#111827] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Lương Cơ Bản Chuẩn Tháng
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
              {standardDays} ngày công
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              {formatVND(config.baseSalary)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tương đương 56 ca làm việc trong tháng ({standardDays} × 2 ca)
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Đã hoàn thành:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {summary.projectedTotalShifts} ca ({summary.projectedStandardDays} công)
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
                  <span className="w-5 h-5 rounded-md bg-indigo-950 text-indigo-400 flex items-center justify-center text-[10px]">1</span>
                  Lương Theo Ca & Ngày Công Làm Việc
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
                  <span>• Ca Tối ({summary.projectedEveningCount} ca × {formatVND(shiftRate)}):</span>
                  <span className="font-mono text-slate-200">{formatVND(summary.projectedEveningCount * shiftRate)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>Tổng số ca quy đổi:</span>
                  <span className="font-semibold text-slate-300">{summary.projectedTotalShifts} ca = {summary.projectedStandardDays} công chuẩn</span>
                </div>
              </div>
            </div>

            {/* Section B: Tiền Ăn & Phụ Cấp (0 đ) */}
            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-[10px]">2</span>
                  Tiền Ăn & Phụ Cấp
                </span>
                <span className="text-slate-400 font-mono text-sm">
                  0 ₫
                </span>
              </div>
              <div className="pl-6 space-y-1 text-slate-500 text-[11px]">
                <span>Không phát sinh tiền ăn hoặc phụ cấp bổ sung.</span>
              </div>
            </div>

            {/* Section C: Giảm Trừ */}
            <div className="py-3 space-y-2">
              <div className="flex items-center justify-between font-bold text-rose-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-rose-950 text-rose-400 flex items-center justify-center text-[10px]">3</span>
                  Các Khoản Giảm Trừ / Tạm Ứng
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
                {config.monthlyAdvance === 0 && config.insuranceDeduction === 0 && summary.accumulatedDeductions === 0 && (
                  <span className="text-[11px] text-slate-500">Không có khoản giảm trừ nào.</span>
                )}
              </div>
            </div>

            {/* Grand Total Net Summary */}
            <div className="pt-4 flex items-center justify-between font-black text-sm">
              <span className="text-white text-base">THỰC LĨNH CẢ THÁNG (NET):</span>
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
                BẢNG THANH TOÁN LƯƠNG NHÂN VIÊN
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
                <span className="font-mono text-slate-400">0 (3 ca cố định)</span>
              </div>
            </div>

            {/* Income breakdown mini */}
            <div className="py-3 border-b border-dashed border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Lương ca cơ bản:</span>
                <span className="font-mono text-slate-200">{formatVND(summary.projectedBaseSalary)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Phụ cấp & Tiền ăn:</span>
                <span className="font-mono text-slate-400">0 ₫</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Tổng thu nhập:</span>
                <span className="font-mono font-bold text-white">{formatVND(summary.projectedBaseSalary)}</span>
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
                (Chuẩn 28 ngày công • 2 ca/ngày = 1 công)
              </p>
            </div>
          </div>

          {/* Slip actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={onPrintSlip}
              className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Lương / Xuất PDF</span>
            </button>
            <button
              onClick={handleCopyTextSlip}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Sao chép nội dung phiếu"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
