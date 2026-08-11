import {
  useMemo,
} from 'react';

import {
  Badge,
  EditActionButton,
} from '@shared/components/ui';
import type {
  Column,
} from '@shared/types';

import type {
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import {
  MANTENER_ACCESOS_USUARIO_COLUMNS,
  MANTENER_ACCESOS_USUARIO_COLUMN_WIDTHS,
  MANTENER_ACCESOS_USUARIO_TEXTS,
} from '../constants/mantenerAccesosUsuario.constants';

interface UseMantenerAccesosUsuarioColumnsParams {
  onEditAcceso?: (
    acceso: UsuarioGrupoOpcionListado
  ) => void;
}

export const useMantenerAccesosUsuarioColumns = ({
  onEditAcceso,
}: UseMantenerAccesosUsuarioColumnsParams = {}): Column<UsuarioGrupoOpcionListado>[] => {
  return useMemo(
    () => [
      {
        key: 'idUsuarioGrupoOpcion',
        label:
          MANTENER_ACCESOS_USUARIO_COLUMNS
            .idUsuarioGrupoOpcion,
        width:
          MANTENER_ACCESOS_USUARIO_COLUMN_WIDTHS
            .idUsuarioGrupoOpcion,
      },
      {
        key: 'usuario',
        label:
          MANTENER_ACCESOS_USUARIO_COLUMNS
            .usuario,
        width:
          MANTENER_ACCESOS_USUARIO_COLUMN_WIDTHS
            .usuario,
      },
      {
        key: 'nombreCompleto',
        label:
          MANTENER_ACCESOS_USUARIO_COLUMNS
            .nombreCompleto,
        width:
          MANTENER_ACCESOS_USUARIO_COLUMN_WIDTHS
            .nombreCompleto,
        render: (row) =>
          row.nombreCompleto || '—',
      },
      {
        key: 'grupo',
        label:
          MANTENER_ACCESOS_USUARIO_COLUMNS
            .grupo,
        width:
          MANTENER_ACCESOS_USUARIO_COLUMN_WIDTHS
            .grupo,
        render: (row) =>
          row.grupo || '—',
      },
      {
        key: 'opcion',
        label:
          MANTENER_ACCESOS_USUARIO_COLUMNS
            .opcion,
        width:
          MANTENER_ACCESOS_USUARIO_COLUMN_WIDTHS
            .opcion,
        render: (row) =>
          row.opcion || '—',
      },
      {
        key: 'estado',
        label:
          MANTENER_ACCESOS_USUARIO_COLUMNS
            .estado,
        width:
          MANTENER_ACCESOS_USUARIO_COLUMN_WIDTHS
            .estado,
        render: (row) => (
          <Badge
            variant={
              row.estado === 'Activo'
                ? 'success'
                : 'neutral'
            }
            style={{
              padding: '3px 8px',
              fontSize: '10px',
            }}
          >
            {row.estado.toUpperCase()}
          </Badge>
        ),
      },
      {
        key: 'editar',
        label:
          MANTENER_ACCESOS_USUARIO_COLUMNS
            .editar,
        width:
          MANTENER_ACCESOS_USUARIO_COLUMN_WIDTHS
            .editar,
        align: 'center',
        filterable: false,
        render: (row) => (
          <EditActionButton
            ariaLabel={`${MANTENER_ACCESOS_USUARIO_TEXTS.editAction}: ${row.usuario} - ${row.grupo}`}
            title={
              MANTENER_ACCESOS_USUARIO_TEXTS
                .editAction
            }
            disabled={!onEditAcceso}
            onClick={() => {
              onEditAcceso?.(row);
            }}
          />
        ),
      },
    ],
    [onEditAcceso]
  );
};
