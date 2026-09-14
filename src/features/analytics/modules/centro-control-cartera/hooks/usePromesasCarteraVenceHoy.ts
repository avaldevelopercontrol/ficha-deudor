import { useMemo } from 'react';

import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PromesasCarteraVenceHoyData,
  PromesasCarteraVenceHoyQuery,
  PromesasCarteraVenceHoySortKey,
  PortfolioDueTodayStatusFilter,
  PortfolioSortDirection,
} from '../domain/promesasCartera.types';
import {
  buildPromesasCarteraVenceHoyQuery,
  loadPromesasCarteraVenceHoy,
} from '../application/promesasCartera.application';
import { useDetallePromesaCarteraResource } from './useDetallePromesaCarteraResource';

interface UsePromesasCarteraVenceHoyParams {
  crmClientId: number;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > | null;
  enabled: boolean;
  page: number;
  pageSize: number;
  status: PortfolioDueTodayStatusFilter;
  sortKey: PromesasCarteraVenceHoySortKey;
  sortDirection: PortfolioSortDirection;
}

export const usePromesasCarteraVenceHoy = ({
  crmClientId,
  context,
  enabled,
  page,
  pageSize,
  status,
  sortKey,
  sortDirection,
}: UsePromesasCarteraVenceHoyParams) => {
  const query = useMemo<PromesasCarteraVenceHoyQuery>(
    () =>
      buildPromesasCarteraVenceHoyQuery(
        page,
        pageSize,
        status,
        sortKey,
        sortDirection
      ),
    [status, page, pageSize, sortDirection, sortKey]
  );

  return useDetallePromesaCarteraResource<
    PromesasCarteraVenceHoyData,
    PromesasCarteraVenceHoyQuery
  >({
    crmClientId,
    context,
    enabled,
    query,
    queryKey: [page, pageSize, status, sortKey, sortDirection],
    load: loadPromesasCarteraVenceHoy,
    errorMessage:
      'No se pudo cargar el detalle de promesas con vencimiento hoy.',
  });
};
