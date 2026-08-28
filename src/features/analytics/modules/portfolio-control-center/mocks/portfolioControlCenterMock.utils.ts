import type {
  AdvisorPerformanceItem,
  CampaignPerformanceItem,
  PortfolioAttentionItem,
  PortfolioControlCenterData,
  PortfolioControlCenterFilters,
  PortfolioPromiseStatus,
  PortfolioSummaryMetrics,
  PortfolioTargetProgress,
  SupervisorPerformanceItem,
} from '../../../types/portfolioControlCenter.types';
import {
  calculatePortfolioRate,
} from '../utils/portfolioControlCenter.formatters';
import {
  calculateExpectedRecoveryAmount,
} from '../utils/portfolioTargetCurve.utils';
import {
  PORTFOLIO_CONTROL_CENTER_MOCK,
} from './portfolioControlCenter.mock';
import type {
  SupervisorPerformanceMockItem,
} from './portfolioControlCenter.mock';
import {
  PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK,
} from './portfolioControlCenterFilterOptions.mock';

const DUE_TODAY_PROMISE_RATIO = 1430 / 8450;
const OVERDUE_PROMISE_RATIO = 690 / 8450;
const DUE_TODAY_AVERAGE_AMOUNT = 286400 / 1430;

const sumBy = <T>(
  items: readonly T[],
  selector: (item: T) => number
): number =>
  items.reduce(
    (total, item) => total + selector(item),
    0
  );

const roundCurrency = (value: number): number =>
  Math.round(value * 100) / 100;

const roundRate = (value: number): number =>
  Math.round(value * 100) / 100;

interface PortfolioDateRatios {
  assigned: number;
  managed: number;
  recovered: number;
}

const getCutoffContext = (
  filters: PortfolioControlCenterFilters
): {
  period: string;
  ratios: PortfolioDateRatios;
} | null => {
  if (
    filters.dateFrom &&
    filters.dateTo &&
    filters.dateFrom > filters.dateTo
  ) {
    return null;
  }

  const evolution =
    PORTFOLIO_CONTROL_CENTER_MOCK.evolution;
  const current = evolution[evolution.length - 1];
  const cutoff = filters.dateTo
    ? evolution.find(
        (item) => item.period === filters.dateTo
      )
    : current;

  if (!current || !cutoff) {
    return null;
  }

  return {
    period: cutoff.period,
    ratios: {
      assigned:
        current.assignedPortfolio > 0
          ? cutoff.assignedPortfolio /
            current.assignedPortfolio
          : 0,
      managed:
        current.managedPortfolio > 0
          ? cutoff.managedPortfolio /
            current.managedPortfolio
          : 0,
      recovered:
        current.recoveredAmount > 0
          ? cutoff.recoveredAmount /
            current.recoveredAmount
          : 0,
    },
  };
};

const scaleCampaign = (
  item: CampaignPerformanceItem,
  ratios: PortfolioDateRatios
): CampaignPerformanceItem => {
  const assignedPortfolio = Math.round(
    item.assignedPortfolio * ratios.assigned
  );
  const managedPortfolio = Math.round(
    item.managedPortfolio * ratios.managed
  );

  return {
    ...item,
    assignedPortfolio,
    managedPortfolio,
    progressRate: calculatePortfolioRate(
      managedPortfolio,
      assignedPortfolio
    ),
    managementCount: Math.round(
      item.managementCount * ratios.managed
    ),
    promiseCount: Math.round(
      item.promiseCount * ratios.managed
    ),
    paymentCount: Math.round(
      item.paymentCount * ratios.managed
    ),
    recoveredAmount: roundCurrency(
      item.recoveredAmount * ratios.recovered
    ),
  };
};

