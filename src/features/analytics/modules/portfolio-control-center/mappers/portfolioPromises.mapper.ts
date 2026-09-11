import type {
  PortfolioDueTodayPromisesApiResponse,
  PortfolioOverduePromisesApiResponse,
} from '../api/portfolioControlCenterApi.types';
import type {
  PortfolioDueTodayPromisesData,
  PortfolioDueTodayStatusKey,
  PortfolioOverduePromisesData,
  PortfolioPagination,
} from '../domain/portfolioPromises.types';

const mapPortfolioPagination = (
  pagination: PortfolioPagination | undefined,
  itemCount: number
): PortfolioPagination =>
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
): PortfolioOverduePromisesData => ({
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
});

const getDueTodayStatusLabel = (
  statusKey: PortfolioDueTodayStatusKey
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
): PortfolioDueTodayPromisesData => ({
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
});
