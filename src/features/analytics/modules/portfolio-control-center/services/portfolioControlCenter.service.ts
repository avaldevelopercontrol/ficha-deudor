import type {
  PortfolioControlCenterData,
  PortfolioControlCenterFilterOptions,
  PortfolioOperationalContext,
  PortfolioOverduePromisesData,
  PortfolioDueTodayPromisesData,
  AdvisorPerformanceItem,
  SupervisorPerformanceItem,
  PortfolioControlCenterFilters,
  PortfolioDueTodayPromisesQuery,
  PortfolioOverduePromisesQuery,
} from '../../../types/portfolioControlCenter.types';
import {
  fetchPortfolioControlCenterBootstrap,
  fetchPortfolioControlCenterOverview,
  fetchPortfolioAdvisorPerformance,
  fetchPortfolioOverduePromises,
  fetchPortfolioDueTodayPromises,
  fetchPortfolioSupervisorPerformance,
} from '../api/portfolioControlCenterApi';
import {
  mapPortfolioFilterOptionsResponse,
  mapPortfolioOverduePromisesResponse,
  mapPortfolioDueTodayPromisesResponse,
  mapPortfolioOverviewResponse,
  mapPortfolioAdvisorPerformanceResponse,
  mapPortfolioSupervisorPerformanceResponse,
} from '../mappers/portfolioControlCenterApi.mapper';

export interface PortfolioControlCenterBootstrapData {
  data: PortfolioControlCenterData | null;
  filterOptions: PortfolioControlCenterFilterOptions;
}

export const loadPortfolioControlCenterBootstrap = async (
  crmClientId: number,
  filters: PortfolioControlCenterFilters,
  signal: AbortSignal
): Promise<PortfolioControlCenterBootstrapData> => {
  if (filters.supervisorId) {
    throw new Error(
      'Supervisor permanece restringido como filtro global porque los KPIs superiores no tienen una semántica canonical atribuible a supervisor.'
    );
  }

  const response =
    await fetchPortfolioControlCenterBootstrap(
      crmClientId,
      filters,
      signal
    );

  const filterOptions = mapPortfolioFilterOptionsResponse(
    response.filterOptions
  );

  return {
    data:
      response.overview === null
        ? null
        : mapPortfolioOverviewResponse(
            response.overview,
            filters.subPortfolioId,
            filterOptions.selectedBusinessUnit
          ),
    filterOptions,
  };
};

export const loadPortfolioControlCenter = async (
  crmClientId: number,
  filters: PortfolioControlCenterFilters,
  signal: AbortSignal
): Promise<PortfolioControlCenterData> => {
  if (filters.supervisorId) {
    throw new Error(
      'Supervisor permanece restringido como filtro global porque los KPIs superiores no tienen una semántica canonical atribuible a supervisor.'
    );
  }

  const overviewResponse =
    await fetchPortfolioControlCenterOverview(
      crmClientId,
      filters,
      signal
    );

  return mapPortfolioOverviewResponse(
    overviewResponse,
    filters.subPortfolioId,
    filters.businessUnit
  );
};

export interface PortfolioSupervisorPerformanceData {
  updatedAt: string | null;
  supervisors: readonly SupervisorPerformanceItem[];
}

export interface PortfolioAdvisorPerformanceData {
  updatedAt: string | null;
  advisors: readonly AdvisorPerformanceItem[];
}

export const loadPortfolioSupervisorPerformance = async (
  crmClientId: number,
  context: PortfolioOperationalContext,
  signal: AbortSignal
): Promise<PortfolioSupervisorPerformanceData> => {
  const response = await fetchPortfolioSupervisorPerformance(
    crmClientId,
    context,
    signal
  );

  return {
    updatedAt: response.updatedAt,
    supervisors: mapPortfolioSupervisorPerformanceResponse(response),
  };
};

export const loadPortfolioAdvisorPerformance = async (
  crmClientId: number,
  context: PortfolioOperationalContext,
  supervisorId: string | null,
  signal: AbortSignal
): Promise<PortfolioAdvisorPerformanceData> => {
  const response = await fetchPortfolioAdvisorPerformance(
    crmClientId,
    context,
    supervisorId,
    signal
  );

  return {
    updatedAt: response.updatedAt,
    advisors: mapPortfolioAdvisorPerformanceResponse(response),
  };
};

export const loadPortfolioOverduePromises = async (
  crmClientId: number,
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  >,
  query: PortfolioOverduePromisesQuery,
  signal: AbortSignal
): Promise<PortfolioOverduePromisesData> => {
  const response = await fetchPortfolioOverduePromises(
    crmClientId,
    context,
    query,
    signal
  );

  return mapPortfolioOverduePromisesResponse(response);
};

export const loadPortfolioDueTodayPromises = async (
  crmClientId: number,
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  >,
  query: PortfolioDueTodayPromisesQuery,
  signal: AbortSignal
): Promise<PortfolioDueTodayPromisesData> => {
  const response = await fetchPortfolioDueTodayPromises(
    crmClientId,
    context,
    query,
    signal
  );

  return mapPortfolioDueTodayPromisesResponse(response);
};