const scaleSupervisor = (
  item: SupervisorPerformanceMockItem,
  ratios: PortfolioDateRatios
): SupervisorPerformanceMockItem => {
  const assignedPortfolio = Math.round(
    item.assignedPortfolio * ratios.assigned
  );
  const managedPortfolio = Math.round(
    item.managedPortfolio * ratios.managed
  );

  return {
    ...item,
    assignedPortfolio,
    managedPortfolio,
    managementCount: Math.round(
      item.managementCount * ratios.managed
    ),
    progressRate: calculatePortfolioRate(
      managedPortfolio,
      assignedPortfolio
    ),
    promiseCount: Math.round(
      item.promiseCount * ratios.managed
    ),
    paymentCount: Math.round(
      item.paymentCount * ratios.managed
    ),
    attributableRecoveredAmount: roundCurrency(
      item.attributableRecoveredAmount * ratios.recovered
    ),
  };
};

const scaleAdvisor = (
  item: AdvisorPerformanceItem,
  ratios: PortfolioDateRatios
): AdvisorPerformanceItem => ({
  ...item,
  managementCount: Math.round(
    item.managementCount * ratios.managed
  ),
  promiseCount: Math.round(
    item.promiseCount * ratios.managed
  ),
  paymentCount: Math.round(
    item.paymentCount * ratios.managed
  ),
  attributableRecoveredAmount: roundCurrency(
    item.attributableRecoveredAmount *
      ratios.recovered
  ),
});

const getAllowedCampaignIds = (
  filters: PortfolioControlCenterFilters
): Set<string> => {
  const { campaigns, availability } =
    PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK;

  return new Set(
    campaigns
      .filter((campaign) => {
        if (
          filters.campaignId &&
          campaign.id !== filters.campaignId
        ) {
          return false;
        }

        if (filters.subPortfolioId) {
          const isAvailableForPortfolio =
            availability.subPortfolioCampaigns.some(
              (item) =>
                item.subPortfolioId ===
                  filters.subPortfolioId &&
                item.campaignId === campaign.id
            );

          if (!isAvailableForPortfolio) {
            return false;
          }
        }

        if (filters.supervisorId) {
          return availability.supervisorContexts.some(
            (item) =>
              item.supervisorId ===
                filters.supervisorId &&
              item.campaignId === campaign.id &&
              (!filters.subPortfolioId ||
                item.subPortfolioId ===
                  filters.subPortfolioId)
          );
        }

        return true;
      })
      .map((item) => item.id)
  );
};

const filterCampaigns = (
  filters: PortfolioControlCenterFilters,
  ratios: PortfolioDateRatios
): readonly CampaignPerformanceItem[] => {
  const allowedIds = getAllowedCampaignIds(filters);

  return PORTFOLIO_CONTROL_CENTER_MOCK.campaigns
    .filter((item) =>
      allowedIds.has(item.campaignId)
    )
    .map((item) => scaleCampaign(item, ratios));
};

const filterSupervisors = (
  filters: PortfolioControlCenterFilters,
  allowedCampaignIds: ReadonlySet<string>,
  ratios: PortfolioDateRatios
): readonly SupervisorPerformanceMockItem[] => {
  const { availability } =
    PORTFOLIO_CONTROL_CENTER_FILTER_OPTIONS_MOCK;

  const allowedSupervisorIds = new Set(
    availability.supervisorContexts
      .filter((item) => {
        if (!allowedCampaignIds.has(item.campaignId)) {
          return false;
        }

        if (
          filters.subPortfolioId &&
          item.subPortfolioId !== filters.subPortfolioId
        ) {
          return false;
        }

        return (
          !filters.supervisorId ||
          item.supervisorId === filters.supervisorId
        );
      })
      .map((item) => item.supervisorId)
  );

  return PORTFOLIO_CONTROL_CENTER_MOCK.supervisors
    .filter((item) =>
      allowedSupervisorIds.has(item.supervisorId)
    )
    .map((item) => scaleSupervisor(item, ratios));
};

const filterAdvisors = (
  supervisors: readonly SupervisorPerformanceItem[],
  ratios: PortfolioDateRatios
): readonly AdvisorPerformanceItem[] => {
  const allowedSupervisorIds = new Set(
    supervisors.map((item) => item.supervisorId)
  );

  return PORTFOLIO_CONTROL_CENTER_MOCK.advisors
    .filter((item) =>
      item.currentSupervisorId !== null &&
      allowedSupervisorIds.has(item.currentSupervisorId)
    )
    .map((item) => scaleAdvisor(item, ratios));
};

