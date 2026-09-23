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
  MANTENER_BI_COLUMNS,
  MANTENER_BI_COLUMN_WIDTHS,
  MANTENER_BI_TEXTS,
} from '../constants/mantenerBi.constants';

interface UseMantenerBiColumnsParams {
  onEditBi?: (
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

export const useMantenerBiColumns = ({
  onEditBi,
}: UseMantenerBiColumnsParams = {}): Column<Modulo>[] => {
  return useMemo(
      () => [
        {
          key: 'idModulo',
          label:
            MANTENER_BI_COLUMNS
              .idModulo,
          width:
            MANTENER_BI_COLUMN_WIDTHS
              .idModulo,
        },
        {
          key: 'nombre',
          label:
            MANTENER_BI_COLUMNS
              .nombre,
          width:
            MANTENER_BI_COLUMN_WIDTHS
              .nombre,
          render: (row) =>
            row.nombre || '—',
        },
        {
          key: 'implementacion',
          label:
            MANTENER_BI_COLUMNS
              .implementacion,
          width:
            MANTENER_BI_COLUMN_WIDTHS
              .implementacion,
          render: (row) => {
            const label =
              row.implementacion ??
              'SIN IMPLEMENTAR';

            const variant =
              label === 'IMPLEMENTADO'
                ? 'success'
                : label === 'POWER BI'
                  ? 'info'
                  : label === 'AGRUPADOR'
                    ? 'neutral'
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
            MANTENER_BI_COLUMNS
              .visible,
          width:
            MANTENER_BI_COLUMN_WIDTHS
              .visible,
          render: (row) =>
            renderBooleanBadge(
              row.visible
            ),
        },
        {
          key: 'estado',
          label:
            MANTENER_BI_COLUMNS
              .estado,
          width:
            MANTENER_BI_COLUMN_WIDTHS
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
            MANTENER_BI_COLUMNS
              .editar,
          width:
            MANTENER_BI_COLUMN_WIDTHS
              .editar,
          align: 'center',
          filterable: false,
          render: (row) => (
            <EditActionButton
              ariaLabel={`${MANTENER_BI_TEXTS.editAction}: ${row.nombre}`}
              title={
                onEditBi
                  ? MANTENER_BI_TEXTS
                      .editAction
                  : MANTENER_BI_TEXTS
                      .editUnavailable
              }
              disabled={!onEditBi}
              onClick={() => {
                onEditBi?.(row);
              }}
            />
          ),
        },
      ],
    [onEditBi]
  );
};
