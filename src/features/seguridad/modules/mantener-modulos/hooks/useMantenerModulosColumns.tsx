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
  Modulo,
} from '../../../types/opcion.types';

import {
  MANTENER_MODULOS_COLUMNS,
  MANTENER_MODULOS_COLUMN_WIDTHS,
  MANTENER_MODULOS_TEXTS,
} from '../constants/mantenerModulos.constants';

interface UseMantenerModulosColumnsParams {
  onEditModulo?: (
    modulo: Modulo
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

export const useMantenerModulosColumns = ({
  onEditModulo,
}: UseMantenerModulosColumnsParams = {}): Column<Modulo>[] => {
  return useMemo(
    () => [
      {
        key: 'idModulo',
        label:
          MANTENER_MODULOS_COLUMNS
            .idModulo,
        width:
          MANTENER_MODULOS_COLUMN_WIDTHS
            .idModulo,
      },
      {
        key: 'nombre',
        label:
          MANTENER_MODULOS_COLUMNS
            .nombre,
        width:
          MANTENER_MODULOS_COLUMN_WIDTHS
            .nombre,
        render: (row) =>
          row.nombre || '—',
      },
      {
        key: 'padre',
        label:
          MANTENER_MODULOS_COLUMNS
            .padre,
        width:
          MANTENER_MODULOS_COLUMN_WIDTHS
            .padre,
        render: (row) =>
          row.padre || '—',
      },
      {
        key: 'tipo',
        label:
          MANTENER_MODULOS_COLUMNS
            .nivel,
        width:
          MANTENER_MODULOS_COLUMN_WIDTHS
            .nivel,
      },
      {
        key: 'implementacion',
        label:
          MANTENER_MODULOS_COLUMNS
            .implementacion,
        width:
          MANTENER_MODULOS_COLUMN_WIDTHS
            .implementacion,
        render: (row) => {
          const label =
            row.implementacion ??
            'SIN PANTALLA';

          const variant =
            label === 'IMPLEMENTADA'
              ? 'success'
              : label === 'ESTRUCTURA'
                ? 'info'
                : 'warning';

          return (
            <Badge
              variant={variant}
              style={{
                padding: '3px 8px',
                fontSize: '10px',
              }}
            >
              {label}
            </Badge>
          );
        },
      },
      {
        key: 'visible',
        label:
          MANTENER_MODULOS_COLUMNS
            .visible,
        width:
          MANTENER_MODULOS_COLUMN_WIDTHS
            .visible,
        render: (row) =>
          renderBooleanBadge(
            row.visible
          ),
      },
      {
        key: 'estado',
        label:
          MANTENER_MODULOS_COLUMNS
            .estado,
        width:
          MANTENER_MODULOS_COLUMN_WIDTHS
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
          MANTENER_MODULOS_COLUMNS
            .editar,
        width:
          MANTENER_MODULOS_COLUMN_WIDTHS
            .editar,
        align: 'center',
        filterable: false,
        render: (row) => (
          <EditActionButton
            ariaLabel={`${MANTENER_MODULOS_TEXTS.editAction}: ${row.nombre}`}
            title={
              onEditModulo
                ? MANTENER_MODULOS_TEXTS
                    .editAction
                : MANTENER_MODULOS_TEXTS
                    .editUnavailable
            }
            disabled={
              !onEditModulo
            }
            onClick={() => {
              onEditModulo?.(row);
            }}
          />
        ),
      },
    ],
    [onEditModulo]
  );
};
