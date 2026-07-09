import { Badge } from '@shared/components/ui/Badge';
import { WrapCell } from '@shared/components/ui/WrapCell';
import type {
  ColumnApi,
  DatoAdicionalApi,
} from '../../../shared/types';

const ESTADOS_SERVICIO = {
  Activo: 'success',
  Suspendido: 'warning',
  Cancelado: 'danger',
} as const;

const DEFAULT_ESTADO_SERVICIO_VARIANT = 'neutral';

const formatDatoAdicionalMoney = (value: unknown) => {
  const numValue = Number(value);

  return Number.isNaN(numValue)
    ? String(value)
    : numValue.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

const getEstadoServicioVariant = (value: string) => {
  return (
    ESTADOS_SERVICIO[value as keyof typeof ESTADOS_SERVICIO] ||
    DEFAULT_ESTADO_SERVICIO_VARIANT
  );
};

export const renderDatoAdicionalCell = (
  row: DatoAdicionalApi,
  column: ColumnApi
) => {
  const rawValue = row[column.key];

  if (rawValue === null || rawValue === undefined) return '-';

  const value = String(rawValue);

  switch (column.type) {
    case 'money':
      return formatDatoAdicionalMoney(rawValue);

    case 'estado':
      return <Badge variant={getEstadoServicioVariant(value)}>{value}</Badge>;

    default:
      return <WrapCell weight={500}>{value}</WrapCell>;
  }
};