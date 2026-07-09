import { useMemo } from 'react';

import type { Column } from '@shared/types';
import type { InfDeudorTableRow } from '../types/infDeudor.types';

import {
  INF_DEUDOR_POPUP_CELL_STYLE,
  INF_DEUDOR_POPUP_COLUMNS_CONFIG,
} from '../constants/infDeudorPopup.constants';
import {
  calculateInfDeudorTotalWidth,
  getInfDeudorColumnsWithData,
  getInfDeudorParamKey,
} from '../utils/infDeudorPopup.utils';

interface UseInfDeudorColumnsResult {
  columns: Column[];
  totalWidth: number;
}

export const useInfDeudorColumns = (
  rows: InfDeudorTableRow[]
): UseInfDeudorColumnsResult => {
  const columnsWithData = useMemo(
    () => getInfDeudorColumnsWithData(rows),
    [rows]
  );

  const totalWidth = useMemo(
    () => calculateInfDeudorTotalWidth(columnsWithData),
    [columnsWithData]
  );

  const columns: Column[] = useMemo(() => {
    const generatedColumns: Column[] = [];

    for (
      let index = INF_DEUDOR_POPUP_COLUMNS_CONFIG.start;
      index <= INF_DEUDOR_POPUP_COLUMNS_CONFIG.end;
      index += 1
    ) {
      const paramKey = getInfDeudorParamKey(index);
      const hasData = columnsWithData.has(index);

      generatedColumns.push({
        key: paramKey,
        label: INF_DEUDOR_POPUP_COLUMNS_CONFIG.label,
        width: hasData
          ? `${INF_DEUDOR_POPUP_COLUMNS_CONFIG.widthWithData}px`
          : `${INF_DEUDOR_POPUP_COLUMNS_CONFIG.widthWithoutData}px`,
        render: (row: InfDeudorTableRow) => {
          const value = row[paramKey];

          if (!value || !value.trim()) return null;

          return <div style={INF_DEUDOR_POPUP_CELL_STYLE}>{value}</div>;
        },
      });
    }

    return generatedColumns;
  }, [columnsWithData]);

  return {
    columns,
    totalWidth,
  };
};