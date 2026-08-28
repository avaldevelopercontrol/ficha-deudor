import {
  useCallback,
} from 'react';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';
import {
  fetchInfDeudorCabeceraFalse,
  fetchInfDeudorCabeceraTrue,
  fetchInfDeudorParams,
} from '../api/infDeudorApi';
import type { InfDeudorTableRow } from '../types/infDeudor.types';
import { INF_DEUDOR_POPUP_MESSAGES } from '../constants/infDeudorPopup.constants';
import { mapInfDeudorApiToTableRows } from '../mappers/infDeudor.mapper';

interface UseInfDeudorReturn {
  rows: InfDeudorTableRow[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInfDeudor(
  id_deudor: string
): UseInfDeudorReturn {
  const fetcher = useCallback(
    async (
      signal: AbortSignal
    ): Promise<InfDeudorTableRow[]> => {
      const [
        cabeceraPrincipal,
        cabeceraAdicional,
        valoresDeudor,
      ] = await Promise.all([
        fetchInfDeudorCabeceraFalse(signal),
        fetchInfDeudorCabeceraTrue(signal),
        fetchInfDeudorParams(
          { idDeudor: id_deudor },
          signal
        ),
      ]);

      return mapInfDeudorApiToTableRows(
        cabeceraPrincipal,
        cabeceraAdicional,
        valoresDeudor
      );
    },
    [id_deudor]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiResource<InfDeudorTableRow[]>(
    fetcher,
    [id_deudor],
    {
      enabled: Boolean(id_deudor),
      initialLoading: false,
      errorMessage:
        INF_DEUDOR_POPUP_MESSAGES.loadError,
      clearDataOnError: false,
      resetDataWhenDisabled: false,
    }
  );

  return {
    rows: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
