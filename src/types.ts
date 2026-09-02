export type ShiftKey = 'morning' | 'afternoon' | 'evening';

export interface DayAttendance {
  date: string; // YYYY-MM-DD
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  overtimeHours: number;
  dailyBonus: number; // Thưởng nóng, tip, phụ cấp riêng ngày
  dailyDeduction: number; // Phạt, trừ ngày
  mealCount?: number; // Số suất ăn (nếu override tự động)
  isHoliday?: boolean; // Ngày lễ x2 / x3
  holidayMultiplier?: number; // Hệ số ngày lễ (mặc định 2.0 nếu là ngày lễ)
  note: string; // Ghi chú công việc
}

export type SalaryCalculationMode = 'monthly_based' | 'shift_based' | 'hourly_based';

export interface SalaryConfig {
  employeeName: string;
  workplace: string;
  calculationMode: SalaryCalculationMode;
  
  // Lương cơ bản tháng
  baseSalary: number; // e.g., 7,500,000 VND
  standardDaysInMonth: number; // Số ngày công chuẩn / tháng (thường 26 ngày)
  standardShiftsPerDay: number; // Số ca chuẩn/ngày (ca gãy thường 2 ca/ngày = 1 công)
  
  // Hoặc tính theo giá từng ca trực tiếp
  ratePerShift: number; // Đơn giá 1 ca (nếu theo shift_based hoặc tính từ lương cơ bản)
  
  // Giờ làm mỗi ca (để tính giờ & tăng ca)
  hoursPerShift: {
    morning: number; // default 4h
    afternoon: number; // default 4h
    evening: number; // default 4h
  };
  
  // Hệ số ca tối / đêm (nếu có ưu đãi thêm, vd 1.0 = bình thường, 1.2 = thêm 20%)
  eveningShiftMultiplier: number;
  
  // Đơn giá tăng ca (VNĐ/giờ)
  overtimeRatePerHour: number;
  
  // Phụ cấp
  mealAllowancePerDayOrShift: number; // Tiền ăn (VD: 30,000đ/ngày nếu làm >= 2 ca hoặc tính theo số ca)
  mealRule: 'per_day_if_multi_shift' | 'per_shift' | 'none'; // Quy tắc tính tiền ăn
  travelAllowance: number; // Phụ cấp xăng xe / đi lại cố định tháng
  phoneAllowance: number; // Phụ cấp điện thoại / trách nhiệm
  
  // Chuyên cần
  attendanceBonus: number; // Thưởng chuyên cần
  attendanceRequiredDays: number; // Số công tối thiểu để đạt chuyên cần (VD: 24 công)
  
  // Khấu trừ / Tạm ứng
  insuranceDeduction: number; // Bảo hiểm / Công đoàn
  monthlyAdvance: number; // Tạm ứng lương
}

export interface DaySalaryDetail {
  dayAttendance: DayAttendance;
  dayOfWeek: string;
  dayNumber: number;
  totalShifts: number;
  totalHours: number;
  isSplitShift: boolean; // Ca gãy (>= 2 ca rời nhau vd sáng + tối)
  shiftNameDisplay: string;
  shiftSalary: number;
  overtimeSalary: number;
  mealAllowance: number;
  dailyBonus: number;
  dailyDeduction: number;
  totalDayEarnings: number;
  isPastOrToday: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export interface MonthSalarySummary {
  monthKey: string; // YYYY-MM
  totalCalendarDays: number;
  
  // Số lượng ca thực tế đến hôm nay
  workedDaysCount: number;
  workedMorningCount: number;
  workedAfternoonCount: number;
  workedEveningCount: number;
  workedTotalShifts: number;
  workedStandardDays: number; // Tổng số công quy đổi (VD: 52 ca / 2 = 26 công)
  workedOvertimeHours: number;
  
  // Lương thực tế đến hiện tại
  accumulatedBaseSalary: number; // Lương ca / công đến hiện tại
  accumulatedOvertimeSalary: number;
  accumulatedMealAllowance: number;
  accumulatedBonus: number;
  accumulatedDeductions: number;
  accumulatedGrossSalary: number; // Tổng thu nhập trước giảm trừ cố định
  accumulatedNetSalary: number; // Lương thực nhận đến hiện tại (trừ bảo hiểm & tạm ứng)
  
  // Toàn bộ tháng (Bao gồm cả ca dự kiến trong tương lai đã tick)
  projectedDaysCount: number;
  projectedTotalShifts: number;
  projectedStandardDays: number;
  projectedMorningCount: number;
  projectedAfternoonCount: number;
  projectedEveningCount: number;
  projectedOvertimeHours: number;
  
  // Lương dự kiến cả tháng
  projectedBaseSalary: number;
  projectedOvertimeSalary: number;
  projectedMealAllowance: number;
  projectedFixedAllowances: number; // Xăng xe, điện thoại
  projectedAttendanceBonus: number; // Thưởng chuyên cần (nếu đạt số công)
  hasEarnedAttendanceBonus: boolean;
  projectedGrossSalary: number;
  projectedDeductions: number; // Bảo hiểm + tạm ứng + phạt
  projectedNetSalary: number; // Lương thực nhận cả tháng
  
  // Chi tiết từng ngày
  daysDetail: DaySalaryDetail[];
}
