import React, { useState } from 'react';
import {
  X,
  Settings,
  DollarSign,
  Briefcase,
  Utensils,
  Award,
  ShieldAlert,
  Save,
  HelpCircle,
  Calculator,
} from 'lucide-react';
import { SalaryConfig } from '../types';
import { formatVND, getSingleShiftRate } from '../utils/salaryCalculator';

interface SalaryConfigModalProps {
  config: SalaryConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: SalaryConfig) => void;
}

export const SalaryConfigModal: React.FC<SalaryConfigModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<SalaryConfig>({ ...config });

  const calculatedShiftRate = getSingleShiftRate(form);
  const calculatedDayRate = calculatedShiftRate * (form.standardShiftsPerDay || 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#111827] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-800 animate-in fade-in zoom-in-95 duration-200 text-[#E2E8F0]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cài Đặt Mức Lương Cơ Bản & Ca Làm
              </h3>
              <p className="text-xs text-slate-400">
                Thiết lập mức lương, phụ cấp ca gãy, tiền ăn và quy tắc tính lương
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Thông tin chung */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Họ và tên của bạn
              </label>
              <input
                type="text"
                value={form.employeeName}
                onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 bg-[#0F172A] text-white placeholder-slate-500"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Nơi làm việc / Chi nhánh
              </label>
              <input
                type="text"
                value={form.workplace}
                onChange={(e) => setForm({ ...form, workplace: e.target.value })}
                className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 bg-[#0F172A] text-white placeholder-slate-500"
                placeholder="VD: Nhà hàng ABC - Chi nhánh 1"
              />
            </div>
          </div>

          {/* Section 2: Mức lương cơ bản & Chế độ tính */}
          <div className="p-4 bg-indigo-950/20 rounded-2xl border border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                Mức Lương Cơ Bản
              </span>
              <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-lg border border-indigo-900/50 text-xs">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, calculationMode: 'monthly_based' })}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    form.calculationMode === 'monthly_based'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Theo Tháng
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, calculationMode: 'shift_based' })}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    form.calculationMode === 'shift_based'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Theo Từng Ca
                </button>
              </div>
            </div>

            {form.calculationMode === 'monthly_based' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Lương cơ bản tháng (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    value={form.baseSalary}
                    onChange={(e) => setForm({ ...form, baseSalary: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-indigo-300 bg-[#0F172A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Số công chuẩn / tháng
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="31"
                    value={form.standardDaysInMonth}
                    onChange={(e) =>
                      setForm({ ...form, standardDaysInMonth: parseInt(e.target.value, 10) || 26 })
                    }
                    className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono bg-[#0F172A] text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Số ca / 1 công chuẩn
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={form.standardShiftsPerDay}
                    onChange={(e) =>
                      setForm({ ...form, standardShiftsPerDay: parseInt(e.target.value, 10) || 2 })
                    }
                    className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono bg-[#0F172A] text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Ca gãy: 2 ca = 1 công</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Đơn giá cố định 1 ca (VNĐ/ca)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={form.ratePerShift}
                  onChange={(e) =>
                    setForm({ ...form, ratePerShift: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-indigo-300 bg-[#0F172A]"
                />
              </div>
            )}

            {/* Live Calculation Preview Banner */}
            <div className="p-3 bg-[#0F172A] rounded-xl border border-indigo-900/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Đơn giá quy đổi thực tế:</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-semibold">
                <span className="text-indigo-400">1 ca = {formatVND(calculatedShiftRate)}</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400">1 ngày ca gãy (2 ca) = {formatVND(calculatedDayRate)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Giờ làm & Hệ số ca tối & Tăng ca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Hệ số phụ cấp Ca Tối
              </label>
              <select
                value={form.eveningShiftMultiplier}
                onChange={(e) =>
                  setForm({ ...form, eveningShiftMultiplier: parseFloat(e.target.value) })
                }
                className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 bg-[#0F172A] text-white font-mono"
              >
                <option value={1.0}>1.0 (Lương ca tối như bình thường)</option>
                <option value={1.15}>1.15 (+15% phụ cấp ca tối)</option>
                <option value={1.2}>1.20 (+20% phụ cấp đêm)</option>
                <option value={1.3}>1.30 (+30% phụ cấp đêm)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Tiền tăng ca ngoài ca (VNĐ/giờ)
              </label>
              <input
                type="number"
                step="5000"
                value={form.overtimeRatePerHour}
                onChange={(e) =>
                  setForm({ ...form, overtimeRatePerHour: parseFloat(e.target.value) || 0 })
                }
                className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono bg-[#0F172A] text-white"
                placeholder="40000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Thời lượng mỗi ca (mặc định)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={form.hoursPerShift.morning}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hoursPerShift: {
                        ...form.hoursPerShift,
                        morning: parseFloat(e.target.value) || 4,
                        afternoon: parseFloat(e.target.value) || 4,
                        evening: parseFloat(e.target.value) || 4,
                      },
                    })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono text-center bg-[#0F172A] text-white"
                />
                <span className="text-xs text-slate-500">giờ/ca</span>
              </div>
            </div>
          </div>

          {/* Section 4: Phụ cấp (Tiền ăn, xăng xe, điện thoại) */}
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-amber-400" />
              Chế Độ Phụ Cấp & Tiền Ăn Ca
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Mức tiền ăn ca (VNĐ)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={form.mealAllowancePerDayOrShift}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mealAllowancePerDayOrShift: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono bg-[#0F172A] text-white"
                  placeholder="30000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Quy tắc tính tiền ăn
                </label>
                <select
                  value={form.mealRule}
                  onChange={(e) =>
                    setForm({ ...form, mealRule: e.target.value as any })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 bg-[#0F172A] text-white"
                >
                  <option value="per_day_if_multi_shift">
                    Hỗ trợ khi làm ca gãy (từ 2 ca / ngày trở lên)
                  </option>
                  <option value="per_shift">Tính theo từng ca (Làm ca nào tính ca đó)</option>
                  <option value="none">Không hỗ trợ tiền ăn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Phụ cấp Xăng xe / Đi lại (VNĐ/tháng)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={form.travelAllowance}
                  onChange={(e) =>
                    setForm({ ...form, travelAllowance: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono bg-[#0F172A] text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Phụ cấp Điện thoại / Trách nhiệm (VNĐ/tháng)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={form.phoneAllowance}
                  onChange={(e) =>
                    setForm({ ...form, phoneAllowance: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono bg-[#0F172A] text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Thưởng chuyên cần & Giảm trừ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chuyên cần */}
            <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-900/40 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                Thưởng Chuyên Cần
              </span>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tiền thưởng (VNĐ/tháng)</label>
                <input
                  type="number"
                  step="50000"
                  value={form.attendanceBonus}
                  onChange={(e) =>
                    setForm({ ...form, attendanceBonus: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono bg-[#0F172A] text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Số công tối thiểu để đạt</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={form.attendanceRequiredDays}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      attendanceRequiredDays: parseFloat(e.target.value) || 24,
                    })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono bg-[#0F172A] text-white"
                />
              </div>
            </div>

            {/* Giảm trừ / Tạm ứng */}
            <div className="p-4 bg-rose-950/20 rounded-2xl border border-rose-900/40 space-y-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Giảm Trừ & Tạm Ứng
              </span>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Đã tạm ứng trong tháng (VNĐ)</label>
                <input
                  type="number"
                  step="100000"
                  value={form.monthlyAdvance}
                  onChange={(e) =>
                    setForm({ ...form, monthlyAdvance: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-rose-500 font-mono bg-[#0F172A] text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Bảo hiểm / Công đoàn (VNĐ/tháng)</label>
                <input
                  type="number"
                  step="50000"
                  value={form.insuranceDeduction}
                  onChange={(e) =>
                    setForm({ ...form, insuranceDeduction: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-rose-500 font-mono bg-[#0F172A] text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
            >
              Đóng
            </button>
            <button
              type="submit"
              id="btn-save-salary-config"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Áp dụng cài đặt lương</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
