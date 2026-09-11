import {
  fetchPortfolioAdvisorPerformance,
  fetchPortfolioSupervisorPerformance,
} from '../api/portfolioControlCenterApi';
import type {
  AdvisorPerformanceItem,
  PortfolioOperationalContext,
  SupervisorPerformanceItem,
} from '../domain/portfolioOverview.types';
import {
  mapPortfolioAdvisorPerformanceResponse,
  mapPortfolioSupervisorPerformanceResponse,
} from '../mappers/portfolioPerformance.mapper';

export interface PortfolioSupervisorPerformanceData {
  updatedAt: string | null;
  supervisors: readonly SupervisorPerformanceItem[];
}

export interface PortfolioAdvisorPerformanceData {
  updatedAt: string | null;
  advisors: readonly AdvisorPerformanceItem[];
}

export const loadPortfolioSupervisorPerformance = async (
  crmClientId: number,
  context: PortfolioOperationalContext,
  signal: AbortSignal
): Promise<PortfolioSupervisorPerformanceData> => {
  const response = await fetchPortfolioSupervisorPerformance(
    crmClientId,
    context,
    signal
  );

  return {
    updatedAt: response.updatedAt,
    supervisors: mapPortfolioSupervisorPerformanceResponse(response),
  };
};

export const loadPortfolioAdvisorPerformance = async (
  crmClientId: number,
  context: PortfolioOperationalContext,
  supervisorId: string | null,
  signal: AbortSignal
): Promise<PortfolioAdvisorPerformanceData> => {
  const response = await fetchPortfolioAdvisorPerformance(
    crmClientId,
    context,
    supervisorId,
    signal
  );

  return {
    updatedAt: response.updatedAt,
    advisors: mapPortfolioAdvisorPerformanceResponse(response),
  };
};
