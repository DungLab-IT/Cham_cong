import * as XLSX from 'xlsx';
import { MonthSalarySummary, SalaryConfig } from '../types';
import { formatVND } from './salaryCalculator';

/**
 * Export full monthly attendance and salary sheet to Excel (.xlsx) file
 */
export function exportToExcelXLSX(summary: MonthSalarySummary, config: SalaryConfig) {
  const [year, month] = summary.monthKey.split('-');
  const fileName = `Bang_Cham_Cong_Va_Tinh_Luong_Thang_${month}_${year}_${(config.employeeName || 'NhanVien').replace(/\s+/g, '_')}.xlsx`;
  const shiftsPerDay = config.standardShiftsPerDay || 2;
  const standardDays = config.standardDaysInMonth || 28;

  // Prepare header info rows
  const wsData: (string | number | null)[][] = [
    [`BẢNG CHẤM CÔNG & TÍNH LƯƠNG - THÁNG ${month}/${year}`],
    [`Họ và tên: ${config.employeeName || 'Nhân viên'}`, `Nơi làm việc: ${config.workplace || 'Toàn thời gian'}`],
    [
      `Lương cơ bản: ${formatVND(config.baseSalary)}`,
      `Công chuẩn: ${standardDays} ngày (Tháng nghỉ 2 ngày)`,
      `Quy chuẩn: ${shiftsPerDay} ca = 1 công chuẩn`,
    ],
    [], // Blank line
    [
      'STT',
      'Ngày',
      'Thứ',
      'Ca Sáng',
      'Ca Chiều',
      'Ca Tối',
      'Tổng Ca',
      'Công Quy Đổi',
      'Lương Ca (VNĐ)',
      'Tiền Ăn (VNĐ)',
      'Thưởng (VNĐ)',
      'Giảm Trừ (VNĐ)',
      'Tổng Thu Nhập (VNĐ)',
      'Ghi Chú',
    ],
  ];

  // Populate data rows
  summary.daysDetail.forEach((day, index) => {
    wsData.push([
      index + 1,
      day.dayAttendance.date,
      day.dayOfWeek,
      day.dayAttendance.morning ? '✓' : '-',
      day.dayAttendance.afternoon ? '✓' : '-',
      day.dayAttendance.evening ? '✓' : '-',
      day.totalShifts > 0 ? day.totalShifts : 0,
      day.totalShifts > 0 ? Number((day.totalShifts / shiftsPerDay).toFixed(1)) : 0,
      Math.round(day.shiftSalary),
      Math.round(day.mealAllowance),
      Math.round(day.dailyBonus),
      Math.round(day.dailyDeduction),
      Math.round(day.totalDayEarnings),
      day.dayAttendance.note || '',
    ]);
  });

  // Summary footer rows
  wsData.push([]);
  wsData.push([
    'TỔNG CỘNG',
    '',
    '',
    summary.projectedMorningCount,
    summary.projectedAfternoonCount,
    summary.projectedEveningCount,
    summary.projectedTotalShifts,
    summary.projectedStandardDays,
    Math.round(summary.projectedBaseSalary),
    Math.round(summary.projectedMealAllowance),
    '',
    Math.round(summary.projectedDeductions),
    Math.round(summary.projectedNetSalary),
    '',
  ]);

  wsData.push([]);
  wsData.push(['--- BẢNG TỔNG HỢP LƯƠNG ---']);
  wsData.push(['1. Số công quy đổi (Cả tháng):', `${summary.projectedStandardDays} công (${summary.projectedTotalShifts} ca)`]);
  wsData.push(['2. Số công thực tế đã làm đến hôm nay:', `${summary.workedStandardDays} công (${summary.workedTotalShifts} ca)`]);
  wsData.push(['3. Lương tính đến ngày hiện tại (Lũy kế):', Math.round(summary.accumulatedNetSalary)]);
  wsData.push(['4. Lương ca & công cả tháng:', Math.round(summary.projectedBaseSalary)]);
  wsData.push(['5. Phụ cấp & Tiền ăn:', 0]);
  wsData.push(['6. Tăng ca OT:', '0 (Không có)']);
  wsData.push(['7. Các khoản giảm trừ / Tạm ứng:', Math.round(summary.projectedDeductions)]);
  wsData.push(['8. LƯƠNG THỰC NHẬN DỰ KIẾN CẢ THÁNG (NET):', Math.round(summary.projectedNetSalary)]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 13 }, // Ngày
    { wch: 11 }, // Thứ
    { wch: 10 }, // Sáng
    { wch: 10 }, // Chiều
    { wch: 10 }, // Tối
    { wch: 10 }, // Tổng ca
    { wch: 14 }, // Công
    { wch: 16 }, // Lương ca
    { wch: 14 }, // Tiền ăn
    { wch: 14 }, // Thưởng
    { wch: 14 }, // Phạt
    { wch: 18 }, // Tổng ngày
    { wch: 25 }, // Ghi chú
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Tháng ${month}-${year}`);

  // Write and trigger download
  XLSX.writeFile(wb, fileName);
}

/**
 * Export to CSV format with UTF-8 BOM for universal compatibility
 */
export function exportToCSV(summary: MonthSalarySummary, config: SalaryConfig) {
  const [year, month] = summary.monthKey.split('-');
  const fileName = `Bang_Cham_Cong_Thang_${month}_${year}.csv`;
  const shiftsPerDay = config.standardShiftsPerDay || 2;

  const rows: string[][] = [
    [`BẢNG CHẤM CÔNG VÀ TÍNH LƯƠNG THÁNG ${month}/${year}`],
    [`Nhân viên: ${config.employeeName}`, `Lương cơ bản: ${config.baseSalary}`],
    [],
    [
      'STT',
      'Ngày',
      'Thứ',
      'Ca Sáng',
      'Ca Chiều',
      'Ca Tối',
      'Tổng Ca',
      'Công',
      'Lương Ca (đ)',
      'Tiền Ăn (đ)',
      'Thưởng (đ)',
      'Giảm Trừ (đ)',
      'Tổng Tiền Ngày (đ)',
      'Ghi Chú',
    ],
  ];

  summary.daysDetail.forEach((day, index) => {
    rows.push([
      String(index + 1),
      day.dayAttendance.date,
      day.dayOfWeek,
      day.dayAttendance.morning ? '1' : '0',
      day.dayAttendance.afternoon ? '1' : '0',
      day.dayAttendance.evening ? '1' : '0',
      String(day.totalShifts),
      day.totalShifts > 0 ? (day.totalShifts / shiftsPerDay).toFixed(1) : '0',
      String(Math.round(day.shiftSalary)),
      String(Math.round(day.mealAllowance)),
      String(Math.round(day.dailyBonus)),
      String(Math.round(day.dailyDeduction)),
      String(Math.round(day.totalDayEarnings)),
      `"${(day.dayAttendance.note || '').replace(/"/g, '""')}"`,
    ]);
  });

  rows.push([]);
  rows.push(['LƯƠNG TÍNH ĐẾN HÔM NAY', String(Math.round(summary.accumulatedNetSalary))]);
  rows.push(['LƯƠNG DỰ KIẾN CẢ THÁNG', String(Math.round(summary.projectedNetSalary))]);

  const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy formatted tab-separated values so user can instantly paste into Google Sheets (Cmd/Ctrl + V)
 */
