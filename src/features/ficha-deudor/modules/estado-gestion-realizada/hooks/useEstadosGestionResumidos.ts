import { useCallback } from 'react';
import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';
import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';
import { hasRequiredValues } from '../../../shared/utils/requiredValues.utils';
import {
  ESTADOS_GESTION_ERROR_MESSAGES,
  ESTADOS_GESTION_INITIAL_PAGE_SIZE,
} from '../constants/estadosGestion.constants';
import { loadEstadosGestionResumidos } from '../services/estadosGestion.service';
import type { EstadoGestion } from '../types/estadoGestion.types';

export const useEstadosGestionResumidos = (
  params: FichaDeudorCarteraPanelParams
) => {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
  } = params;

  const canLoad = hasRequiredValues(
    id_cliente,
    id_cartera,
    id_deudor
  );

  const fetchData = useCallback(
    (signal: AbortSignal) =>
      loadEstadosGestionResumidos(
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

  return useClientSideResourceTable<EstadoGestion>({
    fetchData,
    resetDeps: [
      id_cliente,
      id_cartera,
      id_deudor,
    ],
    enabled: canLoad,
    initialPageSize:
      ESTADOS_GESTION_INITIAL_PAGE_SIZE,
    errorMessage:
      ESTADOS_GESTION_ERROR_MESSAGES.RESUMIDOS,
  });
};
