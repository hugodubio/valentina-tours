export const IVA_RATE = 0.23;
export const IVA_DIVISOR = 1 + IVA_RATE; // 1.23

export const DEFAULT_PLATFORM_FEES = {
  civitatis: 4.00,
  viator: 3.50,
  take: 3.50,
  bimbi: 2.00,
} as const;

export const DEFAULT_COMMISSION_TIERS = [
  { minRepeats: 0, maxRepeats: null, commissionPct: 0.20 },
];
