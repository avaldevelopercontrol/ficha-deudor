import type {
  KeyboardEvent,
  MouseEvent,
} from 'react';

import {
  EditActionButton,
} from '@shared/components/ui';
import { Badge } from '@shared/components/ui/Badge';
import ExpandableCell from '@shared/components/ui/ExpandableCell';
import { WrapCell } from '@shared/components/ui/WrapCell';
import { maskPhoneNumber } from '@shared/utils/maskPhoneNumber';

import type { TelefonoReferenciado } from '../types/telefono.types';

const EMPTY_CELL = '—';

export const renderTelefonoNumeroCell = (
  numeroValue: string | number | null | undefined,
  onSelectTelefono: (telefono: string) => void
) => {
  const numeroCompleto = String(
    numeroValue ?? ''
  ).trim();

  if (!numeroCompleto) {
    return EMPTY_CELL;
  }

  const numeroEnmascarado =
    maskPhoneNumber(numeroCompleto);

  const handleClick = (
    event: MouseEvent<HTMLSpanElement>
  ) => {
    event.stopPropagation();

    // Se envía el número original a Ficha de Gestión.
    onSelectTelefono(numeroCompleto);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLSpanElement>
  ) => {
    const isSelectionKey =
      event.key === 'Enter' ||
      event.key === ' ';

    if (!isSelectionKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Se envía el número original a Ficha de Gestión.
    onSelectTelefono(numeroCompleto);
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Seleccionar teléfono ${numeroEnmascarado}`}
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {numeroEnmascarado}
    </span>
  );
};

export const renderTelefonoWrappedCell = (
  value: string
) => {
  return <WrapCell>{value}</WrapCell>;
};

export const renderTelefonoExpandableCell = (
  value: string
) => {
  return (
    <ExpandableCell
      text={value}
      maxLines={2}
      lineHeight={18}
    />
  );
};

export const renderTelefonoEstadoCell = (
  estado: string
) => {
  return (
    <Badge
      variant={
        estado === 'OPERATIVO'
          ? 'success'
          : 'neutral'
      }
      style={{
        padding: '2px 7px',
        borderRadius: '10px',
        fontSize: '9px',
      }}
    >
      {estado || EMPTY_CELL}
    </Badge>
  );
};

export const renderTelefonoContactadosCell = (
  contactados: string | number
) => {
  return (
    <WrapCell weight={500}>
      {`${contactados}`}
    </WrapCell>
  );
};

export const renderTelefonoEditCell = (
  row: TelefonoReferenciado,
  onEdit: (
    row: TelefonoReferenciado
  ) => void
) => {
  const numeroEnmascarado =
    maskPhoneNumber(row.numero);

  return (
    <EditActionButton
      ariaLabel={`Editar teléfono ${numeroEnmascarado}`}
      title="Editar teléfono"
      onClick={() => onEdit(row)}
    />
  );
};