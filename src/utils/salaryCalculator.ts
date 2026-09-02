import { DayAttendance, SalaryConfig, DaySalaryDetail, MonthSalarySummary } from '../types';

const VIETNAMESE_DAYS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

/**
 * Format currency in VND with separator
 */
export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Calculate base rate per single shift
 */
export function getSingleShiftRate(config: SalaryConfig): number {
  if (config.calculationMode === 'shift_based') {
    return config.ratePerShift;
  }
  
  // monthly_based: baseSalary / (standardDaysInMonth * standardShiftsPerDay)
  const totalStandardShifts = Math.max(1, config.standardDaysInMonth * config.standardShiftsPerDay);
  return config.baseSalary / totalStandardShifts;
}

/**
 * Calculate hourly rate derived from shift rate
 */
export function getHourlyBaseRate(config: SalaryConfig): number {
  const shiftRate = getSingleShiftRate(config);
  const avgHoursPerShift = (config.hoursPerShift.morning + config.hoursPerShift.afternoon + config.hoursPerShift.evening) / 3 || 4;
  return shiftRate / avgHoursPerShift;
}

/**
 * Human readable shift description
 */
export function getShiftNameDisplay(morning: boolean, afternoon: boolean, evening: boolean): string {
  const shifts: string[] = [];
  if (morning) shifts.push('Sáng');
  if (afternoon) shifts.push('Chiều');
  if (evening) shifts.push('Tối');
  
  if (shifts.length === 0) return 'Nghỉ';
  if (shifts.length === 3) return 'Cả 3 ca (Sáng + Chiều + Tối)';
  if (morning && evening) return 'Ca gãy: Sáng + Tối';
  if (morning && afternoon) return 'Ca gãy: Sáng + Chiều';
  if (afternoon && evening) return 'Ca gãy: Chiều + Tối';
  return `Ca ${shifts[0]}`;
}

/**
 * Calculate salary breakdown for a single day
 */
export function calculateDaySalary(
  day: DayAttendance,
  config: SalaryConfig,
  currentDateStr: string
): DaySalaryDetail {
  const dateObj = new Date(day.date + 'T00:00:00');
  const dayOfWeekIndex = dateObj.getDay();
  const dayOfWeek = VIETNAMESE_DAYS[dayOfWeekIndex];
  const dayNumber = dateObj.getDate();
  
  let totalShifts = 0;
  if (day.morning) totalShifts++;
  if (day.afternoon) totalShifts++;
  if (day.evening) totalShifts++;
  
  let totalHours = 0;
  if (day.morning) totalHours += config.hoursPerShift.morning;
  if (day.afternoon) totalHours += config.hoursPerShift.afternoon;
  if (day.evening) totalHours += config.hoursPerShift.evening;
  totalHours += day.overtimeHours || 0;
  
  const baseShiftRate = getSingleShiftRate(config);
  const holidayMult = day.isHoliday ? (day.holidayMultiplier || 2.0) : 1.0;
  
  // Calculate shift salary with potential evening multiplier and holiday multiplier
  let shiftSalary = 0;
  if (day.morning) {
    shiftSalary += baseShiftRate * holidayMult;
  }
  if (day.afternoon) {
    shiftSalary += baseShiftRate * holidayMult;
  }
  if (day.evening) {
    const eveningMult = config.eveningShiftMultiplier || 1.0;
    shiftSalary += baseShiftRate * eveningMult * holidayMult;
  }
  
  // Overtime salary
  const hourlyOvertimeRate = config.overtimeRatePerHour > 0 
    ? config.overtimeRatePerHour 
    : getHourlyBaseRate(config) * 1.5;
  const overtimeSalary = (day.overtimeHours || 0) * hourlyOvertimeRate * holidayMult;
  
  // Meal allowance
  let mealAllowance = 0;
  if (day.mealCount !== undefined && day.mealCount >= 0) {
    mealAllowance = day.mealCount * config.mealAllowancePerDayOrShift;
  } else if (config.mealRule === 'per_shift') {
    mealAllowance = totalShifts * config.mealAllowancePerDayOrShift;
  } else if (config.mealRule === 'per_day_if_multi_shift') {
    // Nếu làm từ 2 ca trở lên (ca gãy) thì được hỗ trợ cơm
    if (totalShifts >= 2) {
      mealAllowance = config.mealAllowancePerDayOrShift;
    }
  }
  
  const dailyBonus = day.dailyBonus || 0;
  const dailyDeduction = day.dailyDeduction || 0;
  
  const totalDayEarnings = shiftSalary + overtimeSalary + mealAllowance + dailyBonus - dailyDeduction;
  
  const isSplitShift = totalShifts >= 2;
  const isPastOrToday = day.date <= currentDateStr;
  const isToday = day.date === currentDateStr;
  const isFuture = day.date > currentDateStr;
  
  return {
    dayAttendance: day,
    dayOfWeek,
    dayNumber,
    totalShifts,
    totalHours,
    isSplitShift,
    shiftNameDisplay: getShiftNameDisplay(day.morning, day.afternoon, day.evening),
    shiftSalary,
    overtimeSalary,
    mealAllowance,
    dailyBonus,
    dailyDeduction,
    totalDayEarnings,
    isPastOrToday,
    isToday,
    isFuture,
  };
}

