import type { Tour } from '../types/tour';
import { AGGREGATOR_FEE_PER_PERSON } from '../constants/finance';

export function calcTourFinance(tour: Tour) {
  const grossRevenue = tour.revenueTotal;
  const aggregatorFee = tour.participants * AGGREGATOR_FEE_PER_PERSON;
  const netRevenue = grossRevenue - aggregatorFee;
  return { grossRevenue, aggregatorFee, netRevenue };
}

export function calcTotals(tours: Tour[]) {
  return tours.reduce(
    (acc, t) => {
      const f = calcTourFinance(t);
      return {
        tours: acc.tours + 1,
        participants: acc.participants + t.participants,
        grossRevenue: acc.grossRevenue + f.grossRevenue,
        aggregatorFee: acc.aggregatorFee + f.aggregatorFee,
        netRevenue: acc.netRevenue + f.netRevenue,
      };
    },
    { tours: 0, participants: 0, grossRevenue: 0, aggregatorFee: 0, netRevenue: 0 }
  );
}

export function formatEur(value: number): string {
  return '€' + value.toFixed(2).replace('.', ',');
}
