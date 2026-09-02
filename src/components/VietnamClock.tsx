import React, { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';
import { getVietnamNow } from '../utils/vietnamTime';

interface VietnamClockProps {
  compact?: boolean;
}

export const VietnamClock: React.FC<VietnamClockProps> = ({ compact = false }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const vnDate = getVietnamNow();
      
      const hours = String(vnDate.getHours()).padStart(2, '0');
      const minutes = String(vnDate.getMinutes()).padStart(2, '0');
      const seconds = String(vnDate.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[vnDate.getDay()];
      const day = String(vnDate.getDate()).padStart(2, '0');
      const month = String(vnDate.getMonth() + 1).padStart(2, '0');
      const year = vnDate.getFullYear();
      setDateStr(`${dayName}, ${day}/${month}/${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="font-mono font-bold text-white tracking-wide">{timeStr || '--:--:--'}</span>
        <span className="text-[10px] text-slate-400 hidden sm:inline font-medium">VN (GMT+7)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#0F172A] via-[#111827] to-indigo-950/40 border border-slate-800 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Giờ Thực Tế Việt Nam (GMT+7)
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-300 mt-0.5">
            {dateStr || 'Đang đồng bộ...'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-base sm:text-lg font-mono font-black text-white tracking-wider">
          {timeStr || '--:--:--'}
        </div>
      </div>
    </div>
  );
};
