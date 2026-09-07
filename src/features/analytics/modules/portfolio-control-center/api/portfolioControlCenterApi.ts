import {
  analyticsApiClient,
} from '@shared/api/analyticsApiClient';

import type {
  PortfolioControlCenterFilters,
  PortfolioDueTodayPromisesQuery,
  PortfolioOperationalContext,
  PortfolioOverduePromisesQuery,
} from '../../../types/portfolioControlCenter.types';
import type {
  PortfolioAdvisorPerformanceApiResponse,
  PortfolioBootstrapApiResponse,
  PortfolioDueTodayPromisesApiResponse,
  PortfolioOverviewApiResponse,
  PortfolioOverduePromisesApiResponse,
  PortfolioSupervisorPerformanceApiResponse,
} from './portfolioControlCenterApi.types';
import {
  assertDateRange,
  assertPositiveIntegerParam,
  normalizeOptionalIsoDateParam,
  normalizeOptionalQueryText,
  normalizePerformanceContext,
  normalizeRequiredQueryText,
  validateDueTodayPromisesQuery,
  validateOverduePromisesQuery,
} from './portfolioControlCenterApi.params';
import {
  parsePortfolioAdvisorPerformanceApiResponse,
  parsePortfolioBootstrapApiResponse,
  parsePortfolioDueTodayPromisesApiResponse,
  parsePortfolioOverviewApiResponse,
  parsePortfolioOverduePromisesApiResponse,
  parsePortfolioSupervisorPerformanceApiResponse,
} from './portfolioControlCenterApi.validators';

const ANALYTICS_ENDPOINTS = {
  bootstrap:
    '/api/v1/portfolio-control-center/bootstrap',
  overview:
    '/api/v1/portfolio-control-center/overview',
  overduePromises:
    '/api/v1/portfolio-control-center/promises/overdue',
  dueTodayPromises:
    '/api/v1/portfolio-control-center/promises/due-today',
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
  if (value !== null) {
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

const buildPortfolioOperationalEndpoint = (
  endpoint: string,
  filters: PortfolioControlCenterFilters
): string => {
  const params = new URLSearchParams();
  const campaignId = normalizeOptionalQueryText(
    'campaign',
    filters.campaignId
  );
  const businessUnit = normalizeOptionalQueryText(
    'businessUnit',
    filters.businessUnit
  );
  const dateFrom = normalizeOptionalIsoDateParam(
    'dateFrom',
    filters.dateFrom
  );
  const dateTo = normalizeOptionalIsoDateParam(
    'dateTo',
    filters.dateTo
  );
  const subPortfolioId = normalizeOptionalQueryText(
    'subPortfolioId',
    filters.subPortfolioId
  );

  if (dateFrom !== null && dateTo !== null) {
    assertDateRange(dateFrom, dateTo);
  }

  appendQueryParam(params, 'campaign', campaignId);
  appendQueryParam(params, 'businessUnit', businessUnit);
  appendQueryParam(params, 'dateFrom', dateFrom);
  appendQueryParam(params, 'dateTo', dateTo);
  appendQueryParam(params, 'subPortfolioId', subPortfolioId);

  return withQuery(endpoint, params);
};

export const buildPortfolioBootstrapEndpoint = (
  filters: PortfolioControlCenterFilters
): string =>
  buildPortfolioOperationalEndpoint(
    ANALYTICS_ENDPOINTS.bootstrap,
    filters
  );

export const buildPortfolioOverviewEndpoint = (
  filters: PortfolioControlCenterFilters
): string =>
  buildPortfolioOperationalEndpoint(
    ANALYTICS_ENDPOINTS.overview,
    filters
  );

export const buildPortfolioOverduePromisesEndpoint = (
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  >,
  query: PortfolioOverduePromisesQuery
): string => {
  validateOverduePromisesQuery(query);

  const params = new URLSearchParams();
  params.set(
    'campaign',
    normalizeRequiredQueryText('campaign', context.campaignId)
  );
  appendQueryParam(
    params,
    'businessUnit',
    normalizeOptionalQueryText('businessUnit', context.businessUnit)
  );
  appendQueryParam(
    params,
    'subPortfolioId',
    normalizeOptionalQueryText('subPortfolioId', context.subPortfolioId)
  );
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  appendQueryParam(params, 'aging', query.aging);
  params.set('sortBy', query.sortBy);
  params.set('sortDirection', query.sortDirection);

  return withQuery(ANALYTICS_ENDPOINTS.overduePromises, params);
};

export const buildPortfolioDueTodayPromisesEndpoint = (
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  >,
  query: PortfolioDueTodayPromisesQuery
): string => {
  validateDueTodayPromisesQuery(query);

  const params = new URLSearchParams();
  params.set(
    'campaign',
    normalizeRequiredQueryText('campaign', context.campaignId)
  );
  appendQueryParam(
    params,
    'businessUnit',
    normalizeOptionalQueryText('businessUnit', context.businessUnit)
  );
  appendQueryParam(
    params,
    'subPortfolioId',
    normalizeOptionalQueryText('subPortfolioId', context.subPortfolioId)
  );
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));
  appendQueryParam(params, 'status', query.status);
  params.set('sortBy', query.sortBy);
  params.set('sortDirection', query.sortDirection);

  return withQuery(ANALYTICS_ENDPOINTS.dueTodayPromises, params);
};

