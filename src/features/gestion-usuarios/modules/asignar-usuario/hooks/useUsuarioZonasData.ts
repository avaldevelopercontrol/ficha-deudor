import {
  useCallback,
} from 'react';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  fetchZonasAsignadasByClienteUsuario,
  fetchZonasFaltantesByClienteUsuario,
} from '../../../api/usuarioZonasApi';

interface UseUsuarioZonasDataParams {
  enabled: boolean;
  idCliente: number | null;
  idUsuario: number | null;
}

export const useUsuarioZonasData = ({
  enabled,
  idCliente,
  idUsuario,
}: UseUsuarioZonasDataParams) => {
  const hasValidContext =
    enabled &&
    idCliente !== null &&
    idUsuario !== null;

  const assignedFetcher =
    useCallback(
      (signal: AbortSignal) => {
        if (
          !hasValidContext ||
          idCliente === null ||
          idUsuario === null
        ) {
          return Promise.reject(
            new Error(
              'No se pudo identificar el cliente o el usuario para cargar sus zonas.'
            )
          );
        }

        return fetchZonasAsignadasByClienteUsuario(
          idCliente,
          idUsuario,
          signal
        );
      },
      [
        hasValidContext,
        idCliente,
        idUsuario,
      ]
    );

  const availableFetcher =
    useCallback(
      (signal: AbortSignal) => {
        if (
          !hasValidContext ||
          idCliente === null ||
          idUsuario === null
        ) {
          return Promise.reject(
            new Error(
              'No se pudo identificar el cliente o el usuario para cargar las zonas disponibles.'
            )
          );
        }

        return fetchZonasFaltantesByClienteUsuario(
          idCliente,
          idUsuario,
          signal
        );
      },
      [
        hasValidContext,
        idCliente,
        idUsuario,
      ]
    );

  const assigned = useApiResource(
    assignedFetcher,
    [
      hasValidContext,
      idCliente,
      idUsuario,
    ],
    { enabled: hasValidContext }
  );

  const available = useApiResource(
    availableFetcher,
    [
      hasValidContext,
      idCliente,
      idUsuario,
    ],
    { enabled: hasValidContext }
  );

  const refetch = async (): Promise<void> => {
    await Promise.all([
      assigned.refetch(),
      available.refetch(),
    ]);
  };

  return {
    zonasAsignadas: assigned.data,
    zonasFaltantes: available.data,
    isLoading:
      assigned.isLoading ||
      available.isLoading,
    error:
      assigned.error ??
      available.error,
    refetch,
  };
};
