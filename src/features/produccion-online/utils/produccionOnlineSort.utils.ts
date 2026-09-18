import type {
  ProduccionOnlineRow,
  ProduccionOnlineSortDirection,
  ProduccionOnlineSortKey,
} from '../types/produccionOnline.types';

export const sortProduccionOnlineRows = (
  rows: readonly ProduccionOnlineRow[],
  sortKey: ProduccionOnlineSortKey | '',
  sortDirection: ProduccionOnlineSortDirection
): ProduccionOnlineRow[] => {
  if (!sortKey) {
    return [...rows];
  }

  const direction =
    sortDirection === 'asc' ? 1 : -1;

  return rows
    .map((row, originalIndex) => ({
      row,
      originalIndex,
    }))
    .sort((left, right) => {
      const difference =
        left.row[sortKey] -
        right.row[sortKey];

      if (difference !== 0) {
        return difference * direction;
      }

      return (
        left.originalIndex -
        right.originalIndex
      );
    })
    .map(({ row }) => row);
};
