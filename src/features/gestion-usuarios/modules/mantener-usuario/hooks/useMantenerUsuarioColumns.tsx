import { useMemo } from 'react';

import {
  Badge,
  EditActionButton,
} from '@shared/components/ui';
import type { Column } from '@shared/types';

import {
  MANTENER_USUARIO_COLUMNS,
  MANTENER_USUARIO_COLUMN_WIDTHS,
  MANTENER_USUARIO_TEXTS,
} from '../constants/mantenerUsuario.constants';
import type { UsuarioMantenible } from '../types/mantenerUsuario.types';

interface UseMantenerUsuarioColumnsParams {
  onEditUsuario?: (
    usuario: UsuarioMantenible
  ) => void;
}

const getEstadoVariant = (
  estado: string
): 'success' | 'neutral' | 'warning' => {
  const normalizedEstado =
    estado.trim().toLowerCase();

  if (normalizedEstado === 'activo') {
    return 'success';
  }

  if (normalizedEstado === 'inactivo') {
    return 'neutral';
  }

  return 'warning';
};

export const useMantenerUsuarioColumns = ({
  onEditUsuario,
}: UseMantenerUsuarioColumnsParams = {}): Column<UsuarioMantenible>[] => {
  return useMemo(
    () => [
      {
        key: 'id',
        label:
          MANTENER_USUARIO_COLUMNS.id,
        width:
          MANTENER_USUARIO_COLUMN_WIDTHS.id,
      },
      {
        key: 'nombre',
        label:
          MANTENER_USUARIO_COLUMNS.nombre,
        width:
          MANTENER_USUARIO_COLUMN_WIDTHS.nombre,
        render: (row) =>
          row.nombre || '—',
      },
      {
        key: 'estado',
        label:
          MANTENER_USUARIO_COLUMNS.estado,
        width:
          MANTENER_USUARIO_COLUMN_WIDTHS.estado,
        render: (row) => {
          const estado =
            row.estado.trim() ||
            'Sin estado';

          return (
            <Badge
              variant={getEstadoVariant(
                estado
              )}
              style={{
                padding: '3px 8px',
                fontSize: '10px',
              }}
            >
              {estado.toUpperCase()}
            </Badge>
          );
        },
      },
      {
        key: 'perfil',
        label:
          MANTENER_USUARIO_COLUMNS.perfil,
        width:
          MANTENER_USUARIO_COLUMN_WIDTHS.perfil,
        render: (row) =>
          row.perfil || '—',
      },
      {
        key: 'codigoRecaudacion',
        label:
          MANTENER_USUARIO_COLUMNS
            .codigoRecaudacion,
        width:
          MANTENER_USUARIO_COLUMN_WIDTHS
            .codigoRecaudacion,
        render: (row) =>
          row.codigoRecaudacion || '—',
      },
      {
        key: 'login',
        label:
          MANTENER_USUARIO_COLUMNS.login,
        width:
          MANTENER_USUARIO_COLUMN_WIDTHS.login,
        render: (row) =>
          row.login || '—',
      },
      {
        key: 'editar',
        label:
          MANTENER_USUARIO_COLUMNS.editar,
        width:
          MANTENER_USUARIO_COLUMN_WIDTHS.editar,
        filterable: false,
        render: (row) => (
          <EditActionButton
            ariaLabel={`${MANTENER_USUARIO_TEXTS.editAction}: ${row.nombre}`}
            title={
              MANTENER_USUARIO_TEXTS
                .editAction
            }
            onClick={() => {
              onEditUsuario?.(row);
            }}
          />
        ),
      },
    ],
    [onEditUsuario]
  );
};