import {
  fetchRendimientoAsesorCartera,
  fetchRendimientoSupervisorCartera,
} from '../api/centroControlCarteraApi';
import type {
  AdvisorPerformanceItem,
  PortfolioOperationalContext,
  SupervisorPerformanceItem,
} from '../domain/panoramaCartera.types';
import {
  mapRendimientoAsesorCarteraResponse,
  mapRendimientoSupervisorCarteraResponse,
} from '../mappers/rendimientoCartera.mapper';

export interface RendimientoSupervisorCarteraData {
  updatedAt: string | null;
  supervisors: readonly SupervisorPerformanceItem[];
}

export interface RendimientoAsesorCarteraData {
  updatedAt: string | null;
  advisors: readonly AdvisorPerformanceItem[];
}

export const loadRendimientoSupervisorCartera = async (
  crmClientId: number,
  context: PortfolioOperationalContext,
  signal: AbortSignal
): Promise<RendimientoSupervisorCarteraData> => {
  const response = await fetchRendimientoSupervisorCartera(
    crmClientId,
    context,
    signal
  );

  return {
    updatedAt: response.updatedAt,
    supervisors: mapRendimientoSupervisorCarteraResponse(response),
  };
};

export const loadRendimientoAsesorCartera = async (
  crmClientId: number,
  context: PortfolioOperationalContext,
  supervisorId: string | null,
  signal: AbortSignal
): Promise<RendimientoAsesorCarteraData> => {
  const response = await fetchRendimientoAsesorCartera(
    crmClientId,
    context,
    supervisorId,
    signal
  );

  return {
    updatedAt: response.updatedAt,
    advisors: mapRendimientoAsesorCarteraResponse(response),
  };
};
