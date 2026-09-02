import React, { useRef, useState } from 'react';
import {
  Printer,
  Download,
  Copy,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Building2,
  User,
  Calendar,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { MonthSalarySummary, SalaryConfig } from '../types';
import { formatVND } from '../utils/salaryCalculator';
import { exportToExcelXLSX } from '../utils/sheetExporter';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthSalarySummary;
  config: SalaryConfig;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  summary,
  config,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [year, month] = summary.monthKey.split('-');

  if (!isOpen) return null;

  // Rate calculations (10M / 28 days)
  const standardDays = config.standardDaysInMonth || 28;
  const shiftsPerDay = config.standardShiftsPerDay || 2;
  const shiftRate = Math.round(config.baseSalary / (standardDays * shiftsPerDay));
  const fullDayRate = shiftRate * shiftsPerDay;

  // Handle direct print using iframe technique to bypass iframe restrictions
  const handlePrint = () => {
    setIsPrinting(true);

    try {
      // Create hidden iframe for reliable printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        setIsPrinting(false);
        return;
      }

      const slipHtml = generatePrintableHtml(summary, config, shiftRate, fullDayRate, standardDays);
      doc.open();
      doc.write(slipHtml);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            setIsPrinting(false);
          }, 1000);
        }
      }, 500);
    } catch {
      window.print();
      setIsPrinting(false);
    }
  };

  // Download standalone offline printable HTML file
  const handleDownloadHtml = () => {
    const slipHtml = generatePrintableHtml(summary, config, shiftRate, fullDayRate, standardDays);
    const blob = new Blob([slipHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Phieu_Luong_Thang_${month}_${year}_${(config.employeeName || 'NhanVien').replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy text slip to clipboard
  const handleCopyText = () => {
    const text = `=== PHIẾU LƯƠNG THÁNG ${summary.monthKey} ===
Họ và tên: ${config.employeeName || 'Nhân viên'}
Nơi làm việc: ${config.workplace || 'Chi nhánh'}
Mức lương cơ bản: ${formatVND(config.baseSalary)} / ${standardDays} ngày công chuẩn

THỐNG KÊ CÔNG & CA LÀM:
- Tổng số ca: ${summary.projectedTotalShifts} ca (${summary.projectedStandardDays} công)
- Ca Sáng: ${summary.projectedMorningCount} ca
- Ca Chiều: ${summary.projectedAfternoonCount} ca
- Ca Tối: ${summary.projectedEveningCount} ca
- Số ngày nghỉ: ${summary.daysDetail.filter((d) => d.totalShifts === 0).length} ngày
- Tăng ca OT: Không có (3 ca cố định)

CHI TIẾT THU NHẬP:
1. Lương ca & công làm việc: ${formatVND(summary.projectedBaseSalary)}
2. Tiền ăn & phụ cấp: 0 ₫
3. Tạm ứng / Giảm trừ: -${formatVND(summary.projectedDeductions || 0)}

>>> THỰC LĨNH CẢ THÁNG (NET): ${formatVND(summary.projectedNetSalary)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto no-print">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>In Phiếu Lương & Xuất Báo Cáo</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                  Tháng {month}/{year}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Chuẩn 10.000.000 ₫ / 28 công (2 ca/ngày = 1 công = 357.143 ₫ • Không tăng ca)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="p-3 bg-[#161F30] border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              id="btn-modal-print-direct"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Đang mở máy in...' : 'In Phiếu Lương (Print / PDF)'}</span>
            </button>

            {/* Download Offline HTML */}
            <button
              onClick={handleDownloadHtml}
              id="btn-modal-download-html"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              title="Tải về file HTML có thể mở trên mọi trình duyệt và in tức thì"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tải File In (.html)</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={() => exportToExcelXLSX(summary, config)}
              id="btn-modal-export-excel"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 hover:text-emerald-200 text-xs font-semibold rounded-xl border border-emerald-800/60 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Excel</span>
            </button>
          </div>

          {/* Copy Text Slip */}
          <button
            onClick={handleCopyText}
            id="btn-modal-copy-text"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
              copied
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Sao chép văn bản</span>
              </>
            )}
          </button>
        </div>

        {/* Printable Payslip Preview Container (High-Contrast White Paper Style) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950/70 flex justify-center">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-xl shadow-xl p-6 sm:p-8 font-sans text-xs border border-slate-200 selection:bg-indigo-100">
            {/* Payslip Header */}
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="text-[11px] uppercase tracking-widest text-slate-600 font-semibold mb-1">
                {config.workplace ? config.workplace.toUpperCase() : 'BẢNG LƯƠNG NHÂN VIÊN'}
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                PHIẾU TÍNH LƯƠNG & BẢNG CHẤM CÔNG
              </h1>
              <div className="text-sm font-bold text-indigo-900 mt-1">
                KỲ LƯƠNG: THÁNG {month} NĂM {year}
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 text-left text-xs">
                <div>
                  <span className="text-slate-500">Họ và tên:</span>{' '}
                  <strong className="text-slate-900">{config.employeeName || 'Nhân viên'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Nơi làm việc:</span>{' '}
                  <strong className="text-slate-900">{config.workplace || 'Toàn thời gian'}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Ngày in:</span>{' '}
                  <strong className="text-slate-900">{new Date().toLocaleDateString('vi-VN')}</strong>
                </div>
              </div>
            </div>

            {/* Key Standard Configuration Grid */}
            <div className="my-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <div className="text-[11px] text-slate-500">Lương cơ bản:</div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {formatVND(config.baseSalary)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Chuẩn ngày công:</div>
                <div className="text-sm font-bold text-slate-900">
                  {standardDays} ngày (Nghỉ 2 ngày)
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Đơn giá 1 ca:</div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {formatVND(shiftRate)} (0.5 công)
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Đơn giá 2 ca/ngày:</div>
                <div className="text-sm font-bold text-emerald-700 font-mono">
                  {formatVND(fullDayRate)} (1 công)
                </div>
              </div>
            </div>

            {/* Income & Attendance Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              {/* Box 1: Shift details */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1">
                  1. Thống kê ca & ngày công
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span>• Tổng số ca đã làm:</span>
                    <strong className="text-slate-900">{summary.projectedTotalShifts} ca ({summary.projectedStandardDays} công)</strong>
                  </div>
                  <div className="flex justify-between pl-3 text-slate-600 text-[11px]">
                    <span>- Ca Sáng:</span>
                    <span>{summary.projectedMorningCount} ca</span>
                  </div>
                  <div className="flex justify-between pl-3 text-slate-600 text-[11px]">
                    <span>- Ca Chiều:</span>
                    <span>{summary.projectedAfternoonCount} ca</span>
                  </div>
                  <div className="flex justify-between pl-3 text-slate-600 text-[11px]">
                    <span>- Ca Tối:</span>
                    <span>{summary.projectedEveningCount} ca</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1">
                    <span>• Số ngày nghỉ trong tháng:</span>
                    <strong className="text-slate-900">
                      {summary.daysDetail.filter((d) => d.totalShifts === 0).length} ngày
                    </strong>
                  </div>
                </div>
              </div>

              {/* Box 2: Calculation results */}
              <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="font-bold text-slate-900 uppercase text-[11px] border-b border-slate-200 pb-1">
                  2. Chi tiết tiền lương & Giảm trừ
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span>• Lương ca làm việc:</span>
                    <strong className="font-mono text-slate-900">{formatVND(summary.projectedBaseSalary)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>• Phụ cấp & Tiền ăn:</span>
                    <span className="font-mono text-slate-500">0 ₫ (Không phụ cấp)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Tăng ca OT:</span>
                    <span className="font-mono text-slate-500">0 ₫ (3 ca cố định)</span>
                  </div>
                  <div className="flex justify-between text-rose-700 border-t border-slate-100 pt-1">
                    <span>• Tạm ứng & Giảm trừ:</span>
                    <strong className="font-mono">-{formatVND(summary.projectedDeductions || 0)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Net Salary Banner */}
            <div className="my-5 p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Lương Thực Nhận Cả Tháng (NET)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Đã làm {summary.projectedTotalShifts} ca / {standardDays * 2} ca chuẩn
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {formatVND(summary.projectedNetSalary)}
                </div>
              </div>
            </div>

            {/* Detailed Daily Attendance Table */}
            <div className="mt-5">
              <div className="font-bold text-slate-900 uppercase text-[11px] mb-2 flex items-center justify-between">
                <span>Bảng Chi Tiết Từng Ngày Chấm Công Trong Tháng</span>
                <span className="text-slate-500 font-normal">{summary.daysDetail.length} ngày</span>
              </div>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-center font-bold text-slate-700">
                    <th className="border border-slate-300 py-1.5 px-2 w-16">Ngày</th>
                    <th className="border border-slate-300 py-1.5 px-2 w-16">Thứ</th>
                    <th className="border border-slate-300 py-1.5 px-2 w-14 bg-amber-50">Sáng</th>
                    <th className="border border-slate-300 py-1.5 px-2 w-14 bg-orange-50">Chiều</th>
                    <th className="border border-slate-300 py-1.5 px-2 w-14 bg-indigo-50">Tối</th>
                    <th className="border border-slate-300 py-1.5 px-2 w-16">Tổng Ca</th>
                    <th className="border border-slate-300 py-1.5 px-2 w-16">Công</th>
                    <th className="border border-slate-300 py-1.5 px-2 text-right w-24">Tiền Ngày</th>
                    <th className="border border-slate-300 py-1.5 px-2">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.daysDetail.map((d) => (
                    <tr
                      key={d.dayAttendance.date}
                      className={`text-center ${d.totalShifts === 0 ? 'bg-slate-50 text-slate-400' : ''}`}
                    >
                      <td className="border border-slate-300 py-1 px-2 font-mono">
                        {d.dayAttendance.date.split('-').slice(1).reverse().join('/')}
                      </td>
                      <td className="border border-slate-300 py-1 px-2">{d.dayOfWeek}</td>
                      <td className="border border-slate-300 py-1 px-2 font-bold text-amber-700">
                        {d.dayAttendance.morning ? '✓' : '-'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 font-bold text-orange-700">
                        {d.dayAttendance.afternoon ? '✓' : '-'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 font-bold text-indigo-700">
                        {d.dayAttendance.evening ? '✓' : '-'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 font-bold">
                        {d.totalShifts > 0 ? d.totalShifts : 'Nghỉ'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 font-mono font-semibold">
                        {d.totalShifts > 0 ? (d.totalShifts / shiftsPerDay).toFixed(1) : '-'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 text-right font-mono font-semibold text-slate-900">
                        {d.totalDayEarnings > 0 ? formatVND(d.totalDayEarnings) : '-'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 text-left text-slate-600 text-[11px]">
                        {d.dayAttendance.note || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Block */}
            <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-3 text-center text-xs">
              <div>
                <p className="font-bold text-slate-900">Người lập bảng</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-16" />
                <p className="font-semibold text-slate-800">Tự động xuất</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Người duyệt lương</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-16" />
                <p className="font-semibold text-slate-800">Kế toán / Quản lý</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Người nhận lương</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-16" />
                <p className="font-bold text-slate-900">{config.employeeName || 'Nhân viên'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 sm:p-4 bg-[#0F172A] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Đã xác thực dữ liệu chấm công & tính lương tháng {month}/{year}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Generate full standalone printable HTML page for isolated iframe and offline file download
 */
function generatePrintableHtml(
  summary: MonthSalarySummary,
  config: SalaryConfig,
  shiftRate: number,
  fullDayRate: number,
  standardDays: number
): string {
  const [year, month] = summary.monthKey.split('-');
  const shiftsPerDay = config.standardShiftsPerDay || 2;

  const tableRows = summary.daysDetail
    .map(
      (d) => `
    <tr class="${d.totalShifts === 0 ? 'off-day' : ''}">
      <td class="center font-mono">${d.dayAttendance.date.split('-').slice(1).reverse().join('/')}</td>
      <td class="center">${d.dayOfWeek}</td>
      <td class="center shift-val">${d.dayAttendance.morning ? '✓' : '-'}</td>
      <td class="center shift-val">${d.dayAttendance.afternoon ? '✓' : '-'}</td>
      <td class="center shift-val">${d.dayAttendance.evening ? '✓' : '-'}</td>
      <td class="center font-bold">${d.totalShifts > 0 ? d.totalShifts : 'Nghỉ'}</td>
      <td class="center font-mono">${d.totalShifts > 0 ? (d.totalShifts / shiftsPerDay).toFixed(1) : '-'}</td>
      <td class="right font-mono font-bold">${d.totalDayEarnings > 0 ? formatVND(d.totalDayEarnings) : '-'}</td>
      <td class="left">${d.dayAttendance.note || ''}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Phiếu Lương Tháng ${month}/${year} - ${config.employeeName || 'Nhân viên'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #111827;
      background: #fff;
      padding: 15px;
    }
    .font-mono { font-family: "Courier New", Courier, monospace; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 15px; }
    .company { font-size: 10pt; text-transform: uppercase; letter-spacing: 1px; color: #475569; margin-bottom: 4px; }
    .title { font-size: 18pt; font-weight: 900; text-transform: uppercase; color: #0f172a; }
    .month { font-size: 12pt; font-weight: bold; color: #3730a3; margin-top: 2px; }
    .info-grid { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 10pt; }
    
    .config-box { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 9.5pt; }
    .config-box div { flex: 1; }
    .config-box .val { font-size: 11pt; font-weight: bold; color: #0f172a; margin-top: 2px; }

    .summary-grid { display: flex; gap: 12px; margin-bottom: 14px; }
    .summary-card { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; font-size: 9.5pt; }
    .summary-card .card-title { font-weight: bold; text-transform: uppercase; font-size: 9pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    
    .net-box { background: #0f172a; color: #fff; border-radius: 6px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin: 14px 0; }
    .net-label { font-size: 10pt; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; }
    .net-val { font-size: 20pt; font-weight: 900; color: #34d399; }

    table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 10px; }
    th, td { border: 1px solid #94a3b8; padding: 4px 6px; }
    th { background: #f1f5f9; font-weight: bold; color: #1e293b; text-align: center; }
    .center { text-align: center; }
    .right { text-align: right; }
    .left { text-align: left; }
    .font-bold { font-weight: bold; }
    .off-day { background: #f8fafc; color: #64748b; }
    .shift-val { font-weight: bold; }

    .signatures { display: flex; justify-content: space-between; margin-top: 25px; padding-top: 15px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 9.5pt; page-break-inside: avoid; }
    .signatures div { width: 30%; }
    .sig-space { height: 60px; }

    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company">${config.workplace || 'BẢNG LƯƠNG NHÂN VIÊN'}</div>
    <div class="title">PHIẾU TÍNH LƯƠNG & BẢNG CHẤM CÔNG</div>
    <div class="month">KỲ LƯƠNG: THÁNG ${month} NĂM ${year}</div>
    <div class="info-grid">
      <div>Họ và tên: <strong>${config.employeeName || 'Nhân viên'}</strong></div>
      <div>Nơi làm việc: <strong>${config.workplace || 'Toàn thời gian'}</strong></div>
      <div>Ngày in: <strong>${new Date().toLocaleDateString('vi-VN')}</strong></div>
    </div>
  </div>

  <div class="config-box">
    <div>
      <div>Lương cơ bản:</div>
      <div class="val font-mono">${formatVND(config.baseSalary)}</div>
    </div>
    <div>
      <div>Chuẩn ngày công:</div>
      <div class="val">${standardDays} ngày (nghỉ 2 ngày)</div>
    </div>
    <div>
      <div>Đơn giá 1 ca:</div>
      <div class="val font-mono">${formatVND(shiftRate)} (0.5 công)</div>
    </div>
    <div>
      <div>Đơn giá 2 ca/ngày:</div>
      <div class="val font-mono">${formatVND(fullDayRate)} (1 công)</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="card-title">1. Thống kê ca làm & ngày công</div>
      <div class="summary-row">
        <span>Tổng số ca đã làm:</span>
        <strong>${summary.projectedTotalShifts} ca (${summary.projectedStandardDays} công)</strong>
      </div>
      <div class="summary-row">
        <span>• Ca Sáng:</span>
        <span>${summary.projectedMorningCount} ca</span>
      </div>
      <div class="summary-row">
        <span>• Ca Chiều:</span>
        <span>${summary.projectedAfternoonCount} ca</span>
      </div>
      <div class="summary-row">
        <span>• Ca Tối:</span>
        <span>${summary.projectedEveningCount} ca</span>
      </div>
      <div class="summary-row">
        <span>• Số ngày nghỉ:</span>
        <strong>${summary.daysDetail.filter((d) => d.totalShifts === 0).length} ngày</strong>
      </div>
    </div>

    <div class="summary-card">
      <div class="card-title">2. Chi tiết tiền lương</div>
      <div class="summary-row">
        <span>Lương ca làm việc:</span>
        <strong class="font-mono">${formatVND(summary.projectedBaseSalary)}</strong>
      </div>
      <div class="summary-row">
        <span>Phụ cấp & Tiền ăn:</span>
        <span class="font-mono">0 ₫ (Không phụ cấp)</span>
      </div>
      <div class="summary-row">
        <span>Tăng ca OT:</span>
        <span class="font-mono">0 ₫ (3 ca cố định)</span>
      </div>
      <div class="summary-row" style="color: #b91c1c;">
        <span>Tạm ứng & Giảm trừ:</span>
        <strong class="font-mono">-${formatVND(summary.projectedDeductions || 0)}</strong>
      </div>
    </div>
  </div>

  <div class="net-box">
    <div>
      <div class="net-label">Lương Thực Nhận Cả Tháng (NET)</div>
      <div style="font-size: 9pt; color: #94a3b8; margin-top: 2px;">Đã làm ${summary.projectedTotalShifts} ca / ${standardDays * 2} ca chuẩn</div>
    </div>
    <div class="net-val font-mono">${formatVND(summary.projectedNetSalary)}</div>
  </div>

  <div>
    <div style="font-weight: bold; font-size: 9.5pt; text-transform: uppercase; margin-bottom: 4px;">
      Chi tiết từng ngày chấm công trong tháng
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">Ngày</th>
          <th style="width: 50px;">Thứ</th>
          <th style="width: 40px;">Sáng</th>
          <th style="width: 40px;">Chiều</th>
          <th style="width: 40px;">Tối</th>
          <th style="width: 50px;">Tổng Ca</th>
          <th style="width: 50px;">Công</th>
          <th style="width: 90px;">Tiền Ngày</th>
          <th>Ghi Chú</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>

  <div class="signatures">
    <div>
      <p style="font-weight: bold;">Người lập bảng</p>
      <p style="font-size: 8.5pt; font-style: italic; color: #64748b;">(Ký, ghi rõ họ tên)</p>
      <div class="sig-space"></div>
      <p style="font-weight: 600;">Tự động xuất</p>
    </div>
    <div>
      <p style="font-weight: bold;">Người duyệt lương</p>
      <p style="font-size: 8.5pt; font-style: italic; color: #64748b;">(Ký, ghi rõ họ tên)</p>
      <div class="sig-space"></div>
      <p style="font-weight: 600;">Kế toán / Quản lý</p>
    </div>
    <div>
      <p style="font-weight: bold;">Người nhận lương</p>
      <p style="font-size: 8.5pt; font-style: italic; color: #64748b;">(Ký, ghi rõ họ tên)</p>
      <div class="sig-space"></div>
      <p style="font-weight: bold;">${config.employeeName || 'Nhân viên'}</p>
    </div>
  </div>
</body>
</html>`;
}
