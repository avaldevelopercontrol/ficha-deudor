import type {
  PromesasCarteraVenceHoyApiResponse,
  SeguimientoPromesasCarteraApiResponse,
  PromesasCarteraVencidasApiResponse,
} from '../api/centroControlCarteraApi.types';
import type {
  PromesasCarteraVenceHoyData,
  SeguimientoPromesasCarteraData,
  SeguimientoPromesasCarteraStatusKey,
  PortfolioDueTodayStatusKey,
  PromesasCarteraVencidasData,
  PortfolioPagination,
} from '../domain/promesasCartera.types';

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

export const mapPromesasCarteraVencidasResponse = (
  response: PromesasCarteraVencidasApiResponse
): PromesasCarteraVencidasData => ({
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

export const mapPromesasCarteraVenceHoyResponse = (
  response: PromesasCarteraVenceHoyApiResponse
): PromesasCarteraVenceHoyData => ({
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


const getPromiseTrackingStatusLabel = (
  statusKey: SeguimientoPromesasCarteraStatusKey
): string => {
  switch (statusKey) {
    case 'pending':
      return 'Pendiente';
    case 'partial':
      return 'Pago parcial';
    case 'fulfilled':
      return 'Cumplida';
    case 'broken':
      return 'Incumplida';
    case 'paid-out-of-range':
      return 'Pagada fuera de plazo';
  }
};

export const mapSeguimientoPromesasCarteraResponse = (
  response: SeguimientoPromesasCarteraApiResponse
): SeguimientoPromesasCarteraData => ({
  dueDate: response.dueDate,
  asOfDate: response.asOfDate,
  updatedAt: response.updatedAt,
  summary: {
    promiseCount: response.summary.promiseCount,
    promiseAmount: response.summary.promiseAmount,
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
    debtorName: item.debtorName,
    dueDate: item.dueDate,
    promiseAmount: item.promiseAmount,
    paidAmount: item.paidAmount,
    outstandingAmount: item.outstandingAmount,
    lastPaymentDate: item.lastPaymentDate,
    statusKey: item.statusKey,
    statusLabel: getPromiseTrackingStatusLabel(item.statusKey),
    managed: item.managed,
    managementCount: item.managementCount,
    callCount: item.callCount,
    contactKey: item.contactKey,
    contactLabel: item.contactLabel,
    paymentConfirmed: item.paymentConfirmed,
    lastManagementAt: item.lastManagementAt,
    advisorId: item.advisorId === null ? null : String(item.advisorId),
    advisorName: item.advisorName,
    supervisorId:
      item.supervisorId === null ? null : String(item.supervisorId),
    supervisorName: item.supervisorName,
  })),
});
