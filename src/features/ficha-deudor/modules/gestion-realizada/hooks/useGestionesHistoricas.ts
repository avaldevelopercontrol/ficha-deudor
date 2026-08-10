import { useCallback } from 'react';
import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';
import type { FichaDeudorGestionPanelParams } from '../../../shared/types/fichaDeudor.types';
import { hasRequiredValues } from '../../../shared/utils/requiredValues.utils';
import {
  GESTIONES_HISTORICAS_INITIAL_PAGE_SIZE,
  GESTIONES_REALIZADAS_ERROR_MESSAGES,
} from '../constants/gestionesRealizadas.constants';
import { loadTodasLasGestionesHistoricas } from '../services/gestionesRealizadas.service';
import type { GestionCompleta } from '../types/gestionRealizada.types';

interface UseGestionesHistoricasOptions {
  enabled: boolean;
}

export const useGestionesHistoricas = (
  params: FichaDeudorGestionPanelParams,
  { enabled }: UseGestionesHistoricasOptions
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
      loadTodasLasGestionesHistoricas(
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

  return useClientSideResourceTable<GestionCompleta>({
    fetchData,
    resetDeps: [
      id_cliente,
      id_cartera,
      id_deudor,
    ],
    enabled: canLoad,
    initialPageSize:
      GESTIONES_HISTORICAS_INITIAL_PAGE_SIZE,
    errorMessage:
      GESTIONES_REALIZADAS_ERROR_MESSAGES.HISTORICAS,
  });
};
