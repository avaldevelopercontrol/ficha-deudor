import type { BotonApi } from '../../../shared/types';
import { CLIENTE_CLARO_ID } from '../../../shared/constants/clientes.constants';

interface BuildDocumentosBotonesParams {
  idCliente: string;
}

export const buildDocumentosBotones = ({
  idCliente,
}: BuildDocumentosBotonesParams): BotonApi[] => {
  if (idCliente === CLIENTE_CLARO_ID) {
    return [
      {
        id: 'estado_cuenta_excel',
        label: 'ESTADO CUENTA',
        action: 'popup_estado_cuenta',
      },
      {
        id: 'pagos',
        label: 'PAGOS',
        action: 'popup_pago',
      },
      {
        id: 'email',
        label: 'EMAIL',
        action: 'popup_email',
      },
      {
        id: 'agendas',
        label: 'AGENDAS',
        action: 'popup_agenda',
      },
      {
        id: 'inf_deudor',
        label: 'INF. DEUDOR',
        action: 'popup_inf_deudor',
      },
    ];
  }

  return [
    {
      id: 'estado_cuenta',
      label: 'ESTADO_CUENTA',
      action: 'modal_estado_cuenta',
    },
    {
      id: 'pagos',
      label: 'PAGOS',
      action: 'modal_pagos',
    },
  ];
};