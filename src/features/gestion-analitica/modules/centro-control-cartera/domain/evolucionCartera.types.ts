import type { EvolucionCarteraPoint } from './panoramaCartera.types';

export interface EvolucionCarteraComparisonSeries {
  campaignId: string;
  campaignName: string;
  dateFrom: string;
  dateTo: string;
  coversComparablePeriod: boolean;
  evolution: readonly EvolucionCarteraPoint[];
}

export interface EvolucionCarteraComparison {
  referenceDateFrom: string;
  referenceDateTo: string;
  comparableProgressMonths: number;
  comparableRecoveryMonths: number;
  previousMonth: EvolucionCarteraComparisonSeries | null;
  bestProgress: EvolucionCarteraComparisonSeries | null;
  bestRecovery: EvolucionCarteraComparisonSeries | null;
}
