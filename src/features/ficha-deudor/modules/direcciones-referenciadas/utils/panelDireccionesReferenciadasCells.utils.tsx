import { ActionButton } from '@shared/components/ui';
import { WrapCell } from '@shared/components/ui/WrapCell';
import type { DireccionReferenciada } from '../types/direccion.types';

const EMPTY_CELL = '—';

const ESTADOS_BADGE: Record<string, string> = {
  ACTIVO: 'badge-s',
  INACTIVO: 'badge-d',
};

export const renderDireccionWrappedCell = (value: string) => {
  return <WrapCell>{value}</WrapCell>;
};

export const renderDireccionNombreCell = (nombre: string) => {
  return <WrapCell weight={500}>{nombre}</WrapCell>;
};

export const renderDireccionTipoDeudorCell = (tipoDeudor: string) => {
  return (
    <span
      className={`badge ${
        tipoDeudor === 'Titular' ? 'badge-s' : 'badge-info'
      }`}
    >
      {tipoDeudor}
    </span>
  );
};

export const renderDireccionEstadoCell = (estado: string) => {
  const badgeClass = ESTADOS_BADGE[estado] || 'badge-n';

  return (
    <span className={`badge ${badgeClass}`}>
      {estado || EMPTY_CELL}
    </span>
  );
};

export const renderDireccionEditCell = (
  row: DireccionReferenciada,
  onEdit: (row: DireccionReferenciada) => void
) => {
  return (
    <ActionButton
      label=""
      variant="primary"
      size="sm"
      icon="✎"
      onClick={() => onEdit(row)}
    />
  );
};