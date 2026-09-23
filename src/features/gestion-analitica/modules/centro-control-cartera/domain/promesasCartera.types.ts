export type PortfolioSortDirection = 'asc' | 'desc';

export interface PortfolioPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type PortfolioOverdueAgingFilter =
  | 'all'
  | '1-3'
  | '4-7'
  | '8-plus'
  | 'unclassified';

export type PortfolioOverdueAgingKey = Exclude<
  PortfolioOverdueAgingFilter,
  'all'
>;

export type PortfolioOverdueSituationKey =
  | 'no-payment-recorded'
  | 'partial-payment';

export type PromesasCarteraVencidasSortKey =
  | 'debtorId'
  | 'dueDate'
  | 'overdueDays'
  | 'promiseAmount'
  | 'paidAmount'
  | 'outstandingAmount'
  | 'advisorName'
  | 'supervisorName';

export interface PromesasCarteraVencidasQuery {
  page: number;
  pageSize: number;
  aging: PortfolioOverdueAgingKey | null;
  sortBy: PromesasCarteraVencidasSortKey;
  sortDirection: PortfolioSortDirection;
}

export interface PortfolioOverduePromiseItem {
  promiseId: string;
  debtorId: string;
  debtorName: string | null;
  dueDate: string | null;
  overdueDays: number | null;
  promiseAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  situationKey: PortfolioOverdueSituationKey;
  situationLabel: string;
  agingKey: PortfolioOverdueAgingKey;
  advisorId: string | null;
  advisorName: string | null;
  supervisorId: string | null;
  supervisorName: string | null;
}

export interface PortfolioOverdueAgingBucket {
  key: PortfolioOverdueAgingKey;
  label: string;
  count: number;
  promiseAmount: number;
  outstandingAmount: number;
}

export interface PortfolioOverduePromiseFilterOption {
  id: string;
  name: string;
}

export interface PromesasCarteraVencidasData {
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
  pagination: PortfolioPagination;
  items: readonly PortfolioOverduePromiseItem[];
}

export type PortfolioDueTodayStatusFilter =
  | 'all'
  | 'pending'
  | 'partial'
  | 'covered';

export type PortfolioDueTodayStatusKey = Exclude<
  PortfolioDueTodayStatusFilter,
  'all'
>;

export type PromesasCarteraVenceHoySortKey =
  | 'debtorId'
  | 'promiseAmount'
  | 'paidAmount'
  | 'outstandingAmount'
  | 'statusLabel'
  | 'lastPaymentDate'
  | 'advisorName'
  | 'supervisorName';

export interface PromesasCarteraVenceHoyQuery {
  page: number;
  pageSize: number;
  status: PortfolioDueTodayStatusKey | null;
  sortBy: PromesasCarteraVenceHoySortKey;
  sortDirection: PortfolioSortDirection;
}

export interface PortfolioDueTodayPromiseItem {
  promiseId: string;
  debtorId: string;
  promiseAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  statusKey: PortfolioDueTodayStatusKey;
  statusLabel: string;
  lastPaymentDate: string | null;
  advisorId: string | null;
  advisorName: string | null;
  supervisorId: string | null;
  supervisorName: string | null;
}

export interface PortfolioDueTodayStatusBucket {
  key: PortfolioDueTodayStatusKey;
  label: string;
  count: number;
  promiseAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export interface PromesasCarteraVenceHoyData {
  asOfDate: string | null;
  updatedAt: string | null;
  summary: {
    dueTodayCount: number;
    dueTodayAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  };
  status: readonly PortfolioDueTodayStatusBucket[];
  pagination: PortfolioPagination;
  items: readonly PortfolioDueTodayPromiseItem[];
}

export type SeguimientoPromesasCarteraPeriodo = 'today' | 'yesterday';

export type SeguimientoPromesasCarteraStatusFilter =
  | 'all'
  | 'pending'
  | 'partial'
  | 'fulfilled'
  | 'broken'
  | 'paid-out-of-range';

export type SeguimientoPromesasCarteraStatusKey = Exclude<
  SeguimientoPromesasCarteraStatusFilter,
  'all'
>;

export type SeguimientoPromesasCarteraContactKey =
  | 'direct'
  | 'indirect'
  | 'no-contact'
  | 'no-management';

export type SeguimientoPromesasCarteraSortKey =
  | 'debtorId'
  | 'promiseAmount'
  | 'paidAmount'
  | 'outstandingAmount'
  | 'statusLabel'
  | 'lastPaymentDate'
  | 'advisorName'
  | 'supervisorName';

export interface SeguimientoPromesasCarteraQuery {
  dueDate: string;
  page: number;
  pageSize: number;
  status: SeguimientoPromesasCarteraStatusKey | null;
  sortBy: SeguimientoPromesasCarteraSortKey;
  sortDirection: PortfolioSortDirection;
}

export interface SeguimientoPromesaCarteraItem {
  promiseId: string;
  debtorId: string;
  debtorName: string | null;
  dueDate: string | null;
  promiseAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  lastPaymentDate: string | null;
  statusKey: SeguimientoPromesasCarteraStatusKey;
  statusLabel: string;
  managed: boolean;
  managementCount: number;
  callCount: number;
  contactKey: SeguimientoPromesasCarteraContactKey;
  contactLabel: string;
  paymentConfirmed: boolean | null;
  lastManagementAt: string | null;
  advisorId: string | null;
  advisorName: string | null;
  supervisorId: string | null;
  supervisorName: string | null;
}

export interface SeguimientoPromesasCarteraStatusBucket {
  key: SeguimientoPromesasCarteraStatusKey;
  label: string;
  count: number;
  promiseAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export interface SeguimientoPromesasCarteraData {
  dueDate: string;
  asOfDate: string | null;
  updatedAt: string | null;
  summary: {
    promiseCount: number;
    promiseAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  };
  status: readonly SeguimientoPromesasCarteraStatusBucket[];
  pagination: PortfolioPagination;
  items: readonly SeguimientoPromesaCarteraItem[];
}
