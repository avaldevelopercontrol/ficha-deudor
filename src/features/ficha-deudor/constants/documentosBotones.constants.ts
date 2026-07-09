import type { BotonApi } from '../types';
import { buildFichaDeudorPopupPath } from './fichaDeudorRoutes.constants';
import { CLIENTE_CLARO_ID } from './fichaGestion.constants';

interface BuildDocumentosBotonesParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
  idUsuario: string;
}

export const buildDocumentosBotones = ({
  idCliente,
  idCartera,
  idDeudor,
  idUsuario,
}: BuildDocumentosBotonesParams): BotonApi[] => {
  if (idCliente === CLIENTE_CLARO_ID) {
    return [
      {
        id: 'pagos',
        label: 'PAGOS',
        action: 'popup_pago',
        popupUrl: buildFichaDeudorPopupPath.pagoDeudor({
          idCliente,
          idCartera,
          idDeudor,
        }),
      },
      {
        id: 'email',
        label: 'EMAIL',
        action: 'popup_email',
        popupUrl: buildFichaDeudorPopupPath.emailDeudor({
          idCliente,
          idDeudor,
          idUsuario,
        }),
      },
      {
        id: 'agendas',
        label: 'AGENDAS',
        action: 'popup_agenda',
        popupUrl: buildFichaDeudorPopupPath.agendaDeudor({
          idCliente,
          idCartera,
          idDeudor,
          idUsuario,
        }),
      },
      {
        id: 'inf_deudor',
        label: 'INF. DEUDOR',
        action: 'popup_inf_deudor',
        popupUrl: buildFichaDeudorPopupPath.infDeudor({
          idCliente,
          idCartera,
          idDeudor,
          idUsuario,
        }),
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