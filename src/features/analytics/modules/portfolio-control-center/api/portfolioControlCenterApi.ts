import {
  analyticsApiClient,
} from '@shared/api/analyticsApiClient';

import type {
  PortfolioControlCenterFilters,
} from '../../../types/portfolioControlCenter.types';
import type {
  PortfolioAdvisorPerformanceApiResponse,
  PortfolioCampaignPerformanceApiResponse,
  PortfolioEvolutionApiResponse,
  PortfolioFilterOptionsApiResponse,
  PortfolioPromisesApiResponse,
  PortfolioOverduePromisesApiResponse,
  PortfolioDueTodayPromisesApiResponse,
  PortfolioSummaryApiResponse,
  PortfolioSupervisorPerformanceApiResponse,
  PortfolioTargetProgressApiResponse,
} from './portfolioControlCenterApi.types';

const ANALYTICS_ENDPOINTS = {
  filterOptions:
    '/api/v1/portfolio-control-center/filter-options',
  summary:
    '/api/v1/portfolio-control-center/summary',
  targetProgress:
    '/api/v1/portfolio-control-center/target-progress',
  promises:
    '/api/v1/portfolio-control-center/promises',
  overduePromises:
    '/api/v1/portfolio-control-center/promises/overdue',
  dueTodayPromises:
    '/api/v1/portfolio-control-center/promises/due-today',
  evolution:
    '/api/v1/portfolio-control-center/evolution',
  campaignPerformance:
    '/api/v1/portfolio-control-center/campaign-performance',
  supervisorPerformance:
    '/api/v1/portfolio-control-center/supervisor-performance',
  advisorPerformance:
    '/api/v1/portfolio-control-center/advisor-performance',
} as const;

const appendQueryParam = (
  params: URLSearchParams,
  key: string,
  value: string | null
) => {
  if (value) {
    params.set(key, value);
  }
};

const withQuery = (
  endpoint: string,
  params: URLSearchParams
): string => {
  const query = params.toString();

  return query ? `${endpoint}?${query}` : endpoint;
};

export const buildPortfolioSummaryEndpoint = (
  filters: PortfolioControlCenterFilters
): string => {
  const params = new URLSearchParams();

  appendQueryParam(
    params,
    'campaign',
    filters.campaignId
  );
  appendQueryParam(
    params,
    'dateFrom',
    filters.dateFrom
  );
  appendQueryParam(
    params,
    'dateTo',
    filters.dateTo
  );
  appendQueryParam(
    params,
    'subPortfolioId',
    filters.subPortfolioId
  );

  return withQuery(ANALYTICS_ENDPOINTS.summary, params);
};

export const buildPortfolioTargetProgressEndpoint = (
  campaignCode: string,
  dateTo: string,
  subPortfolioId: string | null = null
): string => {
  const params = new URLSearchParams();
  params.set('campaign', campaignCode);
  params.set('dateTo', dateTo);
  appendQueryParam(params, 'subPortfolioId', subPortfolioId);

  return withQuery(
    ANALYTICS_ENDPOINTS.targetProgress,
    params
  );
};

export const buildPortfolioPromisesEndpoint = (
  campaignCode: string,
  subPortfolioId: string | null = null
): string => {
  const params = new URLSearchParams();
  params.set('campaign', campaignCode);
  appendQueryParam(params, 'subPortfolioId', subPortfolioId);

  return withQuery(ANALYTICS_ENDPOINTS.promises, params);
};


export const buildPortfolioOverduePromisesEndpoint = (
  campaignCode: string,
  subPortfolioId: string | null
): string => {
  const params = new URLSearchParams();
  params.set('campaign', campaignCode);
  appendQueryParam(params, 'subPortfolioId', subPortfolioId);

  return withQuery(ANALYTICS_ENDPOINTS.overduePromises, params);
};

export const buildPortfolioDueTodayPromisesEndpoint = (
  campaignCode: string,
  subPortfolioId: string | null
): string => {
  const params = new URLSearchParams();
  params.set('campaign', campaignCode);
  appendQueryParam(params, 'subPortfolioId', subPortfolioId);

  return withQuery(ANALYTICS_ENDPOINTS.dueTodayPromises, params);
};

export const buildPortfolioEvolutionEndpoint = (
  campaignCode: string,
  dateFrom: string,
  dateTo: string,
  subPortfolioId: string | null = null
): string => {
  const params = new URLSearchParams();
  params.set('campaign', campaignCode);
  params.set('dateFrom', dateFrom);
  params.set('dateTo', dateTo);
  appendQueryParam(params, 'subPortfolioId', subPortfolioId);

  return withQuery(ANALYTICS_ENDPOINTS.evolution, params);
};

export const buildPortfolioCampaignPerformanceEndpoint = (
  campaignCode: string,
  dateFrom: string,
  dateTo: string,
  subPortfolioId: string | null = null
): string => {
  const params = new URLSearchParams();
  params.set('campaign', campaignCode);
  params.set('dateFrom', dateFrom);
  params.set('dateTo', dateTo);
  appendQueryParam(params, 'subPortfolioId', subPortfolioId);

  return withQuery(
    ANALYTICS_ENDPOINTS.campaignPerformance,
    params
  );
};


export const buildPortfolioSupervisorPerformanceEndpoint = (
  campaignCode: string,
  dateFrom: string,
  dateTo: string,
  subPortfolioId: string | null = null,
  supervisorId: string | null = null
): string => {
  const params = new URLSearchParams();
  params.set('campaign', campaignCode);
  params.set('dateFrom', dateFrom);
  params.set('dateTo', dateTo);
  appendQueryParam(params, 'subPortfolioId', subPortfolioId);
  appendQueryParam(params, 'supervisorId', supervisorId);

  return withQuery(
    ANALYTICS_ENDPOINTS.supervisorPerformance,
    params
  );
};

