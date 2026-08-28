import { useCallback, useMemo } from 'react';

import {
  fetchEmailById,
  fetchEmailsByDeudor,
  fetchEmailStatuses,
} from '../api/emailsApi';
import type {
  Email,
  EmailByIdApi,
} from '../types/email.types';
import { useApiResource } from '@shared/hooks/useApiResource';
import { useNullableResourceById } from '@shared/hooks/useNullableResourceById';
import {
  usePopupTableResource,
  type UsePopupTableResourceReturn,
} from '../../../shared/hooks/popups/usePopupTableResource';

export type { TextFilters, SelectedFilters } from '../../../shared/hooks/popups/usePopupTableResource';

type UseEmailsByDeudorReturn = UsePopupTableResourceReturn<Email>;

const EMAILS_BY_DEUDOR_MESSAGES = {
  missingParams: 'Faltan parámetros: id_cliente o id_deudor',
  loadError: 'Error cargando emails',
} as const;

const EMAIL_BY_ID_MESSAGES = {
  loadError: 'Error cargando email',
} as const;

export function useEmailsByDeudor(
  id_cliente: string,
  id_deudor: string
): UseEmailsByDeudorReturn {
  const resetDeps = useMemo(
    () => [id_cliente, id_deudor] as const,
    [id_cliente, id_deudor]
  );

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      fetchEmailsByDeudor(
        { idCliente: id_cliente, idDeudor: id_deudor },
        signal
      ),
    [id_cliente, id_deudor]
  );

  return usePopupTableResource<Email>({
    areParamsReady: Boolean(id_cliente && id_deudor),
    missingParamsError: EMAILS_BY_DEUDOR_MESSAGES.missingParams,
    loadError: EMAILS_BY_DEUDOR_MESSAGES.loadError,
    resetDeps,
    fetcher,
    initialPageSize: 10,
  });
}

export function useEmailStatuses() {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchEmailStatuses(signal),
    []
  );

  return useApiResource(fetcher, []);
}

export function useEmailById(idEmail: string | null) {
  const fetcher = useCallback(
    (id: string, signal: AbortSignal) =>
      fetchEmailById({ idEmail: id }, signal),
    []
  );

  return useNullableResourceById<
    string,
    EmailByIdApi
  >({
    id: idEmail,
    fetcher,
    errorMessage: EMAIL_BY_ID_MESSAGES.loadError,
  });
}
