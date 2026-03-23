import type { TourType } from '../types/tour';

export const TOUR_TYPES: Record<TourType, { label: string; color: string; emoji: string }> = {
  chiado: { label: 'Chiado & Centro', color: '#002FA7', emoji: '🏛️' },
  belem:  { label: 'Belém',           color: '#E8A020', emoji: '⚓' },
  alfama: { label: 'Alfama',          color: '#C0392B', emoji: '🎵' },
  sintra: { label: 'Sintra',          color: '#27AE60', emoji: '🏰' },
} as const;
