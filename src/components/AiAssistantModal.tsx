import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import { MonthSalarySummary, SalaryConfig, DayAttendance } from '../types';
import { formatVND, getSingleShiftRate } from '../utils/salaryCalculator';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthSalarySummary;
  config: SalaryConfig;
  currentDateStr: string;
  onBatchUpdate: (updates: Record<string, Partial<DayAttendance>>) => void;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  suggestedAction?: {
    type: 'apply_shifts';
    data: Record<string, Partial<DayAttendance>>;
    description: string;
  };
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  summary,
  config,
  currentDateStr,
  onBatchUpdate,
}) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Xin chào ${config.employeeName || 'bạn'}! Tôi là Trợ lý Chấm Công Ca Gãy. Bạn có thể nói tự nhiên như:
• "Hôm nay tôi làm ca sáng và tối, tăng ca 1h"
• "Tuần này từ thứ 2 đến thứ 6 làm sáng tối, thứ 7 làm sáng chiều"
• "Tôi cần làm thêm bao nhiêu ca nữa để đạt 10 triệu?"
• "Hôm qua tôi quên chấm, tôi làm ca chiều và tối"`,
    },
  ]);
  const [appliedAction, setAppliedAction] = useState<string | null>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const newMessages: Message[] = [...messages, { role: 'user', text: userText }];
    setInput('');

    // Natural Language Parser
    const lower = userText.toLowerCase();
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Case 1: "Hôm nay" / "Hôm qua"
    if (lower.includes('hôm nay') || lower.includes('nay')) {
      const isMorning = lower.includes('sáng');
      const isAfternoon = lower.includes('chiều');
      const isEvening = lower.includes('tối');
      
      // Parse OT
      let ot = 0;
      const otMatch = lower.match(/tăng ca\s*([0-9.]+)\s*(h|tiếng|giờ)/i) || lower.match(/ot\s*([0-9.]+)/i);
      if (otMatch) {
        ot = parseFloat(otMatch[1]) || 0;
      }

      const updates: Record<string, Partial<DayAttendance>> = {
        [currentDateStr]: {
          morning: isMorning,
          afternoon: isAfternoon,
          evening: isEvening,
          overtimeHours: ot,
          note: `AI chấm: ${isMorning ? 'Sáng ' : ''}${isAfternoon ? 'Chiều ' : ''}${isEvening ? 'Tối' : ''}${ot ? ` + ${ot}h OT` : ''}`.trim(),
        },
      };

      const shiftDesc = `${isMorning ? 'Sáng ' : ''}${isAfternoon ? 'Chiều ' : ''}${isEvening ? 'Tối' : ''}`.trim() || 'Nghỉ';

      newMessages.push({
        role: 'assistant',
        text: `Đã hiểu! Bạn muốn chấm công hôm nay (${currentDateStr.split('-').reverse().join('/')}) với:
- Ca làm: ${shiftDesc}
${ot > 0 ? `- Tăng ca: ${ot} giờ` : ''}

Bấm nút bên dưới để áp dụng ngay vào bảng tính:`,
        suggestedAction: {
          type: 'apply_shifts',
          data: updates,
          description: `Áp dụng ca ${shiftDesc} cho hôm nay`,
        },
      });
    } else if (lower.includes('bao nhiêu ca') || lower.includes('đạt') || lower.includes('mục tiêu') || lower.includes('triệu')) {
      // Goal calculation
      const targetMatch = lower.match(/([0-9]+)\s*(triệu|tr|m)/i);
      const targetMillion = targetMatch ? parseFloat(targetMatch[1]) : 10;
      const targetAmount = targetMillion * 1000000;
      
      const currentNet = summary.projectedNetSalary;
      const shiftRate = getSingleShiftRate(config);
      const diff = Math.max(0, targetAmount - currentNet);
      const neededShifts = Math.ceil(diff / (shiftRate || 150000));
      const neededSplitDays = Math.ceil(neededShifts / 2);

      newMessages.push({
        role: 'assistant',
        text: `📊 Phân tích mục tiêu thu nhập:
- Mục tiêu: ${formatVND(targetAmount)}
- Thu nhập dự kiến hiện tại: ${formatVND(currentNet)}
- Còn thiếu: ${formatVND(diff)}

👉 Với đơn giá ~${formatVND(shiftRate)}/ca, bạn cần làm thêm khoảng **${neededShifts} ca** (tương đương **${neededSplitDays} ngày ca gãy 2 ca**) để đạt mức thu nhập này!`,
      });
    } else if (lower.includes('cả tuần') || lower.includes('thứ 2 đến thứ 6') || lower.includes('t2 đến t6')) {
      // Batch weekdays
      const updates: Record<string, Partial<DayAttendance>> = {};
      summary.daysDetail.forEach((d) => {
        if (d.dayOfWeek !== 'Chủ Nhật') {
          updates[d.dayAttendance.date] = {
            morning: true,
            afternoon: false,
            evening: true,
            note: 'Ca gãy: Sáng + Tối (Tuần)',
          };
        }
      });

      newMessages.push({
        role: 'assistant',
        text: `Tôi có thể giúp bạn tự động chấm ca gãy (Sáng + Tối) cho tất cả các ngày trong tuần từ Thứ 2 đến Thứ 7 tháng này!`,
        suggestedAction: {
          type: 'apply_shifts',
          data: updates,
          description: 'Áp dụng ca gãy (Sáng+Tối) cả tháng',
        },
      });
    } else {
      newMessages.push({
        role: 'assistant',
        text: `Hiện tại bạn đã làm được **${summary.workedStandardDays} công** (${summary.workedTotalShifts} ca) trong tháng này.
Lương tích lũy thực tế đến hôm nay là **${formatVND(summary.accumulatedNetSalary)}**.
Lương dự kiến cả tháng là **${formatVND(summary.projectedNetSalary)}**.

Bạn cần tôi hỗ trợ ghi nhận ca làm nào tiếp theo?`,
      });
    }

    setMessages(newMessages);
  };

  const handleApplyAction = (action: NonNullable<Message['suggestedAction']>, idx: number) => {
    onBatchUpdate(action.data);
    setAppliedAction(`applied-${idx}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#111827] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-800 flex flex-col h-[600px] max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 text-[#E2E8F0]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-400 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>AI Trợ Lý Chấm Công Ca Gãy</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </h3>
              <p className="text-xs text-slate-400">Nhập ca bằng ngôn ngữ tự nhiên & tính lương nhanh</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B0D11]/60 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-purple-950/80 border border-purple-800/50 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-2xs leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                    : 'bg-[#111827] text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                {msg.text}

                {/* Suggested Action Button */}
                {msg.suggestedAction && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800">
                    {appliedAction === `applied-${idx}` ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4" /> Đã cập nhật vào bảng tính!
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyAction(msg.suggestedAction!, idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>{msg.suggestedAction.description}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-3 bg-[#0F172A] border-t border-slate-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="VD: Hôm nay làm ca sáng và tối, tăng ca 1h..."
              className="flex-1 text-xs py-2 px-3 border border-slate-700 rounded-xl focus:ring-1 focus:ring-indigo-500 bg-[#111827] text-white placeholder-slate-500"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors shrink-0 shadow-lg shadow-indigo-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
