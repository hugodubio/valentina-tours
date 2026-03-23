import { useState } from 'react';
import { format, isToday } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Tour } from '../../types/tour';
import { getWeekDays, toISODate, prevWeek, nextWeek } from '../../utils/dateHelpers';
import { TOUR_TYPES } from '../../constants/tours';

interface Props {
  tours: Tour[];
  onDayClick: (date: string) => void;
  onTourClick: (tour: Tour) => void;
}

export default function CalendarWeek({ tours, onDayClick, onTourClick }: Props) {
  const [current, setCurrent] = useState(() => new Date());
  const days = getWeekDays(current);

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
        <button onClick={() => setCurrent(prevWeek(current))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors text-[#6b6b6b] dark:text-[#888]">
          <ChevronLeft />
        </button>
        <span className="text-sm font-semibold text-ink dark:text-[#e8e5e0]">
          {format(days[0], 'd MMM', { locale: pt })} – {format(days[6], 'd MMM yyyy', { locale: pt })}
        </span>
        <button onClick={() => setCurrent(nextWeek(current))} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors text-[#6b6b6b] dark:text-[#888]">
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {days.map(day => {
          const iso = toISODate(day);
          const dayTours = toursByDate[iso] ?? [];
          const today = isToday(day);

          return (
            <div key={iso} className="flex flex-col gap-1">
              <div className="text-center mb-1">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888]">
                  {format(day, 'EEE', { locale: pt })}
                </div>
                <button
                  onClick={() => onDayClick(iso)}
                  className={`mx-auto mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-colors hover:bg-primary hover:text-white min-h-[28px] ${
                    today ? 'bg-primary text-white' : 'text-ink dark:text-[#e8e5e0]'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              </div>
              <div className="flex flex-col gap-1 min-h-[80px] md:min-h-[120px]">
                {dayTours.map(t => {
                  const cfg = TOUR_TYPES[t.type];
                  return (
                    <button
                      key={t.id}
                      onClick={() => onTourClick(t)}
                      className="w-full text-left px-1.5 md:px-2 py-1 md:py-1.5 rounded-lg text-[10px] md:text-[11px] font-medium text-white transition-opacity hover:opacity-80 min-h-[44px] flex flex-col justify-center"
                      style={{ backgroundColor: cfg.color }}
                    >
                      <div className="leading-tight">{cfg.label}</div>
                      {t.time && <div className="opacity-75 mt-0.5">{t.time}</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
