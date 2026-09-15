import {
  useCallback,
} from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';

import {
  getSesionesBiPanelResourceKey,
  loadSesionesBiPanel,
} from '../application/sesionesBi.application';
import type {
  SesionesBiPanel,
  SesionesBiPanelFilters,
} from '../domain/sesionesBi.types';

export const useSesionesBiPanel = (
  filters: SesionesBiPanelFilters
) => {
  const loader = useCallback(
    (signal: AbortSignal) =>
      loadSesionesBiPanel(filters, signal),
    [filters]
  );

  const resource = useAsyncResource<SesionesBiPanel | null>({
    loader,
    resourceKey: getSesionesBiPanelResourceKey(filters),
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
