import { useCallback, useMemo } from 'react';

import { fetchPagosByDeudor } from '../api/pagosApi';
import type { Pago } from '../types/pago.types';
import {
  usePopupTableResource,
  type UsePopupTableResourceReturn,
} from '../../../shared/hooks/popups/usePopupTableResource';

export type { TextFilters, SelectedFilters } from '../../../shared/hooks/popups/usePopupTableResource';

type UsePagosByDeudorReturn = UsePopupTableResourceReturn<Pago>;

const PAGOS_BY_DEUDOR_MESSAGES = {
  missingParams: 'Faltan parámetros requeridos',
  loadError: 'Error cargando pagos',
} as const;

export function usePagosByDeudor(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string
): UsePagosByDeudorReturn {
  const resetDeps = useMemo(
    () => [id_cliente, id_cartera, id_deudor] as const,
    [id_cliente, id_cartera, id_deudor]
  );

  const fetcher = useCallback(
    (signal?: AbortSignal) =>
      fetchPagosByDeudor(id_cliente, id_cartera, id_deudor, signal),
    [id_cliente, id_cartera, id_deudor]
  );

  return usePopupTableResource<Pago>({
    areParamsReady: Boolean(id_cliente && id_cartera && id_deudor),
    missingParamsError: PAGOS_BY_DEUDOR_MESSAGES.missingParams,
    loadError: PAGOS_BY_DEUDOR_MESSAGES.loadError,
    resetDeps,
    fetcher,
    initialPageSize: 10,
  });
}