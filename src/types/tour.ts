export type TourType = 'chiado' | 'belem' | 'alfama' | 'sintra';

export interface Tour {
  id: string;
  date: string;        // "YYYY-MM-DD"
  time: string;        // "HH:MM"
  type: TourType;
  isPrivate: boolean;

  // Pax por origem (0 se não aplicável)
  paxCivitatis: number;
  paxViator: number;
  paxTake: number;
  paxBimbi: number;    // crianças — fee próprio
  repeats: number;     // convertidos para tour privado (métrica)

  // Financeiro
  revenueTotal: number;   // bruto recebido (IVA 23% incluído)
  feeTotal: number;       // calculado auto, editável manualmente
  feeOverride: boolean;   // true se feeTotal foi editado manualmente

  notes?: string;
  createdAt: string;
}
