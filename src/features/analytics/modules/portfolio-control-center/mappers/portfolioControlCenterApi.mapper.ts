import type {
  AdvisorPerformanceItem,
  CampaignPerformanceItem,
  PortfolioControlCenterData,
  PortfolioControlCenterFilterOptions,
  PortfolioEvolutionPoint,
  PortfolioPerformanceDetailData,
  PortfolioPromiseStatus,
  PortfolioOverduePromisesData,
  PortfolioDueTodayPromisesData,
  PortfolioTargetProgress,
  SupervisorPerformanceItem,
} from '../../../types/portfolioControlCenter.types';
import type {
  PortfolioAdvisorPerformanceApiResponse,
  PortfolioCampaignPerformanceApiResponse,
  PortfolioEvolutionApiResponse,
  PortfolioFilterOptionsApiResponse,
  PortfolioPromisesApiResponse,
  PortfolioOverduePromisesApiResponse,
  PortfolioDueTodayPromisesApiResponse,
  PortfolioSummaryApiResponse,
  PortfolioSupervisorPerformanceApiResponse,
  PortfolioTargetProgressApiResponse,
} from '../api/portfolioControlCenterApi.types';
import {
  buildPortfolioOperationalAttention,
} from '../utils/portfolioAttention.utils';

export const mapPortfolioFilterOptionsResponse = (
  response: PortfolioFilterOptionsApiResponse
): PortfolioControlCenterFilterOptions => {
  return {
    availableDateFrom: response.availableDateFrom,
    availableDateTo: response.availableDateTo,
    portfolio: {
      id: String(response.portfolio.id),
    },
    subPortfolios: response.subPortfolios.map((item) => ({
      id: String(item.id),
      label: item.name,
    })),
    campaigns: response.campaigns.map((item) => ({
      id: item.code,
      label: item.name,
      startDate: item.startDate,
      endDate: item.endDate,
      availableDateFrom: item.availableDateFrom,
      availableDateTo: item.availableDateTo,
    })),
    supervisors: response.supervisors.map((item) => ({
      id: String(item.id),
      label: item.name,
    })),
    availability: {
      subPortfolioCampaigns:
        response.availability.subPortfolioCampaigns.map(
          (item) => ({
            subPortfolioId: String(item.subPortfolioId),
            campaignId: item.campaignCode,
            availableDateFrom: item.availableDateFrom,
            availableDateTo: item.availableDateTo,
          })
        ),
      supervisorContexts:
        response.availability.supervisorContexts.map(
          (item) => ({
            supervisorId: String(item.supervisorId),
            subPortfolioId: String(item.subPortfolioId),
            campaignId: item.campaignCode,
            availableDateFrom: item.availableDateFrom,
            availableDateTo: item.availableDateTo,
          })
        ),
    },
  };
};

export const mapPortfolioTargetProgressResponse = (
  response: PortfolioTargetProgressApiResponse
): PortfolioTargetProgress | null => {
  if (!response.target) {
    return null;
  }

  return {
    monthlyTargetAmount:
      response.target.monthlyTargetAmount,
    expectedToDateAmount:
      response.target.expectedToDateAmount,
    targetAchievementRate:
      response.target.targetAchievementRate,
    paceAchievementRate:
      response.target.paceAchievementRate,
    gapAmount: response.target.gapAmount,
    gapRate: response.target.gapRate,
  };
};

export const mapPortfolioPromisesResponse = (
  response: PortfolioPromisesApiResponse
): PortfolioPromiseStatus => {
  return {
    dueTodayCount: response.promises.dueTodayCount,
    dueTodayAmount: response.promises.dueTodayAmount,
    overdueCount: response.promises.overdueCount,
    fulfillmentRate:
      response.promises.fulfillmentRate,
  };
};


