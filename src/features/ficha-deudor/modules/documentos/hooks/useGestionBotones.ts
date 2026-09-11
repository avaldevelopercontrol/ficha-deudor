import { useCallback } from 'react';

import { useApiResource } from '@shared/hooks/useApiResource';

import { fetchGestionBotones } from '../api/gestionBotonesApi';
import { DOCUMENTOS_ERROR_MESSAGES } from '../constants/documentos.constants';
import type { GestionBoton } from '../types/gestionBoton.types';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';

const EMPTY_GESTION_BOTONES: GestionBoton[] = [];

interface UseGestionBotonesParams {
  idCliente: string;
  idContrato: string;
}

export const useGestionBotones = ({
  idCliente,
  idContrato,
}: UseGestionBotonesParams) => {
  const canLoad = Boolean(idCliente && idContrato);

  const fetchResource = useCallback(
    async (signal: AbortSignal): Promise<GestionBoton[]> => {
      try {
        return await fetchGestionBotones(
          {
            idCliente,
            idContrato,
          },
          signal
        );
      } catch (error) {
        throw new Error(
          getErrorMessage(
            error,
            DOCUMENTOS_ERROR_MESSAGES.BUTTONS
          )
        );
      }
    },
    [idCliente, idContrato]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiResource<GestionBoton[]>(
    fetchResource,
    [idCliente, idContrato],
    {
      enabled: canLoad,
      initialLoading: canLoad,
      errorMessage: DOCUMENTOS_ERROR_MESSAGES.BUTTONS,
    }
  );

  return {
    botones: data ?? EMPTY_GESTION_BOTONES,
    isLoading,
    error,
    refetch,
  };
};
