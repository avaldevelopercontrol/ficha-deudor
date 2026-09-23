import type {
  EvolucionCarteraComparativaApiResponse,
  EvolucionCarteraComparativaApiSeries,
} from '../api/centroControlCarteraApi.types';
import type {
  EvolucionCarteraComparison,
  EvolucionCarteraComparisonSeries,
} from '../domain/evolucionCartera.types';

const mapSeries = (
  series: EvolucionCarteraComparativaApiSeries | null
): EvolucionCarteraComparisonSeries | null =>
  series === null
    ? null
    : {
        campaignId: series.campaign.code,
        campaignName: series.campaign.name,
        dateFrom: series.period.dateFrom,
        dateTo: series.period.dateTo,
        coversComparablePeriod: series.coversComparablePeriod,
        evolution: series.evolution.map((item) => ({
          period: item.period,
          assignedPortfolio: item.assignedPortfolio,
          managedPortfolio: item.managedPortfolio,
          pendingPortfolio: item.pendingPortfolio,
          recoveredAmount: item.recoveredAmount,
        })),
      };

export const mapEvolucionComparativaCarteraResponse = (
  response: EvolucionCarteraComparativaApiResponse
): EvolucionCarteraComparison => ({
  referenceDateFrom: response.referencePeriod.dateFrom,
  referenceDateTo: response.referencePeriod.dateTo,
  comparableProgressMonths: response.comparableProgressMonths,
  comparableRecoveryMonths: response.comparableRecoveryMonths,
  previousMonth: mapSeries(response.previousMonth),
  bestProgress: mapSeries(response.bestProgress),
  bestRecovery: mapSeries(response.bestRecovery),
});
