import type {
  AdvisorPerformanceItem,
  CampaignPerformanceItem,
  PortfolioControlCenterData,
  PortfolioControlCenterFilterOptions,
  PortfolioEvolutionPoint,
  PortfolioPromiseStatus,
  PortfolioOverduePromisesData,
  PortfolioDueTodayPromisesData,
  PortfolioTargetProgress,
  SupervisorPerformanceItem,
} from '../../../types/portfolioControlCenter.types';
import type {
  PortfolioAdvisorPerformanceApiResponse,
  PortfolioEvolutionApiResponse,
  PortfolioFilterOptionsApiResponse,
  PortfolioPromisesApiResponse,
  PortfolioOverduePromisesApiResponse,
  PortfolioOverviewApiResponse,
  PortfolioDueTodayPromisesApiResponse,
  PortfolioSummaryApiResponse,
  PortfolioSupervisorPerformanceApiResponse,
  PortfolioTargetProgressApiResponse,
} from '../api/portfolioControlCenterApi.types';
import {
  buildPortfolioOperationalAttention,
} from '../utils/portfolioAttention.utils';

const getCampaignCalendarPartFromCode = (
  campaignCode: string
): { year: number; month: number } | null => {
  const match = /^(\d{4})-(\d{1,2})$/.exec(campaignCode);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return { year, month };
};

const getCampaignCalendarPartFromDate = (
  date: string
): { year: number; month: number } | null => {
  const match = /^(\d{4})-(\d{2})-\d{2}/.exec(date);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return { year, month };
};

const resolveCampaignCalendarParts = (campaign: {
  code: string;
  year?: number;
  month?: number;
  startDate: string;
  endDate: string;
  availableDateFrom: string;
}): { year: number; month: number } => {
  if (
    Number.isInteger(campaign.year) &&
    Number.isInteger(campaign.month) &&
    (campaign.month ?? 0) >= 1 &&
    (campaign.month ?? 0) <= 12
  ) {
    return {
      year: campaign.year as number,
      month: campaign.month as number,
    };
  }

  const fallback =
    getCampaignCalendarPartFromCode(campaign.code) ??
    getCampaignCalendarPartFromDate(campaign.startDate) ??
    getCampaignCalendarPartFromDate(campaign.endDate) ??
    getCampaignCalendarPartFromDate(
      campaign.availableDateFrom
    );

  if (!fallback) {
    throw new Error(
      `Campaña sin año/mes válido: ${campaign.code}`
    );
  }

  return fallback;
};

export const mapPortfolioFilterOptionsResponse = (
  response: PortfolioFilterOptionsApiResponse
): PortfolioControlCenterFilterOptions => {
  return {
    availableDateFrom: response.availableDateFrom,
    availableDateTo: response.availableDateTo,
    portfolio: {
      id: String(response.portfolio.id),
    },
    businessUnits: (response.businessUnits ?? []).map((item) => ({
      id: item.code.trim(),
      label: item.name.trim(),
    })),
    selectedBusinessUnit:
      response.selectedBusinessUnit?.trim() ?? null,
    subPortfolios: response.subPortfolios.map((item) => ({
      id: String(item.id),
      label: item.name,
    })),
    campaigns: response.campaigns.map((item) => {
      const { year, month } =
        resolveCampaignCalendarParts(item);

      return {
        id: item.code,
        label: item.name,
        year,
        month,
        startDate: item.startDate,
        endDate: item.endDate,
        availableDateFrom: item.availableDateFrom,
        availableDateTo: item.availableDateTo,
      };
    }),
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



const mapPortfolioPagination = (
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  } | undefined,
  itemCount: number
) =>
  pagination ?? {
    page: 1,
    pageSize: itemCount || 1,
    totalItems: itemCount,
    totalPages: itemCount > 0 ? 1 : 0,
    hasPreviousPage: false,
    hasNextPage: false,
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
    pagination: mapPortfolioPagination(
      response.pagination,
      response.items.length
    ),
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
    pagination: mapPortfolioPagination(
      response.pagination,
      response.items.length
    ),
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

const roundPercentageLikeSql = (
  value: number
): number =>
  Math.round(value * 10_000) / 10_000;

const mapSelectedCampaignFromOperationalResponses = (
  summaryResponse: PortfolioSummaryApiResponse,
  target: PortfolioTargetProgress | null,
  subPortfolioId: string | null
): CampaignPerformanceItem => {
  const summary = summaryResponse.summary;

  return {
    campaignId: summaryResponse.campaign.code,
    campaignName: summaryResponse.campaign.name,
    assignedPortfolio: summary.assignedPortfolio,
    managedPortfolio: summary.managedPortfolio,
    progressRate:
      summary.assignedPortfolio > 0
        ? roundPercentageLikeSql(
            (summary.managedPortfolio /
              summary.assignedPortfolio) *
              100
          )
        : null,
    managementCount: summary.managementCount,
    contactabilityRate: summary.contactabilityRate,
    rpcRate: summary.rpcRate,
    closeRate: summary.closeRate,
    promiseCount: summary.promiseCount,
    promiseFulfillmentRate:
      summary.promiseFulfillmentRate,
    paymentCount: summary.paymentCount,
    recoveredAmount: summary.recoveredAmount,
    targetAmount:
      subPortfolioId === null
        ? target?.monthlyTargetAmount ?? null
        : null,
  };
};

export const mapPortfolioOperationalResponses = (
  summaryResponse: PortfolioSummaryApiResponse,
  targetResponse: PortfolioTargetProgressApiResponse,
  promisesResponse: PortfolioPromisesApiResponse,
  evolutionResponse: PortfolioEvolutionApiResponse,
  subPortfolioId: string | null,
  businessUnit: string | null = null
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
  const campaigns = [
    mapSelectedCampaignFromOperationalResponses(
      summaryResponse,
      target,
      subPortfolioId
    ),
  ];

  return {
    context: {
      businessUnit,
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
    ]),
    freshness: {
      operationAsOfAt:
        summaryResponse.freshness?.operationAsOfAt ?? null,
      portfolioBaseRefreshedAt:
        summaryResponse.freshness?.portfolioBaseRefreshedAt ?? null,
      refreshedAt:
        summaryResponse.freshness?.refreshedAt ?? null,
    },
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
    supervisors: [],
    advisors: [],
    attention: buildPortfolioOperationalAttention(
      target,
      promises
    ),
  };
};

export const mapPortfolioOverviewResponse = (
  response: PortfolioOverviewApiResponse,
  subPortfolioId: string | null,
  businessUnit: string | null = null
): PortfolioControlCenterData =>
  mapPortfolioOperationalResponses(
    response.summary,
    response.targetProgress,
    response.promises,
    response.evolution,
    subPortfolioId,
    businessUnit
  );
