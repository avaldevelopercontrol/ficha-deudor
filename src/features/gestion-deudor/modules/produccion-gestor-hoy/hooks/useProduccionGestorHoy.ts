import {
  useCallback,
} from 'react';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  fetchProduccionGestorHoy,
} from '../api/produccionGestorHoyApi';

export const useProduccionGestorHoy = (
  idCliente: string,
  idUsuario: string
) => {
  const fetcher = useCallback(
    (signal: AbortSignal) =>
      fetchProduccionGestorHoy(
        idCliente,
        idUsuario,
        signal
      ),
    [
      idCliente,
      idUsuario,
    ]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiResource(
    fetcher,
    [
      idCliente,
      idUsuario,
    ]
  );

  return {
    rows: data ?? [],
    isLoading,
    error,
    refetch,
  };
};