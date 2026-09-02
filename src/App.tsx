import React, { useState, useEffect, useMemo } from 'react';
import {
  DayAttendance,
  DaySalaryDetail,
  SalaryConfig,
} from './types';
import {
  loadSalaryConfig,
  saveSalaryConfig,
  loadAttendances,
  saveAttendances,
} from './utils/storage';
import { calculateMonthSummary } from './utils/salaryCalculator';
import {
  exportToExcelXLSX,
  copyForGoogleSheets,
} from './utils/sheetExporter';
import {
  getVietnamTodayStr,
  getVietnamCurrentMonthKey,
} from './utils/vietnamTime';
import { Sidebar, ActiveTabKey } from './components/Sidebar';
import { Header } from './components/Header';
import { ScheduleOverviewView } from './components/views/ScheduleOverviewView';
import { SalaryCalculationView } from './components/views/SalaryCalculationView';
import { ComprehensiveDashboardView } from './components/views/ComprehensiveDashboardView';
import { MonthlyReportView } from './components/views/MonthlyReportView';
import { AllTimeSalaryView } from './components/views/AllTimeSalaryView';
import { SalarySettingsView } from './components/views/SalarySettingsView';
import { DayEditModal } from './components/DayEditModal';
import { PrintSalarySlip } from './components/PrintSalarySlip';
import { AiAssistantModal } from './components/AiAssistantModal';
import { MonthSelectorModal } from './components/MonthSelectorModal';

