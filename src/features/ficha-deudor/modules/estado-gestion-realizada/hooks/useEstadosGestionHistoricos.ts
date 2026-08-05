import { useCallback } from 'react';
import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';
import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';
import { hasRequiredValues } from '../../../shared/utils/requiredValues.utils';
import {
  ESTADOS_GESTION_ERROR_MESSAGES,
  ESTADOS_GESTION_HISTORICOS_INITIAL_PAGE_SIZE,
} from '../constants/estadosGestion.constants';
import { loadTodosLosEstadosGestionHistoricos } from '../services/estadosGestion.service';
import type { EstadoGestionCompleta } from '../types/estadoGestion.types';

interface UseEstadosGestionHistoricosOptions {
  enabled: boolean;
}

export const useEstadosGestionHistoricos = (
  params: FichaDeudorCarteraPanelParams,
  { enabled }: UseEstadosGestionHistoricosOptions
) => {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
  } = params;

  const canLoad =
    enabled &&
    hasRequiredValues(
      id_cliente,
      id_cartera,
      id_deudor
    );

  const fetchData = useCallback(
    (signal: AbortSignal) =>
      loadTodosLosEstadosGestionHistoricos(
        {
          idCliente: id_cliente,
          idCartera: id_cartera,
          idDeudor: id_deudor,
        },
        signal
      ),
    [
      id_cliente,
      id_cartera,
      id_deudor,
    ]
  );

  return useClientSideResourceTable<EstadoGestionCompleta>({
    fetchData,
    resetDeps: [
      id_cliente,
      id_cartera,
      id_deudor,
    ],
    enabled: canLoad,
    initialPageSize:
      ESTADOS_GESTION_HISTORICOS_INITIAL_PAGE_SIZE,
    errorMessage:
      ESTADOS_GESTION_ERROR_MESSAGES.HISTORICOS,
  });
};
