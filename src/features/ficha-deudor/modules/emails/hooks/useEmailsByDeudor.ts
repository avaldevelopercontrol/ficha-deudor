import { useCallback, useEffect, useMemo, useReducer } from 'react';

import {
  createEmail,
  fetchEmailById,
  fetchEmailsByDeudor,
  fetchEmailStatuses,
} from '../api/emailsApi';
import type {
  Email,
  EmailByIdApi,
  EmailFormData,
} from '../types/email.types';
import { useApiResource } from '@shared/hooks/useApiResource';
import {
  usePopupTableResource,
  type UsePopupTableResourceReturn,
} from '../../../shared/hooks/popups/usePopupTableResource';

export type { TextFilters, SelectedFilters } from '../../../shared/hooks/popups/usePopupTableResource';

type UseEmailsByDeudorReturn = UsePopupTableResourceReturn<Email>;

interface EmailByIdState {
  data: EmailByIdApi | null;
  isLoading: boolean;
  error: string | null;
}

type EmailByIdAction =
  | { type: 'RESET' }
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; data: EmailByIdApi }
  | { type: 'LOAD_ERROR'; error: string };

const EMAILS_BY_DEUDOR_MESSAGES = {
  missingParams: 'Faltan parámetros: id_cliente o id_deudor',
  loadError: 'Error cargando emails',
} as const;

const EMAIL_BY_ID_MESSAGES = {
  loadError: 'Error cargando email',
} as const;

const emailByIdInitialState: EmailByIdState = {
  data: null,
  isLoading: false,
  error: null,
};

function emailByIdReducer(
  state: EmailByIdState,
  action: EmailByIdAction
): EmailByIdState {
  switch (action.type) {
    case 'RESET':
      return emailByIdInitialState;

    case 'LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOAD_SUCCESS':
      return {
        data: action.data,
        isLoading: false,
        error: null,
      };

    case 'LOAD_ERROR':
      return {
        data: null,
        isLoading: false,
        error: action.error,
      };

    default:
      return state;
  }
}

export function useEmailsByDeudor(
  id_cliente: string,
  id_deudor: string
): UseEmailsByDeudorReturn {
  const resetDeps = useMemo(
    () => [id_cliente, id_deudor] as const,
    [id_cliente, id_deudor]
  );

  const fetcher = useCallback(
    (signal?: AbortSignal) =>
      fetchEmailsByDeudor(id_cliente, id_deudor, signal),
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

export function useCreateEmail(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string
) {
  const create = useCallback(
    async (formData: EmailFormData) => {
      return createEmail(id_cliente, id_deudor, id_usuario, formData);
    },
    [id_cliente, id_deudor, id_usuario]
  );

  return { create };
}

export function useEmailById(idEmail: string | null) {
  const [state, dispatch] = useReducer(
    emailByIdReducer,
    emailByIdInitialState
  );

  useEffect(() => {
    if (!idEmail) {
      dispatch({
        type: 'RESET',
      });

      return;
    }

    const controller = new AbortController();

    dispatch({
      type: 'LOAD_START',
    });

    fetchEmailById(idEmail, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;

        dispatch({
          type: 'LOAD_SUCCESS',
          data,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        dispatch({
          type: 'LOAD_ERROR',
          error:
            err instanceof Error
              ? err.message
              : EMAIL_BY_ID_MESSAGES.loadError,
        });
      });

    return () => {
      controller.abort();
    };
  }, [idEmail]);

  return state;
}