export const mapPortfolioOverduePromisesResponse = (
  response: PortfolioOverduePromisesApiResponse
): PortfolioOverduePromisesData => {
  return {
    asOfDate: response.asOfDate,
    updatedAt: response.updatedAt,
    summary: {
      overdueCount: response.summary.overdueCount,
      overdueAmount: response.summary.overdueAmount,
      outstandingAmount: response.summary.outstandingAmount,
    },
    aging: response.aging.map((item) => ({
      key: item.key,
      label: item.label,
      count: item.count,
      promiseAmount: item.promiseAmount,
      outstandingAmount: item.outstandingAmount,
    })),
    filters: {
      advisors: response.filters.advisors.map((item) => ({
        id: String(item.id),
        name: item.name,
      })),
      supervisors: response.filters.supervisors.map((item) => ({
        id: String(item.id),
        name: item.name,
      })),
    },
    items: response.items.map((item) => ({
      promiseId: String(item.promiseId),
      debtorId: String(item.debtorId),
      dueDate: item.dueDate,
      overdueDays: item.overdueDays,
      promiseAmount: item.promiseAmount,
      paidAmount: item.paidAmount,
      outstandingAmount: item.outstandingAmount,
      agingKey: item.agingKey,
      advisorId:
        item.advisorId === null ? null : String(item.advisorId),
      advisorName: item.advisorName,
      supervisorId:
        item.supervisorId === null
          ? null
          : String(item.supervisorId),
      supervisorName: item.supervisorName,
    })),
  };
};

const getDueTodayStatusLabel = (
  statusKey: 'pending' | 'partial' | 'covered'
): string => {
  switch (statusKey) {
    case 'pending':
      return 'Pendiente';
    case 'partial':
      return 'Pago parcial';
    case 'covered':
      return 'Cubierta';
  }
};

export const mapPortfolioDueTodayPromisesResponse = (
  response: PortfolioDueTodayPromisesApiResponse
): PortfolioDueTodayPromisesData => {
  return {
    asOfDate: response.asOfDate,
    updatedAt: response.updatedAt,
    summary: {
      dueTodayCount: response.summary.dueTodayCount,
      dueTodayAmount: response.summary.dueTodayAmount,
      paidAmount: response.summary.paidAmount,
      outstandingAmount: response.summary.outstandingAmount,
    },
    status: response.status.map((item) => ({
      key: item.key,
      label: item.label,
      count: item.count,
      promiseAmount: item.promiseAmount,
      paidAmount: item.paidAmount,
      outstandingAmount: item.outstandingAmount,
    })),
    items: response.items.map((item) => ({
      promiseId: String(item.promiseId),
      debtorId: String(item.debtorId),
      promiseAmount: item.promiseAmount,
      paidAmount: item.paidAmount,
      outstandingAmount: item.outstandingAmount,
      statusKey: item.statusKey,
      statusLabel: getDueTodayStatusLabel(item.statusKey),
      lastPaymentDate: item.lastPaymentDate,
      advisorId:
        item.advisorId === null ? null : String(item.advisorId),
      advisorName: item.advisorName,
      supervisorId:
        item.supervisorId === null
          ? null
          : String(item.supervisorId),
      supervisorName: item.supervisorName,
    })),
  };
};

export const mapPortfolioEvolutionResponse = (
  response: PortfolioEvolutionApiResponse
): readonly PortfolioEvolutionPoint[] => {
  return response.evolution.map((item) => ({
    period: item.period,
    assignedPortfolio: item.assignedPortfolio,
    managedPortfolio: item.managedPortfolio,
    pendingPortfolio: item.pendingPortfolio,
    recoveredAmount: item.recoveredAmount,
  }));
};

export const mapPortfolioCampaignPerformanceResponse = (
  response: PortfolioCampaignPerformanceApiResponse
): readonly CampaignPerformanceItem[] => {
  return response.campaigns.map((item) => ({
    campaignId: item.campaignCode,
    campaignName: item.campaignName,
    assignedPortfolio: item.assignedPortfolio,
    managedPortfolio: item.managedPortfolio,
    progressRate: item.progressRate,
    managementCount: item.managementCount,
    contactabilityRate: item.contactabilityRate,
    rpcRate: item.rpcRate,
    closeRate: item.closeRate,
    promiseCount: item.promiseCount,
    promiseFulfillmentRate:
      item.promiseFulfillmentRate,
    paymentCount: item.paymentCount,
    recoveredAmount: item.recoveredAmount,
    targetAmount: item.targetAmount,
  }));
};

export const mapPortfolioSupervisorPerformanceResponse = (
  response: PortfolioSupervisorPerformanceApiResponse
): readonly SupervisorPerformanceItem[] => {
  return response.supervisors.map((item) => ({
    supervisorId: String(item.supervisorId),
    supervisorName: item.supervisorName,
    advisorCount: item.advisorCount,
    managementCount: item.managementCount,
    rpcRate: item.rpcRate,
    closeRate: item.closeRate,
    promiseCount: item.promiseCount,
    promiseFulfillmentRate:
      item.promiseFulfillmentRate,
    paymentCount: item.paymentCount,
    attributableRecoveredAmount:
      item.attributableRecoveredAmount,
  }));
};

