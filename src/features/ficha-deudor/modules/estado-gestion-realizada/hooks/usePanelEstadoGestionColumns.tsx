import { useMemo } from 'react';
import type { Column } from '@shared/types';
import type {
  EstadoGestion,
  EstadoGestionCompleta,
} from '../../../shared/types';
import {
  renderEstadoGestionComentarioCell,
  renderEstadoGestionNroCell,
  renderEstadoGestionOperacionCell,
  renderEstadoGestionResultadoCell,
  renderEstadoGestionWrappedTextCell,
} from '../utils/panelEstadoGestionCells.utils';

export const usePanelEstadoGestionColumns = () => {
  const columnsResumidas: Column<EstadoGestion>[] = useMemo(
    () => [
      {
        key: 'nro',
        label: 'Nro',
        render: (row) => renderEstadoGestionNroCell(row.nro),
      },
      {
        key: 'fecha',
        label: 'Fecha',
      },
      {
        key: 'operador',
        label: 'Operador',
        render: (row) => renderEstadoGestionWrappedTextCell(row.operador),
      },
      {
        key: 'documento',
        label: 'Documento',
      },
      {
        key: 'operacion',
        label: 'Operación',
        render: (row) => renderEstadoGestionOperacionCell(row.operacion),
      },
      {
        key: 'resultado',
        label: 'Resultado',
        render: (row) => renderEstadoGestionResultadoCell(row.resultado),
      },
      {
        key: 'comentario',
        label: 'Comentario',
        render: (row) => renderEstadoGestionComentarioCell(row.comentario),
      },
    ],
    []
  );

  const columnsExpandidas: Column<EstadoGestionCompleta>[] = useMemo(
    () => [
      {
        key: 'nro',
        label: 'Nro',
        render: (row) => renderEstadoGestionNroCell(row.nro),
      },
      {
        key: 'cliente',
        label: 'Cliente',
        render: (row) => renderEstadoGestionWrappedTextCell(row.cliente),
      },
      {
        key: 'cartera',
        label: 'Cartera',
        render: (row) => renderEstadoGestionWrappedTextCell(row.cartera),
      },
      {
        key: 'campana',
        label: 'Campaña',
      },
      {
        key: 'fecha',
        label: 'Fecha',
      },
      {
        key: 'gestor',
        label: 'Gestor',
        render: (row) => renderEstadoGestionWrappedTextCell(row.gestor),
      },
      {
        key: 'documento',
        label: 'Documento',
      },
      {
        key: 'operacion',
        label: 'Operación',
        render: (row) => renderEstadoGestionOperacionCell(row.operacion),
      },
      {
        key: 'resultado',
        label: 'Resultado',
        render: (row) => renderEstadoGestionResultadoCell(row.resultado),
      },
      {
        key: 'comentario',
        label: 'Comentario',
        render: (row) => renderEstadoGestionComentarioCell(row.comentario),
      },
    ],
    []
  );

  return {
    columnsResumidas,
    columnsExpandidas,
  };
};