import { useMemo } from 'react';

import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PortfolioOverdueAgingFilter,
  PromesasCarteraVencidasData,
  PromesasCarteraVencidasQuery,
  PromesasCarteraVencidasSortKey,
  PortfolioSortDirection,
} from '../domain/promesasCartera.types';
import {
  buildPromesasCarteraVencidasQuery,
  loadPromesasCarteraVencidas,
} from '../application/promesasCartera.application';
import { useDetallePromesaCarteraResource } from './useDetallePromesaCarteraResource';

interface UsePromesasCarteraVencidasParams {
  crmClientId: number;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > | null;
  enabled: boolean;
  page: number;
  pageSize: number;
  aging: PortfolioOverdueAgingFilter;
  sortKey: PromesasCarteraVencidasSortKey;
  sortDirection: PortfolioSortDirection;
}

export const usePromesasCarteraVencidas = ({
  crmClientId,
  context,
  enabled,
  page,
  pageSize,
  aging,
  sortKey,
  sortDirection,
}: UsePromesasCarteraVencidasParams) => {
  const query = useMemo<PromesasCarteraVencidasQuery>(
    () =>
      buildPromesasCarteraVencidasQuery(
        page,
        pageSize,
        aging,
        sortKey,
        sortDirection
      ),
    [aging, page, pageSize, sortDirection, sortKey]
  );

  return useDetallePromesaCarteraResource<
    PromesasCarteraVencidasData,
    PromesasCarteraVencidasQuery
  >({
    crmClientId,
    context,
    enabled,
    query,
    queryKey: [page, pageSize, aging, sortKey, sortDirection],
    load: loadPromesasCarteraVencidas,
    errorMessage: 'No se pudo cargar el detalle de promesas vencidas.',
  });
};
