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
  PerfilOpcionCount,
} from '../../../types/perfilOpcion.types';

import {
  MANTENER_ACCESOS_PERFIL_COLUMNS,
  MANTENER_ACCESOS_PERFIL_COLUMN_WIDTHS,
  MANTENER_ACCESOS_PERFIL_TEXTS,
} from '../constants/mantenerAccesosPerfil.constants';

interface UseMantenerAccesosPerfilColumnsParams {
  onEditPerfil?: (
    perfil: PerfilOpcionCount
  ) => void;
}

export const useMantenerAccesosPerfilColumns = ({
  onEditPerfil,
}: UseMantenerAccesosPerfilColumnsParams = {}): Column<PerfilOpcionCount>[] => {
  return useMemo(
    () => [
      {
        key: 'idPerfil',
        label:
          MANTENER_ACCESOS_PERFIL_COLUMNS
            .idPerfil,
        width:
          MANTENER_ACCESOS_PERFIL_COLUMN_WIDTHS
            .idPerfil,
      },
      {
        key: 'nombrePerfil',
        label:
          MANTENER_ACCESOS_PERFIL_COLUMNS
            .nombrePerfil,
        width:
          MANTENER_ACCESOS_PERFIL_COLUMN_WIDTHS
            .nombrePerfil,
        render: (row) =>
          row.nombrePerfil || '—',
      },
      {
        key: 'estadoActivo',
        label:
          MANTENER_ACCESOS_PERFIL_COLUMNS
            .estado,
        width:
          MANTENER_ACCESOS_PERFIL_COLUMN_WIDTHS
            .estado,
        render: (row) => {
          if (row.estadoActivo === undefined) {
            return '—';
          }

          return (
            <Badge
              variant={
                row.estadoActivo
                  ? 'success'
                  : 'neutral'
              }
              style={{
                padding: '3px 8px',
                fontSize: '10px',
              }}
            >
              {row.estadoActivo
                ? 'ACTIVO'
                : 'INACTIVO'}
            </Badge>
          );
        },
      },
      {
        key: 'cantidadOpciones',
        label:
          MANTENER_ACCESOS_PERFIL_COLUMNS
            .cantidadOpciones,
        width:
          MANTENER_ACCESOS_PERFIL_COLUMN_WIDTHS
            .cantidadOpciones,
      },
      {
        key: 'editar',
        label:
          MANTENER_ACCESOS_PERFIL_COLUMNS
            .editar,
        width:
          MANTENER_ACCESOS_PERFIL_COLUMN_WIDTHS
            .editar,
        align: 'center',
        filterable: false,
        render: (row) => (
          <EditActionButton
            ariaLabel={`${MANTENER_ACCESOS_PERFIL_TEXTS.editAction}: ${row.nombrePerfil}`}
            title={
              onEditPerfil
                ? MANTENER_ACCESOS_PERFIL_TEXTS
                    .editAction
                : MANTENER_ACCESOS_PERFIL_TEXTS
                    .editPendingTitle
            }
            disabled={!onEditPerfil}
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
