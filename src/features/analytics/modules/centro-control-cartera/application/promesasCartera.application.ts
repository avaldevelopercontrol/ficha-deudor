import {
  fetchPromesasCarteraVenceHoy,
  fetchPromesasCarteraVencidas,
  fetchSeguimientoPromesasCartera,
} from '../api/centroControlCarteraApi';
import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PromesasCarteraVenceHoyData,
  PromesasCarteraVenceHoyQuery,
  PromesasCarteraVenceHoySortKey,
  SeguimientoPromesasCarteraData,
  SeguimientoPromesasCarteraQuery,
  SeguimientoPromesasCarteraSortKey,
  SeguimientoPromesasCarteraStatusFilter,
  PortfolioDueTodayStatusFilter,
  PortfolioOverdueAgingFilter,
  PromesasCarteraVencidasData,
  PromesasCarteraVencidasQuery,
  PromesasCarteraVencidasSortKey,
  PortfolioSortDirection,
} from '../domain/promesasCartera.types';
import {
  mapPromesasCarteraVenceHoyResponse,
  mapPromesasCarteraVencidasResponse,
  mapSeguimientoPromesasCarteraResponse,
} from '../mappers/promesasCartera.mapper';

export type DetallePromesaCarteraContext = Pick<
  PortfolioOperationalContext,
  'businessUnit' | 'campaignId' | 'subPortfolioId'
>;

export const buildPromesasCarteraVencidasQuery = (
  page: number,
  pageSize: number,
  aging: PortfolioOverdueAgingFilter,
  sortBy: PromesasCarteraVencidasSortKey,
  sortDirection: PortfolioSortDirection
): PromesasCarteraVencidasQuery => ({
  page,
  pageSize,
  aging: aging === 'all' ? null : aging,
  sortBy,
  sortDirection,
});

export const buildPromesasCarteraVenceHoyQuery = (
  page: number,
  pageSize: number,
  status: PortfolioDueTodayStatusFilter,
  sortBy: PromesasCarteraVenceHoySortKey,
  sortDirection: PortfolioSortDirection
): PromesasCarteraVenceHoyQuery => ({
  page,
  pageSize,
  status: status === 'all' ? null : status,
  sortBy,
  sortDirection,
});

export const loadPromesasCarteraVencidas = async (
  crmClientId: number,
  context: DetallePromesaCarteraContext,
  query: PromesasCarteraVencidasQuery,
  signal: AbortSignal
): Promise<PromesasCarteraVencidasData> => {
  const response = await fetchPromesasCarteraVencidas(
    crmClientId,
    context,
    query,
    signal
  );

  return mapPromesasCarteraVencidasResponse(response);
};

export const loadPromesasCarteraVenceHoy = async (
  crmClientId: number,
  context: DetallePromesaCarteraContext,
  query: PromesasCarteraVenceHoyQuery,
  signal: AbortSignal
): Promise<PromesasCarteraVenceHoyData> => {
  const response = await fetchPromesasCarteraVenceHoy(
    crmClientId,
    context,
    query,
    signal
  );

  return mapPromesasCarteraVenceHoyResponse(response);
};


export const buildSeguimientoPromesasCarteraQuery = (
  dueDate: string,
  page: number,
  pageSize: number,
  status: SeguimientoPromesasCarteraStatusFilter,
  sortBy: SeguimientoPromesasCarteraSortKey,
  sortDirection: PortfolioSortDirection
): SeguimientoPromesasCarteraQuery => ({
  dueDate,
  page,
  pageSize,
  status: status === 'all' ? null : status,
  sortBy,
  sortDirection,
});

export const loadSeguimientoPromesasCartera = async (
  crmClientId: number,
  context: DetallePromesaCarteraContext,
  query: SeguimientoPromesasCarteraQuery,
  signal: AbortSignal
): Promise<SeguimientoPromesasCarteraData> => {
  const response = await fetchSeguimientoPromesasCartera(
    crmClientId,
    context,
    query,
    signal
  );

  return mapSeguimientoPromesasCarteraResponse(response);
};