const buildPortfolioPerformanceEndpoint = (
  endpoint: string,
  context: PortfolioOperationalContext,
  supervisorId: string | null
): string => {
  const normalizedContext = normalizePerformanceContext(context);
  const params = new URLSearchParams();

  params.set('campaign', normalizedContext.campaignId);
  appendQueryParam(
    params,
    'businessUnit',
    normalizedContext.businessUnit
  );
  params.set('dateFrom', normalizedContext.dateFrom);
  params.set('dateTo', normalizedContext.dateTo);
  appendQueryParam(
    params,
    'subPortfolioId',
    normalizedContext.subPortfolioId
  );
  appendQueryParam(
    params,
    'supervisorId',
    normalizeOptionalQueryText('supervisorId', supervisorId)
  );

  return withQuery(endpoint, params);
};

export const buildPortfolioSupervisorPerformanceEndpoint = (
  context: PortfolioOperationalContext,
  supervisorId: string | null = null
): string =>
  buildPortfolioPerformanceEndpoint(
    ANALYTICS_ENDPOINTS.supervisorPerformance,
    context,
    supervisorId
  );

export const buildPortfolioAdvisorPerformanceEndpoint = (
  context: PortfolioOperationalContext,
  supervisorId: string | null = null
): string =>
  buildPortfolioPerformanceEndpoint(
    ANALYTICS_ENDPOINTS.advisorPerformance,
    context,
    supervisorId
  );

const fetchValidatedPortfolioResponse = async <T>(
  crmClientId: number,
  endpoint: string,
  signal: AbortSignal,
  parse: (value: unknown) => T
): Promise<T> => {
  assertPositiveIntegerParam('crmClientId', crmClientId);

  const response = await analyticsApiClient.get<unknown>(
    endpoint,
    {
      crmClientId,
      includeSelectedCrmClientId: false,
      signal,
    }
  );

  return parse(response);
};

export const fetchPortfolioControlCenterBootstrap = (
  crmClientId: number,
  filters: PortfolioControlCenterFilters,
  signal: AbortSignal
): Promise<PortfolioBootstrapApiResponse> =>
  fetchValidatedPortfolioResponse(
    crmClientId,
    buildPortfolioBootstrapEndpoint(filters),
    signal,
    parsePortfolioBootstrapApiResponse
  );

export const fetchPortfolioControlCenterOverview = (
  crmClientId: number,
  filters: PortfolioControlCenterFilters,
  signal: AbortSignal
): Promise<PortfolioOverviewApiResponse> =>
  fetchValidatedPortfolioResponse(
    crmClientId,
    buildPortfolioOverviewEndpoint(filters),
    signal,
    parsePortfolioOverviewApiResponse
  );

export const fetchPortfolioOverduePromises = (
  crmClientId: number,
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  >,
  query: PortfolioOverduePromisesQuery,
  signal: AbortSignal
): Promise<PortfolioOverduePromisesApiResponse> =>
  fetchValidatedPortfolioResponse(
    crmClientId,
    buildPortfolioOverduePromisesEndpoint(
      context,
      query
    ),
    signal,
    parsePortfolioOverduePromisesApiResponse
  );

export const fetchPortfolioDueTodayPromises = (
  crmClientId: number,
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  >,
  query: PortfolioDueTodayPromisesQuery,
  signal: AbortSignal
): Promise<PortfolioDueTodayPromisesApiResponse> =>
  fetchValidatedPortfolioResponse(
    crmClientId,
    buildPortfolioDueTodayPromisesEndpoint(
      context,
      query
    ),
    signal,
    parsePortfolioDueTodayPromisesApiResponse
  );

export const fetchPortfolioSupervisorPerformance = (
  crmClientId: number,
  context: PortfolioOperationalContext,
  signal: AbortSignal
): Promise<PortfolioSupervisorPerformanceApiResponse> =>
  fetchValidatedPortfolioResponse(
    crmClientId,
    buildPortfolioSupervisorPerformanceEndpoint(context),
    signal,
    parsePortfolioSupervisorPerformanceApiResponse
  );

export const fetchPortfolioAdvisorPerformance = (
  crmClientId: number,
  context: PortfolioOperationalContext,
  supervisorId: string | null,
  signal: AbortSignal
): Promise<PortfolioAdvisorPerformanceApiResponse> =>
  fetchValidatedPortfolioResponse(
    crmClientId,
    buildPortfolioAdvisorPerformanceEndpoint(
      context,
      supervisorId
    ),
    signal,
    parsePortfolioAdvisorPerformanceApiResponse
  );
