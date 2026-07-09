import { useMemo } from 'react';
import type { Column } from '@shared/types';
import type { DireccionReferenciada } from '../types/direccion.types';
import {
  renderDireccionEditCell,
  renderDireccionEstadoCell,
  renderDireccionNombreCell,
  renderDireccionTipoDeudorCell,
  renderDireccionWrappedCell,
} from '../utils/panelDireccionesReferenciadasCells.utils';

interface UsePanelDireccionesReferenciadasColumnsParams {
  onEdit: (row: DireccionReferenciada) => void;
}

export const usePanelDireccionesReferenciadasColumns = ({
  onEdit,
}: UsePanelDireccionesReferenciadasColumnsParams) => {
  const columns: Column<DireccionReferenciada>[] = useMemo(
    () => [
      {
        key: 'direccion',
        label: 'Dirección',
        render: (row) => renderDireccionWrappedCell(row.direccion),
      },
      {
        key: 'refUbicacion',
        label: 'Ref. Ubicación',
        render: (row) => renderDireccionWrappedCell(row.refUbicacion),
      },
      {
        key: 'tipoDeudor',
        label: 'Tipo Deudor',
        render: (row) => renderDireccionTipoDeudorCell(row.tipoDeudor),
      },
      {
        key: 'nombre',
        label: 'Nombre',
        render: (row) => renderDireccionNombreCell(row.nombre),
      },
      {
        key: 'estado',
        label: 'Estado',
        render: (row) => renderDireccionEstadoCell(row.estado),
      },
      {
        key: 'acciones',
        label: 'Editar',
        width: '55px',
        filterable: false,
        render: (row) => renderDireccionEditCell(row, onEdit),
      },
    ],
    [onEdit]
  );

  return {
    columns,
  };
};