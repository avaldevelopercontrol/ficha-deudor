import { useMemo } from 'react';
import type { Column } from '@shared/types';
import type {
  ColumnApi,
  DatoAdicionalApi,
} from '../../../shared/types';
import { renderDatoAdicionalCell } from '../utils/panelDatosAdicionalesCells.utils';

export const usePanelDatosAdicionalesColumns = (columns: ColumnApi[]) => {
  const tableColumns: Column<DatoAdicionalApi>[] = useMemo(
    () =>
      columns.map((column) => ({
        key: column.key,
        label: column.label,
        render: (row) => renderDatoAdicionalCell(row, column),
      })),
    [columns]
  );

  return {
    tableColumns,
  };
};