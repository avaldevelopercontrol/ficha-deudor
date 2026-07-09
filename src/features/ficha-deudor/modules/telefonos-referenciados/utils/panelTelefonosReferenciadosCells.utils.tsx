import type { KeyboardEvent, MouseEvent } from 'react';
import { ActionButton } from '@shared/components/ui';
import { Badge } from '@shared/components/ui/Badge';
import { WrapCell } from '@shared/components/ui/WrapCell';
import type { TelefonoReferenciado } from '../types/telefono.types';

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
    <ActionButton
      label=""
      variant="primary"
      size="sm"
      icon="✎"
      onClick={() => onEdit(row)}
    />
  );
};