export default function App() {
  // Current real date in Vietnam (GMT+7)
  const todayStr = useMemo(() => getVietnamTodayStr(), []);
  const defaultMonthKey = useMemo(() => getVietnamCurrentMonthKey(), []);

  // States
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(defaultMonthKey);
  const [activeTab, setActiveTab] = useState<ActiveTabKey>('schedule');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [config, setConfig] = useState<SalaryConfig>(() => loadSalaryConfig());
  const [attendances, setAttendances] = useState<Record<string, DayAttendance>>(() => loadAttendances());
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [selectedDayDetail, setSelectedDayDetail] = useState<DaySalaryDetail | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveSalaryConfig(config);
  }, [config]);

  useEffect(() => {
    saveAttendances(attendances);
  }, [attendances]);

  // Computed summary for the currently selected month
  const summary = useMemo(() => {
    return calculateMonthSummary(currentMonthKey, attendances, config, todayStr);
  }, [currentMonthKey, attendances, config, todayStr]);

  // Update single day attendance
  const handleUpdateDay = (date: string, updates: Partial<DayAttendance>) => {
    setAttendances((prev) => {
      const existing = prev[date] || {
        date,
        morning: false,
        afternoon: false,
        evening: false,
        overtimeHours: 0,
        dailyBonus: 0,
        dailyDeduction: 0,
        note: '',
      };
      return {
        ...prev,
        [date]: {
          ...existing,
          ...updates,
        },
      };
    });
  };

  // Batch apply updates
  const handleBatchUpdate = (updatesMap: Record<string, Partial<DayAttendance>>) => {
    setAttendances((prev) => {
      const next = { ...prev };
      Object.entries(updatesMap).forEach(([date, updates]) => {
        const existing = next[date] || {
          date,
          morning: false,
          afternoon: false,
          evening: false,
          overtimeHours: 0,
          dailyBonus: 0,
          dailyDeduction: 0,
          note: '',
        };
        next[date] = { ...existing, ...updates };
      });
      return next;
    });
  };

  // Batch presets (Especially Ca Gãy 2 ca/ngày)
  const handleBatchApply = (pattern: 'morning_evening' | 'morning_afternoon' | 'afternoon_evening' | 'clear') => {
    const [yearStr, monthStr] = currentMonthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const totalDays = new Date(year, month, 0).getDate();

    const updates: Record<string, Partial<DayAttendance>> = {};

    for (let d = 1; d <= totalDays; d++) {
      const dayStr = d < 10 ? `0${d}` : `${d}`;
      const dateKey = `${currentMonthKey}-${dayStr}`;
      const dayOfWeek = new Date(year, month - 1, d).getDay();

      if (pattern === 'clear') {
        updates[dateKey] = {
          morning: false,
          afternoon: false,
          evening: false,
          overtimeHours: 0,
          dailyBonus: 0,
          dailyDeduction: 0,
          note: '',
        };
      } else if (dayOfWeek !== 0) {
        // Thứ 2 đến thứ 7
        if (pattern === 'morning_evening') {
          updates[dateKey] = {
            morning: true,
            afternoon: false,
            evening: true,
            note: 'Ca gãy: Sáng + Đêm (1 công)',
          };
        } else if (pattern === 'morning_afternoon') {
          updates[dateKey] = {
            morning: true,
            afternoon: true,
            evening: false,
            note: 'Ca liền: Sáng + Chiều (1 công)',
          };
        } else if (pattern === 'afternoon_evening') {
          updates[dateKey] = {
            morning: false,
            afternoon: true,
            evening: true,
            note: 'Ca gãy: Chiều + Đêm (1 công)',
          };
        }
      }
    }

    handleBatchUpdate(updates);
  };

  // Switch to a past/future month to edit its attendance & recalculate
  const handleSelectMonthToEdit = (monthKey: string) => {
    setCurrentMonthKey(monthKey);
    setActiveTab('schedule'); // Jump right to Schedule overview for that month to easily edit
  };

  // Export handlers
  const handleExportExcel = () => {
    exportToExcelXLSX(summary, config);
  };

  const handleCopyGoogleSheet = async () => {
    const success = await copyForGoogleSheets(summary, config);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const todayAttendance = attendances[todayStr];

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E2E8F0] flex font-sans selection:bg-indigo-600 selection:text-white">
      {/* Sidebar Navigation */}
      <div className="no-print">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentMonthKey={currentMonthKey}
          onMonthChange={setCurrentMonthKey}
          config={config}
          summary={summary}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          onPrintSlip={handlePrint}
          onExportExcel={handleExportExcel}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          onOpenMonthSelector={() => setIsMonthSelectorOpen(true)}
        />
      </div>

      {/* Main Content Layout with Responsive Offset for Desktop Sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <div className="no-print">
          <Header
            currentMonthKey={currentMonthKey}
            onMonthChange={setCurrentMonthKey}
            config={config}
            activeTab={activeTab}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            onExportExcel={handleExportExcel}
            onCopyGoogleSheet={handleCopyGoogleSheet}
            onPrint={handlePrint}
            copySuccess={copySuccess}
            summary={summary}
            onOpenMonthSelector={() => setIsMonthSelectorOpen(true)}
          />
        </div>

        {/* View Routing */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
          {/* Tab 1: Tổng quan về lịch làm việc */}
          {activeTab === 'schedule' && (
            <ScheduleOverviewView
              summary={summary}
              config={config}
              currentDateStr={todayStr}
              onUpdateDay={handleUpdateDay}
              onOpenDayDetail={setSelectedDayDetail}
              onBatchApply={handleBatchApply}
              todayAttendance={todayAttendance}
            />
          )}

          {/* Tab 2: Tính lương chi tiết */}
          {activeTab === 'salary' && (
            <SalaryCalculationView
              summary={summary}
              config={config}
              currentDateStr={todayStr}
              onPrintSlip={handlePrint}
            />
          )}

          {/* Tab 3: Tổng thể cả lương và lịch làm việc */}
          {activeTab === 'comprehensive' && (
            <ComprehensiveDashboardView
              summary={summary}
              config={config}
              currentDateStr={todayStr}
              onUpdateDay={handleUpdateDay}
              onBatchApply={handleBatchApply}
              onOpenDayDetail={setSelectedDayDetail}
              onExportExcel={handleExportExcel}
              onCopyGoogleSheet={handleCopyGoogleSheet}
              onPrint={handlePrint}
              copySuccess={copySuccess}
              todayAttendance={todayAttendance}
            />
          )}

          {/* Tab 4: Báo cáo phân theo từng tháng */}
          {activeTab === 'monthly_report' && (
            <MonthlyReportView
              summary={summary}
              config={config}
              currentMonthKey={currentMonthKey}
              onMonthChange={setCurrentMonthKey}
              onOpenDayDetail={setSelectedDayDetail}
              onBatchApply={handleBatchApply}
              onExportExcel={handleExportExcel}
              onPrint={handlePrint}
              onNavigateToTab={setActiveTab}
            />
          )}

          {/* Tab 5: Báo cáo toàn bộ lương (Tab tổng xem tất cả lương) */}
          {activeTab === 'all_time' && (
            <AllTimeSalaryView
              attendances={attendances}
              config={config}
              currentDateStr={todayStr}
              onSelectMonthToEdit={handleSelectMonthToEdit}
              onNavigateToTab={setActiveTab}
            />
          )}

          {/* Tab 6: Cài đặt để xem mức lương nó sẽ như thế nào */}
          {activeTab === 'settings' && (
            <SalarySettingsView
              config={config}
              onSaveConfig={setConfig}
            />
          )}
        </main>
      </div>

      {/* Modals & Popups */}
      <MonthSelectorModal
        isOpen={isMonthSelectorOpen}
        onClose={() => setIsMonthSelectorOpen(false)}
        currentMonthKey={currentMonthKey}
        onSelectMonth={(mKey) => {
          setCurrentMonthKey(mKey);
          setIsMonthSelectorOpen(false);
        }}
        attendances={attendances}
        config={config}
      />

      <DayEditModal
        dayDetail={selectedDayDetail}
        config={config}
        onClose={() => setSelectedDayDetail(null)}
        onSave={handleUpdateDay}
      />

      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        summary={summary}
        config={config}
        currentDateStr={todayStr}
        onBatchUpdate={handleBatchUpdate}
      />

      {/* Print Slip Component for Browser Print Dialog */}
      <PrintSalarySlip summary={summary} config={config} />
    </div>
  );
}
