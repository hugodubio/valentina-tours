import type { Tour } from '../../types/tour';
import type { MonthlyFees, MonthlyPrivateCommission } from '../../types/fees';
import { calcTourFinance, calcTotals, getFeesForMonth, getCommissionForMonth, lookupCommissionPct, getPreviousMonthKey, formatEur, totalPax } from '../../utils/finance';
import { format, getISOWeek } from 'date-fns';
import { pt } from 'date-fns/locale';
import { parseISODate } from '../../utils/dateHelpers';
import { TOUR_TYPES } from '../../constants/tours';

interface Props {
  tours: Tour[];
  feesArray: MonthlyFees[];
  commissionArray: MonthlyPrivateCommission[];
  repeatsPerMonth: Record<string, number>;
}

export default function FinanceTable({ tours: allTours, feesArray, commissionArray, repeatsPerMonth }: Props) {
  const withData = allTours.filter(t => t.revenueTotal > 0);

  if (withData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#6b6b6b] dark:text-[#888]">Sem dados financeiros ainda. Adiciona os valores após cada tour.</p>
      </div>
    );
  }

  const byMonth: Record<string, Record<number, Tour[]>> = {};
  for (const t of withData) {
    const month = t.date.slice(0, 7);
    const week = getISOWeek(parseISODate(t.date));
    if (!byMonth[month]) byMonth[month] = {};
    if (!byMonth[month][week]) byMonth[month][week] = [];
    byMonth[month][week].push(t);
  }

  const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {months.map(month => {
        const monthTours = Object.values(byMonth[month]).flat();
        const monthTotals = calcTotals(monthTours, feesArray, commissionArray, repeatsPerMonth);
        const [y, m] = month.split('-').map(Number);
        const monthLabel = format(new Date(y, m - 1, 1), 'MMMM yyyy', { locale: pt });
        const weeks = Object.keys(byMonth[month]).map(Number).sort((a, b) => b - a);

        return (
          <div key={month}>
            <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 border-b border-black/[0.1] dark:border-white/[0.08] mb-3">
              <h3 className="text-sm font-semibold text-ink dark:text-[#e8e5e0] capitalize">{monthLabel}</h3>
              <div className="flex gap-4 text-xs">
                <span className="text-[#6b6b6b] dark:text-[#888]">{monthTotals.count} tours · {monthTotals.pax} pax</span>
                <span className="text-red-500">{formatEur(monthTotals.feeTotal)}</span>
                <span className="font-semibold text-green-500">{formatEur(monthTotals.liquido)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:pl-4">
              {weeks.map(week => {
                const weekTours = byMonth[month][week].sort((a, b) => b.date.localeCompare(a.date));
                const weekTotals = calcTotals(weekTours, feesArray, commissionArray, repeatsPerMonth);
                return (
                  <div key={week} className="border border-black/[0.07] dark:border-white/[0.07] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-surface dark:bg-[#1a1a1a]">
                      <span className="text-xs font-semibold text-[#6b6b6b] dark:text-[#888]">Semana {week}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-[#6b6b6b] dark:text-[#888]">{weekTotals.count} t. · {weekTotals.pax} pax</span>
                        <span className="text-green-500 font-semibold">{formatEur(weekTotals.liquido)}</span>
                      </div>
                    </div>
                    <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
                      {weekTours.map(t => {
                        const cfg = TOUR_TYPES[t.type];
                        const monthKey = t.date.slice(0, 7);
                        const fees = getFeesForMonth(monthKey, feesArray);
                        const prevMonth = getPreviousMonthKey(monthKey);
                        const prevRepeats = repeatsPerMonth[prevMonth] ?? 0;
                        const tiers = getCommissionForMonth(monthKey, commissionArray);
                        const commissionPct = lookupCommissionPct(prevRepeats, tiers.length > 0 ? tiers : [{ minRepeats: 0, maxRepeats: null, commissionPct: 0.20 }]);
                        const fin = calcTourFinance(t, fees, commissionPct);
                        const pax = totalPax(t);
                        return (
                          <div key={t.id} className="flex items-center px-4 py-2.5 gap-3 text-sm bg-white dark:bg-[#111]">
                            <span className="text-[#6b6b6b] dark:text-[#888] w-16 shrink-0 text-xs">{t.date.slice(8)} {format(parseISODate(t.date), 'EEE', { locale: pt })}</span>
                            <span className="text-[#6b6b6b] dark:text-[#888] w-10 shrink-0 text-xs">{t.time || '—'}</span>
                            <span className="flex-1 flex items-center gap-1.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold text-white" style={{ backgroundColor: cfg.color }}>
                                {cfg.label}
                              </span>
                              {t.isPrivate && <span className="text-[10px] text-[#6b6b6b] dark:text-[#888]">privado</span>}
                            </span>
                            <span className="text-[#6b6b6b] dark:text-[#888] text-xs">{pax > 0 ? `${pax}p` : '—'}</span>
                            {t.feeOverride && <span className="text-[9px] text-amber-500">M</span>}
                            <span className="text-green-500 font-semibold text-sm w-16 text-right">{formatEur(fin.liquido)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
