import type {
  CentroControlCarteraFilters,
} from '../domain/filtrosCartera.types';
import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PromesasCarteraVenceHoyQuery,
  PromesasCarteraVencidasQuery,
  SeguimientoPromesasCarteraQuery,
} from '../domain/promesasCartera.types';
import {
  assertDateRange,
  normalizeIsoDateParam,
  normalizeOptionalIsoDateParam,
  normalizeOptionalQueryText,
  normalizePerformanceContext,
  normalizeRequiredQueryText,
  validateDueTodayPromisesQuery,
  validateOverduePromisesQuery,
  validateSeguimientoPromesasQuery,
} from './centroControlCarteraApi.params';

const CENTRO_CONTROL_CARTERA_ENDPOINTS = {
  bootstrap:
    '/v1/Analitica/CentroControlCartera/Inicializacion',
  overview:
    '/v1/Analitica/CentroControlCartera/Panorama',
  overduePromises:
    '/v1/Analitica/CentroControlCartera/Promesas/Vencidas',
  dueTodayPromises:
    '/v1/Analitica/CentroControlCartera/Promesas/VenceHoy',
  promiseTracking:
    '/v1/Analitica/CentroControlCartera/Promesas/Seguimiento',
  supervisorPerformance:
    '/v1/Analitica/CentroControlCartera/RendimientoSupervisor',
  advisorPerformance:
    '/v1/Analitica/CentroControlCartera/RendimientoAsesor',
} as const;

const ANTIGUEDAD_A_BACKEND = {
  '1-3': '1-3',
  '4-7': '4-7',
  '8-plus': '8-mas',
  unclassified: 'sin-clasificar',
} as const;

const ORDEN_VENCIDAS_A_BACKEND = {
  debtorId: 'idDeudor',
  dueDate: 'fechaVencimiento',
  overdueDays: 'diasVencimiento',
  promiseAmount: 'montoPromesa',
  paidAmount: 'montoPagado',
  outstandingAmount: 'montoPendiente',
  advisorName: 'nombreAsesor',
  supervisorName: 'nombreSupervisor',
} as const;

const ESTADO_VENCE_HOY_A_BACKEND = {
  pending: 'pendiente',
  partial: 'parcial',
  covered: 'cubierta',
} as const;

const ORDEN_VENCE_HOY_A_BACKEND = {
  debtorId: 'idDeudor',
  promiseAmount: 'montoPromesa',
  paidAmount: 'montoPagado',
  outstandingAmount: 'montoPendiente',
  statusLabel: 'etiquetaEstado',
  lastPaymentDate: 'fechaUltimoPago',
  advisorName: 'nombreAsesor',
  supervisorName: 'nombreSupervisor',
} as const;

const ESTADO_SEGUIMIENTO_A_BACKEND = {
  pending: 'pendiente',
  partial: 'parcial',
  fulfilled: 'cumplida',
  broken: 'incumplida',
  'paid-out-of-range': 'pagada-fuera-plazo',
} as const;

const ORDEN_SEGUIMIENTO_A_BACKEND = ORDEN_VENCE_HOY_A_BACKEND;

type PromiseOperationalContext = Pick<
  PortfolioOperationalContext,
  'businessUnit' | 'campaignId' | 'subPortfolioId'
>;

