import { useCallback, useMemo } from 'react';

import { fetchAgendasByDeudor } from '../api/agendasApi';
import type { Agenda } from '../types/agenda.types';
import {
  usePopupTableResource,
  type UsePopupTableResourceReturn,
} from '../../../shared/hooks/popups/usePopupTableResource';

export type { TextFilters, SelectedFilters } from '../../../shared/hooks/popups/usePopupTableResource';

type UseAgendasByDeudorReturn = UsePopupTableResourceReturn<Agenda>;

const AGENDAS_BY_DEUDOR_MESSAGES = {
  missingParams: 'Faltan parámetros requeridos',
  loadError: 'Error cargando agendas',
} as const;

export function useAgendasByDeudor(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_usuario: string
): UseAgendasByDeudorReturn {
  const resetDeps = useMemo(
    () => [id_cliente, id_cartera, id_deudor, id_usuario] as const,
    [id_cliente, id_cartera, id_deudor, id_usuario]
  );

  const fetcher = useCallback(
    (signal?: AbortSignal) =>
      fetchAgendasByDeudor(
        id_cliente,
        id_cartera,
        id_deudor,
        id_usuario,
        signal
      ),
    [id_cliente, id_cartera, id_deudor, id_usuario]
  );

  return usePopupTableResource<Agenda>({
    areParamsReady: Boolean(id_cliente && id_cartera && id_deudor && id_usuario),
    missingParamsError: AGENDAS_BY_DEUDOR_MESSAGES.missingParams,
    loadError: AGENDAS_BY_DEUDOR_MESSAGES.loadError,
    resetDeps,
    fetcher,
    initialPageSize: 10,
  });
}