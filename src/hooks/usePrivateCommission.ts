import { useState, useCallback } from 'react';
import type { MonthlyPrivateCommission, PrivateCommissionTier } from '../types/fees';
import { DEFAULT_COMMISSION_TIERS } from '../constants/finance';
import { config } from '../config';

const STORAGE_KEY = `${config.storagePrefix}_private_commission`;

function load(): MonthlyPrivateCommission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MonthlyPrivateCommission[];
  } catch {
    return [];
  }
}

function save(data: MonthlyPrivateCommission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function usePrivateCommission() {
  const [commissionArray, setCommissionArray] = useState<MonthlyPrivateCommission[]>(load);

  const getTiersForMonth = useCallback((monthKey: string): PrivateCommissionTier[] => {
    const found = commissionArray.find(c => c.monthKey === monthKey);
    return found ? found.tiers : DEFAULT_COMMISSION_TIERS;
  }, [commissionArray]);

  const setMonthTiers = useCallback((monthKey: string, tiers: PrivateCommissionTier[]) => {
    setCommissionArray(prev => {
      const exists = prev.find(c => c.monthKey === monthKey);
      const next = exists
        ? prev.map(c => c.monthKey === monthKey ? { ...c, tiers } : c)
        : [...prev, { monthKey, tiers }];
      save(next);
      return next;
    });
  }, []);

  return { commissionArray, getTiersForMonth, setMonthTiers };
}
