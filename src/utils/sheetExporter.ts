import * as XLSX from 'xlsx';
import { MonthSalarySummary, SalaryConfig } from '../types';
import { formatVND } from './salaryCalculator';

/**
 * Export full monthly attendance and salary sheet to Excel (.xlsx) file
 */
export function exportToExcelXLSX(summary: MonthSalarySummary, config: SalaryConfig) {
  const [year, month] = summary.monthKey.split('-');
  const fileName = `Bang_Cham_Cong_Va_Tinh_Luong_Thang_${month}_${year}_${config.employeeName.replace(/\s+/g, '_')}.xlsx`;

  // Prepare header info rows
  const wsData: (string | number | null)[][] = [
    [`BẢNG CHẤM CÔNG & TÍNH LƯƠNG CA GÃY - THÁNG ${month}/${year}`],
    [`Họ và tên: ${config.employeeName || 'Cá nhân'}`, `Nơi làm việc: ${config.workplace || 'Chung'}`],
    [
      `Lương cơ bản: ${formatVND(config.baseSalary)}`,
      `Công chuẩn: ${config.standardDaysInMonth} ngày`,
      `Quy chuẩn: ${config.standardShiftsPerDay} ca/công`,
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
      'Giờ Làm (h)',
      'Tăng Ca (h)',
      'Lương Ca (VNĐ)',
      'Tiền Ăn (VNĐ)',
      'Thưởng/Tip (VNĐ)',
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
      day.totalShifts,
      day.totalHours,
      day.dayAttendance.overtimeHours || 0,
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
    '',
    summary.projectedOvertimeHours,
    Math.round(summary.projectedBaseSalary),
    Math.round(summary.projectedMealAllowance),
    '',
    '',
    Math.round(summary.projectedGrossSalary),
    '',
  ]);

  wsData.push([]);
  wsData.push(['--- BẢNG TỔNG HỢP LƯƠNG ---']);
  wsData.push(['1. Số công quy đổi (Cả tháng):', `${summary.projectedStandardDays} công (${summary.projectedTotalShifts} ca)`]);
  wsData.push(['2. Số công thực tế đã làm đến hôm nay:', `${summary.workedStandardDays} công (${summary.workedTotalShifts} ca)`]);
  wsData.push(['3. Lương tính đến ngày hiện tại (Lũy kế):', Math.round(summary.accumulatedNetSalary)]);
  wsData.push(['4. Lương ca & công cả tháng:', Math.round(summary.projectedBaseSalary)]);
  wsData.push(['5. Tiền tăng ca:', Math.round(summary.projectedOvertimeSalary)]);
  wsData.push(['6. Tiền ăn ca gãy:', Math.round(summary.projectedMealAllowance)]);
  wsData.push(['7. Phụ cấp cố định (Xăng xe/ĐT):', Math.round(summary.projectedFixedAllowances)]);
  wsData.push(['8. Thưởng chuyên cần:', Math.round(summary.projectedAttendanceBonus)]);
  wsData.push(['9. Các khoản giảm trừ / Tạm ứng:', Math.round(summary.projectedDeductions)]);
  wsData.push(['10. LƯƠNG THỰC NHẬN DỰ KIẾN CẢ THÁNG:', Math.round(summary.projectedNetSalary)]);

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
    { wch: 9 },  // Tổng ca
    { wch: 12 }, // Giờ làm
    { wch: 12 }, // Tăng ca
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
      'Giờ Làm',
      'Tăng Ca (h)',
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
      String(day.totalHours),
      String(day.dayAttendance.overtimeHours || 0),
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
  const rows: string[][] = [
    [`BẢNG CHẤM CÔNG & TÍNH LƯƠNG CA GÃY - THÁNG ${month}/${year}`],
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
      'Giờ Làm',
      'Tăng Ca (h)',
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
      String(day.totalHours),
      String(day.dayAttendance.overtimeHours || 0),
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
