import type {
  PortfolioDueTodayPromisesQuery,
  PortfolioDueTodayPromisesSortKey,
  PortfolioDueTodayStatusKey,
  PortfolioOperationalContext,
  PortfolioOverdueAgingKey,
  PortfolioOverduePromisesQuery,
  PortfolioOverduePromisesSortKey,
} from '../../../types/portfolioControlCenter.types';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const OVERDUE_AGING_KEYS = new Set<PortfolioOverdueAgingKey>([
  '1-3',
  '4-7',
  '8-plus',
  'unclassified',
]);

const OVERDUE_SORT_KEYS = new Set<PortfolioOverduePromisesSortKey>([
  'debtorId',
  'dueDate',
  'overdueDays',
  'promiseAmount',
  'paidAmount',
  'outstandingAmount',
  'advisorName',
  'supervisorName',
]);

const DUE_TODAY_STATUS_KEYS = new Set<PortfolioDueTodayStatusKey>([
  'pending',
  'partial',
  'covered',
]);

const DUE_TODAY_SORT_KEYS = new Set<PortfolioDueTodayPromisesSortKey>([
  'debtorId',
  'promiseAmount',
  'paidAmount',
  'outstandingAmount',
  'statusLabel',
  'lastPaymentDate',
  'advisorName',
  'supervisorName',
]);

export const assertPositiveIntegerParam = (
  name: string,
  value: number
): void => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} debe ser un entero positivo.`);
  }
};

export const normalizeRequiredQueryText = (
  name: string,
  value: string
): string => {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${name} no puede estar vacío.`);
  }

  return normalized;
};

export const normalizeOptionalQueryText = (
  name: string,
  value: string | null
): string | null =>
  value === null
    ? null
    : normalizeRequiredQueryText(name, value);

const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const normalizeIsoDateParam = (
  name: string,
  value: string
): string => {
  const normalized = normalizeRequiredQueryText(name, value);

  if (!isValidIsoDate(normalized)) {
    throw new Error(`${name} debe usar el formato YYYY-MM-DD y ser una fecha válida.`);
  }

  return normalized;
};

export const normalizeOptionalIsoDateParam = (
  name: string,
  value: string | null
): string | null =>
  value === null ? null : normalizeIsoDateParam(name, value);

export const assertDateRange = (
  dateFrom: string,
  dateTo: string
): void => {
  if (dateFrom > dateTo) {
    throw new Error('dateFrom no puede ser posterior a dateTo.');
  }
};

export const normalizePerformanceContext = (
  context: PortfolioOperationalContext
): PortfolioOperationalContext => {
  const dateFrom = normalizeIsoDateParam('dateFrom', context.dateFrom);
  const dateTo = normalizeIsoDateParam('dateTo', context.dateTo);
  assertDateRange(dateFrom, dateTo);

  return {
    businessUnit: normalizeOptionalQueryText(
      'businessUnit',
      context.businessUnit
    ),
    campaignId: normalizeRequiredQueryText('campaign', context.campaignId),
    dateFrom,
    dateTo,
    subPortfolioId: normalizeOptionalQueryText(
      'subPortfolioId',
      context.subPortfolioId
    ),
  };
};

export const validateOverduePromisesQuery = (
  query: PortfolioOverduePromisesQuery
): void => {
  assertPositiveIntegerParam('page', query.page);
  assertPositiveIntegerParam('pageSize', query.pageSize);

  if (query.aging !== null && !OVERDUE_AGING_KEYS.has(query.aging)) {
    throw new Error('aging no es un valor soportado.');
  }

  if (!OVERDUE_SORT_KEYS.has(query.sortBy)) {
    throw new Error('sortBy no es un criterio soportado para promesas vencidas.');
  }

  if (query.sortDirection !== 'asc' && query.sortDirection !== 'desc') {
    throw new Error('sortDirection debe ser asc o desc.');
  }
};

export const validateDueTodayPromisesQuery = (
  query: PortfolioDueTodayPromisesQuery
): void => {
  assertPositiveIntegerParam('page', query.page);
  assertPositiveIntegerParam('pageSize', query.pageSize);

  if (query.status !== null && !DUE_TODAY_STATUS_KEYS.has(query.status)) {
    throw new Error('status no es un valor soportado.');
  }

  if (!DUE_TODAY_SORT_KEYS.has(query.sortBy)) {
    throw new Error('sortBy no es un criterio soportado para promesas de hoy.');
  }

  if (query.sortDirection !== 'asc' && query.sortDirection !== 'desc') {
    throw new Error('sortDirection debe ser asc o desc.');
  }
};
