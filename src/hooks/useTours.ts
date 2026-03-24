import { useState, useCallback } from 'react';
import type { Tour } from '../types/tour';

const STORAGE_KEY = 'valentina_tours';

function load(): Tour[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (JSON.parse(raw) as any[]).map(t => {
      if ('revenuePerPerson' in t && !('revenueTotal' in t)) {
        const { revenuePerPerson, ...rest } = t;
        return { ...rest, revenueTotal: (revenuePerPerson as number) * (t.participants as number || 1) };
      }
      return t as Tour;
    });
  } catch {
    return [];
  }
}

function save(tours: Tour[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
}

export function useTours() {
  const [tours, setTours] = useState<Tour[]>(load);

  const addTour = useCallback((tour: Tour) => {
    setTours(prev => {
      const next = [...prev, tour];
      save(next);
      return next;
    });
  }, []);

  const updateTour = useCallback((updated: Tour) => {
    setTours(prev => {
      const next = prev.map(t => (t.id === updated.id ? updated : t));
      save(next);
      return next;
    });
  }, []);

  const deleteTour = useCallback((id: string) => {
    setTours(prev => {
      const next = prev.filter(t => t.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { tours, addTour, updateTour, deleteTour };
}
