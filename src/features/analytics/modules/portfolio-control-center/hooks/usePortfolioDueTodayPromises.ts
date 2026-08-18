import { useCallback } from 'react';

import { useAsyncResource } from '@shared/hooks/useAsyncResource';

import type {
  PortfolioDueTodayPromisesData,
  PortfolioOperationalContext,
} from '../../../types/portfolioControlCenter.types';
import { loadPortfolioDueTodayPromises } from '../services/portfolioControlCenter.service';

interface UsePortfolioDueTodayPromisesParams {
  context: Pick<
    PortfolioOperationalContext,
    'campaignId' | 'subPortfolioId'
  > | null;
  enabled: boolean;
}

export const usePortfolioDueTodayPromises = ({
  context,
  enabled,
}: UsePortfolioDueTodayPromisesParams) => {
  const loader = useCallback(
    (signal: AbortSignal) => {
      if (!context) {
        return Promise.resolve<PortfolioDueTodayPromisesData | null>(
          null
        );
      }

      return loadPortfolioDueTodayPromises(
        context,
        signal
      );
    }, [context]
  );

  return useAsyncResource<PortfolioDueTodayPromisesData | null>({
    loader,
    resourceKey: [
      context?.campaignId ?? null,
      context?.subPortfolioId ?? null,
    ],
    initialData: null,
    initialLoading: enabled,
    errorMessage:
      'No se pudo cargar el detalle de promesas con vencimiento hoy.',
    enabled: enabled && context !== null,
    resetDataWhenDisabled: true,
  });
};