const getWeightedRate = <T>(
  items: readonly T[],
  valueSelector: (item: T) => number | null,
  weightSelector: (item: T) => number
): number | null => {
  const evaluableItems = items.filter(
    (item) => valueSelector(item) !== null
  );
  const totalWeight = sumBy(
    evaluableItems,
    weightSelector
  );

  if (totalWeight === 0) {
    return null;
  }

  return (
    sumBy(evaluableItems, (item) => {
      const value = valueSelector(item);

      return (value ?? 0) * weightSelector(item);
    }) / totalWeight
  );
};

const buildCampaignSummary = (
  campaigns: readonly CampaignPerformanceItem[]
): PortfolioSummaryMetrics => {
  const assignedPortfolio = sumBy(
    campaigns,
    (item) => item.assignedPortfolio
  );
  const managedPortfolio = sumBy(
    campaigns,
    (item) => item.managedPortfolio
  );
  const managementCount = sumBy(
    campaigns,
    (item) => item.managementCount
  );

  return {
    assignedPortfolio,
    managedPortfolio,
    pendingPortfolio:
      assignedPortfolio - managedPortfolio,
    managementCount,
    managementIntensity:
      managedPortfolio > 0
        ? managementCount / managedPortfolio
        : 0,
    recoveredAmount: roundCurrency(
      sumBy(
        campaigns,
        (item) => item.recoveredAmount
      )
    ),
    contactabilityRate: getWeightedRate(
      campaigns,
      (item) => item.contactabilityRate,
      (item) => item.managementCount
    ),
    rpcRate: getWeightedRate(
      campaigns,
      (item) => item.rpcRate,
      (item) => item.managementCount
    ),
    closeRate: getWeightedRate(
      campaigns,
      (item) => item.closeRate,
      (item) => item.managementCount
    ),
    promiseCount: sumBy(
      campaigns,
      (item) => item.promiseCount
    ),
    promiseFulfillmentRate: getWeightedRate(
      campaigns,
      (item) => item.promiseFulfillmentRate,
      (item) => item.promiseCount
    ),
    paymentCount: sumBy(
      campaigns,
      (item) => item.paymentCount
    ),
  };
};

const buildSupervisorSummary = (
  supervisor: SupervisorPerformanceMockItem
): PortfolioSummaryMetrics => ({
  assignedPortfolio: supervisor.assignedPortfolio,
  managedPortfolio: supervisor.managedPortfolio,
  pendingPortfolio:
    supervisor.assignedPortfolio -
    supervisor.managedPortfolio,
  managementCount: supervisor.managementCount,
  managementIntensity:
    supervisor.managedPortfolio > 0
      ? supervisor.managementCount /
        supervisor.managedPortfolio
      : 0,
  recoveredAmount:
    supervisor.attributableRecoveredAmount,
  contactabilityRate: supervisor.contactabilityRate,
  rpcRate: supervisor.rpcRate,
  closeRate: supervisor.closeRate,
  promiseCount: supervisor.promiseCount,
  promiseFulfillmentRate:
    supervisor.promiseFulfillmentRate,
  paymentCount: supervisor.paymentCount,
});

const buildTargetProgress = (
  campaigns: readonly CampaignPerformanceItem[],
  recoveredAmount: number,
  period: string
): PortfolioTargetProgress | null => {
  const monthlyTargetAmount = sumBy(
    campaigns,
    (item) => item.targetAmount ?? 0
  );

  if (monthlyTargetAmount <= 0) {
    return null;
  }

  const expectedToDateAmount =
    calculateExpectedRecoveryAmount(
      monthlyTargetAmount,
      period
    );
  const gapAmount =
    recoveredAmount - expectedToDateAmount;

  return {
    monthlyTargetAmount,
    expectedToDateAmount: roundCurrency(
      expectedToDateAmount
    ),
    targetAchievementRate: roundRate(
      calculatePortfolioRate(
        recoveredAmount,
        monthlyTargetAmount
      )
    ),
    paceAchievementRate: roundRate(
      calculatePortfolioRate(
        recoveredAmount,
        expectedToDateAmount
      )
    ),
    gapAmount: roundCurrency(gapAmount),
    gapRate:
      expectedToDateAmount > 0
        ? roundRate(
            (gapAmount / expectedToDateAmount) * 100
          )
        : 0,
  };
};

