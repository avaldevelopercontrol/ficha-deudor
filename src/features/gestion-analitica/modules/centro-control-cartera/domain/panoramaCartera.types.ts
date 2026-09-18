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

export interface MetaCarteraProgress {
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

export interface EvolucionCarteraPoint {
  period: string;
  assignedPortfolio: number;
  managedPortfolio: number;
  pendingPortfolio: number;
  recoveredAmount: number;
}

export interface RendimientoCampanaItem {
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
  managedDebtorCount: number | null;
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
  periodSupervisorId: string | null;
  periodSupervisorName: string | null;
  currentSupervisorId: string | null;
  currentSupervisorName: string | null;
  managementCount: number;
  managedDebtorCount: number | null;
  rpcRate: number | null;
  closeRate: number | null;
  promiseCount: number;
  paymentCount: number;
  attributableRecoveredAmount: number;
}

export type AtencionCarteraMetric =
  | 'curveGap'
  | 'promisesDue'
  | 'promisesOverdue'
  | 'targetPace'
  | 'contactability';

export type AtencionCarteraTone =
  | 'critical'
  | 'warning'
  | 'positive';

export interface AtencionCarteraItem {
  id: string;
  title: string;
  detail: string;
  metric: AtencionCarteraMetric;
  tone: AtencionCarteraTone;
  value: number;
  amount?: number;
}

export type DetalleCarteraTab =
  | 'campaigns'
  | 'supervisors'
  | 'advisors';

export type UnidadNegocioCarteraCode = string;

export interface PortfolioOperationalContext {
  businessUnit: UnidadNegocioCarteraCode | null;
  campaignId: string;
  dateFrom: string;
  dateTo: string;
  subPortfolioId: string | null;
}

export interface CentroControlCarteraFreshness {
  operationAsOfAt: string | null;
  portfolioBaseRefreshedAt: string | null;
  refreshedAt: string | null;
}

export interface CentroControlCarteraData {
  context: PortfolioOperationalContext;
  updatedAt: string | null;
  freshness: CentroControlCarteraFreshness;
  summary: PortfolioSummaryMetrics;
  target: MetaCarteraProgress | null;
  promises: PortfolioPromiseStatus;
  evolution: readonly EvolucionCarteraPoint[];
  campaigns: readonly RendimientoCampanaItem[];
  supervisors: readonly SupervisorPerformanceItem[];
  advisors: readonly AdvisorPerformanceItem[];
  attention: readonly AtencionCarteraItem[];
}
