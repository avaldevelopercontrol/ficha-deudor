import { useMemo } from 'react';

import { ActionButton } from '@shared/components/ui';
import { WrapCell } from '@shared/components/ui/WrapCell';
import type { Column } from '@shared/types';
import type { Email } from '../types/email.types';

import {
  EMAIL_DEUDOR_POPUP_COLUMNS,
  EMAIL_DEUDOR_POPUP_COLUMN_WIDTHS,
  EMAIL_DEUDOR_POPUP_FALLBACK_TEXT,
  EMAIL_DEUDOR_POPUP_TEXTS,
} from '../constants/emailDeudorPopup.constants';
import {
  formatEmailPopupFecha,
  getEmailEstadoBadgeClass,
} from '../utils/emailDeudorPopup.utils';

interface UseEmailDeudorColumnsProps {
  onEdit: (row: Email) => void;
}

export const useEmailDeudorColumns = ({
  onEdit,
}: UseEmailDeudorColumnsProps): Column[] => {
  return useMemo(
    () => [
      {
        key: 'id',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.id,
        width: EMAIL_DEUDOR_POPUP_COLUMN_WIDTHS.id,
        render: (row: Email) => <span>{row.id}</span>,
      },
      {
        key: 'email',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.email,
        render: (row: Email) => <WrapCell>{row.email}</WrapCell>,
      },
      {
        key: 'fechaActivacion',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.fechaRegistro,
        width: EMAIL_DEUDOR_POPUP_COLUMN_WIDTHS.fechaRegistro,
        render: (row: Email) => (
          <span>{formatEmailPopupFecha(row.fechaActivacion)}</span>
        ),
      },
      {
        key: 'estado',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.estado,
        width: EMAIL_DEUDOR_POPUP_COLUMN_WIDTHS.estado,
        render: (row: Email) => {
          const badgeClass = getEmailEstadoBadgeClass(row.estado);

          return (
            <span className={`badge ${badgeClass}`}>
              {row.estado || EMAIL_DEUDOR_POPUP_FALLBACK_TEXT}
            </span>
          );
        },
      },
      {
        key: 'status',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.status,
        width: EMAIL_DEUDOR_POPUP_COLUMN_WIDTHS.status,
        render: (row: Email) => (
          <span>{row.status || EMAIL_DEUDOR_POPUP_FALLBACK_TEXT}</span>
        ),
      },
      {
        key: 'fuente',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.fuente,
        render: (row: Email) => (
          <span>{row.fuente || EMAIL_DEUDOR_POPUP_FALLBACK_TEXT}</span>
        ),
      },
      {
        key: 'baseCliente',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.baseCliente,
        render: (row: Email) => (
          <span>{row.baseCliente || EMAIL_DEUDOR_POPUP_FALLBACK_TEXT}</span>
        ),
      },
      {
        key: 'contacto',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.contacto,
        render: (row: Email) => (
          <span>{row.contacto || EMAIL_DEUDOR_POPUP_FALLBACK_TEXT}</span>
        ),
      },
      {
        key: 'prioridad',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.prioridad,
        width: EMAIL_DEUDOR_POPUP_COLUMN_WIDTHS.prioridad,
        render: (row: Email) => <span>{row.prioridad}</span>,
      },
      {
        key: 'comentario',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.comentario,
        render: (row: Email) => (
          <WrapCell>
            {row.comentario || EMAIL_DEUDOR_POPUP_FALLBACK_TEXT}
          </WrapCell>
        ),
      },
      {
        key: 'acciones',
        label: EMAIL_DEUDOR_POPUP_COLUMNS.acciones,
        width: EMAIL_DEUDOR_POPUP_COLUMN_WIDTHS.acciones,
        filterable: false,
        render: (row: Email) => (
          <ActionButton
            label=""
            variant="primary"
            size="sm"
            icon={EMAIL_DEUDOR_POPUP_TEXTS.editButtonIcon}
            onClick={() => onEdit(row)}
          />
        ),
      },
    ],
    [onEdit]
  );
};