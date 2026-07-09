import type { InfDeudorTableRow } from '../types/infDeudor.types';
import { INF_DEUDOR_POPUP_COLUMNS_CONFIG } from '../constants/infDeudorPopup.constants';

export const getInfDeudorParamKey = (index: number): string => {
  const paramIndex = index.toString().padStart(2, '0');

  return `param${paramIndex}`;
};

export const getInfDeudorColumnsWithData = (
  rows: InfDeudorTableRow[]
): Set<number> => {
  const columnsWithData = new Set<number>();

  rows.forEach((row) => {
    for (
      let index = INF_DEUDOR_POPUP_COLUMNS_CONFIG.start;
      index <= INF_DEUDOR_POPUP_COLUMNS_CONFIG.end;
      index += 1
    ) {
      const paramKey = getInfDeudorParamKey(index);
      const value = row[paramKey];

      if (value && value.trim()) {
        columnsWithData.add(index);
      }
    }
  });

  return columnsWithData;
};

export const calculateInfDeudorTotalWidth = (
  columnsWithData: Set<number>
): number => {
  let totalWidth = 0;

  for (
    let index = INF_DEUDOR_POPUP_COLUMNS_CONFIG.start;
    index <= INF_DEUDOR_POPUP_COLUMNS_CONFIG.end;
    index += 1
  ) {
    totalWidth += columnsWithData.has(index)
      ? INF_DEUDOR_POPUP_COLUMNS_CONFIG.totalWidthWithData
      : INF_DEUDOR_POPUP_COLUMNS_CONFIG.totalWidthWithoutData;
  }

  return totalWidth;
};