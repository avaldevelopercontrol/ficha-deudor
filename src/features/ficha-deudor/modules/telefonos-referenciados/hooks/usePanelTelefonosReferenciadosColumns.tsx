import { useMemo } from 'react';
import type { Column } from '@shared/types';
import type { TelefonoReferenciado } from '../types/telefono.types';
import {
  renderTelefonoContactadosCell,
  renderTelefonoEditCell,
  renderTelefonoEstadoCell,
  renderTelefonoNumeroCell,
  renderTelefonoWrappedCell,
} from '../utils/panelTelefonosReferenciadosCells.utils';

interface UsePanelTelefonosReferenciadosColumnsParams {
  onEdit: (row: TelefonoReferenciado) => void;
  onSelectTelefono?: (telefono: string) => void;
}

export const usePanelTelefonosReferenciadosColumns = ({
  onEdit,
  onSelectTelefono,
}: UsePanelTelefonosReferenciadosColumnsParams) => {
  const columns: Column<TelefonoReferenciado>[] = useMemo(
    () => [
      {
        key: 'prioridad',
        label: 'Prioridad',
      },
      {
        key: 'numero',
        label: 'Número',
        render: (row) => renderTelefonoNumeroCell(row.numero, onSelectTelefono),
      },
      {
        key: 'horario',
        label: 'Horario',
        render: (row) => renderTelefonoWrappedCell(row.horario),
      },
      {
        key: 'refUbicacion',
        label: 'Ref. Ubicación',
        render: (row) => renderTelefonoWrappedCell(row.refUbicacion),
      },
      {
        key: 'estado',
        label: 'Estado',
        render: (row) => renderTelefonoEstadoCell(row.estado),
      },
      {
        key: 'fechaEstado',
        label: 'Fecha Estado',
      },
      {
        key: 'fechaBase',
        label: 'Fecha Base',
      },
      {
        key: 'contactados',
        label: 'Contactados',
        render: (row) => renderTelefonoContactadosCell(row.contactados),
      },
      {
        key: 'noContactados',
        label: 'No Contactados',
      },
      {
        key: 'ivr',
        label: 'IVR',
      },
      {
        key: 'fuente',
        label: 'Fuente',
        render: (row) => renderTelefonoWrappedCell(row.fuente),
      },
      {
        key: 'ordenSearch',
        label: 'Orden Search',
      },
      {
        key: 'acciones',
        label: 'Editar',
        width: '55px',
        filterable: false,
        render: (row) => renderTelefonoEditCell(row, onEdit),
      },
    ],
    [onEdit, onSelectTelefono]
  );

  return {
    columns,
  };
};