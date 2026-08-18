import type {
  PortfolioOverdueAgingFilter,
  PortfolioOverduePromiseItem,
  PortfolioOverduePromisesSortKey,
  PortfolioSortDirection,
} from '../../../types/portfolioControlCenter.types';

const textCollator = new Intl.Collator('es', {
  numeric: true,
  sensitivity: 'base',
});

const getSortValue = (
  item: PortfolioOverduePromiseItem,
  key: PortfolioOverduePromisesSortKey
): string | number | null => {
  switch (key) {
    case 'debtorId':
      return item.debtorId;
    case 'dueDate':
      return item.dueDate;
    case 'overdueDays':
      return item.overdueDays;
    case 'promiseAmount':
      return item.promiseAmount;
    case 'paidAmount':
      return item.paidAmount;
    case 'outstandingAmount':
      return item.outstandingAmount;
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

export const filterPortfolioOverduePromisesByAging = (
  items: readonly PortfolioOverduePromiseItem[],
  aging: PortfolioOverdueAgingFilter
): PortfolioOverduePromiseItem[] => {
  if (aging === 'all') {
    return [...items];
  }

  return items.filter((item) => item.agingKey === aging);
};

export const sortPortfolioOverduePromises = (
  items: readonly PortfolioOverduePromiseItem[],
  sortKey: PortfolioOverduePromisesSortKey,
  sortDirection: PortfolioSortDirection
): PortfolioOverduePromiseItem[] => {
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