const buildPromiseStatus = (
  summary: PortfolioSummaryMetrics
): PortfolioPromiseStatus => {
  const dueTodayCount = Math.round(
    summary.promiseCount * DUE_TODAY_PROMISE_RATIO
  );

  return {
    dueTodayCount,
    dueTodayAmount: roundCurrency(
      dueTodayCount * DUE_TODAY_AVERAGE_AMOUNT
    ),
    overdueCount: Math.round(
      summary.promiseCount * OVERDUE_PROMISE_RATIO
    ),
    fulfillmentRate:
      summary.promiseFulfillmentRate,
  };
};

const buildAttention = (
  target: PortfolioTargetProgress | null,
  promises: PortfolioPromiseStatus,
  campaigns: readonly CampaignPerformanceItem[],
  supervisors: readonly SupervisorPerformanceMockItem[],
  period: string
): readonly PortfolioAttentionItem[] => {
  const attention: PortfolioAttentionItem[] = [];

  if (target?.gapRate !== null && target?.gapRate !== undefined) {
    attention.push({
      id: 'curve-gap',
      title: 'Ritmo de recuperación',
      detail:
        'Comparación del recaudo acumulado contra la curva esperada por días hábiles.',
      metric: 'curveGap',
      tone:
        target.gapRate < 0
          ? 'critical'
          : 'positive',
      value: target.gapRate,
    });
  }

  if (promises.dueTodayCount > 0) {
    attention.push({
      id: 'promises-due-today',
      title: 'Promesas con vencimiento hoy',
      detail:
        'Compromisos que requieren seguimiento durante el corte actual.',
      metric: 'promisesDue',
      tone: 'warning',
      value: promises.dueTodayCount,
      amount: promises.dueTodayAmount,
    });
  }

  const campaignAhead = campaigns
    .map((campaign) => {
      const campaignTarget = buildTargetProgress(
        [campaign],
        campaign.recoveredAmount,
        period
      );

      if (campaignTarget?.gapRate === null || !campaignTarget) {
        return null;
      }

      return {
        campaign,
        target: campaignTarget,
        gapRate: campaignTarget.gapRate,
      };
    })
    .filter(
      (item): item is {
        campaign: CampaignPerformanceItem;
        target: PortfolioTargetProgress;
        gapRate: number;
      } => item !== null
    )
    .sort((a, b) => b.gapRate - a.gapRate)[0];

  if (
    campaignAhead &&
    campaignAhead.gapRate > 0
  ) {
    attention.push({
      id: `target-pace-${campaignAhead.campaign.campaignId}`,
      title: campaignAhead.campaign.campaignName,
      detail:
        'Campaña por encima del ritmo esperado de recuperación.',
      metric: 'targetPace',
      tone: 'positive',
      value: campaignAhead.gapRate,
    });
  } else {
    const lowestContactability = [...supervisors].sort(
      (a, b) =>
        a.contactabilityRate - b.contactabilityRate
    )[0];

    if (lowestContactability) {
      attention.push({
        id: `contactability-${lowestContactability.supervisorId}`,
        title: lowestContactability.supervisorName,
        detail:
          'Equipo con la menor contactabilidad del corte actual.',
        metric: 'contactability',
        tone: 'critical',
        value: lowestContactability.contactabilityRate,
      });
    }
  }

  return attention;
};

