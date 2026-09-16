import { useMemo } from 'react';

import { EditActionButton } from '@shared/components/ui';
import { WrapCell } from '@shared/components/ui/WrapCell';
import type { Column } from '@shared/types';

import {
  REPORTAR_CASOS_POPUP_COLUMNS,
  REPORTAR_CASOS_POPUP_COLUMN_WIDTHS,
} from '../constants/reportarCasosPopup.constants';
import type { ReportarCaso } from '../types/reportarCaso.types';
import { formatReportarCasoFecha } from '../utils/reportarCasosPopup.utils';

interface UseReportarCasosColumnsProps {
  onEdit: (row: ReportarCaso) => void;
}

export const useReportarCasosColumns = ({
  onEdit,
}: UseReportarCasosColumnsProps): Column[] => {
  return useMemo(
    () => [
      {
        key: 'id',
        label: REPORTAR_CASOS_POPUP_COLUMNS.id,
        width: REPORTAR_CASOS_POPUP_COLUMN_WIDTHS.id,
        render: (row: ReportarCaso) => <span>{row.id}</span>,
      },
      {
        key: 'caso',
        label: REPORTAR_CASOS_POPUP_COLUMNS.caso,
        width: REPORTAR_CASOS_POPUP_COLUMN_WIDTHS.caso,
        render: (row: ReportarCaso) => <WrapCell>{row.caso}</WrapCell>,
      },
      {
        key: 'descripcion',
        label: REPORTAR_CASOS_POPUP_COLUMNS.descripcion,
        render: (row: ReportarCaso) => (
          <WrapCell>{row.descripcion}</WrapCell>
        ),
      },
      {
        key: 'cartera',
        label: REPORTAR_CASOS_POPUP_COLUMNS.cartera,
        width: REPORTAR_CASOS_POPUP_COLUMN_WIDTHS.cartera,
        render: (row: ReportarCaso) => <WrapCell>{row.cartera}</WrapCell>,
      },
      {
        key: 'usuario',
        label: REPORTAR_CASOS_POPUP_COLUMNS.usuario,
        width: REPORTAR_CASOS_POPUP_COLUMN_WIDTHS.usuario,
        render: (row: ReportarCaso) => <WrapCell>{row.usuario}</WrapCell>,
      },
      {
        key: 'fechaIngreso',
        label: REPORTAR_CASOS_POPUP_COLUMNS.fechaIngreso,
        width: REPORTAR_CASOS_POPUP_COLUMN_WIDTHS.fechaIngreso,
        render: (row: ReportarCaso) => (
          <span>{formatReportarCasoFecha(row.fechaIngreso)}</span>
        ),
      },
      {
        key: 'acciones',
        label: REPORTAR_CASOS_POPUP_COLUMNS.acciones,
        width: REPORTAR_CASOS_POPUP_COLUMN_WIDTHS.acciones,
        align: 'center',
        filterable: false,
        render: (row: ReportarCaso) => (
          <EditActionButton
            ariaLabel={`Editar caso: ${row.id}`}
            onClick={() => onEdit(row)}
          />
        ),
      },
    ],
    [onEdit]
  );
};
