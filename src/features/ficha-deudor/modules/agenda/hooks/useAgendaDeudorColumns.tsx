import { useMemo } from 'react';

import { WrapCell } from '@shared/components/ui/WrapCell';
import type { Column } from '@shared/types';
import type { Agenda } from '../types/agenda.types';
import {
  AGENDA_DEUDOR_POPUP_COLUMNS,
  AGENDA_DEUDOR_POPUP_COLUMN_WIDTHS,
} from '../constants/agendaDeudorPopup.constants';
import { formatAgendaPopupFecha } from '../utils/agendaDeudorPopup.utils';

export const useAgendaDeudorColumns = (): Column[] => {
  return useMemo(
    () => [
      {
        key: 'id',
        label: AGENDA_DEUDOR_POPUP_COLUMNS.id,
        width: AGENDA_DEUDOR_POPUP_COLUMN_WIDTHS.id,
        render: (row: Agenda) => <span>{row.id}</span>,
      },
      {
        key: 'fechaNuevaGestion',
        label: AGENDA_DEUDOR_POPUP_COLUMNS.fechaNuevaGestion,
        width: AGENDA_DEUDOR_POPUP_COLUMN_WIDTHS.fechaNuevaGestion,
        render: (row: Agenda) => (
          <span>{formatAgendaPopupFecha(row.fechaNuevaGestion)}</span>
        ),
      },
      {
        key: 'tiempoVencido',
        label: AGENDA_DEUDOR_POPUP_COLUMNS.tiempoVencido,
        width: AGENDA_DEUDOR_POPUP_COLUMN_WIDTHS.tiempoVencido,
        render: (row: Agenda) => <span>{row.tiempoVencido}</span>,
      },
      {
        key: 'cartera',
        label: AGENDA_DEUDOR_POPUP_COLUMNS.cartera,
        render: (row: Agenda) => <WrapCell>{row.cartera}</WrapCell>,
      },
      {
        key: 'deudor',
        label: AGENDA_DEUDOR_POPUP_COLUMNS.deudor,
        render: (row: Agenda) => <WrapCell>{row.deudor}</WrapCell>,
      },
      {
        key: 'respuestaOEstado',
        label: AGENDA_DEUDOR_POPUP_COLUMNS.respuestaOEstado,
        width: AGENDA_DEUDOR_POPUP_COLUMN_WIDTHS.respuestaOEstado,
        render: (row: Agenda) => (
          <WrapCell>{row.respuestaOEstado}</WrapCell>
        ),
      },
      {
        key: 'usuario',
        label: AGENDA_DEUDOR_POPUP_COLUMNS.usuario,
        width: AGENDA_DEUDOR_POPUP_COLUMN_WIDTHS.usuario,
        render: (row: Agenda) => <span>{row.usuario}</span>,
      },
    ],
    []
  );
};