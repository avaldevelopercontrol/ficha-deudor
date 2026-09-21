import { useCallback } from 'react';

import { useApiResource } from '@shared/hooks/useApiResource';

import { fetchAdicionalMaf } from '../api/adicionalMafApi';
import { ADICIONAL_MAF_API_MESSAGES } from '../constants/adicionalMafPopup.constants';
import type { AdicionalMaf } from '../types/adicionalMaf.types';

interface UseAdicionalMafParams {
  idDeudor: string;
  idCartera: string;
  idCliente: string;
}

interface UseAdicionalMafReturn {
  data: AdicionalMaf | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdicionalMaf = ({
  idDeudor,
  idCartera,
  idCliente,
}: UseAdicionalMafParams): UseAdicionalMafReturn => {
  const canLoad = Boolean(
    idDeudor && idCartera && idCliente
  );

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      fetchAdicionalMaf(
        {
          idDeudor,
          idCartera,
          idCliente,
        },
        signal
      ),
    [idCartera, idCliente, idDeudor]
  );

  const resource = useApiResource<AdicionalMaf>(
    fetcher,
    [idDeudor, idCartera, idCliente],
    {
      enabled: canLoad,
      initialLoading: canLoad,
      errorMessage: ADICIONAL_MAF_API_MESSAGES.loadError,
    }
  );

  return resource;
};
