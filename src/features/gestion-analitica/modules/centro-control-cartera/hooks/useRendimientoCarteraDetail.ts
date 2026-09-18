import { useCallback } from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';
import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import {
  loadRendimientoAsesorCartera,
  loadRendimientoSupervisorCartera,
  type RendimientoAsesorCarteraData,
  type RendimientoSupervisorCarteraData,
} from '../application/rendimientoCartera.application';

interface BasePerformanceParams {
  crmClientId: number;
  context: PortfolioOperationalContext | null;
  enabled?: boolean;
}

interface UseRendimientoAsesorCarteraParams
  extends BasePerformanceParams {
  supervisorId: string | null;
}

export const useRendimientoSupervisorCartera = ({
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

      return loadRendimientoSupervisorCartera(
        crmClientId,
        context,
        signal
      );
    }, [crmClientId, context]
  );

  return useAsyncResource<
    RendimientoSupervisorCarteraData | null
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

export const useRendimientoAsesorCartera = ({
  crmClientId,
  context,
  supervisorId,
  enabled = true,
}: UseRendimientoAsesorCarteraParams) => {
  const loader = useCallback(
    (signal: AbortSignal) => {
      if (!context) {
        return Promise.reject(
          new Error(
            'El contexto de rendimiento no está disponible.'
          )
        );
      }

      return loadRendimientoAsesorCartera(
        crmClientId,
        context,
        supervisorId,
        signal
      );
    }, [crmClientId, context, supervisorId]
  );

  return useAsyncResource<
    RendimientoAsesorCarteraData | null
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