const appendQueryParam = (
  params: URLSearchParams,
  key: string,
  value: string | null
): void => {
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

const appendPromiseContext = (
  params: URLSearchParams,
  context: PromiseOperationalContext
): void => {
  params.set(
    'campana',
    normalizeRequiredQueryText('campana', context.campaignId)
  );
  appendQueryParam(
    params,
    'unidadNegocio',
    normalizeOptionalQueryText('unidadNegocio', context.businessUnit)
  );
  appendQueryParam(
    params,
    'idSubCartera',
    normalizeOptionalQueryText('idSubCartera', context.subPortfolioId)
  );
};

const buildPortfolioOperationalEndpoint = (
  endpoint: string,
  filters: CentroControlCarteraFilters
): string => {
  const params = new URLSearchParams();
  const campaignId = normalizeOptionalQueryText(
    'campana',
    filters.campaignId
  );
  const businessUnit = normalizeOptionalQueryText(
    'unidadNegocio',
    filters.businessUnit
  );
  const dateFrom = normalizeOptionalIsoDateParam(
    'fechaDesde',
    filters.dateFrom
  );
  const dateTo = normalizeOptionalIsoDateParam(
    'fechaHasta',
    filters.dateTo
  );
  const subPortfolioId = normalizeOptionalQueryText(
    'idSubCartera',
    filters.subPortfolioId
  );

  if (dateFrom !== null && dateTo !== null) {
    assertDateRange(dateFrom, dateTo);
  }

  appendQueryParam(params, 'campana', campaignId);
  appendQueryParam(params, 'unidadNegocio', businessUnit);
  appendQueryParam(params, 'fechaDesde', dateFrom);
  appendQueryParam(params, 'fechaHasta', dateTo);
  appendQueryParam(params, 'idSubCartera', subPortfolioId);

  return withQuery(endpoint, params);
};

export const buildInicializacionCarteraEndpoint = (
  filters: CentroControlCarteraFilters
): string =>
  buildPortfolioOperationalEndpoint(
    CENTRO_CONTROL_CARTERA_ENDPOINTS.bootstrap,
    filters
  );

export const buildPanoramaCarteraEndpoint = (
  filters: CentroControlCarteraFilters
): string =>
  buildPortfolioOperationalEndpoint(
    CENTRO_CONTROL_CARTERA_ENDPOINTS.overview,
    filters
  );

export const buildPromesasCarteraVencidasEndpoint = (
  context: PromiseOperationalContext,
  query: PromesasCarteraVencidasQuery
): string => {
  validateOverduePromisesQuery(query);

  const params = new URLSearchParams();
  appendPromiseContext(params, context);
  params.set('pagina', String(query.page));
  params.set('tamanoPagina', String(query.pageSize));
  appendQueryParam(
    params,
    'antiguedad',
    query.aging === null ? null : ANTIGUEDAD_A_BACKEND[query.aging]
  );
  params.set('ordenarPor', ORDEN_VENCIDAS_A_BACKEND[query.sortBy]);
  params.set('direccionOrden', query.sortDirection);

  return withQuery(CENTRO_CONTROL_CARTERA_ENDPOINTS.overduePromises, params);
};

export const buildPromesasCarteraVenceHoyEndpoint = (
  context: PromiseOperationalContext,
  query: PromesasCarteraVenceHoyQuery
): string => {
  validateDueTodayPromisesQuery(query);

  const params = new URLSearchParams();
  appendPromiseContext(params, context);
  params.set('pagina', String(query.page));
  params.set('tamanoPagina', String(query.pageSize));
  appendQueryParam(
    params,
    'estado',
    query.status === null ? null : ESTADO_VENCE_HOY_A_BACKEND[query.status]
  );
  params.set('ordenarPor', ORDEN_VENCE_HOY_A_BACKEND[query.sortBy]);
  params.set('direccionOrden', query.sortDirection);

  return withQuery(CENTRO_CONTROL_CARTERA_ENDPOINTS.dueTodayPromises, params);
};

export const buildSeguimientoPromesasCarteraEndpoint = (
  context: PromiseOperationalContext,
  query: SeguimientoPromesasCarteraQuery
): string => {
  validateSeguimientoPromesasQuery(query);

  const params = new URLSearchParams();
  appendPromiseContext(params, context);
  params.set(
    'fechaVencimiento',
    normalizeIsoDateParam('fechaVencimiento', query.dueDate)
  );
  params.set('pagina', String(query.page));
  params.set('tamanoPagina', String(query.pageSize));
  appendQueryParam(
    params,
    'estado',
    query.status === null ? null : ESTADO_SEGUIMIENTO_A_BACKEND[query.status]
  );
  params.set('ordenarPor', ORDEN_SEGUIMIENTO_A_BACKEND[query.sortBy]);
  params.set('direccionOrden', query.sortDirection);

  return withQuery(CENTRO_CONTROL_CARTERA_ENDPOINTS.promiseTracking, params);
};

const buildRendimientoCarteraEndpoint = (
  endpoint: string,
  context: PortfolioOperationalContext,
  supervisorId: string | null
): string => {
  const normalizedContext = normalizePerformanceContext(context);
  const params = new URLSearchParams();

  params.set('campana', normalizedContext.campaignId);
  appendQueryParam(
    params,
    'unidadNegocio',
    normalizedContext.businessUnit
  );
  params.set('fechaDesde', normalizedContext.dateFrom);
  params.set('fechaHasta', normalizedContext.dateTo);
  appendQueryParam(
    params,
    'idSubCartera',
    normalizedContext.subPortfolioId
  );
  appendQueryParam(
    params,
    'idSupervisor',
    normalizeOptionalQueryText('idSupervisor', supervisorId)
  );

  return withQuery(endpoint, params);
};

export const buildRendimientoSupervisorCarteraEndpoint = (
  context: PortfolioOperationalContext,
  supervisorId: string | null = null
): string =>
  buildRendimientoCarteraEndpoint(
    CENTRO_CONTROL_CARTERA_ENDPOINTS.supervisorPerformance,
    context,
    supervisorId
  );

export const buildRendimientoAsesorCarteraEndpoint = (
  context: PortfolioOperationalContext,
  supervisorId: string | null = null
): string =>
  buildRendimientoCarteraEndpoint(
    CENTRO_CONTROL_CARTERA_ENDPOINTS.advisorPerformance,
    context,
    supervisorId
  );
