import { useCallback, useMemo } from 'react';
import { Badge } from '../../../shared/components/ui/Badge';
import { WrapCell } from '../../../shared/components/ui/WrapCell';
import type { Column } from '../../../shared/types';
import type {
  ColumnApi,
  DatoAdicionalApi,
} from '../../../shared/types/indexApi';

const ESTADOS_SERVICIO = {
  Activo: 'success',
  Suspendido: 'warning',
  Cancelado: 'danger',
} as const;

export const usePanelDatosAdicionalesColumns = (columns: ColumnApi[]) => {
  const renderCell = useCallback((row: DatoAdicionalApi, column: ColumnApi) => {
    const rawValue = row[column.key];

    if (rawValue === null || rawValue === undefined) return '-';

    const value = String(rawValue);

    switch (column.type) {
      case 'money': {
        const numValue = Number(rawValue);

        return Number.isNaN(numValue)
          ? value
          : numValue.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
      }

      case 'estado': {
        const variant =
          ESTADOS_SERVICIO[value as keyof typeof ESTADOS_SERVICIO] ||
          'neutral';

        return <Badge variant={variant}>{value}</Badge>;
      }

      default:
        return <WrapCell weight={500}>{value}</WrapCell>;
    }
  }, []);

  const tableColumns: Column<DatoAdicionalApi>[] = useMemo(
    () =>
      columns.map((column) => ({
        key: column.key,
        label: column.label,
        render: (row) => renderCell(row, column),
      })),
    [columns, renderCell]
  );

  return {
    tableColumns,
  };
};