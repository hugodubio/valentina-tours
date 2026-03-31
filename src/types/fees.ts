export interface PlatformFees {
  civitatis: number;
  viator: number;
  take: number;
  bimbi: number;
}

export interface MonthlyFees {
  monthKey: string;   // "YYYY-MM"
  fees: PlatformFees;
}

export interface PrivateCommissionTier {
  minRepeats: number;
  maxRepeats: number | null;  // null = sem limite
  commissionPct: number;      // ex: 0.15 = 15%
}

export interface MonthlyPrivateCommission {
  monthKey: string;   // "YYYY-MM"
  tiers: PrivateCommissionTier[];
}
