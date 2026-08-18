import { useCallback } from 'react';

import { useAsyncResource } from '@shared/hooks/useAsyncResource';

import type {
  PortfolioOperationalContext,
  PortfolioOverduePromisesData,
} from '../../../types/portfolioControlCenter.types';
import { loadPortfolioOverduePromises } from '../services/portfolioControlCenter.service';

interface UsePortfolioOverduePromisesParams {
  context: Pick<
    PortfolioOperationalContext,
    'campaignId' | 'subPortfolioId'
  > | null;
  enabled: boolean;
}

export const usePortfolioOverduePromises = ({
  context,
  enabled,
}: UsePortfolioOverduePromisesParams) => {
  const loader = useCallback(
    (signal: AbortSignal) => {
      if (!context) {
        return Promise.resolve<PortfolioOverduePromisesData | null>(
          null
        );
      }

      return loadPortfolioOverduePromises(
        context,
        signal
      );
    }, [context]
  );

  return useAsyncResource<PortfolioOverduePromisesData | null>({
    loader,
    resourceKey: [
      context?.campaignId ?? null,
      context?.subPortfolioId ?? null,
    ],
    initialData: null,
    initialLoading: enabled,
    errorMessage:
      'No se pudo cargar el detalle de promesas vencidas.',
    enabled: enabled && context !== null,
    resetDataWhenDisabled: true,
  });
};
