export type TourType = 'chiado' | 'belem' | 'alfama' | 'sintra';

export interface Tour {
  id: string;
  date: string;        // "YYYY-MM-DD"
  time: string;        // "HH:MM"
  type: TourType;
  participants: number;
  revenuePerPerson: number;
  notes?: string;
  createdAt: string;
}
