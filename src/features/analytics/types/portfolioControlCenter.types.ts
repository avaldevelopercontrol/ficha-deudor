export interface PortfolioSummaryMetrics {
  assignedPortfolio: number;
  managedPortfolio: number;
  pendingPortfolio: number;
  managementCount: number;
  managementIntensity: number | null;
  recoveredAmount: number;
  contactabilityRate: number | null;
  rpcRate: number | null;
  closeRate: number | null;
  promiseCount: number;
  promiseFulfillmentRate: number | null;
  paymentCount: number;
}

export interface PortfolioTargetProgress {
  monthlyTargetAmount: number;
  expectedToDateAmount: number;
  targetAchievementRate: number | null;
  paceAchievementRate: number | null;
  gapAmount: number;
  gapRate: number | null;
}

export interface PortfolioPromiseStatus {
  dueTodayCount: number;
  dueTodayAmount: number;
  overdueCount: number;
  fulfillmentRate: number | null;
}

export interface PortfolioEvolutionPoint {
  period: string;
  assignedPortfolio: number;
  managedPortfolio: number;
  pendingPortfolio: number;
  recoveredAmount: number;
}

export interface CampaignPerformanceItem {
  campaignId: string;
  campaignName: string;
  assignedPortfolio: number;
  managedPortfolio: number;
  progressRate: number | null;
  managementCount: number;
  contactabilityRate: number | null;
  rpcRate: number | null;
  closeRate: number | null;
  promiseCount: number;
  promiseFulfillmentRate: number | null;
  paymentCount: number;
  recoveredAmount: number;
  targetAmount: number | null;
}

export interface SupervisorPerformanceItem {
  supervisorId: string;
  supervisorName: string;
  advisorCount: number;
  managementCount: number;
  rpcRate: number | null;
  closeRate: number | null;
  promiseCount: number;
  promiseFulfillmentRate: number | null;
  paymentCount: number;
  attributableRecoveredAmount: number;
}

export interface AdvisorPerformanceItem {
  advisorId: string;
  advisorName: string;
  currentSupervisorId: string | null;
  currentSupervisorName: string | null;
  managementCount: number;
  rpcRate: number | null;
  closeRate: number | null;
  promiseCount: number;
  paymentCount: number;
  attributableRecoveredAmount: number;
}

export type PortfolioAttentionMetric =
  | 'curveGap'
  | 'promisesDue'
  | 'promisesOverdue'
  | 'targetPace'
  | 'contactability';

export type PortfolioAttentionTone =
  | 'critical'
  | 'warning'
  | 'positive';

export interface PortfolioAttentionItem {
  id: string;
  title: string;
  detail: string;
  metric: PortfolioAttentionMetric;
  tone: PortfolioAttentionTone;
  value: number;
  amount?: number;
}


export interface PortfolioOperationalContext {
  campaignId: string;
  dateFrom: string;
  dateTo: string;
  subPortfolioId: string | null;
}

export interface PortfolioPerformanceDetailData {
  updatedAt: string | null;
  supervisors: readonly SupervisorPerformanceItem[];
  advisors: readonly AdvisorPerformanceItem[];
}

export interface PortfolioControlCenterData {
  context: PortfolioOperationalContext;
  updatedAt: string | null;
  summary: PortfolioSummaryMetrics;
  target: PortfolioTargetProgress | null;
  promises: PortfolioPromiseStatus;
  evolution: readonly PortfolioEvolutionPoint[];
  campaigns: readonly CampaignPerformanceItem[];
  supervisors: readonly SupervisorPerformanceItem[];
  advisors: readonly AdvisorPerformanceItem[];
  attention: readonly PortfolioAttentionItem[];
}

export interface PortfolioControlCenterFilters {
  dateFrom: string | null;
  dateTo: string | null;
  subPortfolioId: string | null;
  campaignId: string | null;
  supervisorId: string | null;
}

export interface PortfolioFilterOption {
  id: string;
  label: string;
}

export interface PortfolioCampaignFilterOption
  extends PortfolioFilterOption {
  startDate: string;
  endDate: string;
  availableDateFrom: string;
  availableDateTo: string;
}

export type PortfolioSupervisorFilterOption =
  PortfolioFilterOption;

