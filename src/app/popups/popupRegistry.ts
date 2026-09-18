import type {
  FichaDeudorPopupType,
} from './popupContext.types';

import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control';

interface PopupConfig {
  path: string;
  windowName: string;
  width: number;
  height: number;
  requiredOptionId: number;
}

export const FICHA_DEUDOR_POPUP_REGISTRY = {
  'email-deudor': {
    path: '/popup/email-deudor',
    windowName: 'email-deudor',
    width: 1300,
    height: 750,
    requiredOptionId:
      APPLICATION_OPTION_IDS.GESTION_DEUDOR,
  },

  'agenda-deudor': {
    path: '/popup/agenda-deudor',
    windowName: 'agenda-deudor',
    width: 1300,
    height: 750,
    requiredOptionId:
      APPLICATION_OPTION_IDS.GESTION_DEUDOR,
  },

  'pago-deudor': {
    path: '/popup/pago-deudor',
    windowName: 'pago-deudor',
    width: 1300,
    height: 750,
    requiredOptionId:
      APPLICATION_OPTION_IDS.GESTION_DEUDOR,
  },

  'inf-deudor': {
    path: '/popup/inf-deudor',
    windowName: 'inf-deudor',
    width: 1300,
    height: 400,
    requiredOptionId:
      APPLICATION_OPTION_IDS.GESTION_DEUDOR,
  },

  'lista-gestores': {
    path: '/popup/lista-gestores',
    windowName: 'lista-gestores',
    width: 1300,
    height: 750,
    requiredOptionId:
      APPLICATION_OPTION_IDS.GESTION_DEUDOR,
  },

  'estado-cuenta': {
    path: '/popup/estado-cuenta',
    windowName: 'estado-cuenta',
    width: 1300,
    height: 650,
    requiredOptionId:
      APPLICATION_OPTION_IDS.GESTION_DEUDOR,
  },


  'reportar-caso': {
    path: '/popup/reportar-caso',
    windowName: 'reportar-caso',
    width: 1300,
    height: 750,
    requiredOptionId:
      APPLICATION_OPTION_IDS.GESTION_DEUDOR,
  },

  'produccion-gestor-hoy': {
    path:
      '/popup/produccion-gestor-hoy',

    windowName:
      'produccion-gestor-hoy',

    width: 1100,
    height: 560,
    requiredOptionId:
      APPLICATION_OPTION_IDS.GESTION_DEUDOR,
  },

  'produccion-online': {
    path:
      '/popup/produccion-online',

    windowName:
      'produccion-online',

    width: 1400,
    height: 800,
    requiredOptionId:
      APPLICATION_OPTION_IDS.PRODUCCION_ONLINE,
  },

} satisfies Record<
  FichaDeudorPopupType,
  PopupConfig
>;