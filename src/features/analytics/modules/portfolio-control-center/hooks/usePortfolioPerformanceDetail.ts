import { useCallback } from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';
import type {
  PortfolioOperationalContext,
  PortfolioPerformanceDetailData,
} from '../../../types/portfolioControlCenter.types';
import {
  loadPortfolioPerformanceDetail,
} from '../services/portfolioControlCenter.service';

interface UsePortfolioPerformanceDetailParams {
  context: PortfolioOperationalContext | null;
  supervisorId: string | null;
  enabled?: boolean;
}

export const usePortfolioPerformanceDetail = ({
  context,
  supervisorId,
  enabled = true,
}: UsePortfolioPerformanceDetailParams) => {
  const canLoad = Boolean(
    enabled && context && supervisorId
  );

  const loader = useCallback(
    (signal: AbortSignal) => {
      if (!context || !supervisorId) {
        return Promise.reject(
          new Error(
            'El contexto de supervisor no está disponible.'
          )
        );
      }

      return loadPortfolioPerformanceDetail(
        context,
        supervisorId,
        signal
      );
    }, [context, supervisorId]
  );

  return useAsyncResource<
    PortfolioPerformanceDetailData | null
  >({
    loader,
    resourceKey: [
      context?.campaignId,
      context?.dateFrom,
      context?.dateTo,
      context?.subPortfolioId,
      supervisorId,
    ],
    initialData: null,
    initialLoading: false,
    enabled: canLoad,
    errorMessage:
      'No se pudo cargar el detalle del supervisor seleccionado.',
  });
};
