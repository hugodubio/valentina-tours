import { useState } from 'react';
import { format, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Tour } from '../../types/tour';
import { getMonthDays, toISODate } from '../../utils/dateHelpers';
import TourDot from './TourDot';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

interface Props {
  tours: Tour[];
  onDayClick: (date: string) => void;
  onTourClick: (tour: Tour) => void;
}

export default function CalendarMonth({ tours, onDayClick, onTourClick }: Props) {
  const [current, setCurrent] = useState(() => new Date());
  const days = getMonthDays(current);

  const toursByDate = tours.reduce<Record<string, Tour[]>>((acc, t) => {
    (acc[t.date] ??= []).push(t);
    return acc;
  }, {});

  const ChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  );
  const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setCurrent(subMonths(current, 1))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0]">
          <ChevronLeft />
        </button>
        <span className="text-sm font-semibold text-ink dark:text-[#e8e5e0] capitalize">
          {format(current, 'MMMM yyyy', { locale: pt })}
        </span>
        <button onClick={() => setCurrent(addMonths(current, 1))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0]">
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-black/[0.06] dark:bg-white/[0.06] rounded-2xl overflow-hidden">
        {days.map(day => {
          const iso = toISODate(day);
          const dayTours = toursByDate[iso] ?? [];
          const inMonth = isSameMonth(day, current);
          const today = isToday(day);

          return (
            <button
              key={iso}
              onClick={() => inMonth && onDayClick(iso)}
              className={`min-h-[64px] md:min-h-[80px] bg-white dark:bg-[#111] p-1.5 md:p-2 text-left flex flex-col gap-1 transition-colors ${
                inMonth ? 'hover:bg-surface dark:hover:bg-[#1a1a1a] cursor-pointer' : 'cursor-default opacity-25'
              }`}
            >
              <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${
                today ? 'bg-primary text-white' : 'text-ink dark:text-[#e8e5e0]'
              }`}>
                {format(day, 'd')}
              </span>
              <div className="flex flex-wrap gap-0.5 md:gap-1">
                {dayTours.slice(0, 4).map(t => (
                  <TourDot key={t.id} tour={t} onClick={onTourClick} />
                ))}
                {dayTours.length > 4 && (
                  <span className="text-[9px] text-[#6b6b6b] dark:text-[#888]">+{dayTours.length - 4}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {tours.filter(t => t.date.startsWith(format(current, 'yyyy-MM'))).length === 0 && (
        <p className="text-center text-sm text-[#6b6b6b] dark:text-[#888] mt-6">
          Nenhum tour este mês. Adiciona o primeiro!
        </p>
      )}
    </div>
  );
}