/**
 * Calculate full month salary summary with separate accumulated (up to today) and full-month projected totals
 */
export function calculateMonthSummary(
  monthKey: string, // YYYY-MM
  attendances: Record<string, DayAttendance>,
  config: SalaryConfig,
  currentDateStr: string
): MonthSalarySummary {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12
  
  const totalCalendarDays = new Date(year, month, 0).getDate();
  const daysDetail: DaySalaryDetail[] = [];
  
  let workedDaysCount = 0;
  let workedMorningCount = 0;
  let workedAfternoonCount = 0;
  let workedEveningCount = 0;
  let workedTotalShifts = 0;
  let workedOvertimeHours = 0;
  let accumulatedBaseSalary = 0;
  let accumulatedOvertimeSalary = 0;
  let accumulatedMealAllowance = 0;
  let accumulatedBonus = 0;
  let accumulatedDeductions = 0;
  
  let projectedDaysCount = 0;
  let projectedMorningCount = 0;
  let projectedAfternoonCount = 0;
  let projectedEveningCount = 0;
  let projectedTotalShifts = 0;
  let projectedOvertimeHours = 0;
  let projectedBaseSalary = 0;
  let projectedOvertimeSalary = 0;
  let projectedMealAllowance = 0;
  let projectedDailyBonus = 0;
  let projectedDailyDeductions = 0;
  
  for (let d = 1; d <= totalCalendarDays; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const dateKey = `${monthKey}-${dayStr}`;
    
    const dayAttendance: DayAttendance = attendances[dateKey] || {
      date: dateKey,
      morning: false,
      afternoon: false,
      evening: false,
      overtimeHours: 0,
      dailyBonus: 0,
      dailyDeduction: 0,
      note: '',
    };
    
    const detail = calculateDaySalary(dayAttendance, config, currentDateStr);
    daysDetail.push(detail);
    
    const hasWorked = detail.totalShifts > 0 || detail.dayAttendance.overtimeHours > 0;
    
    // Projected totals (All marked days in month)
    if (hasWorked) {
      projectedDaysCount++;
    }
    if (dayAttendance.morning) projectedMorningCount++;
    if (dayAttendance.afternoon) projectedAfternoonCount++;
    if (dayAttendance.evening) projectedEveningCount++;
    projectedTotalShifts += detail.totalShifts;
    projectedOvertimeHours += dayAttendance.overtimeHours || 0;
    projectedBaseSalary += detail.shiftSalary;
    projectedOvertimeSalary += detail.overtimeSalary;
    projectedMealAllowance += detail.mealAllowance;
    projectedDailyBonus += detail.dailyBonus;
    projectedDailyDeductions += detail.dailyDeduction;
    
    // Accumulated totals (Only days <= today that have shifts worked)
    if (detail.isPastOrToday) {
      if (hasWorked) {
        workedDaysCount++;
      }
      if (dayAttendance.morning) workedMorningCount++;
      if (dayAttendance.afternoon) workedAfternoonCount++;
      if (dayAttendance.evening) workedEveningCount++;
      workedTotalShifts += detail.totalShifts;
      workedOvertimeHours += dayAttendance.overtimeHours || 0;
      accumulatedBaseSalary += detail.shiftSalary;
      accumulatedOvertimeSalary += detail.overtimeSalary;
      accumulatedMealAllowance += detail.mealAllowance;
      accumulatedBonus += detail.dailyBonus;
      accumulatedDeductions += detail.dailyDeduction;
    }
  }
  
  // Standard days worked calculation (1 standard day = config.standardShiftsPerDay ca, usually 2)
  const shiftsPerStandardDay = config.standardShiftsPerDay || 2;
  const workedStandardDays = Number((workedTotalShifts / shiftsPerStandardDay).toFixed(2));
  const projectedStandardDays = Number((projectedTotalShifts / shiftsPerStandardDay).toFixed(2));
  
  // Check attendance bonus eligibility
  const hasEarnedAttendanceBonus = projectedStandardDays >= (config.attendanceRequiredDays || 26);
  const projectedAttendanceBonus = hasEarnedAttendanceBonus ? (config.attendanceBonus || 0) : 0;
  
  // Fixed monthly allowances (Travel, phone)
  const projectedFixedAllowances = (config.travelAllowance || 0) + (config.phoneAllowance || 0);
  
  // Prorated fixed allowances for accumulated up-to-today
  const daysPassedRatio = Math.min(1, Math.max(0, new Date().getDate() / totalCalendarDays));
  const accumulatedFixedAllowances = projectedFixedAllowances * daysPassedRatio;
  
  // Gross & Net Calculations
  const accumulatedGrossSalary = accumulatedBaseSalary + accumulatedOvertimeSalary + accumulatedMealAllowance + accumulatedBonus + accumulatedFixedAllowances;
  const accumulatedNetSalary = Math.max(0, accumulatedGrossSalary - accumulatedDeductions - (config.insuranceDeduction * daysPassedRatio) - (config.monthlyAdvance || 0));
  
  const projectedGrossSalary = projectedBaseSalary + projectedOvertimeSalary + projectedMealAllowance + projectedDailyBonus + projectedFixedAllowances + projectedAttendanceBonus;
  const projectedDeductions = (config.insuranceDeduction || 0) + (config.monthlyAdvance || 0) + projectedDailyDeductions;
  const projectedNetSalary = Math.max(0, projectedGrossSalary - projectedDeductions);
  
  return {
    monthKey,
    totalCalendarDays,
    workedDaysCount,
    workedMorningCount,
    workedAfternoonCount,
    workedEveningCount,
    workedTotalShifts,
    workedStandardDays,
    workedOvertimeHours,
    accumulatedBaseSalary,
    accumulatedOvertimeSalary,
    accumulatedMealAllowance,
    accumulatedBonus,
    accumulatedDeductions,
    accumulatedGrossSalary,
    accumulatedNetSalary,
    projectedDaysCount,
    projectedTotalShifts,
    projectedStandardDays,
    projectedMorningCount,
    projectedAfternoonCount,
    projectedEveningCount,
    projectedOvertimeHours,
    projectedBaseSalary,
    projectedOvertimeSalary,
    projectedMealAllowance,
    projectedFixedAllowances,
    projectedAttendanceBonus,
    hasEarnedAttendanceBonus,
    projectedGrossSalary,
    projectedDeductions,
    projectedNetSalary,
    daysDetail,
  };
}