export const mapPortfolioAdvisorPerformanceResponse = (
  response: PortfolioAdvisorPerformanceApiResponse
): readonly AdvisorPerformanceItem[] => {
  return response.advisors.map((item) => ({
    advisorId: String(item.advisorId),
    advisorName: item.advisorName,
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
    attributableRecoveredAmount:
      item.attributableRecoveredAmount,
  }));
};

const getLatestUpdatedAt = (
  values: readonly (string | null)[]
): string | null => {
  const validValues = values.filter(
    (value): value is string => Boolean(value)
  );

  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce((latest, current) => {
    const latestTimestamp = Date.parse(latest);
    const currentTimestamp = Date.parse(current);

    if (Number.isNaN(currentTimestamp)) {
      return latest;
    }

    if (Number.isNaN(latestTimestamp)) {
      return current;
    }

    return currentTimestamp > latestTimestamp
      ? current
      : latest;
  });
};

export const mapPortfolioPerformanceDetailResponses = (
  supervisorPerformanceResponse: PortfolioSupervisorPerformanceApiResponse,
  advisorPerformanceResponse: PortfolioAdvisorPerformanceApiResponse
): PortfolioPerformanceDetailData => {
  return {
    updatedAt: getLatestUpdatedAt([
      supervisorPerformanceResponse.updatedAt,
      advisorPerformanceResponse.updatedAt,
    ]),
    supervisors: mapPortfolioSupervisorPerformanceResponse(
      supervisorPerformanceResponse
    ),
    advisors: mapPortfolioAdvisorPerformanceResponse(
      advisorPerformanceResponse
    ),
  };
};

export const mapPortfolioOperationalResponses = (
  summaryResponse: PortfolioSummaryApiResponse,
  targetResponse: PortfolioTargetProgressApiResponse,
  promisesResponse: PortfolioPromisesApiResponse,
  evolutionResponse: PortfolioEvolutionApiResponse,
  campaignPerformanceResponse: PortfolioCampaignPerformanceApiResponse,
  supervisorPerformanceResponse: PortfolioSupervisorPerformanceApiResponse,
  advisorPerformanceResponse: PortfolioAdvisorPerformanceApiResponse,
  subPortfolioId: string | null
): PortfolioControlCenterData => {
  const target = mapPortfolioTargetProgressResponse(
    targetResponse
  );
  const promises = mapPortfolioPromisesResponse(
    promisesResponse
  );
  const evolution = mapPortfolioEvolutionResponse(
    evolutionResponse
  );
  const campaigns =
    mapPortfolioCampaignPerformanceResponse(
      campaignPerformanceResponse
    );
  const supervisors =
    mapPortfolioSupervisorPerformanceResponse(
      supervisorPerformanceResponse
    );
  const advisors =
    mapPortfolioAdvisorPerformanceResponse(
      advisorPerformanceResponse
    );

  return {
    context: {
      campaignId: summaryResponse.campaign.code,
      dateFrom: summaryResponse.period.dateFrom,
      dateTo: summaryResponse.period.dateTo,
      subPortfolioId,
    },
    updatedAt: getLatestUpdatedAt([
      summaryResponse.updatedAt,
      targetResponse.updatedAt,
      promisesResponse.updatedAt,
      evolutionResponse.updatedAt,
      campaignPerformanceResponse.updatedAt,
      supervisorPerformanceResponse.updatedAt,
      advisorPerformanceResponse.updatedAt,
    ]),
    summary: {
      assignedPortfolio:
        summaryResponse.summary.assignedPortfolio,
      managedPortfolio:
        summaryResponse.summary.managedPortfolio,
      pendingPortfolio:
        summaryResponse.summary.pendingPortfolio,
      managementCount:
        summaryResponse.summary.managementCount,
      managementIntensity:
        summaryResponse.summary.managementIntensity,
      recoveredAmount:
        summaryResponse.summary.recoveredAmount,
      contactabilityRate:
        summaryResponse.summary.contactabilityRate,
      rpcRate: summaryResponse.summary.rpcRate,
      closeRate: summaryResponse.summary.closeRate,
      promiseCount:
        summaryResponse.summary.promiseCount,
      promiseFulfillmentRate:
        summaryResponse.summary.promiseFulfillmentRate,
      paymentCount:
        summaryResponse.summary.paymentCount,
    },
    target,
    promises,
    evolution,
    campaigns,
    supervisors,
    advisors,
    attention: buildPortfolioOperationalAttention(
      target,
      promises
    ),
  };
};
