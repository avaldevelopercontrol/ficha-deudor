import { useMemo } from 'react';

import type { Column } from '@shared/types';

import { SelectActionButton } from '@shared/components/ui';
import {
  ASIGNAR_USUARIO_COLUMNS,
  ASIGNAR_USUARIO_COLUMN_WIDTHS,
  ASIGNAR_USUARIO_TEXTS,
} from '../constants/asignarUsuario.constants';
import type { UsuarioAsignable } from '../types/asignarUsuario.types';

interface UseAsignarUsuarioColumnsParams {
  onSelect?: (
    usuario: UsuarioAsignable
  ) => void;
}

export const useAsignarUsuarioColumns = ({
  onSelect,
}: UseAsignarUsuarioColumnsParams = {}): Column<UsuarioAsignable>[] => {
  return useMemo(
    () => [
      {
        key: 'id',
        label: ASIGNAR_USUARIO_COLUMNS.id,
        width:
          ASIGNAR_USUARIO_COLUMN_WIDTHS.id,
      },
      {
        key: 'nombre',
        label:
          ASIGNAR_USUARIO_COLUMNS.nombre,
        width:
          ASIGNAR_USUARIO_COLUMN_WIDTHS.nombre,
        render: (row) =>
          row.nombre || '—',
      },
      {
        key: 'perfil',
        label:
          ASIGNAR_USUARIO_COLUMNS.perfil,
        width:
          ASIGNAR_USUARIO_COLUMN_WIDTHS.perfil,
        render: (row) =>
          row.perfil || '—',
      },
      {
        key: 'login',
        label:
          ASIGNAR_USUARIO_COLUMNS.login,
        width:
          ASIGNAR_USUARIO_COLUMN_WIDTHS.login,
        render: (row) =>
          row.login || '—',
      },
      {
        key: 'acciones',
        label:
          ASIGNAR_USUARIO_COLUMNS.acciones,
        width:
          ASIGNAR_USUARIO_COLUMN_WIDTHS.acciones,
        filterable: false,
        render: (row) => (
          <SelectActionButton
            ariaLabel={`${ASIGNAR_USUARIO_TEXTS.selectAction}: ${row.nombre}`}
            title={ASIGNAR_USUARIO_TEXTS.selectAction}
            onClick={() => onSelect?.(row)}
          />
        ),
      },
    ],
    [onSelect]
  );
};