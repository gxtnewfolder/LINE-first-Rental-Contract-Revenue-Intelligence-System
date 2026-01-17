// Inflation domain types
// See docs/rent-adjustment.md for design details

export interface RentAdjustmentResult {
  currentRent: number;
  suggestedRent: number;
  minimumRent: number;
  adjustmentPct: number;
  inflationPct: number;
  rentGrowthPct: number;
  gap: number;
  recommendation: 'INCREASE' | 'MAINTAIN' | 'REVIEW';
  reasoning: string;
  tenantFactor: number;
}

export interface InflationData {
  year: number;
  month: number;
  ratePct: number;
}
