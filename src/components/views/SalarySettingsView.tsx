import React, { useState } from 'react';
import {
  Settings,
  DollarSign,
  TrendingUp,
  Clock,
  Utensils,
  Award,
  Shield,
  Save,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Sliders,
  HelpCircle,
  Building2,
  User,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { SalaryConfig } from '../../types';
import { formatVND } from '../../utils/salaryCalculator';
import { DEFAULT_SALARY_CONFIG } from '../../utils/storage';

interface SalarySettingsViewProps {
  config: SalaryConfig;
  onSaveConfig: (newConfig: SalaryConfig) => void;
}

export const SalarySettingsView: React.FC<SalarySettingsViewProps> = ({
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<SalaryConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live Simulator state (What-if scenario)
  const [simSplitDays, setSimSplitDays] = useState<number>(28); // 28 ngày làm full 2 ca (56 ca = 10tr)
  const [simSingleShifts, setSimSingleShifts] = useState<number>(0); // 0 ca đơn lẻ
  const [simOtHours, setSimOtHours] = useState<number>(0); // 0h tăng ca

  // Calculate live simulator values
  const totalSimShifts = simSplitDays * (formData.standardShiftsPerDay || 2) + simSingleShifts;
  const totalSimStandardDays = totalSimShifts / (formData.standardShiftsPerDay || 2);

  // Base shift rate
  const simShiftRate =
    formData.calculationMode === 'monthly_based'
      ? formData.baseSalary / ((formData.standardDaysInMonth || 28) * (formData.standardShiftsPerDay || 2))
      : formData.ratePerShift;

  const simSplitDayRate = simShiftRate * (formData.standardShiftsPerDay || 2);

  // Base shift earnings
  const simBaseSalary = totalSimShifts * simShiftRate;

  // Overtime earnings
  const simOtSalary = simOtHours * (formData.overtimeRatePerHour || 44643);

  // Meal allowance
  const simMealAllowance =
    formData.mealRule === 'per_day_if_multi_shift'
      ? simSplitDays * formData.mealAllowancePerDayOrShift
      : formData.mealRule === 'per_shift'
      ? totalSimShifts * formData.mealAllowancePerDayOrShift
      : 0;

  // Fixed allowances
  const simFixedAllowances = (formData.travelAllowance || 0) + (formData.phoneAllowance || 0);

  // Attendance bonus
  const hasEarnedAttendance = totalSimStandardDays >= (formData.attendanceRequiredDays || 28);
  const simAttendanceBonus = hasEarnedAttendance ? (formData.attendanceBonus || 0) : 0;

  // Gross
  const simGrossSalary = simBaseSalary + simOtSalary + simMealAllowance + simFixedAllowances + simAttendanceBonus;

  // Deductions
  const simDeductions = (formData.insuranceDeduction || 0) + (formData.monthlyAdvance || 0);

  // Net
  const simNetSalary = Math.max(0, simGrossSalary - simDeductions);

  const handleFieldChange = <K extends keyof SalaryConfig>(field: K, value: SalaryConfig[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleApplyPreset = (presetType: 'standard_10m' | 'restaurant' | 'cafe' | 'hotel' | 'driver') => {
    if (presetType === 'standard_10m') {
      setFormData((prev) => ({
        ...prev,
        calculationMode: 'monthly_based',
        baseSalary: 10000000,
        standardDaysInMonth: 28,
        standardShiftsPerDay: 2,
        ratePerShift: 178571,
        eveningShiftMultiplier: 1.0,
        mealAllowancePerDayOrShift: 0,
        mealRule: 'none',
        travelAllowance: 0,
        phoneAllowance: 0,
        attendanceBonus: 0,
        attendanceRequiredDays: 28,
        insuranceDeduction: 0,
        monthlyAdvance: 0,
        overtimeRatePerHour: 44643,
      }));
    } else if (presetType === 'driver') {
      setFormData((prev) => ({
        ...prev,
        calculationMode: 'monthly_based',
        baseSalary: 10000000,
        standardDaysInMonth: 28,
        standardShiftsPerDay: 2,
        ratePerShift: 178571,
        eveningShiftMultiplier: 1.0,
        mealAllowancePerDayOrShift: 0,
        mealRule: 'none',
        travelAllowance: 0,
        phoneAllowance: 0,
        attendanceBonus: 0,
        attendanceRequiredDays: 28,
        overtimeRatePerHour: 44643,
      }));
    } else if (presetType === 'restaurant') {
      setFormData((prev) => ({
        ...prev,
        calculationMode: 'monthly_based',
        baseSalary: 10000000,
        standardDaysInMonth: 28,
        standardShiftsPerDay: 2,
        ratePerShift: 178571,
        eveningShiftMultiplier: 1.0,
        mealAllowancePerDayOrShift: 0,
        mealRule: 'none',
        attendanceBonus: 0,
        attendanceRequiredDays: 28,
        travelAllowance: 0,
        overtimeRatePerHour: 44643,
      }));
    } else if (presetType === 'cafe') {
      setFormData((prev) => ({
        ...prev,
        calculationMode: 'monthly_based',
        baseSalary: 10000000,
        standardDaysInMonth: 28,
        standardShiftsPerDay: 2,
        ratePerShift: 178571,
        eveningShiftMultiplier: 1.0,
        mealAllowancePerDayOrShift: 0,
        mealRule: 'none',
        attendanceBonus: 0,
        attendanceRequiredDays: 28,
        overtimeRatePerHour: 44643,
      }));
    } else if (presetType === 'hotel') {
      setFormData((prev) => ({
        ...prev,
        calculationMode: 'monthly_based',
        baseSalary: 10000000,
        standardDaysInMonth: 28,
        standardShiftsPerDay: 2,
        ratePerShift: 178571,
        eveningShiftMultiplier: 1.0,
        mealAllowancePerDayOrShift: 0,
        mealRule: 'none',
        attendanceBonus: 0,
        attendanceRequiredDays: 28,
        travelAllowance: 0,
        phoneAllowance: 0,
        overtimeRatePerHour: 44643,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-[#111827] to-[#0F172A] p-5 sm:p-6 rounded-2xl border border-purple-900/40 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white shadow-xs">
              Cài Đặt & Mô Phỏng
            </span>
            <span className="text-xs text-slate-400 font-medium">Hệ thống tính lương 2 ca/ngày</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Cài Đặt & Mô Phỏng Mức Lương Ca Gãy
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Tùy chỉnh lương cơ bản, công chuẩn, đơn giá ca, phụ cấp tiền ăn và xem ngay mô phỏng mức lương thực nhận thay đổi ra sao trong thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setFormData(DEFAULT_SALARY_CONFIG)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>
          <button
            onClick={handleSave}
            id="btn-save-salary-config"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/25"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveSuccess ? 'Đã Lưu Cài Đặt!' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </div>

      {/* Preset Profiles */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-medium">Mẫu thiết lập nhanh:</span>
        <button
          onClick={() => handleApplyPreset('standard_10m')}
          className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span>💎 Chuẩn 10 Triệu (28 ngày công, nghỉ 2 ngày, full 2 ca/ngày, không phụ cấp)</span>
        </button>
        <button
          onClick={() => handleApplyPreset('driver')}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 shadow-xs transition-colors"
        >
          🚗 Ca gãy 28 ngày công (10tr - 2 ca/ngày)
        </button>
        <button
          onClick={() => handleApplyPreset('restaurant')}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          🍽️ Nhà hàng / Dịch vụ
        </button>
      </div>

      {/* LIVE SIMULATOR: "Xem mức lương nó sẽ như thế nào" */}
      <div className="bg-gradient-to-br from-[#111827] via-[#0F172A] to-indigo-950/40 rounded-2xl p-5 sm:p-6 border border-indigo-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Bộ Mô Phỏng Lương Trực Tiếp (Live Salary Simulator)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Xem trước kết quả
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Kéo chỉnh số ngày làm ca gãy hoặc giờ OT để xem ngay mức lương nhận được tương ứng
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400">Mức lương mô phỏng:</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {formatVND(simNetSalary)}
            </div>
          </div>
        </div>

        {/* Sliders row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Slider 1: Split-shift days (2 shifts/day) */}
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Số ngày làm Ca Gãy (2 ca/ngày):
              </span>
              <strong className="text-indigo-400 font-mono text-sm">{simSplitDays} ngày</strong>
            </div>
            <input
              type="range"
              min="0"
              max="31"
              value={simSplitDays}
              onChange={(e) => setSimSplitDays(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 ngày</span>
              <span>28 ngày (10 Triệu)</span>
              <span>31 ngày</span>
            </div>
            <p className="text-[11px] text-slate-400">
              = {simSplitDays * 2} ca làm ({simSplitDays} công chuẩn)
            </p>
          </div>

          {/* Slider 2: Single shifts */}
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Số ca đơn lẻ thêm:
              </span>
              <strong className="text-amber-400 font-mono text-sm">{simSingleShifts} ca</strong>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={simSingleShifts}
              onChange={(e) => setSimSingleShifts(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 ca</span>
              <span>7 ca</span>
              <span>15 ca</span>
            </div>
            <p className="text-[11px] text-slate-400">
              = {simSingleShifts * simShiftRate > 0 ? formatVND(simSingleShifts * simShiftRate) : '0 ₫'}
            </p>
          </div>

          {/* Slider 3: Overtime hours */}
          <div className="bg-[#0F172A] p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                Giờ tăng ca (OT):
              </span>
              <strong className="text-orange-400 font-mono text-sm">{simOtHours} giờ</strong>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={simOtHours}
              onChange={(e) => setSimOtHours(parseInt(e.target.value, 10))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0h</span>
              <span>20h</span>
              <span>40h</span>
            </div>
            <p className="text-[11px] text-slate-400">
              = {formatVND(simOtSalary)} (ở mức {formatVND(formData.overtimeRatePerHour || 40000)}/h)
            </p>
          </div>
        </div>

        {/* Simulator Results Breakdown Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-800/80">
          <div className="bg-[#0B0D11]/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Đơn giá 1 ca:</span>
            <p className="font-bold text-white font-mono mt-0.5">{formatVND(simShiftRate)}</p>
          </div>
          <div className="bg-[#0B0D11]/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">1 Ngày ca gãy (2 ca):</span>
            <p className="font-bold text-indigo-300 font-mono mt-0.5">{formatVND(simSplitDayRate)}</p>
          </div>
          <div className="bg-[#0B0D11]/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Tiền ăn ca ({simSplitDays} ngày):</span>
            <p className="font-bold text-emerald-400 font-mono mt-0.5">{formatVND(simMealAllowance)}</p>
          </div>
          <div className="bg-[#0B0D11]/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[11px]">Thưởng chuyên cần:</span>
            <p className={`font-bold font-mono mt-0.5 ${hasEarnedAttendance ? 'text-emerald-400' : 'text-slate-500'}`}>
              {hasEarnedAttendance ? `+${formatVND(simAttendanceBonus)} (Đạt)` : 'Chưa đạt'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form (Accordion / Grouped Boxes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Thông tin nhân viên & Cơ chế tính */}
        <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Thông Tin Nhân Viên & Phương Thức Tính</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Họ và tên nhân viên</label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => handleFieldChange('employeeName', e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Nơi làm việc / Chi nhánh</label>
              <input
                type="text"
                value={formData.workplace}
                onChange={(e) => handleFieldChange('workplace', e.target.value)}
                placeholder="VD: Nhà hàng ABC - Chi nhánh 1"
                className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Chế độ tính lương</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFieldChange('calculationMode', 'monthly_based')}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                    formData.calculationMode === 'monthly_based'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-[#0F172A] text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs">Theo lương tháng</p>
                  <p className="text-[10px] font-normal opacity-80 mt-0.5">Lương tháng ÷ (Công × 2 ca)</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('calculationMode', 'shift_based')}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                    formData.calculationMode === 'shift_based'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-[#0F172A] text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs">Theo giá từng ca</p>
                  <p className="text-[10px] font-normal opacity-80 mt-0.5">Đơn giá cố định VNĐ/ca</p>
                </button>
              </div>
            </div>

            {formData.calculationMode === 'monthly_based' ? (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Lương cơ bản tháng (VNĐ)</label>
                  <input
                    type="number"
                    step="100000"
                    value={formData.baseSalary}
                    onChange={(e) => handleFieldChange('baseSalary', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Số ngày công chuẩn (ngày)</label>
                  <input
                    type="number"
                    value={formData.standardDaysInMonth}
                    onChange={(e) => handleFieldChange('standardDaysInMonth', parseInt(e.target.value, 10) || 28)}
                    className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-slate-300 font-medium mb-1">Đơn giá 1 ca (VNĐ/ca)</label>
                <input
                  type="number"
                  step="5000"
                  value={formData.ratePerShift}
                  onChange={(e) => handleFieldChange('ratePerShift', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Box 2: Ca Gãy & Hệ Số Ca Tối & Tăng Ca */}
        <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Quy Chuẩn Ca Gãy, Ca Tối & Tăng Ca</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Số ca/ngày chuẩn</label>
                <input
                  type="number"
                  value={formData.standardShiftsPerDay || 2}
                  onChange={(e) => handleFieldChange('standardShiftsPerDay', parseInt(e.target.value, 10) || 2)}
                  className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Ca gãy mặc định 2 ca/ngày = 1 công</p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Hệ số ca tối / đêm</label>
                <select
                  value={formData.eveningShiftMultiplier || 1.0}
                  onChange={(e) => handleFieldChange('eveningShiftMultiplier', parseFloat(e.target.value))}
                  className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                >
                  <option value="1.0">1.0 (Không phụ cấp ca tối)</option>
                  <option value="1.15">1.15 (+15% lương ca tối)</option>
                  <option value="1.2">1.2 (+20% lương ca tối)</option>
                  <option value="1.25">1.25 (+25% lương ca tối)</option>
                  <option value="1.3">1.3 (+30% lương ca tối)</option>
                  <option value="1.5">1.5 (+50% lương ca tối)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Đơn giá giờ tăng ca OT (VNĐ/giờ)</label>
              <input
                type="number"
                step="5000"
                value={formData.overtimeRatePerHour || 40000}
                onChange={(e) => handleFieldChange('overtimeRatePerHour', parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            {/* Giờ làm mỗi ca */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Số giờ làm việc quy định mỗi ca</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-center">
                  <span className="text-amber-400 font-medium text-[11px]">Sáng (giờ)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.hoursPerShift?.morning || 4}
                    onChange={(e) =>
                      handleFieldChange('hoursPerShift', {
                        ...formData.hoursPerShift,
                        morning: parseFloat(e.target.value) || 4,
                      })
                    }
                    className="w-full text-center mt-1 p-1 bg-transparent font-mono text-white text-xs border-b border-slate-700"
                  />
                </div>
                <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-center">
                  <span className="text-orange-400 font-medium text-[11px]">Chiều (giờ)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.hoursPerShift?.afternoon || 4}
                    onChange={(e) =>
                      handleFieldChange('hoursPerShift', {
                        ...formData.hoursPerShift,
                        afternoon: parseFloat(e.target.value) || 4,
                      })
                    }
                    className="w-full text-center mt-1 p-1 bg-transparent font-mono text-white text-xs border-b border-slate-700"
                  />
                </div>
                <div className="p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-center">
                  <span className="text-indigo-400 font-medium text-[11px]">Tối (giờ)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.hoursPerShift?.evening || 4}
                    onChange={(e) =>
                      handleFieldChange('hoursPerShift', {
                        ...formData.hoursPerShift,
                        evening: parseFloat(e.target.value) || 4,
                      })
                    }
                    className="w-full text-center mt-1 p-1 bg-transparent font-mono text-white text-xs border-b border-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Box 3: Phụ Cấp & Chuyên Cần */}
        <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span>Phụ Cấp Tiền Ăn & Thưởng Chuyên Cần</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Tiền ăn ca gãy (VNĐ/ngày)</label>
                <input
                  type="number"
                  step="5000"
                  value={formData.mealAllowancePerDayOrShift}
                  onChange={(e) => handleFieldChange('mealAllowancePerDayOrShift', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Quy tắc tính tiền ăn</label>
                <select
                  value={formData.mealRule}
                  onChange={(e) => handleFieldChange('mealRule', e.target.value as any)}
                  className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white text-xs"
                >
                  <option value="per_day_if_multi_shift">Khi làm từ 2 ca/ngày (Ca gãy)</option>
                  <option value="per_shift">Tính theo từng ca làm</option>
                  <option value="none">Không có tiền ăn</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Thưởng chuyên cần (VNĐ)</label>
                <input
                  type="number"
                  step="50000"
                  value={formData.attendanceBonus}
                  onChange={(e) => handleFieldChange('attendanceBonus', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Số công tối thiểu để đạt</label>
                <input
                  type="number"
                  value={formData.attendanceRequiredDays}
                  onChange={(e) => handleFieldChange('attendanceRequiredDays', parseInt(e.target.value, 10) || 24)}
                  className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Phụ cấp xăng xe (VNĐ/tháng)</label>
                <input
                  type="number"
                  step="50000"
                  value={formData.travelAllowance || 0}
                  onChange={(e) => handleFieldChange('travelAllowance', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Phụ cấp điện thoại / trách nhiệm</label>
                <input
                  type="number"
                  step="50000"
                  value={formData.phoneAllowance || 0}
                  onChange={(e) => handleFieldChange('phoneAllowance', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Box 4: Khấu Trừ & Tạm Ứng */}
        <div className="bg-[#111827] rounded-2xl p-5 border border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Tạm Ứng Lương & Khấu Trừ Bảo Hiểm</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tạm ứng lương trong kỳ (VNĐ)</label>
              <input
                type="number"
                step="100000"
                value={formData.monthlyAdvance || 0}
                onChange={(e) => handleFieldChange('monthlyAdvance', parseFloat(e.target.value) || 0)}
                placeholder="VD: 2000000"
                className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">Số tiền đã ứng trước trong tháng này</p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Bảo hiểm / Công đoàn (VNĐ/tháng)</label>
              <input
                type="number"
                step="50000"
                value={formData.insuranceDeduction || 0}
                onChange={(e) => handleFieldChange('insuranceDeduction', parseFloat(e.target.value) || 0)}
                placeholder="VD: 500000"
                className="w-full p-2.5 bg-[#0F172A] border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <div className="pt-3">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" />
                <span>{saveSuccess ? 'Đã Lưu Cài Đặt Lương!' : 'Áp Dụng Cài Đặt Lương'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
