import { useState, useCallback, useMemo } from 'react';
import type { Tour } from '../types/tour';
import { config } from '../config';

const STORAGE_KEY = `${config.storagePrefix}_tours`;

function load(): Tour[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Tour[];
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

  // repeats por mês — usado para calcular comissão de tours privados
  const repeatsPerMonth = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tours) {
      const mk = t.date.slice(0, 7);
      map[mk] = (map[mk] ?? 0) + t.repeats;
    }
    return map;
  }, [tours]);

  return { tours, addTour, updateTour, deleteTour, repeatsPerMonth };
}
