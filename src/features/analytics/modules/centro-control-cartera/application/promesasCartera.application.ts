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
  SeguimientoPromesaCarteraItem,
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

export type SeguimientoPromesasCarteraExportQuery = Omit<
  SeguimientoPromesasCarteraQuery,
  'page' | 'pageSize'
>;

const SEGUIMIENTO_PROMESAS_EXPORT_PAGE_SIZE = 50;
const SEGUIMIENTO_PROMESAS_EXPORT_MAX_PAGES = 2000;

export const loadAllSeguimientoPromesasCartera = async (
  crmClientId: number,
  context: DetallePromesaCarteraContext,
  query: SeguimientoPromesasCarteraExportQuery,
  signal: AbortSignal
): Promise<readonly SeguimientoPromesaCarteraItem[]> => {
  const firstPage = await loadSeguimientoPromesasCartera(
    crmClientId,
    context,
    {
      ...query,
      page: 1,
      pageSize: SEGUIMIENTO_PROMESAS_EXPORT_PAGE_SIZE,
    },
    signal
  );

  const totalPages = firstPage.pagination.totalPages;

  if (totalPages <= 1) {
    return firstPage.items;
  }

  if (totalPages > SEGUIMIENTO_PROMESAS_EXPORT_MAX_PAGES) {
    throw new Error(
      'La exportación contiene demasiadas páginas para procesarse de forma segura.'
    );
  }

  const items: SeguimientoPromesaCarteraItem[] = [...firstPage.items];

  for (let page = 2; page <= totalPages; page += 1) {
    if (signal.aborted) {
      throw new DOMException('La exportación fue cancelada.', 'AbortError');
    }

    const currentPage = await loadSeguimientoPromesasCartera(
      crmClientId,
      context,
      {
        ...query,
        page,
        pageSize: SEGUIMIENTO_PROMESAS_EXPORT_PAGE_SIZE,
      },
      signal
    );

    items.push(...currentPage.items);
  }

  return items;
};
