/**
 * Vietnam Timezone (Asia/Ho_Chi_Minh - GMT+7) Utilities
 */

/**
 * Returns a Date object representing the current moment in Vietnam Timezone
 */
export function getVietnamNow(): Date {
  const now = new Date();
  const vnString = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
  return new Date(vnString);
}

/**
 * Returns current date in Vietnam formatted as YYYY-MM-DD
 */
export function getVietnamTodayStr(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Returns current month key in Vietnam formatted as YYYY-MM
 */
export function getVietnamCurrentMonthKey(): string {
  const todayStr = getVietnamTodayStr();
  return todayStr.substring(0, 7);
}

/**
 * Format date string (YYYY-MM-DD) to friendly Vietnamese format
 */
export function formatVietnamDate(dateStr: string, options?: { showDayOfWeek?: boolean; showYear?: boolean }): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = days[dateObj.getDay()];

    const showDayOfWeek = options?.showDayOfWeek !== false;
    const showYear = options?.showYear !== false;

    let result = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
    if (showYear) {
      result += `/${y}`;
    }
    if (showDayOfWeek) {
      result = `${dayOfWeek}, ${result}`;
    }
    return result;
  } catch {
    return dateStr;
  }
}

/**
 * Format Month Key (YYYY-MM) to Vietnamese display
 */
export function formatVietnamMonth(monthKey: string): string {
  try {
    const [y, m] = monthKey.split('-');
    return `Tháng ${parseInt(m, 10)}/${y}`;
  } catch {
    return monthKey;
  }
}

/**
 * Returns list of months for quick selection (e.g., from 12 months ago to 6 months ahead)
 */
export function getAvailableMonthsList(currentVNMonthKey: string, spanMonths: number = 18): string[] {
  const [currentY, currentM] = currentVNMonthKey.split('-').map(Number);
  const result: string[] = [];

  // 12 months past + current + 5 months future
  const startOffset = -12;
  const endOffset = 5;

  for (let offset = startOffset; offset <= endOffset; offset++) {
    const targetDate = new Date(currentY, currentM - 1 + offset, 1);
    const y = targetDate.getFullYear();
    const m = String(targetDate.getMonth() + 1).padStart(2, '0');
    result.push(`${y}-${m}`);
  }

  return result.reverse(); // Newest first
}
