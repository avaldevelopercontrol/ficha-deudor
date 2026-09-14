import {
  useCallback,
} from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';

import { getSesionesBiPanel } from '../api/sesionesBi.api';
import type {
  SesionesBiPanel,
  SesionesBiPanelFilters,
} from '../domain/sesionesBi.types';

export const useSesionesBiPanel = (
  filters: SesionesBiPanelFilters
) => {
  const loader = useCallback(
    (signal: AbortSignal) =>
      getSesionesBiPanel(filters, signal),
    [filters]
  );

  const resource = useAsyncResource<SesionesBiPanel | null>({
    loader,
    resourceKey: [
      filters.fromUtc,
      filters.toUtc,
      filters.reportId,
      filters.userId,
      filters.clientId,
      filters.status,
      filters.search,
      filters.order,
      filters.page,
      filters.pageSize,
    ],
    initialData: null,
    initialLoading: true,
    errorMessage: 'No se pudo cargar la trazabilidad de sesiones BI.',
    clearDataOnError: false,
  });

  return {
    data: resource.data,
    loading: resource.isLoading,
    error: resource.error,
    refetch: resource.refetch,
  };
};
