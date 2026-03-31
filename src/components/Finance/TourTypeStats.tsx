import type { Tour, TourType } from '../../types/tour';
import type { MonthlyFees, MonthlyPrivateCommission } from '../../types/fees';
import { TOUR_TYPES } from '../../constants/tours';
import { calcTypeStats, formatEur } from '../../utils/finance';

interface Props {
  tours: Tour[];
  feesArray: MonthlyFees[];
  commissionArray: MonthlyPrivateCommission[];
  repeatsPerMonth: Record<string, number>;
}

function StatRow({ label, value, green, muted }: { label: string; value: string; green?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-[10px] text-[#6b6b6b] dark:text-[#888]">{label}</span>
      <span className={`text-xs font-semibold ${green ? 'text-green-500' : muted ? 'text-[#6b6b6b] dark:text-[#888]' : 'text-ink dark:text-[#e8e5e0]'}`}>{value}</span>
    </div>
  );
}

export default function TourTypeStats({ tours, feesArray, commissionArray, repeatsPerMonth }: Props) {
  const typeKeys = Object.keys(TOUR_TYPES) as TourType[];
  const stats = typeKeys.map(type => calcTypeStats(tours, type, feesArray, commissionArray, repeatsPerMonth));

  if (stats.every(s => s.totalTours === 0)) return null;

  return (
    <div className="mb-6 md:mb-8">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6b6b6b] dark:text-[#888] mb-3">Por tipo de tour</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(s => {
          const cfg = TOUR_TYPES[s.type];
          return (
            <div key={s.type} className="bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-[11px] font-semibold text-ink dark:text-[#e8e5e0] leading-tight">{cfg.label}</span>
              </div>
              {s.totalTours === 0 ? (
                <p className="text-xs text-[#6b6b6b] dark:text-[#888]">Sem dados</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <StatRow label="Tours" value={String(s.totalTours)} />
                  <StatRow label="Pax" value={String(s.totalPax)} />
                  <StatRow label="Média pax/tour" value={s.avgPax.toFixed(1)} />
                  <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <StatRow label="Líquido total" value={formatEur(s.totalLiquido)} green />
                    <StatRow label="Média líq./tour" value={formatEur(s.avgLiquidoPerTour)} muted />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
