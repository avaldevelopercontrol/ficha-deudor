import {
  useCallback,
} from 'react';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import type {
  GestionDeudorIdentity,
} from '../../../utils/gestionDeudorIdentity.utils';
import {
  fetchProduccionGestorHoy,
} from '../api/produccionGestorHoyApi';

export const useProduccionGestorHoy = (
  identity: GestionDeudorIdentity
) => {
  const fetcher = useCallback(
    (signal: AbortSignal) =>
      fetchProduccionGestorHoy(
        identity,
        signal
      ),
    [identity]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiResource(
    fetcher,
    [
      identity.idCliente,
      identity.idUsuario,
    ]
  );

  return {
    rows: data ?? [],
    isLoading,
    error,
    refetch,
  };
};
