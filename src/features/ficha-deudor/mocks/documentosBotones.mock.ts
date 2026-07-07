import type { BotonApi } from '../../../shared/types/indexApi';
import { CLIENTE_CLARO_ID } from '../constants/fichaGestion.constants';

interface MockBotonesParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
  idUsuario: string;
}

export function mockBotones({
  idCliente,
  idCartera,
  idDeudor,
  idUsuario,
}: MockBotonesParams): BotonApi[] {
  if (idCliente === CLIENTE_CLARO_ID) {
    const baseUrl = window.location.origin;

    return [
      {
        id: 'pagos',
        label: 'PAGOS',
        action: 'popup_pago',
        popupUrl: `${baseUrl}/popup/pago-deudor/${idCliente}/${idCartera}/${idDeudor}`,
      },
      {
        id: 'email',
        label: 'EMAIL',
        action: 'popup_email',
        popupUrl: `${baseUrl}/popup/email-deudor/${idCliente}/${idDeudor}/${idUsuario}`,
      },
      {
        id: 'agendas',
        label: 'AGENDAS',
        action: 'popup_agenda',
        popupUrl: `${baseUrl}/popup/agenda-deudor/${idCliente}/${idCartera}/${idDeudor}/${idUsuario}`,
      },
      {
        id: 'inf_deudor',
        label: 'INF. DEUDOR',
        action: 'popup_inf_deudor',
        popupUrl: `${baseUrl}/popup/inf-deudor/${idCliente}/${idCartera}/${idDeudor}/${idUsuario}`,
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
}