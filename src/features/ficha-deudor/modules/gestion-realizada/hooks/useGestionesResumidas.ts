import { useCallback } from 'react';
import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';
import type { FichaDeudorGestionPanelParams } from '../../../shared/types/fichaDeudor.types';
import { hasRequiredValues } from '../../../shared/utils/requiredValues.utils';
import {
  GESTIONES_REALIZADAS_ERROR_MESSAGES,
  GESTIONES_REALIZADAS_INITIAL_PAGE_SIZE,
} from '../constants/gestionesRealizadas.constants';
import { loadGestionesResumidas } from '../services/gestionesRealizadas.service';
import type { GestionRealizada } from '../types/gestionRealizada.types';

export const useGestionesResumidas = (
  params: FichaDeudorGestionPanelParams
) => {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
    id_usuario,
  } = params;

  const canLoad = hasRequiredValues(
    id_cliente,
    id_cartera,
    id_deudor,
    id_usuario
  );

  const fetchData = useCallback(
    (signal: AbortSignal) =>
      loadGestionesResumidas(
        {
          idCliente: id_cliente,
          idCartera: id_cartera,
          idDeudor: id_deudor,
          idUsuario: id_usuario,
        },
        signal
      ),
    [
      id_cliente,
      id_cartera,
      id_deudor,
      id_usuario,
    ]
  );

  return useClientSideResourceTable<GestionRealizada>({
    fetchData,
    resetDeps: [
      id_cliente,
      id_cartera,
      id_deudor,
      id_usuario,
    ],
    enabled: canLoad,
    initialPageSize:
      GESTIONES_REALIZADAS_INITIAL_PAGE_SIZE,
    errorMessage:
      GESTIONES_REALIZADAS_ERROR_MESSAGES.RESUMIDAS,
  });
};
