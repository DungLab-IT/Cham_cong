import React from 'react';
import { MonthSalarySummary, SalaryConfig } from '../types';
import { formatVND } from '../utils/salaryCalculator';

interface PrintSalarySlipProps {
  summary: MonthSalarySummary;
  config: SalaryConfig;
}

export const PrintSalarySlip: React.FC<PrintSalarySlipProps> = ({ summary, config }) => {
  const [year, month] = summary.monthKey.split('-');

  return (
    <div className="hidden print:block p-8 bg-white text-black max-w-4xl mx-auto text-sm">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-slate-900">
        <h1 className="text-xl font-bold uppercase tracking-wider">
          PHIẾU TÍNH LƯƠNG & BẢNG CHẤM CÔNG CA GÃY
        </h1>
        <p className="text-base font-semibold mt-1">
          THÁNG {month} NĂM {year}
        </p>
        <div className="flex justify-between items-center mt-4 text-xs text-slate-700">
          <p>
            Họ và tên: <strong>{config.employeeName || 'Cá nhân'}</strong>
          </p>
          <p>
            Nơi làm việc: <strong>{config.workplace || 'Toàn thời gian / Ca gãy'}</strong>
          </p>
          <p>
            Ngày in: <strong>{new Date().toLocaleDateString('vi-VN')}</strong>
          </p>
        </div>
      </div>

      {/* Salary Overview Box */}
      <div className="my-6 grid grid-cols-2 gap-4 border border-slate-300 p-4 rounded text-xs">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span>Mức lương cơ bản:</span>
            <strong className="font-mono">{formatVND(config.baseSalary)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Số ngày công chuẩn:</span>
            <strong>{config.standardDaysInMonth} công ({config.standardShiftsPerDay} ca/công)</strong>
          </div>
          <div className="flex justify-between">
            <span>Số công thực tế cả tháng:</span>
            <strong>{summary.projectedStandardDays} công ({summary.projectedTotalShifts} ca)</strong>
          </div>
          <div className="flex justify-between">
            <span>Số công đã làm đến hiện tại:</span>
            <strong>{summary.workedStandardDays} công ({summary.workedTotalShifts} ca)</strong>
          </div>
        </div>

        <div className="space-y-1.5 border-l border-slate-200 pl-4">
          <div className="flex justify-between">
            <span>Lương ca & công làm việc:</span>
            <strong className="font-mono">{formatVND(summary.projectedBaseSalary)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Tiền ăn ca gãy:</span>
            <strong className="font-mono">{formatVND(summary.projectedMealAllowance)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Phụ cấp (Xăng xe/ĐT) & Chuyên cần:</span>
            <strong className="font-mono">
              {formatVND(summary.projectedFixedAllowances + summary.projectedAttendanceBonus)}
            </strong>
          </div>
          <div className="flex justify-between text-rose-700">
            <span>Các khoản trừ / Tạm ứng:</span>
            <strong className="font-mono">-{formatVND(summary.projectedDeductions)}</strong>
          </div>
        </div>
      </div>

      {/* Hero Summary Box */}
      <div className="p-4 bg-slate-100 border-2 border-slate-900 rounded mb-6 flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-600">Lương tích lũy đến hiện tại</p>
          <p className="text-lg font-bold font-mono">{formatVND(summary.accumulatedNetSalary)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase text-slate-900">LƯƠNG THỰC NHẬN CẢ THÁNG (DỰ KIẾN)</p>
          <p className="text-2xl font-extrabold font-mono text-indigo-950">{formatVND(summary.projectedNetSalary)}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="mt-4">
        <h2 className="font-bold text-xs uppercase mb-2">Chi Tiết Từng Ngày Chấm Công</h2>
        <table className="w-full text-xs border border-slate-300 border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-center font-bold">
              <th className="border border-slate-300 py-1.5 px-2">Ngày</th>
              <th className="border border-slate-300 py-1.5 px-2">Thứ</th>
              <th className="border border-slate-300 py-1.5 px-2">Sáng</th>
              <th className="border border-slate-300 py-1.5 px-2">Chiều</th>
              <th className="border border-slate-300 py-1.5 px-2">Tối</th>
              <th className="border border-slate-300 py-1.5 px-2">Tổng Ca</th>
              <th className="border border-slate-300 py-1.5 px-2">Tăng Ca</th>
              <th className="border border-slate-300 py-1.5 px-2 text-right">Lương Ngày</th>
              <th className="border border-slate-300 py-1.5 px-2">Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
            {summary.daysDetail.map((d) => (
              <tr key={d.dayAttendance.date} className="text-center">
                <td className="border border-slate-300 py-1 px-2 font-mono">
                  {d.dayAttendance.date.split('-').slice(1).reverse().join('/')}
                </td>
                <td className="border border-slate-300 py-1 px-2">{d.dayOfWeek}</td>
                <td className="border border-slate-300 py-1 px-2">{d.dayAttendance.morning ? '✓' : ''}</td>
                <td className="border border-slate-300 py-1 px-2">{d.dayAttendance.afternoon ? '✓' : ''}</td>
                <td className="border border-slate-300 py-1 px-2">{d.dayAttendance.evening ? '✓' : ''}</td>
                <td className="border border-slate-300 py-1 px-2 font-bold">{d.totalShifts || '-'}</td>
                <td className="border border-slate-300 py-1 px-2 font-mono">
                  {d.dayAttendance.overtimeHours ? `${d.dayAttendance.overtimeHours}h` : '-'}
                </td>
                <td className="border border-slate-300 py-1 px-2 text-right font-mono">
                  {d.totalDayEarnings > 0 ? formatVND(d.totalDayEarnings) : '-'}
                </td>
                <td className="border border-slate-300 py-1 px-2 text-left">{d.dayAttendance.note || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signature */}
      <div className="mt-8 pt-4 flex justify-between text-xs text-center">
        <div>
          <p className="font-bold">Người lập bảng</p>
          <p className="mt-16">(Ký & ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-bold">Người duyệt lương</p>
          <p className="mt-16">(Ký & ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-bold">Người nhận lương</p>
          <p className="mt-16 font-semibold">{config.employeeName || 'Nhân viên'}</p>
        </div>
      </div>
    </div>
  );
};
