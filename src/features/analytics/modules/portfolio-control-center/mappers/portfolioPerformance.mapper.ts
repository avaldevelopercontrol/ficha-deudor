import type {
  PortfolioAdvisorPerformanceApiResponse,
  PortfolioEvolutionApiResponse,
  PortfolioSupervisorPerformanceApiResponse,
} from '../api/portfolioControlCenterApi.types';
import type {
  AdvisorPerformanceItem,
  PortfolioEvolutionPoint,
  SupervisorPerformanceItem,
} from '../domain/portfolioOverview.types';

export const mapPortfolioEvolutionResponse = (
  response: PortfolioEvolutionApiResponse
): readonly PortfolioEvolutionPoint[] =>
  response.evolution.map((item) => ({
    period: item.period,
    assignedPortfolio: item.assignedPortfolio,
    managedPortfolio: item.managedPortfolio,
    pendingPortfolio: item.pendingPortfolio,
    recoveredAmount: item.recoveredAmount,
  }));

export const mapPortfolioSupervisorPerformanceResponse = (
  response: PortfolioSupervisorPerformanceApiResponse
): readonly SupervisorPerformanceItem[] =>
  response.supervisors.map((item) => ({
    supervisorId: String(item.supervisorId),
    supervisorName: item.supervisorName,
    advisorCount: item.advisorCount,
    managementCount: item.managementCount,
    rpcRate: item.rpcRate,
    closeRate: item.closeRate,
    promiseCount: item.promiseCount,
    promiseFulfillmentRate: item.promiseFulfillmentRate,
    paymentCount: item.paymentCount,
    attributableRecoveredAmount: item.attributableRecoveredAmount,
  }));

export const mapPortfolioAdvisorPerformanceResponse = (
  response: PortfolioAdvisorPerformanceApiResponse
): readonly AdvisorPerformanceItem[] =>
  response.advisors.map((item) => ({
    advisorId: String(item.advisorId),
    advisorName: item.advisorName,
    periodSupervisorId:
      item.periodSupervisorId === null
        ? null
        : String(item.periodSupervisorId),
    periodSupervisorName: item.periodSupervisorName,
    currentSupervisorId:
      item.currentSupervisorId === null
        ? null
        : String(item.currentSupervisorId),
    currentSupervisorName: item.currentSupervisorName,
    managementCount: item.managementCount,
    rpcRate: item.rpcRate,
    closeRate: item.closeRate,
    promiseCount: item.promiseCount,
    paymentCount: item.paymentCount,
    attributableRecoveredAmount: item.attributableRecoveredAmount,
  }));
