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
  Grupo,
} from '../../../types/grupo.types';

import {
  MANTENER_GRUPO_COLUMNS,
  MANTENER_GRUPO_COLUMN_WIDTHS,
  MANTENER_GRUPO_TEXTS,
} from '../constants/mantenerGrupo.constants';

interface UseMantenerGrupoColumnsParams {
  onEditGrupo?: (
    grupo: Grupo
  ) => void;
}

export const useMantenerGrupoColumns = ({
  onEditGrupo,
}: UseMantenerGrupoColumnsParams = {}): Column<Grupo>[] => {
  return useMemo(
    () => [
      {
        key: 'idGrupo',

        label:
          MANTENER_GRUPO_COLUMNS
            .idGrupo,

        width:
          MANTENER_GRUPO_COLUMN_WIDTHS
            .idGrupo,
      },
      {
        key: 'nombreGrupo',

        label:
          MANTENER_GRUPO_COLUMNS
            .nombreGrupo,

        width:
          MANTENER_GRUPO_COLUMN_WIDTHS
            .nombreGrupo,

        render: (row) =>
          row.nombreGrupo || '—',
      },
      {
        key: 'cliente',

        label:
          MANTENER_GRUPO_COLUMNS
            .cliente,

        width:
          MANTENER_GRUPO_COLUMN_WIDTHS
            .cliente,

        render: (row) =>
          row.cliente || '—',
      },
      {
        key: 'estado',

        label:
          MANTENER_GRUPO_COLUMNS
            .estado,

        width:
          MANTENER_GRUPO_COLUMN_WIDTHS
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
          MANTENER_GRUPO_COLUMNS
            .editar,

        width:
          MANTENER_GRUPO_COLUMN_WIDTHS
            .editar,

        align: 'center',
        filterable: false,

        render: (row) => (
          <EditActionButton
            ariaLabel={`${MANTENER_GRUPO_TEXTS.editAction}: ${row.nombreGrupo}`}
            title={
              onEditGrupo
                ? MANTENER_GRUPO_TEXTS
                    .editAction
                : MANTENER_GRUPO_TEXTS
                    .editUnavailable
            }
            disabled={
              !onEditGrupo
            }
            onClick={() => {
              onEditGrupo?.(row);
            }}
          />
        ),
      },
    ],
    [onEditGrupo]
  );
};
