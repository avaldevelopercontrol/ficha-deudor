import type {
  RendimientoAsesorCarteraApiResponse,
  EvolucionCarteraApiResponse,
  RendimientoSupervisorCarteraApiResponse,
} from '../api/centroControlCarteraApi.types';
import type {
  AdvisorPerformanceItem,
  EvolucionCarteraPoint,
  SupervisorPerformanceItem,
} from '../domain/panoramaCartera.types';

export const mapEvolucionCarteraResponse = (
  response: EvolucionCarteraApiResponse
): readonly EvolucionCarteraPoint[] =>
  response.evolution.map((item) => ({
    period: item.period,
    assignedPortfolio: item.assignedPortfolio,
    managedPortfolio: item.managedPortfolio,
    pendingPortfolio: item.pendingPortfolio,
    recoveredAmount: item.recoveredAmount,
  }));

export const mapRendimientoSupervisorCarteraResponse = (
  response: RendimientoSupervisorCarteraApiResponse
): readonly SupervisorPerformanceItem[] =>
  response.supervisors.map((item) => ({
    supervisorId: String(item.supervisorId),
    supervisorName: item.supervisorName,
    advisorCount: item.advisorCount,
    managementCount: item.managementCount,
    managedDebtorCount: item.managedDebtorCount,
    rpcRate: item.rpcRate,
    closeRate: item.closeRate,
    promiseCount: item.promiseCount,
    promiseFulfillmentRate: item.promiseFulfillmentRate,
    paymentCount: item.paymentCount,
    attributableRecoveredAmount: item.attributableRecoveredAmount,
  }));

export const mapRendimientoAsesorCarteraResponse = (
  response: RendimientoAsesorCarteraApiResponse
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
    managedDebtorCount: item.managedDebtorCount,
    rpcRate: item.rpcRate,
    closeRate: item.closeRate,
    promiseCount: item.promiseCount,
    paymentCount: item.paymentCount,
    attributableRecoveredAmount: item.attributableRecoveredAmount,
  }));
