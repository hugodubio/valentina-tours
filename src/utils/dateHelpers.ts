import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  getISOWeek,
  startOfISOWeek,
  endOfISOWeek,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { pt } from 'date-fns/locale';

export function getMonthDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function getWeekDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfISOWeek(date),
    end: endOfISOWeek(date),
  });
}

export function formatDatePt(date: Date): string {
  return format(date, "EEE, d MMM yyyy", { locale: pt });
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseISODate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function weekLabel(date: Date): string {
  return `Semana ${getISOWeek(date)}`;
}

export function prevWeek(date: Date): Date {
  return subWeeks(date, 1);
}

export function nextWeek(date: Date): Date {
  return addWeeks(date, 1);
}
