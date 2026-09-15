import {
  useCallback,
} from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';

import {
  getSesionBiDetailResourceKey,
  loadSesionBiDetail,
} from '../application/sesionesBi.application';
import type {
  SesionBiDetail,
} from '../domain/sesionesBi.types';

export const useSesionBiDetail = (
  sessionId: string | null
) => {
  const loader = useCallback(
    (signal: AbortSignal) => {
      if (!sessionId) {
        return Promise.reject(
          new Error('No se seleccionó una sesión BI.')
        );
      }

      return loadSesionBiDetail(sessionId, signal);
    },
    [sessionId]
  );

  const resource = useAsyncResource<SesionBiDetail | null>({
    loader,
    resourceKey: getSesionBiDetailResourceKey(sessionId),
    initialData: null,
    enabled: sessionId !== null,
    initialLoading: false,
    disabledError: null,
    resetDataWhenDisabled: true,
    errorMessage: 'No se pudo cargar el detalle de la sesión.',
  });

  return {
    data: resource.data,
    loading: resource.isLoading,
    error: resource.error,
    refetch: resource.refetch,
  };
};