export async function copyForGoogleSheets(summary: MonthSalarySummary, config: SalaryConfig): Promise<boolean> {
  const [year, month] = summary.monthKey.split('-');
  const shiftsPerDay = config.standardShiftsPerDay || 2;
  const rows: string[][] = [
    [`BẢNG CHẤM CÔNG & TÍNH LƯƠNG - THÁNG ${month}/${year}`],
    [`Nhân viên: ${config.employeeName}`, `Lương cơ bản: ${config.baseSalary}`],
    [],
    [
      'STT',
      'Ngày',
      'Thứ',
      'Ca Sáng',
      'Ca Chiều',
      'Ca Tối',
      'Tổng Ca',
      'Công',
      'Lương Ca',
      'Tiền Ăn',
      'Thưởng',
      'Giảm Trừ',
      'Tổng Ngày',
      'Ghi Chú',
    ],
  ];

  summary.daysDetail.forEach((day, index) => {
    rows.push([
      String(index + 1),
      day.dayAttendance.date,
      day.dayOfWeek,
      day.dayAttendance.morning ? 'x' : '',
      day.dayAttendance.afternoon ? 'x' : '',
      day.dayAttendance.evening ? 'x' : '',
      String(day.totalShifts),
      day.totalShifts > 0 ? (day.totalShifts / shiftsPerDay).toFixed(1) : '0',
      String(Math.round(day.shiftSalary)),
      String(Math.round(day.mealAllowance)),
      String(Math.round(day.dailyBonus)),
      String(Math.round(day.dailyDeduction)),
      String(Math.round(day.totalDayEarnings)),
      day.dayAttendance.note || '',
    ]);
  });

  rows.push([]);
  rows.push(['TỔNG CA LÀM:', String(summary.projectedTotalShifts)]);
  rows.push(['SỐ CÔNG QUY ĐỔI:', String(summary.projectedStandardDays)]);
  rows.push(['LƯƠNG TÍNH ĐẾN HÔM NAY:', String(Math.round(summary.accumulatedNetSalary))]);
  rows.push(['LƯƠNG THỰC NHẬN CẢ THÁNG:', String(Math.round(summary.projectedNetSalary))]);

  const tsvText = rows.map((r) => r.join('\t')).join('\n');
  try {
    await navigator.clipboard.writeText(tsvText);
    return true;
  } catch (e) {
    console.error('Clipboard copy failed', e);
    return false;
  }
}
