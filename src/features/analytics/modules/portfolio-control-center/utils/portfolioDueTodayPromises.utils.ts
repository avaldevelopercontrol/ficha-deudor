import type {
  PortfolioDueTodayPromiseItem,
  PortfolioDueTodayPromisesSortKey,
  PortfolioDueTodayStatusFilter,
  PortfolioSortDirection,
} from '../../../types/portfolioControlCenter.types';

const textCollator = new Intl.Collator('es', {
  numeric: true,
  sensitivity: 'base',
});

const getSortValue = (
  item: PortfolioDueTodayPromiseItem,
  key: PortfolioDueTodayPromisesSortKey
): string | number | null => {
  switch (key) {
    case 'debtorId':
      return item.debtorId;
    case 'promiseAmount':
      return item.promiseAmount;
    case 'paidAmount':
      return item.paidAmount;
    case 'outstandingAmount':
      return item.outstandingAmount;
    case 'statusLabel':
      return item.statusLabel;
    case 'lastPaymentDate':
      return item.lastPaymentDate === 'Sin pago'
        ? null
        : item.lastPaymentDate;
    case 'advisorName':
      return item.advisorName;
    case 'supervisorName':
      return item.supervisorName;
  }
};

const compareDefinedValues = (
  left: string | number,
  right: string | number
): number => {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return textCollator.compare(String(left), String(right));
};

export const filterPortfolioDueTodayPromisesByStatus = (
  items: readonly PortfolioDueTodayPromiseItem[],
  status: PortfolioDueTodayStatusFilter
): PortfolioDueTodayPromiseItem[] => {
  if (status === 'all') {
    return [...items];
  }

  return items.filter((item) => item.statusKey === status);
};

export const sortPortfolioDueTodayPromises = (
  items: readonly PortfolioDueTodayPromiseItem[],
  sortKey: PortfolioDueTodayPromisesSortKey,
  sortDirection: PortfolioSortDirection
): PortfolioDueTodayPromiseItem[] => {
  const direction = sortDirection === 'asc' ? 1 : -1;

  return [...items].sort((left, right) => {
    const leftValue = getSortValue(left, sortKey);
    const rightValue = getSortValue(right, sortKey);

    if (leftValue === null && rightValue === null) {
      return textCollator.compare(left.promiseId, right.promiseId);
    }

    if (leftValue === null) {
      return 1;
    }

    if (rightValue === null) {
      return -1;
    }

    const compared = compareDefinedValues(leftValue, rightValue);

    if (compared !== 0) {
      return compared * direction;
    }

    return textCollator.compare(left.promiseId, right.promiseId);
  });
};
