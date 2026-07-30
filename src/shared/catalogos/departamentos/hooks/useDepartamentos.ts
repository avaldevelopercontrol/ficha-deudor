import {
  useCallback,
} from 'react';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  fetchDepartamentos,
} from '../api/departamentosApi';

import type {
  Departamento,
} from '../types/departamento.types';

export const useDepartamentos = (
  enabled = true
) => {
  const fetcher = useCallback(
    (
      signal: AbortSignal
    ) => {
      if (!enabled) {
        return Promise.resolve(
          [] as Departamento[]
        );
      }

      return fetchDepartamentos(
        signal
      );
    },
    [enabled]
  );

  return useApiResource<
    Departamento[]
  >(
    fetcher,
    [enabled]
  );
};