import { useCallback } from 'react';

import { useAsyncResource } from '@shared/hooks/useAsyncResource';

import { loadEvolucionComparativaCartera } from '../application/evolucionCarteraComparativa.application';
import type { EvolucionCarteraComparison } from '../domain/evolucionCartera.types';
import type { PortfolioOperationalContext } from '../domain/panoramaCartera.types';

const ERROR_MESSAGE =
  'No se pudo cargar la comparación histórica de evolución.';

export const useEvolucionComparativaCartera = (
  crmClientId: number,
  context: PortfolioOperationalContext | null
) => {
  const loader = useCallback(
    (signal: AbortSignal) => {
      if (context === null) {
        return Promise.reject(new Error(ERROR_MESSAGE));
      }

      return loadEvolucionComparativaCartera(
        crmClientId,
        context,
        signal
      );
    }, [crmClientId, context]
  );

  return useAsyncResource<EvolucionCarteraComparison | null>({
    loader,
    resourceKey: [
      crmClientId,
      context?.businessUnit ?? null,
      context?.campaignId ?? null,
      context?.dateFrom ?? null,
      context?.dateTo ?? null,
      context?.subPortfolioId ?? null,
    ],
    initialData: null,
    initialLoading: false,
    errorMessage: ERROR_MESSAGE,
    enabled: context !== null,
  });
};