export interface SubPortfolioCampaignAvailability {
  subPortfolioId: string;
  campaignId: string;
  availableDateFrom: string;
  availableDateTo: string;
}

export interface PortfolioSupervisorContextAvailability {
  supervisorId: string;
  subPortfolioId: string;
  campaignId: string;
  availableDateFrom: string;
  availableDateTo: string;
}

export interface PortfolioFilterScope {
  id: string;
}

export interface PortfolioControlCenterFilterOptions {
  availableDateFrom: string | null;
  availableDateTo: string | null;
  portfolio: PortfolioFilterScope | null;
  subPortfolios: readonly PortfolioFilterOption[];
  campaigns: readonly PortfolioCampaignFilterOption[];
  supervisors: readonly PortfolioSupervisorFilterOption[];
  availability: {
    subPortfolioCampaigns: readonly SubPortfolioCampaignAvailability[];
    supervisorContexts: readonly PortfolioSupervisorContextAvailability[];
  };
}


export type PortfolioOverdueAgingFilter =
  | 'all'
  | '1-3'
  | '4-7'
  | '8-plus'
  | 'unclassified';

export type PortfolioOverduePromisesSortKey =
  | 'debtorId'
  | 'dueDate'
  | 'overdueDays'
  | 'promiseAmount'
  | 'paidAmount'
  | 'outstandingAmount'
  | 'advisorName'
  | 'supervisorName';

export type PortfolioSortDirection = 'asc' | 'desc';

export interface PortfolioOverduePromiseItem {
  promiseId: string;
  debtorId: string;
  dueDate: string | null;
  overdueDays: number | null;
  promiseAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  agingKey: Exclude<PortfolioOverdueAgingFilter, 'all'>;
  advisorId: string | null;
  advisorName: string | null;
  supervisorId: string | null;
  supervisorName: string | null;
}

export interface PortfolioOverdueAgingBucket {
  key: Exclude<PortfolioOverdueAgingFilter, 'all'>;
  label: string;
  count: number;
  promiseAmount: number;
  outstandingAmount: number;
}

export interface PortfolioOverduePromiseFilterOption {
  id: string;
  name: string;
}

export interface PortfolioOverduePromisesData {
  asOfDate: string | null;
  updatedAt: string | null;
  summary: {
    overdueCount: number;
    overdueAmount: number;
    outstandingAmount: number;
  };
  aging: readonly PortfolioOverdueAgingBucket[];
  filters: {
    advisors: readonly PortfolioOverduePromiseFilterOption[];
    supervisors: readonly PortfolioOverduePromiseFilterOption[];
  };
  items: readonly PortfolioOverduePromiseItem[];
}


export type PortfolioDueTodayStatusFilter =
  | 'all'
  | 'pending'
  | 'partial'
  | 'covered';

export type PortfolioDueTodayPromisesSortKey =
  | 'debtorId'
  | 'promiseAmount'
  | 'paidAmount'
  | 'outstandingAmount'
  | 'statusLabel'
  | 'lastPaymentDate'
  | 'advisorName'
  | 'supervisorName';

export interface PortfolioDueTodayPromiseItem {
  promiseId: string;
  debtorId: string;
  promiseAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  statusKey: Exclude<PortfolioDueTodayStatusFilter, 'all'>;
  statusLabel: string;
  lastPaymentDate: string | null;
  advisorId: string | null;
  advisorName: string | null;
  supervisorId: string | null;
  supervisorName: string | null;
}

export interface PortfolioDueTodayStatusBucket {
  key: Exclude<PortfolioDueTodayStatusFilter, 'all'>;
  label: string;
  count: number;
  promiseAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export interface PortfolioDueTodayPromisesData {
  asOfDate: string | null;
  updatedAt: string | null;
  summary: {
    dueTodayCount: number;
    dueTodayAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  };
  status: readonly PortfolioDueTodayStatusBucket[];
  items: readonly PortfolioDueTodayPromiseItem[];
}


export interface PortfolioControlCenterDataSource {
  load: (
    filters: PortfolioControlCenterFilters,
    signal: AbortSignal
  ) => Promise<PortfolioControlCenterData>;
  loadFilterOptions: (
    signal: AbortSignal
  ) => Promise<PortfolioControlCenterFilterOptions>;
}