export const buildPortfolioAdvisorPerformanceEndpoint = (
  campaignCode: string,
  dateFrom: string,
  dateTo: string,
  subPortfolioId: string | null = null,
  supervisorId: string | null = null
): string => {
  const params = new URLSearchParams();
  params.set('campaign', campaignCode);
  params.set('dateFrom', dateFrom);
  params.set('dateTo', dateTo);
  appendQueryParam(params, 'subPortfolioId', subPortfolioId);
  appendQueryParam(params, 'supervisorId', supervisorId);

  return withQuery(
    ANALYTICS_ENDPOINTS.advisorPerformance,
    params
  );
};

export const fetchPortfolioControlCenterFilterOptions = (
  signal: AbortSignal
): Promise<PortfolioFilterOptionsApiResponse> => {
  return analyticsApiClient.get<PortfolioFilterOptionsApiResponse>(
    ANALYTICS_ENDPOINTS.filterOptions,
    {
      signal,
    }
  );
};

export const fetchPortfolioControlCenterSummary = (
  filters: PortfolioControlCenterFilters,
  signal: AbortSignal
): Promise<PortfolioSummaryApiResponse> => {
  return analyticsApiClient.get<PortfolioSummaryApiResponse>(
    buildPortfolioSummaryEndpoint(filters),
    {
      signal,
    }
  );
};

export const fetchPortfolioTargetProgress = (
  campaignCode: string,
  dateTo: string,
  subPortfolioId: string | null,
  signal: AbortSignal
): Promise<PortfolioTargetProgressApiResponse> => {
  return analyticsApiClient.get<PortfolioTargetProgressApiResponse>(
    buildPortfolioTargetProgressEndpoint(
      campaignCode,
      dateTo,
      subPortfolioId
    ),
    {
      signal,
    }
  );
};

export const fetchPortfolioPromises = (
  campaignCode: string,
  subPortfolioId: string | null,
  signal: AbortSignal
): Promise<PortfolioPromisesApiResponse> => {
  return analyticsApiClient.get<PortfolioPromisesApiResponse>(
    buildPortfolioPromisesEndpoint(
      campaignCode,
      subPortfolioId
    ),
    {
      signal,
    }
  );
};


export const fetchPortfolioOverduePromises = (
  campaignCode: string,
  subPortfolioId: string | null,
  signal: AbortSignal
): Promise<PortfolioOverduePromisesApiResponse> => {
  return analyticsApiClient.get<PortfolioOverduePromisesApiResponse>(
    buildPortfolioOverduePromisesEndpoint(
      campaignCode,
      subPortfolioId
    ),
    {
      signal,
    }
  );
};

export const fetchPortfolioDueTodayPromises = (
  campaignCode: string,
  subPortfolioId: string | null,
  signal: AbortSignal
): Promise<PortfolioDueTodayPromisesApiResponse> => {
  return analyticsApiClient.get<PortfolioDueTodayPromisesApiResponse>(
    buildPortfolioDueTodayPromisesEndpoint(
      campaignCode,
      subPortfolioId
    ),
    {
      signal,
    }
  );
};

export const fetchPortfolioEvolution = (
  campaignCode: string,
  dateFrom: string,
  dateTo: string,
  subPortfolioId: string | null,
  signal: AbortSignal
): Promise<PortfolioEvolutionApiResponse> => {
  return analyticsApiClient.get<PortfolioEvolutionApiResponse>(
    buildPortfolioEvolutionEndpoint(
      campaignCode,
      dateFrom,
      dateTo,
      subPortfolioId
    ),
    {
      signal,
    }
  );
};

export const fetchPortfolioCampaignPerformance = (
  campaignCode: string,
  dateFrom: string,
  dateTo: string,
  subPortfolioId: string | null,
  signal: AbortSignal
): Promise<PortfolioCampaignPerformanceApiResponse> => {
  return analyticsApiClient.get<PortfolioCampaignPerformanceApiResponse>(
    buildPortfolioCampaignPerformanceEndpoint(
      campaignCode,
      dateFrom,
      dateTo,
      subPortfolioId
    ),
    {
      signal,
    }
  );
};


export const fetchPortfolioSupervisorPerformance = (
  campaignCode: string,
  dateFrom: string,
  dateTo: string,
  subPortfolioId: string | null,
  supervisorId: string | null,
  signal: AbortSignal
): Promise<PortfolioSupervisorPerformanceApiResponse> => {
  return analyticsApiClient.get<PortfolioSupervisorPerformanceApiResponse>(
    buildPortfolioSupervisorPerformanceEndpoint(
      campaignCode,
      dateFrom,
      dateTo,
      subPortfolioId,
      supervisorId
    ),
    {
      signal,
    }
  );
};

export const fetchPortfolioAdvisorPerformance = (
  campaignCode: string,
  dateFrom: string,
  dateTo: string,
  subPortfolioId: string | null,
  supervisorId: string | null,
  signal: AbortSignal
): Promise<PortfolioAdvisorPerformanceApiResponse> => {
  return analyticsApiClient.get<PortfolioAdvisorPerformanceApiResponse>(
    buildPortfolioAdvisorPerformanceEndpoint(
      campaignCode,
      dateFrom,
      dateTo,
      subPortfolioId,
      supervisorId
    ),
    {
      signal,
    }
  );
};
