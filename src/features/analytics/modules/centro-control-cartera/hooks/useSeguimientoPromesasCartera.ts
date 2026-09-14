import { useMemo } from 'react';

import {
  buildSeguimientoPromesasCarteraQuery,
  loadSeguimientoPromesasCartera,
} from '../application/promesasCartera.application';
import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  SeguimientoPromesasCarteraData,
  SeguimientoPromesasCarteraQuery,
  SeguimientoPromesasCarteraSortKey,
  SeguimientoPromesasCarteraStatusFilter,
  PortfolioSortDirection,
} from '../domain/promesasCartera.types';
import { useDetallePromesaCarteraResource } from './useDetallePromesaCarteraResource';

interface UseSeguimientoPromesasCarteraParams {
  crmClientId: number;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > | null;
  enabled: boolean;
  dueDate: string;
  page: number;
  pageSize: number;
  status: SeguimientoPromesasCarteraStatusFilter;
  sortKey: SeguimientoPromesasCarteraSortKey;
  sortDirection: PortfolioSortDirection;
}

export const useSeguimientoPromesasCartera = ({
  crmClientId,
  context,
  enabled,
  dueDate,
  page,
  pageSize,
  status,
  sortKey,
  sortDirection,
}: UseSeguimientoPromesasCarteraParams) => {
  const query = useMemo<SeguimientoPromesasCarteraQuery>(
    () =>
      buildSeguimientoPromesasCarteraQuery(
        dueDate,
        page,
        pageSize,
        status,
        sortKey,
        sortDirection
      ),
    [dueDate, page, pageSize, sortDirection, sortKey, status]
  );

  return useDetallePromesaCarteraResource<
    SeguimientoPromesasCarteraData,
    SeguimientoPromesasCarteraQuery
  >({
    crmClientId,
    context,
    enabled,
    query,
    queryKey: [dueDate, page, pageSize, status, sortKey, sortDirection],
    load: loadSeguimientoPromesasCartera,
    errorMessage: 'No se pudo cargar el seguimiento de promesas.',
  });
};
