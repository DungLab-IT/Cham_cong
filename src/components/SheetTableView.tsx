import React, { useState } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Check,
  Edit2,
  Calendar,
  Sparkles,
  Info,
  Clock,
  Utensils,
  Plus,
  Trash2,
  Filter,
  CheckCheck,
} from 'lucide-react';
import { MonthSalarySummary, SalaryConfig, DayAttendance, DaySalaryDetail } from '../types';
import { formatVND } from '../utils/salaryCalculator';

interface SheetTableViewProps {
  summary: MonthSalarySummary;
  config: SalaryConfig;
  currentDateStr: string;
  onUpdateDay: (date: string, updates: Partial<DayAttendance>) => void;
  onBatchApply: (pattern: 'morning_evening' | 'morning_afternoon' | 'afternoon_evening' | 'clear') => void;
  onOpenDayDetail: (day: DaySalaryDetail) => void;
}

export const SheetTableView: React.FC<SheetTableViewProps> = ({
  summary,
  config,
  currentDateStr,
  onUpdateDay,
  onBatchApply,
  onOpenDayDetail,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'worked' | 'up_to_today'>('all');
  const [editingNoteDate, setEditingNoteDate] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState<string>('');

  const filteredDays = summary.daysDetail.filter((day) => {
    if (filterMode === 'worked') {
      return day.totalShifts > 0 || (day.dayAttendance.overtimeHours || 0) > 0;
    }
    if (filterMode === 'up_to_today') {
      return day.isPastOrToday;
    }
    return true;
  });

  const handleSaveNote = (date: string) => {
    onUpdateDay(date, { note: tempNote });
    setEditingNoteDate(null);
  };

  const handleQuickPreset = (date: string, m: boolean, a: boolean, e: boolean, note: string) => {
    onUpdateDay(date, {
      morning: m,
      afternoon: a,
      evening: e,
      note,
    });
  };

  return (
    <div className="bg-[#111827] rounded-2xl shadow-xs border border-slate-800 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#111827] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Bảng Sheet Chấm Công Chi Tiết</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 font-semibold">
              {summary.daysDetail.length} ngày
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tích chọn trực tiếp các ca làm trong ngày (Sáng / Chiều / Tối). Hệ thống sẽ tự động tính toán lương tức thì.
          </p>
        </div>

        {/* Filters & Batch Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter dropdown */}
          <div className="flex items-center bg-[#0F172A] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterMode('worked')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === 'worked'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Có đi làm ({summary.projectedDaysCount})
            </button>
            <button
              onClick={() => setFilterMode('up_to_today')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterMode === 'up_to_today'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đến hôm nay
            </button>
          </div>

          {/* Batch Quick Preset Menu */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onBatchApply('morning_evening')}
              id="btn-batch-morning-evening"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 text-indigo-300 transition-colors shadow-xs"
              title="Điền ca Sáng + Tối cho các ngày từ Thứ 2 đến Thứ 7"
            >
              + Ca gãy (Sáng+Tối) cả tháng
            </button>
            <button
              onClick={() => onBatchApply('morning_afternoon')}
              id="btn-batch-morning-afternoon"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 transition-colors shadow-xs"
              title="Điền ca Sáng + Chiều cho các ngày trong tuần"
            >
              + Sáng & Chiều
            </button>
            <button
              onClick={() => onBatchApply('clear')}
              id="btn-batch-clear"
              className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-700 transition-colors"
              title="Xóa trắng chấm công tháng này"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0F172A] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800 select-none">
              <th className="py-3 px-3 w-12 text-center">STT</th>
              <th className="py-3 px-3 w-28 text-slate-300">Ngày</th>
              <th className="py-3 px-2 w-20">Thứ</th>
              <th className="py-3 px-3 text-center w-20 bg-amber-950/30 text-amber-300 border-x border-amber-900/40">
                <div className="flex items-center justify-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sáng</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center w-20 bg-orange-950/30 text-orange-300 border-r border-orange-900/40">
                <div className="flex items-center justify-center gap-1">
                  <Sunset className="w-3.5 h-3.5 text-orange-400" />
                  <span>Chiều</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center w-20 bg-indigo-950/30 text-indigo-300 border-r border-indigo-900/40">
                <div className="flex items-center justify-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tối</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center w-24">Tổng Ca</th>
              <th className="py-3 px-3 text-center w-24">Tăng ca (h)</th>
              <th className="py-3 px-3 text-right w-28">Lương Ca</th>
              <th className="py-3 px-3 text-right w-24">Tiền Ăn</th>
              <th className="py-3 px-3 text-right w-24">Thưởng / Tip</th>
              <th className="py-3 px-3 text-right w-28 font-bold text-white">Tổng Ngày</th>
              <th className="py-3 px-3 min-w-[180px]">Ghi Chú</th>
              <th className="py-3 px-2 text-center w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {filteredDays.map((detail, idx) => {
              const day = detail.dayAttendance;
              const isSunday = detail.dayOfWeek === 'Chủ Nhật';
              const isToday = detail.isToday;
              const isWorked = detail.totalShifts > 0;

              return (
                <tr
                  key={day.date}
                  className={`transition-colors hover:bg-slate-800/40 ${
                    isToday
                      ? 'bg-indigo-950/30 border-l-2 border-indigo-500 font-medium'
                      : isSunday
                      ? 'bg-slate-900/30 text-slate-400'
                      : ''
                  }`}
                >
                  {/* STT */}
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                    {idx + 1}
                  </td>

                  {/* Ngày */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">
                        {day.date.split('-').slice(1).reverse().join('/')}
                      </span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-600 text-white uppercase shadow-xs">
                          Nay
                        </span>
                      )}
                      {day.isHoliday && (
                        <span className="px-1 py-0.2 rounded text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/50">
                          Lễ x2
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Thứ */}
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span
                      className={`text-xs ${
                        isSunday ? 'text-rose-400 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {detail.dayOfWeek}
                    </span>
                  </td>

                  {/* Ca Sáng Checkbox Cell */}
                  <td
                    onClick={() => onUpdateDay(day.date, { morning: !day.morning })}
                    className={`py-2 px-3 text-center cursor-pointer select-none transition-colors border-x border-amber-950/40 ${
                      day.morning ? 'bg-amber-950/40' : 'hover:bg-amber-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={day.morning}
                        onChange={(e) => onUpdateDay(day.date, { morning: e.target.checked })}
                        className="w-4 h-4 text-amber-500 bg-slate-900 rounded border-slate-700 focus:ring-amber-500 cursor-pointer"
                        id={`check-morning-${day.date}`}
                      />
                    </div>
                  </td>

                  {/* Ca Chiều Checkbox Cell */}
                  <td
                    onClick={() => onUpdateDay(day.date, { afternoon: !day.afternoon })}
                    className={`py-2 px-3 text-center cursor-pointer select-none transition-colors border-r border-orange-950/40 ${
                      day.afternoon ? 'bg-orange-950/40' : 'hover:bg-orange-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={day.afternoon}
                        onChange={(e) => onUpdateDay(day.date, { afternoon: e.target.checked })}
                        className="w-4 h-4 text-orange-500 bg-slate-900 rounded border-slate-700 focus:ring-orange-500 cursor-pointer"
                        id={`check-afternoon-${day.date}`}
                      />
                    </div>
                  </td>

                  {/* Ca Tối Checkbox Cell */}
                  <td
                    onClick={() => onUpdateDay(day.date, { evening: !day.evening })}
                    className={`py-2 px-3 text-center cursor-pointer select-none transition-colors border-r border-indigo-950/40 ${
                      day.evening ? 'bg-indigo-950/40' : 'hover:bg-indigo-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={day.evening}
                        onChange={(e) => onUpdateDay(day.date, { evening: e.target.checked })}
                        className="w-4 h-4 text-indigo-500 bg-slate-900 rounded border-slate-700 focus:ring-indigo-500 cursor-pointer"
                        id={`check-evening-${day.date}`}
                      />
                    </div>
                  </td>

                  {/* Tổng Ca Tag */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {detail.totalShifts === 0 ? (
                      <span className="text-slate-500 text-[11px]">Nghỉ</span>
                    ) : detail.isSplitShift ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                        {detail.totalShifts} ca (Gãy)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {detail.totalShifts} ca
                      </span>
                    )}
                  </td>

                  {/* Tăng ca (h) */}
                  <td className="py-1.5 px-3 text-center">
                    <div className="inline-flex items-center justify-center">
                      <input
                        type="number"
                        min="0"
                        max="12"
                        step="0.5"
                        value={day.overtimeHours || 0}
                        onChange={(e) =>
                          onUpdateDay(day.date, {
                            overtimeHours: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-14 text-center py-1 px-1 text-xs border border-slate-700 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono bg-[#0F172A] text-white"
                      />
                    </div>
                  </td>

                  {/* Lương Ca */}
                  <td className="py-2.5 px-3 text-right font-mono text-slate-200 whitespace-nowrap">
                    {detail.shiftSalary > 0 ? formatVND(detail.shiftSalary) : '-'}
                  </td>

                  {/* Tiền Ăn */}
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                    {detail.mealAllowance > 0 ? (
                      <span className="text-emerald-400 font-medium">+{formatVND(detail.mealAllowance)}</span>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Thưởng / Tip */}
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 whitespace-nowrap">
                    {detail.dailyBonus > 0 ? (
                      <span className="text-emerald-400 font-medium">+{formatVND(detail.dailyBonus)}</span>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Tổng tiền ngày */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                    {detail.totalDayEarnings > 0 ? (
                      <span className="text-indigo-400">{formatVND(detail.totalDayEarnings)}</span>
                    ) : (
                      <span className="text-slate-500">0 ₫</span>
                    )}
                  </td>

                  {/* Ghi chú */}
                  <td className="py-2 px-3">
                    {editingNoteDate === day.date ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(day.date)}
                          placeholder="Ghi chú ca..."
                          autoFocus
                          className="w-full text-xs py-1 px-2 border border-indigo-500 rounded focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-[#0F172A] text-white"
                        />
                        <button
                          onClick={() => handleSaveNote(day.date)}
                          className="p-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-500"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingNoteDate(day.date);
                          setTempNote(day.note || '');
                        }}
                        className="cursor-pointer text-slate-400 hover:text-slate-200 truncate max-w-[200px] flex items-center gap-1 group py-1"
                        title={day.note || 'Bấm để thêm ghi chú'}
                      >
                        <span className="truncate">{day.note || <span className="text-slate-600 italic">Thêm ghi chú...</span>}</span>
                        <Edit2 className="w-3 h-3 text-slate-600 group-hover:text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </td>

                  {/* Thao tác nhanh */}
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {/* Sáng + Tối shortcut */}
                      <button
                        onClick={() => handleQuickPreset(day.date, true, false, true, 'Ca gãy: Sáng + Tối')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/70 border border-indigo-800/50"
                        title="Điền ca Sáng + Tối"
                      >
                        S+T
                      </button>

                      {/* Detail Modal */}
                      <button
                        onClick={() => onOpenDayDetail(detail)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Chỉnh sửa chi tiết ngày"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Excel-style SUM Footer */}
          <tfoot>
            <tr className="bg-[#0B0D11] text-white font-bold border-t-2 border-slate-700 text-xs">
              <td colSpan={3} className="py-3 px-3 text-left uppercase tracking-wider">
                TỔNG CỘNG ({summary.projectedDaysCount} ngày làm)
              </td>
              <td className="py-3 px-3 text-center text-amber-300 font-mono">
                {summary.projectedMorningCount} ca
              </td>
              <td className="py-3 px-3 text-center text-orange-300 font-mono">
                {summary.projectedAfternoonCount} ca
              </td>
              <td className="py-3 px-3 text-center text-indigo-300 font-mono">
                {summary.projectedEveningCount} ca
              </td>
              <td className="py-3 px-3 text-center text-emerald-400 font-mono">
                {summary.projectedTotalShifts} ca
              </td>
              <td className="py-3 px-3 text-center text-amber-300 font-mono">
                {summary.projectedOvertimeHours}h
              </td>
              <td className="py-3 px-3 text-right font-mono">
                {formatVND(summary.projectedBaseSalary)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-400">
                {formatVND(summary.projectedMealAllowance)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-emerald-400">
                {formatVND(summary.projectedAttendanceBonus + summary.projectedFixedAllowances)}
              </td>
              <td className="py-3 px-3 text-right font-mono text-amber-400 font-extrabold text-sm">
                {formatVND(summary.projectedGrossSalary)}
              </td>
              <td colSpan={2} className="py-3 px-3 text-slate-400 text-right">
                Quy đổi: <strong className="text-white">{summary.projectedStandardDays} công</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
