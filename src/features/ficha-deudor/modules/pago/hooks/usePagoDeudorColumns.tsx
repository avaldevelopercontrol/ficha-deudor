import { useMemo } from 'react';

import { WrapCell } from '@shared/components/ui/WrapCell';
import type { Column } from '@shared/types';
import type { Pago } from '../types/pago.types';

import {
  PAGO_DEUDOR_POPUP_COLUMNS,
  PAGO_DEUDOR_POPUP_COLUMN_WIDTHS,
} from '../constants/pagoDeudorPopup.constants';
import { formatPagoPopupMonto } from '../utils/pagoDeudorPopup.utils';

export const usePagoDeudorColumns = (): Column[] => {
  return useMemo(
    () => [
      {
        key: 'nro',
        label: PAGO_DEUDOR_POPUP_COLUMNS.nro,
        width: PAGO_DEUDOR_POPUP_COLUMN_WIDTHS.nro,
        render: (row: Pago) => <span>{row.nro}</span>,
      },
      {
        key: 'codigoCliente',
        label: PAGO_DEUDOR_POPUP_COLUMNS.codigoCliente,
        width: PAGO_DEUDOR_POPUP_COLUMN_WIDTHS.codigoCliente,
        render: (row: Pago) => <span>{row.codigoCliente}</span>,
      },
      {
        key: 'nroDocumento',
        label: PAGO_DEUDOR_POPUP_COLUMNS.nroDocumento,
        width: PAGO_DEUDOR_POPUP_COLUMN_WIDTHS.nroDocumento,
        render: (row: Pago) => <WrapCell>{row.nroDocumento}</WrapCell>,
      },
      {
        key: 'fechaPago',
        label: PAGO_DEUDOR_POPUP_COLUMNS.fechaPago,
        width: PAGO_DEUDOR_POPUP_COLUMN_WIDTHS.fechaPago,
        render: (row: Pago) => <span>{row.fechaPago}</span>,
      },
      {
        key: 'montoPago',
        label: PAGO_DEUDOR_POPUP_COLUMNS.montoPago,
        width: PAGO_DEUDOR_POPUP_COLUMN_WIDTHS.montoPago,
        render: (row: Pago) => (
          <span style={{ fontWeight: 600, color: '#2e7d32' }}>
            {formatPagoPopupMonto(row.montoPago, row.moneda)}
          </span>
        ),
      },
      {
        key: 'moneda',
        label: PAGO_DEUDOR_POPUP_COLUMNS.moneda,
        width: PAGO_DEUDOR_POPUP_COLUMN_WIDTHS.moneda,
        render: (row: Pago) => <span>{row.moneda}</span>,
      },
      {
        key: 'zona',
        label: PAGO_DEUDOR_POPUP_COLUMNS.zona,
        width: PAGO_DEUDOR_POPUP_COLUMN_WIDTHS.zona,
        render: (row: Pago) => <span>{row.zona}</span>,
      },
      {
        key: 'notaCredito',
        label: PAGO_DEUDOR_POPUP_COLUMNS.notaCredito,
        width: PAGO_DEUDOR_POPUP_COLUMN_WIDTHS.notaCredito,
        render: (row: Pago) => <span>{row.notaCredito}</span>,
      },
      {
        key: 'marca',
        label: PAGO_DEUDOR_POPUP_COLUMNS.marca,
        width: PAGO_DEUDOR_POPUP_COLUMN_WIDTHS.marca,
        render: (row: Pago) => <span>{row.marca}</span>,
      },
    ],
    []
  );
};