import { env } from '@app/config/env';

import type {
  PortfolioControlCenterData,
  PortfolioControlCenterFilterOptions,
  PortfolioOperationalContext,
  PortfolioOverduePromisesData,
  PortfolioDueTodayPromisesData,
  PortfolioPerformanceDetailData,
  PortfolioControlCenterFilters,
} from '../../../types/portfolioControlCenter.types';
import {
  fetchPortfolioAdvisorPerformance,
  fetchPortfolioCampaignPerformance,
  fetchPortfolioControlCenterFilterOptions,
  fetchPortfolioControlCenterSummary,
  fetchPortfolioEvolution,
  fetchPortfolioPromises,
  fetchPortfolioOverduePromises,
  fetchPortfolioDueTodayPromises,
  fetchPortfolioSupervisorPerformance,
  fetchPortfolioTargetProgress,
} from '../api/portfolioControlCenterApi';
import {
  mapPortfolioFilterOptionsResponse,
  mapPortfolioOverduePromisesResponse,
  mapPortfolioDueTodayPromisesResponse,
  mapPortfolioOperationalResponses,
  mapPortfolioPerformanceDetailResponses,
} from '../mappers/portfolioControlCenterApi.mapper';
import {
  portfolioControlCenterMockDataSource,
} from '../mocks/portfolioControlCenterMock.datasource';

export const loadPortfolioControlCenter = async (
  filters: PortfolioControlCenterFilters,
  signal: AbortSignal
): Promise<PortfolioControlCenterData> => {
  if (env.analyticsUseMocks) {
    return portfolioControlCenterMockDataSource.load(
      filters,
      signal
    );
  }

  if (filters.supervisorId) {
    throw new Error(
      'Supervisor permanece restringido como filtro global porque los KPIs superiores no tienen una semántica canonical atribuible a supervisor.'
    );
  }

  const summaryResponse =
    await fetchPortfolioControlCenterSummary(
      filters,
      signal
    );

  const campaignCode = summaryResponse.campaign.code;
  const effectiveDateTo = summaryResponse.period.dateTo;

  const [
    targetResponse,
    promisesResponse,
    evolutionResponse,
    campaignPerformanceResponse,
    supervisorPerformanceResponse,
    advisorPerformanceResponse,
  ] = await Promise.all([
      fetchPortfolioTargetProgress(
        campaignCode,
        effectiveDateTo,
        filters.subPortfolioId,
        signal
      ),
      fetchPortfolioPromises(
        campaignCode,
        filters.subPortfolioId,
        signal
      ),
      fetchPortfolioEvolution(
        campaignCode,
        summaryResponse.period.dateFrom,
        effectiveDateTo,
        filters.subPortfolioId,
        signal
      ),
      fetchPortfolioCampaignPerformance(
        campaignCode,
        summaryResponse.period.dateFrom,
        effectiveDateTo,
        filters.subPortfolioId,
        signal
      ),
      fetchPortfolioSupervisorPerformance(
        campaignCode,
        summaryResponse.period.dateFrom,
        effectiveDateTo,
        filters.subPortfolioId,
        filters.supervisorId,
        signal
      ),
      fetchPortfolioAdvisorPerformance(
        campaignCode,
        summaryResponse.period.dateFrom,
        effectiveDateTo,
        filters.subPortfolioId,
        filters.supervisorId,
        signal
      ),
    ]);

  return mapPortfolioOperationalResponses(
    summaryResponse,
    targetResponse,
    promisesResponse,
    evolutionResponse,
    campaignPerformanceResponse,
    supervisorPerformanceResponse,
    advisorPerformanceResponse,
    filters.subPortfolioId
  );
};

export const loadPortfolioControlCenterFilterOptions = async (
  signal: AbortSignal
): Promise<PortfolioControlCenterFilterOptions> => {
  if (env.analyticsUseMocks) {
    return portfolioControlCenterMockDataSource.loadFilterOptions(
      signal
    );
  }

  const response =
    await fetchPortfolioControlCenterFilterOptions(
      signal
    );

  return mapPortfolioFilterOptionsResponse(response);
};

export const loadPortfolioPerformanceDetail = async (
  context: PortfolioOperationalContext,
  supervisorId: string,
  signal: AbortSignal
): Promise<PortfolioPerformanceDetailData> => {
  if (env.analyticsUseMocks) {
    const mockData =
      await portfolioControlCenterMockDataSource.load(
        {
          dateFrom: context.dateFrom,
          dateTo: context.dateTo,
          subPortfolioId: context.subPortfolioId,
          campaignId: context.campaignId,
          supervisorId,
        },
        signal
      );

    return {
      updatedAt: mockData.updatedAt,
      supervisors: mockData.supervisors,
      advisors: mockData.advisors,
    };
  }

  const [
    supervisorPerformanceResponse,
    advisorPerformanceResponse,
  ] = await Promise.all([
    fetchPortfolioSupervisorPerformance(
      context.campaignId,
      context.dateFrom,
      context.dateTo,
      context.subPortfolioId,
      supervisorId,
      signal
    ),
    fetchPortfolioAdvisorPerformance(
      context.campaignId,
      context.dateFrom,
      context.dateTo,
      context.subPortfolioId,
      supervisorId,
      signal
    ),
  ]);

  return mapPortfolioPerformanceDetailResponses(
    supervisorPerformanceResponse,
    advisorPerformanceResponse
  );
};

export const loadPortfolioOverduePromises = async (
  context: Pick<PortfolioOperationalContext, 'campaignId' | 'subPortfolioId'>,
  signal: AbortSignal
): Promise<PortfolioOverduePromisesData> => {
  if (env.analyticsUseMocks) {
    throw new Error(
      'El detalle de promesas vencidas requiere Analytics API y no utiliza datos mock.'
    );
  }

  const response = await fetchPortfolioOverduePromises(
    context.campaignId,
    context.subPortfolioId,
    signal
  );

  return mapPortfolioOverduePromisesResponse(response);
};

export const loadPortfolioDueTodayPromises = async (
  context: Pick<PortfolioOperationalContext, 'campaignId' | 'subPortfolioId'>,
  signal: AbortSignal
): Promise<PortfolioDueTodayPromisesData> => {
  if (env.analyticsUseMocks) {
    throw new Error(
      'El detalle de promesas con vencimiento hoy requiere Analytics API y no utiliza datos mock.'
    );
  }

  const response = await fetchPortfolioDueTodayPromises(
    context.campaignId,
    context.subPortfolioId,
    signal
  );

  return mapPortfolioDueTodayPromisesResponse(response);
};
