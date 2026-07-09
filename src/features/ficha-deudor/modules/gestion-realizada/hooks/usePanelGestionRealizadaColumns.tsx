import { useMemo } from 'react';

import type { Column } from '@shared/types';
import type {
  GestionRealizada,
  GestionCompleta,
} from '../../../shared/types';
import {
  renderComentarioCell,
  renderEliminarGestionCell,
  renderGestionCompletaResultadoCell,
  renderGestionRealizadaResultadoCell,
  renderNroCell,
  renderOperacionBadgeCell,
  renderWrappedTextCell,
} from '../utils/panelGestionRealizadaCells.utils';

interface UsePanelGestionRealizadaColumnsParams {
  onEliminar: (row: GestionRealizada) => void;
}

export const usePanelGestionRealizadaColumns = ({
  onEliminar,
}: UsePanelGestionRealizadaColumnsParams) => {
  const columnsResumidas: Column<GestionRealizada>[] = useMemo(
    () => [
      {
        key: 'nro',
        label: 'Nro',
        render: (row) => renderNroCell(row.nro),
      },
      {
        key: 'fecha',
        label: 'Fecha',
      },
      {
        key: 'gestor',
        label: 'Gestor',
        render: (row) => renderWrappedTextCell(row.gestor),
      },
      {
        key: 'documento',
        label: 'Documento',
      },
      {
        key: 'operacion',
        label: 'Operación',
        render: (row) => renderOperacionBadgeCell(row.operacion),
      },
      {
        key: 'respuesta',
        label: 'Respuesta',
        render: renderGestionRealizadaResultadoCell,
      },
      {
        key: 'comentario',
        label: 'Comentario',
        render: (row) => renderComentarioCell(row.comentario),
      },
      {
        key: 'acciones',
        label: 'Borrar',
        width: '55px',
        filterable: false,
        render: (row) => renderEliminarGestionCell(row, onEliminar),
      },
    ],
    [onEliminar]
  );

  const columnsExpandidas: Column<GestionCompleta>[] = useMemo(
    () => [
      {
        key: 'nro',
        label: 'Nro',
        render: (row) => renderNroCell(row.nro),
      },
      {
        key: 'cliente',
        label: 'Cliente',
        render: (row) => renderWrappedTextCell(row.cliente),
      },
      {
        key: 'cartera',
        label: 'Cartera',
        render: (row) => renderWrappedTextCell(row.cartera),
      },
      {
        key: 'campana',
        label: 'Campaña',
        render: (row) => renderWrappedTextCell(row.campana),
      },
      {
        key: 'fecha',
        label: 'Fecha',
      },
      {
        key: 'gestor',
        label: 'Gestor',
        render: (row) => renderWrappedTextCell(row.gestor),
      },
      {
        key: 'documento',
        label: 'Documento',
      },
      {
        key: 'operacion',
        label: 'Operación',
        render: (row) => renderOperacionBadgeCell(row.operacion),
      },
      {
        key: 'resultado',
        label: 'Resultado',
        render: renderGestionCompletaResultadoCell,
      },
      {
        key: 'comentario',
        label: 'Comentario',
        render: (row) => renderComentarioCell(row.comentario),
      },
    ],
    []
  );

  return {
    columnsResumidas,
    columnsExpandidas,
  };
};