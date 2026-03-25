import { useState } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import type { Tour, TourType } from '../../types/tour';
import { TOUR_TYPES } from '../../constants/tours';
import { calcTourFinance, formatEur } from '../../utils/finance';
import { formatDatePt, parseISODate } from '../../utils/dateHelpers';

type DateFilter = 'all' | 'week' | 'month' | 'custom';

interface Props {
  tours: Tour[];
  onEdit: (tour: Tour) => void;
  onDelete: (id: string) => void;
}

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

export default function TourList({ tours, onEdit, onDelete }: Props) {
  const [filter, setFilter] = useState<TourType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

  const pastTours = tours.filter(t => t.date <= todayStr);

  function applyDateFilter(t: Tour): boolean {
    if (dateFilter === 'week') return t.date >= weekStart && t.date <= weekEnd;
    if (dateFilter === 'month') return t.date >= monthStart && t.date <= monthEnd;
    if (dateFilter === 'custom') {
      const from = customFrom || '0000-00-00';
      const to = customTo || '9999-12-31';
      return t.date >= from && t.date <= to;
    }
    return true;
  }

  const dateFilteredTours = pastTours.filter(applyDateFilter);

  const filtered = [...dateFilteredTours]
    .filter(t => filter === 'all' || t.type === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  function handleDelete(id: string) {
    if (window.confirm('Tens a certeza que queres eliminar este tour?')) {
      onDelete(id);
    }
  }

  const isPending = (t: Tour) => !t.revenueTotal;

  return (
    <div>
      {/* Filters */}
      <div className="mb-5 flex flex-col gap-2">
        {/* Date filter pills */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'week', 'month', 'custom'] as DateFilter[]).map(df => {
            const labels: Record<DateFilter, string> = { all: 'Tudo', week: 'Esta semana', month: 'Este mês', custom: 'Personalizado' };
            return (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[36px] ${
                  dateFilter === df
                    ? 'bg-[#1a1814] dark:bg-[#e8e5e0] text-white dark:text-[#1a1814]'
                    : 'bg-black/[0.05] dark:bg-white/[0.06] text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0]'
                }`}
              >
                {labels[df]}
              </button>
            );
          })}
        </div>

        {/* Custom date range inputs */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="border border-black/[0.12] dark:border-white/[0.12] rounded-xl px-3 py-2 text-xs text-ink dark:text-[#e8e5e0] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors min-h-[36px]"
            />
            <span className="text-xs text-[#6b6b6b] dark:text-[#888]">até</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="border border-black/[0.12] dark:border-white/[0.12] rounded-xl px-3 py-2 text-xs text-ink dark:text-[#e8e5e0] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors min-h-[36px]"
            />
            {(customFrom || customTo) && (
              <button
                onClick={() => { setCustomFrom(''); setCustomTo(''); }}
                className="text-xs text-[#6b6b6b] dark:text-[#888] hover:text-ink px-2 py-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        )}

        {/* Tour type filter pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[36px] ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-black/[0.05] dark:bg-white/[0.06] text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0]'
            }`}
          >
            Todos ({dateFilteredTours.length})
          </button>
          {Object.entries(TOUR_TYPES).map(([key, cfg]) => {
            const count = dateFilteredTours.filter(t => t.type === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key as TourType)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors min-h-[36px] ${
                  filter === key ? 'text-white' : 'bg-black/[0.05] dark:bg-white/[0.06] text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0]'
                }`}
                style={filter === key ? { backgroundColor: cfg.color } : {}}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-[#6b6b6b] dark:text-[#888]">
          {pastTours.length === 0 ? 'Nenhum tour passado ainda. Agenda tours no Calendário!' : 'Nenhum tour encontrado.'}
        </p>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map(t => {
              const fin = t.participants && t.revenueTotal ? calcTourFinance(t) : null;
              const cfg = TOUR_TYPES[t.type];
              const pending = isPending(t);
              return (
                <div key={t.id} className="border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 bg-white dark:bg-[#111] shadow-card">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold text-white mb-1" style={{ backgroundColor: cfg.color }}>
                        {cfg.label}
                      </span>
                      <div className="text-sm font-medium text-ink dark:text-[#e8e5e0]">{formatDatePt(parseISODate(t.date))}</div>
                      {t.time && <div className="text-xs text-[#6b6b6b] dark:text-[#888]">{t.time}</div>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => onEdit(t)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0] transition-colors">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-[#6b6b6b] dark:text-[#888] hover:text-red-500 transition-colors">
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                  {pending ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Valores pendentes
                    </span>
                  ) : fin && (
                    <div className="grid grid-cols-3 gap-2 text-center bg-surface dark:bg-[#1a1a1a] rounded-xl p-2.5">
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888]">Bruto</div>
                        <div className="text-xs font-semibold text-ink dark:text-[#e8e5e0]">{formatEur(fin.grossRevenue)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888]">Taxa</div>
                        <div className="text-xs font-semibold text-red-500">{formatEur(fin.aggregatorFee)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888]">Líquido</div>
                        <div className="text-xs font-semibold text-green-500">{formatEur(fin.netRevenue)}</div>
                      </div>
                    </div>
                  )}
                  {t.notes && <p className="text-xs text-[#6b6b6b] dark:text-[#888] mt-2">{t.notes}</p>}
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.08] dark:border-white/[0.08]">
                  {['Data', 'Hora', 'Tour', 'Part.', 'Total', 'Taxa', 'Líquido', 'Notas', ''].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b] dark:text-[#888] pb-2.5 pr-4 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const fin = t.participants && t.revenueTotal ? calcTourFinance(t) : null;
                  const cfg = TOUR_TYPES[t.type];
                  const pending = isPending(t);
                  return (
                    <tr key={t.id} className="border-b border-black/[0.05] dark:border-white/[0.05] hover:bg-surface dark:hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-3 pr-4 text-ink dark:text-[#e8e5e0] whitespace-nowrap">{formatDatePt(parseISODate(t.date))}</td>
                      <td className="py-3 pr-4 text-[#6b6b6b] dark:text-[#888]">{t.time || '—'}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-ink dark:text-[#e8e5e0] text-center">{t.participants || '—'}</td>
                      <td className="py-3 pr-4 text-ink dark:text-[#e8e5e0]">
                        {pending ? <span className="text-amber-500 text-xs font-medium">Pendente</span> : fin ? formatEur(fin.grossRevenue) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-red-500">{fin ? formatEur(fin.aggregatorFee) : '—'}</td>
                      <td className="py-3 pr-4 text-green-500 font-semibold">{fin ? formatEur(fin.netRevenue) : '—'}</td>
                      <td className="py-3 pr-4 text-[#6b6b6b] dark:text-[#888] max-w-[120px] truncate">{t.notes || '—'}</td>
                      <td className="py-3 whitespace-nowrap">
                        <div className="flex gap-1">
                          <button onClick={() => onEdit(t)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.06] text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0] transition-colors">
                            <EditIcon />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#6b6b6b] dark:text-[#888] hover:text-red-500 transition-colors">
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
