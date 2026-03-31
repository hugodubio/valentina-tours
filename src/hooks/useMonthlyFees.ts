import { useState, useCallback } from 'react';
import type { MonthlyFees, PlatformFees } from '../types/fees';
import { DEFAULT_PLATFORM_FEES } from '../constants/finance';
import { config } from '../config';

const STORAGE_KEY = `${config.storagePrefix}_monthly_fees`;

function load(): MonthlyFees[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MonthlyFees[];
  } catch {
    return [];
  }
}

function save(data: MonthlyFees[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useMonthlyFees() {
  const [feesArray, setFeesArray] = useState<MonthlyFees[]>(load);

  const getFeesForMonth = useCallback((monthKey: string): PlatformFees => {
    const found = feesArray.find(f => f.monthKey === monthKey);
    return found ? found.fees : { ...DEFAULT_PLATFORM_FEES };
  }, [feesArray]);

  const setMonthFees = useCallback((monthKey: string, fees: PlatformFees) => {
    setFeesArray(prev => {
      const exists = prev.find(f => f.monthKey === monthKey);
      const next = exists
        ? prev.map(f => f.monthKey === monthKey ? { ...f, fees } : f)
        : [...prev, { monthKey, fees }];
      save(next);
      return next;
    });
  }, []);

  return { feesArray, getFeesForMonth, setMonthFees };
}