const filterEvolution = (
  filters: PortfolioControlCenterFilters
) => {
  if (
    filters.dateFrom &&
    filters.dateTo &&
    filters.dateFrom > filters.dateTo
  ) {
    return [];
  }

  return PORTFOLIO_CONTROL_CENTER_MOCK.evolution
    .filter((item) => {
      const afterStart =
        !filters.dateFrom ||
        item.period >= filters.dateFrom;
      const beforeEnd =
        !filters.dateTo ||
        item.period <= filters.dateTo;

      return afterStart && beforeEnd;
    })
    .map((item) => ({ ...item }));
};

const buildEmptySummary = (): PortfolioSummaryMetrics => ({
  assignedPortfolio: 0,
  managedPortfolio: 0,
  pendingPortfolio: 0,
  managementCount: 0,
  managementIntensity: 0,
  recoveredAmount: 0,
  contactabilityRate: 0,
  rpcRate: 0,
  closeRate: 0,
  promiseCount: 0,
  promiseFulfillmentRate: 0,
  paymentCount: 0,
});

const buildEmptyPromiseStatus = (): PortfolioPromiseStatus => ({
  dueTodayCount: 0,
  dueTodayAmount: 0,
  overdueCount: 0,
  fulfillmentRate: 0,
});

export const buildPortfolioControlCenterMockData = (
  filters: PortfolioControlCenterFilters
): PortfolioControlCenterData => {
  const cutoff = getCutoffContext(filters);

  if (!cutoff) {
    return {
      context: {
        campaignId: filters.campaignId ?? 'mock-all',
        dateFrom:
          filters.dateFrom ??
          PORTFOLIO_CONTROL_CENTER_MOCK.evolution[0]?.period ??
          '',
        dateTo:
          filters.dateTo ??
          PORTFOLIO_CONTROL_CENTER_MOCK.evolution[
            PORTFOLIO_CONTROL_CENTER_MOCK.evolution.length - 1
          ]?.period ??
          '',
        subPortfolioId: filters.subPortfolioId,
      },
      updatedAt:
        PORTFOLIO_CONTROL_CENTER_MOCK.updatedAt,
      freshness:
        PORTFOLIO_CONTROL_CENTER_MOCK.freshness,
      summary: buildEmptySummary(),
      target: null,
      promises: buildEmptyPromiseStatus(),
      evolution: filterEvolution(filters),
      campaigns: [],
      supervisors: [],
      advisors: [],
      attention: [],
    };
  }

  const campaigns = filterCampaigns(
    filters,
    cutoff.ratios
  );
  const allowedCampaignIds = new Set(
    campaigns.map((item) => item.campaignId)
  );
  const supervisors = filterSupervisors(
    filters,
    allowedCampaignIds,
    cutoff.ratios
  );
  const advisors = filterAdvisors(
    supervisors,
    cutoff.ratios
  );

  const selectedSupervisor = filters.supervisorId
    ? supervisors.find(
        (item) =>
          item.supervisorId === filters.supervisorId
      )
    : null;

  const summary = selectedSupervisor
    ? buildSupervisorSummary(selectedSupervisor)
    : buildCampaignSummary(campaigns);
  const target = selectedSupervisor
    ? null
    : buildTargetProgress(
        campaigns,
        summary.recoveredAmount,
        cutoff.period
      );
  const promises = buildPromiseStatus(summary);

  return {
    context: {
      campaignId: filters.campaignId ?? 'mock-all',
      dateFrom:
        filters.dateFrom ??
        PORTFOLIO_CONTROL_CENTER_MOCK.evolution[0]?.period ??
        cutoff.period,
      dateTo: filters.dateTo ?? cutoff.period,
      subPortfolioId: filters.subPortfolioId,
    },
    updatedAt: `${cutoff.period}T15:45:00-05:00`,
    freshness: {
      operationAsOfAt: `${cutoff.period}T15:40:00-05:00`,
      portfolioBaseRefreshedAt: `${cutoff.period}T06:30:00-05:00`,
      refreshedAt: `${cutoff.period}T15:45:00-05:00`,
    },
    summary,
    target,
    promises,
    evolution: filterEvolution(filters),
    campaigns,
    supervisors,
    advisors,
    attention: buildAttention(
      target,
      promises,
      campaigns,
      supervisors,
      cutoff.period
    ),
  };
};
