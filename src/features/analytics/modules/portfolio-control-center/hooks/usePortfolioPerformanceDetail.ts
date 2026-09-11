import { useCallback } from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';
import type {
  PortfolioOperationalContext,
} from '../domain/portfolioOverview.types';
import {
  loadPortfolioAdvisorPerformance,
  loadPortfolioSupervisorPerformance,
  type PortfolioAdvisorPerformanceData,
  type PortfolioSupervisorPerformanceData,
} from '../application/portfolioPerformance.application';

interface BasePerformanceParams {
  crmClientId: number;
  context: PortfolioOperationalContext | null;
  enabled?: boolean;
}

interface UsePortfolioAdvisorPerformanceParams
  extends BasePerformanceParams {
  supervisorId: string | null;
}

export const usePortfolioSupervisorPerformance = ({
  crmClientId,
  context,
  enabled = true,
}: BasePerformanceParams) => {
  const loader = useCallback(
    (signal: AbortSignal) => {
      if (!context) {
        return Promise.reject(
          new Error(
            'El contexto de rendimiento no está disponible.'
          )
        );
      }

      return loadPortfolioSupervisorPerformance(
        crmClientId,
        context,
        signal
      );
    }, [crmClientId, context]
  );

  return useAsyncResource<
    PortfolioSupervisorPerformanceData | null
  >({
    loader,
    resourceKey: [
      crmClientId,
      context?.businessUnit,
      context?.campaignId,
      context?.dateFrom,
      context?.dateTo,
      context?.subPortfolioId,
      'supervisors',
    ],
    initialData: null,
    initialLoading: false,
    enabled: Boolean(enabled && context),
    errorMessage:
      'No se pudo cargar el rendimiento de supervisores.',
  });
};

export const usePortfolioAdvisorPerformance = ({
  crmClientId,
  context,
  supervisorId,
  enabled = true,
}: UsePortfolioAdvisorPerformanceParams) => {
  const loader = useCallback(
    (signal: AbortSignal) => {
      if (!context) {
        return Promise.reject(
          new Error(
            'El contexto de rendimiento no está disponible.'
          )
        );
      }

      return loadPortfolioAdvisorPerformance(
        crmClientId,
        context,
        supervisorId,
        signal
      );
    }, [crmClientId, context, supervisorId]
  );

  return useAsyncResource<
    PortfolioAdvisorPerformanceData | null
  >({
    loader,
    resourceKey: [
      crmClientId,
      context?.businessUnit,
      context?.campaignId,
      context?.dateFrom,
      context?.dateTo,
      context?.subPortfolioId,
      supervisorId,
      'advisors',
    ],
    initialData: null,
    initialLoading: false,
    enabled: Boolean(enabled && context),
    errorMessage: supervisorId
      ? 'No se pudo cargar el detalle del supervisor seleccionado.'
      : 'No se pudo cargar el rendimiento de asesores.',
  });
};
