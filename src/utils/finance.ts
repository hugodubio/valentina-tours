import type { Tour, TourType } from '../types/tour';
import type { PlatformFees, MonthlyFees, MonthlyPrivateCommission, PrivateCommissionTier } from '../types/fees';
import { IVA_DIVISOR, DEFAULT_PLATFORM_FEES, DEFAULT_COMMISSION_TIERS } from '../constants/finance';

export interface TourFinance {
  grossRevenue: number;
  base: number;
  iva: number;
  feeCalculated: number;
  feeTotal: number;
  liquido: number;
  commissionPct: number;
}

export function getFeesForMonth(monthKey: string, feesArray: MonthlyFees[]): PlatformFees {
  const found = feesArray.find(f => f.monthKey === monthKey);
  return found ? found.fees : { ...DEFAULT_PLATFORM_FEES };
}

export function getCommissionForMonth(monthKey: string, commissionArray: MonthlyPrivateCommission[]): PrivateCommissionTier[] {
  const found = commissionArray.find(c => c.monthKey === monthKey);
  return found ? found.tiers : DEFAULT_COMMISSION_TIERS;
}

export function lookupCommissionPct(repeats: number, tiers: PrivateCommissionTier[]): number {
  if (tiers.length === 0) return DEFAULT_COMMISSION_TIERS[0].commissionPct;
  const sorted = [...tiers].sort((a, b) => b.minRepeats - a.minRepeats);
  for (const tier of sorted) {
    if (repeats >= tier.minRepeats) {
      if (tier.maxRepeats === null || repeats <= tier.maxRepeats) {
        return tier.commissionPct;
      }
    }
  }
  return sorted[sorted.length - 1].commissionPct;
}

export function getPreviousMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, '0')}`;
}

export function calcTourFinance(
  tour: Tour,
  fees: PlatformFees,
  commissionPct: number
): TourFinance {
  const grossRevenue = tour.revenueTotal;
  const base = grossRevenue / IVA_DIVISOR;
  const iva = grossRevenue - base;

  let feeCalculated: number;
  if (tour.isPrivate) {
    feeCalculated = base * commissionPct;
  } else {
    feeCalculated =
      tour.paxCivitatis * fees.civitatis +
      tour.paxViator * fees.viator +
      tour.paxTake * fees.take +
      tour.paxBimbi * fees.bimbi;
  }

  const feeTotal = tour.feeOverride ? tour.feeTotal : feeCalculated;
  const liquido = base - feeTotal;

  return { grossRevenue, base, iva, feeCalculated, feeTotal, liquido, commissionPct };
}

export function totalPax(tour: Tour): number {
  return tour.paxCivitatis + tour.paxViator + tour.paxTake + tour.paxBimbi;
}

export interface TourTotals {
  count: number;
  pax: number;
  repeats: number;
  grossRevenue: number;
  iva: number;
  feeTotal: number;
  liquido: number;
}

export function calcTotals(
  tours: Tour[],
  feesArray: MonthlyFees[],
  commissionArray: MonthlyPrivateCommission[],
  repeatsPerMonth: Record<string, number>
): TourTotals {
  return tours.reduce(
    (acc, tour) => {
      if (!tour.revenueTotal) return acc;
      const monthKey = tour.date.slice(0, 7);
      const fees = getFeesForMonth(monthKey, feesArray);
      const prevMonth = getPreviousMonthKey(monthKey);
      const prevRepeats = repeatsPerMonth[prevMonth] ?? 0;
      const tiers = getCommissionForMonth(monthKey, commissionArray);
      const commissionPct = lookupCommissionPct(prevRepeats, tiers);
      const fin = calcTourFinance(tour, fees, commissionPct);
      return {
        count: acc.count + 1,
        pax: acc.pax + totalPax(tour),
        repeats: acc.repeats + tour.repeats,
        grossRevenue: acc.grossRevenue + fin.grossRevenue,
        iva: acc.iva + fin.iva,
        feeTotal: acc.feeTotal + fin.feeTotal,
        liquido: acc.liquido + fin.liquido,
      };
    },
    { count: 0, pax: 0, repeats: 0, grossRevenue: 0, iva: 0, feeTotal: 0, liquido: 0 }
  );
}

export function formatEur(value: number): string {
  return '€' + value.toFixed(2).replace('.', ',');
}

export interface TourTypeStatsResult {
  type: TourType;
  totalTours: number;
  totalPax: number;
  avgPax: number;
  totalLiquido: number;
  avgLiquidoPerTour: number;
}

export function calcTypeStats(
  tours: Tour[],
  type: TourType,
  feesArray: MonthlyFees[],
  commissionArray: MonthlyPrivateCommission[],
  repeatsPerMonth: Record<string, number>
): TourTypeStatsResult {
  const completed = tours.filter(t => t.type === type && t.revenueTotal > 0);
  const totalTours = completed.length;
  const tPax = completed.reduce((s, t) => s + totalPax(t), 0);
  const tLiquido = completed.reduce((s, t) => {
    const monthKey = t.date.slice(0, 7);
    const fees = getFeesForMonth(monthKey, feesArray);
    const prevMonth = getPreviousMonthKey(monthKey);
    const prevRepeats = repeatsPerMonth[prevMonth] ?? 0;
    const tiers = getCommissionForMonth(monthKey, commissionArray);
    const commissionPct = lookupCommissionPct(prevRepeats, tiers);
    return s + calcTourFinance(t, fees, commissionPct).liquido;
  }, 0);
  return {
    type,
    totalTours,
    totalPax: tPax,
    avgPax: totalTours > 0 ? tPax / totalTours : 0,
    totalLiquido: tLiquido,
    avgLiquidoPerTour: totalTours > 0 ? tLiquido / totalTours : 0,
  };
}
