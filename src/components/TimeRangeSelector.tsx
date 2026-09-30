import React, { useRef } from 'react';
import { TimeRangeOption, MonthOption } from '../types';
import { CalendarDays, CalendarRange, Calendar, Layers, ChevronDown, Clock } from 'lucide-react';

interface TimeRangeSelectorProps {
  timeRange: TimeRangeOption;
  selectedMonth: string;
  availableMonths: MonthOption[];
  totalBookingsCount: number;
  filteredBookingsCount: number;
  dateRangeLabel: string;
  onRangeChange: (range: TimeRangeOption) => void;
  onMonthChange: (month: string) => void;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  timeRange,
  selectedMonth,
  availableMonths,
  totalBookingsCount,
  filteredBookingsCount,
  dateRangeLabel,
  onRangeChange,
  onMonthChange,
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const OPTIONS: { id: TimeRangeOption; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: '7d', label: 'Últimos 7 días', icon: CalendarDays },
    { id: '30d', label: 'Últimos 30 días', icon: CalendarRange },
    { id: 'month', label: 'Por Mes', icon: Calendar },
    { id: 'all', label: 'Todo el Histórico', icon: Layers },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % OPTIONS.length;
      onRangeChange(OPTIONS[nextIndex].id);
      if (OPTIONS[nextIndex].id === 'month' && selectRef.current) {
        selectRef.current.focus();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + OPTIONS.length) % OPTIONS.length;
      onRangeChange(OPTIONS[prevIndex].id);
    }
  };

  const handleMonthSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onMonthChange(e.target.value);
    if (timeRange !== 'month') {
      onRangeChange('month');
    }
  };

  return (
    <nav 
      aria-label="Filtros temporales" 
      className="w-full bg-[#FFFFFF] rounded-2xl p-3 sm:p-4 border border-[#E8E4DD] shadow-2xs mb-6 min-h-[64px] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 transition-all"
    >
      {/* 1D Flexbox Semantic Fieldset for Time Controls */}
      <fieldset className="w-full lg:w-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
        <legend className="sr-only">Rango temporal</legend>
        
        {/* Pills / Buttons */}
        <div 
          role="group" 
          aria-label="Seleccionar rango temporal"
          className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F1E8] rounded-xl border border-[#E8E4DD]"
        >
          {OPTIONS.map((opt, idx) => {
            const isSelected = timeRange === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  onRangeChange(opt.id);
                  if (opt.id === 'month' && selectRef.current) {
                    setTimeout(() => selectRef.current?.focus(), 50);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`inline-flex items-center gap-1.5 py-[clamp(0.375rem,0.6vw,0.45rem)] px-[clamp(0.625rem,0.9vw,0.85rem)] rounded-lg text-[clamp(0.75rem,0.82vw,0.875rem)] font-semibold transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-1 ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-[#FDFBF7] shadow-xs'
                    : 'text-[#5A5245] hover:text-[#1A1A1A] hover:bg-[#EAE5D9]/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C8BFA8]' : 'text-[#8C7A6B]'}`} />
                <span className="leading-none pt-0.5">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Month Selector (Active or Highlighted when 'month' is selected) */}
        {availableMonths.length > 0 && (
          <div className="relative inline-flex items-center">
            <label htmlFor="month-select-dropdown" className="sr-only">
              Seleccionar mes y año del histórico
            </label>
            <div className={`flex items-center rounded-xl border pl-2.5 pr-8 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              timeRange === 'month'
                ? 'bg-[#1A1A1A] text-[#FDFBF7] border-[#1A1A1A] shadow-xs'
                : 'bg-[#FDFBF7] text-[#4A453B] border-[#E8E4DD] hover:bg-[#F5F1E8]'
            }`}>
              <Calendar className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${timeRange === 'month' ? 'text-[#C8BFA8]' : 'text-[#8C7A6B]'}`} />
              <select
                id="month-select-dropdown"
                ref={selectRef}
                value={selectedMonth || (availableMonths[0]?.value ?? '')}
                onChange={handleMonthSelectChange}
                onFocus={() => {
                  if (timeRange !== 'month') onRangeChange('month');
                }}
                aria-label="Seleccionar mes y año"
                className="bg-transparent text-inherit font-semibold text-xs focus:outline-none cursor-pointer pr-1 appearance-none"
              >
                {availableMonths.map((m) => (
                  <option 
                    key={m.value} 
                    value={m.value} 
                    className="bg-white text-[#1A1A1A] py-1 text-xs"
                  >
                    {m.label} ({m.count} {m.count === 1 ? 'reserva' : 'reservas'})
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute right-2.5 pointer-events-none ${
                timeRange === 'month' ? 'text-[#C8BFA8]' : 'text-[#8C7A6B]'
              }`} />
            </div>
          </div>
        )}
      </fieldset>

      {/* Screen Reader & Visual Announcement Bar (aria-live="polite", CLS = 0) */}
      <div 
        aria-live="polite" 
        className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-2 text-xs text-[#7A6E5D] pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F0ECE1] shrink-0 min-h-[28px]"
      >
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
          <span className="font-medium text-[#5A5245] truncate max-w-[240px] sm:max-w-none">
            {dateRangeLabel}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5F1E8] text-[#1A1A1A] font-semibold text-[11px] border border-[#E8E4DD] shrink-0">
          <span className="font-mono-numbers">{filteredBookingsCount}</span>
          <span className="text-[#7A6E5D] font-normal">de</span>
          <span className="font-mono-numbers">{totalBookingsCount}</span>
        </span>
      </div>
    </nav>
  );
};
