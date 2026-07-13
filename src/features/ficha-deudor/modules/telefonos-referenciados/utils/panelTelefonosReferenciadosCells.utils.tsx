import type { KeyboardEvent, MouseEvent } from 'react';
import { EditActionButton } from '@shared/components/ui';
import { Badge } from '@shared/components/ui/Badge';
import { WrapCell } from '@shared/components/ui/WrapCell';
import type { TelefonoReferenciado } from '../types/telefono.types';
import ExpandableCell from '@shared/components/ui/ExpandableCell';

const EMPTY_CELL = '—';

export const renderTelefonoNumeroCell = (
  numeroValue: string | number | null | undefined,
  onSelectTelefono?: (telefono: string) => void
) => {
  const numero = String(numeroValue ?? '').trim();

  if (!numero) return EMPTY_CELL;

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    onSelectTelefono?.(numero);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    event.stopPropagation();
    onSelectTelefono?.(numero);
  };

  return (
    <span
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {numero}
    </span>
  );
};

export const renderTelefonoWrappedCell = (value: string) => {
  return <WrapCell>{value}</WrapCell>;
};

export const renderTelefonoExpandableCell = (value: string) => {
  return <ExpandableCell text={value} maxLines={2} lineHeight={18} />;
};

export const renderTelefonoEstadoCell = (estado: string) => {
  return (
    <Badge
      variant={estado === 'OPERATIVO' ? 'success' : 'neutral'}
      style={{ padding: '2px 7px', borderRadius: '10px', fontSize: '9px' }}
    >
      {estado || EMPTY_CELL}
    </Badge>
  );
};

export const renderTelefonoContactadosCell = (
  contactados: string | number
) => {
  return <WrapCell weight={500}>{`${contactados}`}</WrapCell>;
};

export const renderTelefonoEditCell = (
  row: TelefonoReferenciado,
  onEdit: (row: TelefonoReferenciado) => void
) => {
  return (
    <EditActionButton
      ariaLabel={`Editar teléfono: ${row.numero}`}
      onClick={() => onEdit(row)}
    />
  );
};