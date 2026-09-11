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

export type PortfolioOverduePromisesSortKey =
  | 'debtorId'
  | 'dueDate'
  | 'overdueDays'
  | 'promiseAmount'
  | 'paidAmount'
  | 'outstandingAmount'
  | 'advisorName'
  | 'supervisorName';

export interface PortfolioOverduePromisesQuery {
  page: number;
  pageSize: number;
  aging: PortfolioOverdueAgingKey | null;
  sortBy: PortfolioOverduePromisesSortKey;
  sortDirection: PortfolioSortDirection;
}

export interface PortfolioOverduePromiseItem {
  promiseId: string;
  debtorId: string;
  dueDate: string | null;
  overdueDays: number | null;
  promiseAmount: number;
  paidAmount: number;
  outstandingAmount: number;
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

export type PortfolioDueTodayPromisesSortKey =
  | 'debtorId'
  | 'promiseAmount'
  | 'paidAmount'
  | 'outstandingAmount'
  | 'statusLabel'
  | 'lastPaymentDate'
  | 'advisorName'
  | 'supervisorName';

export interface PortfolioDueTodayPromisesQuery {
  page: number;
  pageSize: number;
  status: PortfolioDueTodayStatusKey | null;
  sortBy: PortfolioDueTodayPromisesSortKey;
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
  pagination: PortfolioPagination;
  items: readonly PortfolioDueTodayPromiseItem[];
}
