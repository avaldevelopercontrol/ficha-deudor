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

import {
  MANTENER_PERFIL_COLUMNS,
  MANTENER_PERFIL_COLUMN_WIDTHS,
  MANTENER_PERFIL_TEXTS,
} from '../constants/mantenerPerfil.constants';

import type {
  Perfil,
} from '../../../types/perfil.types';

interface UseMantenerPerfilColumnsParams {
  onEditPerfil?: (
    perfil: Perfil
  ) => void;
}

const renderBooleanBadge = (
  value: 'Sí' | 'No'
) => (
  <Badge
    variant={
      value === 'Sí'
        ? 'success'
        : 'neutral'
    }
    style={{
      padding: '3px 8px',
      fontSize: '10px',
    }}
  >
    {value.toUpperCase()}
  </Badge>
);

export const useMantenerPerfilColumns = ({
  onEditPerfil,
}: UseMantenerPerfilColumnsParams = {}): Column<Perfil>[] => {
  return useMemo(
    () => [
      {
        key: 'idPerfil',

        label:
          MANTENER_PERFIL_COLUMNS
            .idPerfil,

        width:
          MANTENER_PERFIL_COLUMN_WIDTHS
            .idPerfil,
      },
      {
        key: 'nombrePerfil',

        label:
          MANTENER_PERFIL_COLUMNS
            .nombrePerfil,

        width:
          MANTENER_PERFIL_COLUMN_WIDTHS
            .nombrePerfil,

        render: (row) =>
          row.nombrePerfil || '—',
      },
      {
        key: 'abreviatura',

        label:
          MANTENER_PERFIL_COLUMNS
            .abreviatura,

        width:
          MANTENER_PERFIL_COLUMN_WIDTHS
            .abreviatura,

        render: (row) =>
          row.abreviatura || '—',
      },
      {
        key: 'fechaRegistro',

        label:
          MANTENER_PERFIL_COLUMNS
            .fechaRegistro,

        width:
          MANTENER_PERFIL_COLUMN_WIDTHS
            .fechaRegistro,

        render: (row) =>
          row.fechaRegistro || '—',
      },
      {
        key: 'estado',

        label:
          MANTENER_PERFIL_COLUMNS
            .estado,

        width:
          MANTENER_PERFIL_COLUMN_WIDTHS
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
        key: 'produccionOnline',

        label:
          MANTENER_PERFIL_COLUMNS
            .produccionOnline,

        width:
          MANTENER_PERFIL_COLUMN_WIDTHS
            .produccionOnline,

        render: (row) =>
          renderBooleanBadge(
            row.produccionOnline
          ),
      },
      {
        key: 'historiaDeudor',

        label:
          MANTENER_PERFIL_COLUMNS
            .historiaDeudor,

        width:
          MANTENER_PERFIL_COLUMN_WIDTHS
            .historiaDeudor,

        render: (row) =>
          renderBooleanBadge(
            row.historiaDeudor
          ),
      },
      {
        key: 'editar',

        label:
          MANTENER_PERFIL_COLUMNS
            .editar,

        width:
          MANTENER_PERFIL_COLUMN_WIDTHS
            .editar,

        align: 'center',
        filterable: false,

        render: (row) => (
          <EditActionButton
            ariaLabel={`${MANTENER_PERFIL_TEXTS.editAction}: ${row.nombrePerfil}`}
            title={
              MANTENER_PERFIL_TEXTS
                .editAction
            }
            onClick={() => {
              onEditPerfil?.(row);
            }}
          />
        ),
      },
    ],
    [onEditPerfil]
  );
};