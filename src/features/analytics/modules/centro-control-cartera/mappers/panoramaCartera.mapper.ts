import type {
  EvolucionCarteraApiResponse,
  PanoramaCarteraApiResponse,
  PromesasCarteraApiResponse,
  PortfolioSummaryApiResponse,
  MetaCarteraProgressApiResponse,
} from '../api/centroControlCarteraApi.types';
import type {
  RendimientoCampanaItem,
  CentroControlCarteraData,
  PortfolioPromiseStatus,
  MetaCarteraProgress,
} from '../domain/panoramaCartera.types';
import { buildPortfolioOperationalAttention } from '../utils/atencionCartera.utils';
import { mapEvolucionCarteraResponse } from './rendimientoCartera.mapper';

export const mapMetaCarteraProgressResponse = (
  response: MetaCarteraProgressApiResponse
): MetaCarteraProgress | null => {
  if (!response.target) {
    return null;
  }

  return {
    monthlyTargetAmount: response.target.monthlyTargetAmount,
    expectedToDateAmount: response.target.expectedToDateAmount,
    targetAchievementRate: response.target.targetAchievementRate,
    paceAchievementRate: response.target.paceAchievementRate,
    gapAmount: response.target.gapAmount,
    gapRate: response.target.gapRate,
  };
};

export const mapPromesasCarteraResponse = (
  response: PromesasCarteraApiResponse
): PortfolioPromiseStatus => ({
  dueTodayCount: response.promises.dueTodayCount,
  dueTodayAmount: response.promises.dueTodayAmount,
  overdueCount: response.promises.overdueCount,
  fulfillmentRate: response.promises.fulfillmentRate,
});

const getLatestUpdatedAt = (
  values: readonly (string | null)[]
): string | null => {
  const validValues = values.filter(
    (value): value is string => Boolean(value)
  );

  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce((latest, current) => {
    const latestTimestamp = Date.parse(latest);
    const currentTimestamp = Date.parse(current);

    if (Number.isNaN(currentTimestamp)) {
      return latest;
    }

    if (Number.isNaN(latestTimestamp)) {
      return current;
    }

    return currentTimestamp > latestTimestamp ? current : latest;
  });
};

const roundPercentageLikeSql = (value: number): number =>
  Math.round(value * 10_000) / 10_000;

const mapSelectedCampaignFromOperationalResponses = (
  summaryResponse: PortfolioSummaryApiResponse,
  target: MetaCarteraProgress | null,
  subPortfolioId: string | null
): RendimientoCampanaItem => {
  const summary = summaryResponse.summary;

  return {
    campaignId: summaryResponse.campaign.code,
    campaignName: summaryResponse.campaign.name,
    assignedPortfolio: summary.assignedPortfolio,
    managedPortfolio: summary.managedPortfolio,
    progressRate:
      summary.assignedPortfolio > 0
        ? roundPercentageLikeSql(
            (summary.managedPortfolio / summary.assignedPortfolio) * 100
          )
        : null,
    managementCount: summary.managementCount,
    contactabilityRate: summary.contactabilityRate,
    rpcRate: summary.rpcRate,
    closeRate: summary.closeRate,
    promiseCount: summary.promiseCount,
    promiseFulfillmentRate: summary.promiseFulfillmentRate,
    paymentCount: summary.paymentCount,
    recoveredAmount: summary.recoveredAmount,
    targetAmount:
      subPortfolioId === null
        ? target?.monthlyTargetAmount ?? null
        : null,
  };
};

export const mapPortfolioOperationalResponses = (
  summaryResponse: PortfolioSummaryApiResponse,
  targetResponse: MetaCarteraProgressApiResponse,
  promisesResponse: PromesasCarteraApiResponse,
  evolutionResponse: EvolucionCarteraApiResponse,
  subPortfolioId: string | null,
  businessUnit: string | null = null
): CentroControlCarteraData => {
  const target = mapMetaCarteraProgressResponse(targetResponse);
  const promises = mapPromesasCarteraResponse(promisesResponse);
  const evolution = mapEvolucionCarteraResponse(evolutionResponse);
  const campaigns = [
    mapSelectedCampaignFromOperationalResponses(
      summaryResponse,
      target,
      subPortfolioId
    ),
  ];

  return {
    context: {
      businessUnit,
      campaignId: summaryResponse.campaign.code,
      dateFrom: summaryResponse.period.dateFrom,
      dateTo: summaryResponse.period.dateTo,
      subPortfolioId,
    },
    updatedAt: getLatestUpdatedAt([
      summaryResponse.updatedAt,
      targetResponse.updatedAt,
      promisesResponse.updatedAt,
      evolutionResponse.updatedAt,
    ]),
    freshness: {
      operationAsOfAt:
        summaryResponse.freshness?.operationAsOfAt ?? null,
      portfolioBaseRefreshedAt:
        summaryResponse.freshness?.portfolioBaseRefreshedAt ?? null,
      refreshedAt: summaryResponse.freshness?.refreshedAt ?? null,
    },
    summary: {
      assignedPortfolio: summaryResponse.summary.assignedPortfolio,
      managedPortfolio: summaryResponse.summary.managedPortfolio,
      pendingPortfolio: summaryResponse.summary.pendingPortfolio,
      managementCount: summaryResponse.summary.managementCount,
      managementIntensity:
        summaryResponse.summary.managementIntensity,
      recoveredAmount: summaryResponse.summary.recoveredAmount,
      contactabilityRate: summaryResponse.summary.contactabilityRate,
      rpcRate: summaryResponse.summary.rpcRate,
      closeRate: summaryResponse.summary.closeRate,
      promiseCount: summaryResponse.summary.promiseCount,
      promiseFulfillmentRate:
        summaryResponse.summary.promiseFulfillmentRate,
      paymentCount: summaryResponse.summary.paymentCount,
    },
    target,
    promises,
    evolution,
    campaigns,
    supervisors: [],
    advisors: [],
    attention: buildPortfolioOperationalAttention(target, promises),
  };
};

export const mapPanoramaCarteraResponse = (
  response: PanoramaCarteraApiResponse,
  subPortfolioId: string | null,
  businessUnit: string | null = null
): CentroControlCarteraData =>
  mapPortfolioOperationalResponses(
    response.summary,
    response.targetProgress,
    response.promises,
    response.evolution,
    subPortfolioId,
    businessUnit
  );
