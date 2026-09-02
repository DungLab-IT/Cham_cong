import React from 'react';
import { MonthSalarySummary, SalaryConfig } from '../types';
import { formatVND } from '../utils/salaryCalculator';

interface PrintSalarySlipProps {
  summary: MonthSalarySummary;
  config: SalaryConfig;
}

export const PrintSalarySlip: React.FC<PrintSalarySlipProps> = ({ summary, config }) => {
  const [year, month] = summary.monthKey.split('-');
  const standardDays = config.standardDaysInMonth || 28;
  const shiftsPerDay = config.standardShiftsPerDay || 2;
  const shiftRate = Math.round(config.baseSalary / (standardDays * shiftsPerDay));
  const fullDayRate = shiftRate * shiftsPerDay;

  return (
    <div className="hidden print:block p-8 bg-white text-black max-w-4xl mx-auto text-sm print-only">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-slate-900">
        <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold mb-1">
          {config.workplace ? config.workplace.toUpperCase() : 'BẢNG LƯƠNG NHÂN VIÊN'}
        </p>
        <h1 className="text-xl font-bold uppercase tracking-wider text-slate-950">
          PHIẾU TÍNH LƯƠNG & BẢNG CHẤM CÔNG
        </h1>
        <p className="text-base font-semibold mt-1 text-slate-800">
          KỲ LƯƠNG: THÁNG {month} NĂM {year}
        </p>
        <div className="flex justify-between items-center mt-4 text-xs text-slate-700 pt-2 border-t border-slate-200">
          <p>
            Họ và tên: <strong>{config.employeeName || 'Nhân viên'}</strong>
          </p>
          <p>
            Nơi làm việc: <strong>{config.workplace || 'Toàn thời gian'}</strong>
          </p>
          <p>
            Ngày in: <strong>{new Date().toLocaleDateString('vi-VN')}</strong>
          </p>
        </div>
      </div>

      {/* Salary Overview Box */}
      <div className="my-5 grid grid-cols-2 gap-4 border border-slate-300 p-4 rounded text-xs bg-slate-50">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span>Mức lương cơ bản:</span>
            <strong className="font-mono">{formatVND(config.baseSalary)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Số ngày công chuẩn:</span>
            <strong>{standardDays} ngày ({shiftsPerDay} ca/công • Nghỉ 2 ngày)</strong>
          </div>
          <div className="flex justify-between">
            <span>Đơn giá 1 ca (0.5 công):</span>
            <strong className="font-mono">{formatVND(shiftRate)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Đơn giá 2 ca/ngày (1 công):</span>
            <strong className="font-mono">{formatVND(fullDayRate)}</strong>
          </div>
        </div>

        <div className="space-y-1.5 border-l border-slate-200 pl-4">
          <div className="flex justify-between">
            <span>Tổng số ca đã làm:</span>
            <strong>{summary.projectedTotalShifts} ca ({summary.projectedStandardDays} công)</strong>
          </div>
          <div className="flex justify-between">
            <span>Lương ca làm việc:</span>
            <strong className="font-mono">{formatVND(summary.projectedBaseSalary)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Phụ cấp & Tăng ca:</span>
            <span className="font-mono text-slate-500">0 ₫ (Không phụ cấp, không OT)</span>
          </div>
          <div className="flex justify-between text-rose-700">
            <span>Tạm ứng / Giảm trừ:</span>
            <strong className="font-mono">-{formatVND(summary.projectedDeductions || 0)}</strong>
          </div>
        </div>
      </div>

      {/* Hero Summary Box */}
      <div className="p-4 bg-slate-100 border-2 border-slate-900 rounded mb-5 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-600">Lương tích lũy đến hiện tại</p>
          <p className="text-lg font-bold font-mono text-slate-900">{formatVND(summary.accumulatedNetSalary)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase text-slate-900">LƯƠNG THỰC NHẬN CẢ THÁNG (NET)</p>
          <p className="text-2xl font-extrabold font-mono text-slate-950">{formatVND(summary.projectedNetSalary)}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="mt-4">
        <h2 className="font-bold text-xs uppercase mb-2 text-slate-900">Chi Tiết Từng Ngày Chấm Công</h2>
        <table className="w-full text-xs border border-slate-300 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-center font-bold text-slate-800">
              <th className="border border-slate-300 py-1 px-2 w-16">Ngày</th>
              <th className="border border-slate-300 py-1 px-2 w-14">Thứ</th>
              <th className="border border-slate-300 py-1 px-2 w-12">Sáng</th>
              <th className="border border-slate-300 py-1 px-2 w-12">Chiều</th>
              <th className="border border-slate-300 py-1 px-2 w-12">Tối</th>
              <th className="border border-slate-300 py-1 px-2 w-16">Tổng Ca</th>
              <th className="border border-slate-300 py-1 px-2 w-14">Công</th>
              <th className="border border-slate-300 py-1 px-2 text-right w-24">Tiền Ngày</th>
              <th className="border border-slate-300 py-1 px-2">Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
            {summary.daysDetail.map((d) => (
              <tr key={d.dayAttendance.date} className={`text-center ${d.totalShifts === 0 ? 'bg-slate-50 text-slate-400' : ''}`}>
                <td className="border border-slate-300 py-1 px-2 font-mono">
                  {d.dayAttendance.date.split('-').slice(1).reverse().join('/')}
                </td>
                <td className="border border-slate-300 py-1 px-2">{d.dayOfWeek}</td>
                <td className="border border-slate-300 py-1 px-2 font-bold">{d.dayAttendance.morning ? '✓' : ''}</td>
                <td className="border border-slate-300 py-1 px-2 font-bold">{d.dayAttendance.afternoon ? '✓' : ''}</td>
                <td className="border border-slate-300 py-1 px-2 font-bold">{d.dayAttendance.evening ? '✓' : ''}</td>
                <td className="border border-slate-300 py-1 px-2 font-bold">{d.totalShifts > 0 ? d.totalShifts : 'Nghỉ'}</td>
                <td className="border border-slate-300 py-1 px-2 font-mono">
                  {d.totalShifts > 0 ? (d.totalShifts / shiftsPerDay).toFixed(1) : '-'}
                </td>
                <td className="border border-slate-300 py-1 px-2 text-right font-mono font-bold">
                  {d.totalDayEarnings > 0 ? formatVND(d.totalDayEarnings) : '-'}
                </td>
                <td className="border border-slate-300 py-1 px-2 text-left">{d.dayAttendance.note || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <div className="mt-8 pt-4 flex justify-between text-xs text-center border-t border-slate-200">
        <div>
          <p className="font-bold">Người lập bảng</p>
          <p className="mt-14 font-semibold text-slate-700">Tự động xuất</p>
        </div>
        <div>
          <p className="font-bold">Người duyệt lương</p>
          <p className="mt-14 font-semibold text-slate-700">Kế toán / Quản lý</p>
        </div>
        <div>
          <p className="font-bold">Người nhận lương</p>
          <p className="mt-14 font-semibold text-slate-900">{config.employeeName || 'Nhân viên'}</p>
        </div>
      </div>
    </div>
  );
};
