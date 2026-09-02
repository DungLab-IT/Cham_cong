import { DayAttendance, SalaryConfig } from '../types';

const STORAGE_KEYS = {
  SALARY_CONFIG: 'shift_attendance_salary_config_v1',
  ATTENDANCES: 'shift_attendance_records_v1',
};

export const DEFAULT_SALARY_CONFIG: SalaryConfig = {
  employeeName: 'Nguyễn Văn A',
  workplace: 'Chi nhánh / Doanh nghiệp',
  calculationMode: 'monthly_based',
  baseSalary: 10000000, // 10,000,000 VND / tháng (Làm full 2 ca/ngày)
  standardDaysInMonth: 26, // 26 ngày công chuẩn (26 ngày x 2 ca = 52 ca)
  standardShiftsPerDay: 2, // 2 ca/ngày = 1 công chuẩn (1 ca = 0.5 công)
  ratePerShift: 192308, // 10,000,000 / (26 * 2) = 192,308 VND / ca
  hoursPerShift: {
    morning: 4,
    afternoon: 4,
    evening: 4,
  },
  eveningShiftMultiplier: 1.0, // 1.0 = Không phụ cấp thêm ca tối
  overtimeRatePerHour: 48077, // 10,000,000 / 26 / 8 = 48,077 VND / giờ tăng ca
  mealAllowancePerDayOrShift: 0, // 0 đồng (Không phụ cấp tiền ăn)
  mealRule: 'none', // Không phụ cấp ăn
  travelAllowance: 0, // 0 đồng (Không phụ cấp xăng xe)
  phoneAllowance: 0, // 0 đồng (Không phụ cấp điện thoại)
  attendanceBonus: 0, // 0 đồng (Không phụ cấp chuyên cần)
  attendanceRequiredDays: 26,
  insuranceDeduction: 0, // Khấu trừ bảo hiểm nếu có
  monthlyAdvance: 0, // Tạm ứng
};

/**
 * Generate initial sample attendance data for the current month so user sees instant live numbers
 */
export function generateSampleMonthData(monthKey: string): Record<string, DayAttendance> {
  const records: Record<string, DayAttendance> = {};
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const totalDays = new Date(year, month, 0).getDate();
  const todayDate = new Date();
  const currentDayNum = todayDate.getDate();
  const currentMonthKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}`;

  const isThisMonth = monthKey === currentMonthKey;
  const maxFillDay = isThisMonth ? Math.min(totalDays, currentDayNum + 3) : totalDays;

  // Patterns of split shifts:
  // 1: Sáng + Tối (morning + evening)
  // 2: Sáng + Chiều (morning + afternoon)
  // 3: Chiều + Tối (afternoon + evening)
  // 4: Sáng only
  // 5: Nghỉ (Sunday)
  for (let d = 1; d <= maxFillDay; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const dateKey = `${monthKey}-${dayStr}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = CN, 1 = T2, ...

    if (dayOfWeek === 0) {
      // Chủ nhật nghỉ hoặc ca nhẹ
      records[dateKey] = {
        date: dateKey,
        morning: false,
        afternoon: false,
        evening: false,
        overtimeHours: 0,
        dailyBonus: 0,
        dailyDeduction: 0,
        note: 'Nghỉ Chủ Nhật',
      };
    } else if (d % 3 === 1) {
      // Ca gãy Sáng + Tối (rất phổ biến cho nhà hàng / dịch vụ)
      records[dateKey] = {
        date: dateKey,
        morning: true,
        afternoon: false,
        evening: true,
        overtimeHours: d % 5 === 0 ? 1.5 : 0,
        dailyBonus: d % 7 === 0 ? 50000 : 0,
        dailyDeduction: 0,
        note: d % 5 === 0 ? 'Tăng ca đóng cửa 1.5h' : 'Ca gãy: Sáng + Tối',
      };
    } else if (d % 3 === 2) {
      // Ca Sáng + Chiều
      records[dateKey] = {
        date: dateKey,
        morning: true,
        afternoon: true,
        evening: false,
        overtimeHours: 0,
        dailyBonus: 0,
        dailyDeduction: 0,
        note: 'Ca liền: Sáng + Chiều',
      };
    } else {
      // Ca gãy Chiều + Tối
      records[dateKey] = {
        date: dateKey,
        morning: false,
        afternoon: true,
        evening: true,
        overtimeHours: 0,
        dailyBonus: 0,
        dailyDeduction: 0,
        note: 'Ca gãy: Chiều + Tối',
      };
    }
  }

  return records;
}

export function loadSalaryConfig(): SalaryConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALARY_CONFIG);
    if (!raw) return DEFAULT_SALARY_CONFIG;
    const parsed = JSON.parse(raw);
    // If saved config was using older default salary (8M, 7.5M, 8.5M) or old allowances, migrate to 10M 0 allowances
    if (
      parsed.baseSalary === 8000000 ||
      parsed.baseSalary === 7500000 ||
      parsed.baseSalary === 8500000 ||
      !parsed.baseSalary
    ) {
      parsed.baseSalary = 10000000;
      parsed.mealAllowancePerDayOrShift = 0;
      parsed.mealRule = 'none';
      parsed.travelAllowance = 0;
      parsed.phoneAllowance = 0;
      parsed.attendanceBonus = 0;
      parsed.eveningShiftMultiplier = 1.0;
      parsed.standardDaysInMonth = parsed.standardDaysInMonth || 26;
      parsed.standardShiftsPerDay = 2;
    }
    return { ...DEFAULT_SALARY_CONFIG, ...parsed };
  } catch {
    return DEFAULT_SALARY_CONFIG;
  }
}

export function saveSalaryConfig(config: SalaryConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SALARY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save salary config:', err);
  }
}

export function loadAttendances(): Record<string, DayAttendance> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCES);
    if (!raw) {
      // Seed with current month
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const sample = generateSampleMonthData(currentMonthKey);
      saveAttendances(sample);
      return sample;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveAttendances(records: Record<string, DayAttendance>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save attendances:', err);
  }
}
