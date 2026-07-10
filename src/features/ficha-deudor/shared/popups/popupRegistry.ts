import type {
  FichaDeudorPopupType,
} from './popupContext.types';

interface PopupConfig {
  path: string;
  windowName: string;
  width: number;
  height: number;
}

export const FICHA_DEUDOR_POPUP_REGISTRY = {
  'email-deudor': {
    path: '/popup/email-deudor',
    windowName: 'email-deudor',
    width: 1300,
    height: 750,
  },

  'agenda-deudor': {
    path: '/popup/agenda-deudor',
    windowName: 'agenda-deudor',
    width: 1300,
    height: 750,
  },

  'pago-deudor': {
    path: '/popup/pago-deudor',
    windowName: 'pago-deudor',
    width: 1300,
    height: 750,
  },

  'inf-deudor': {
    path: '/popup/inf-deudor',
    windowName: 'inf-deudor',
    width: 1300,
    height: 400,
  },

  'lista-gestores': {
    path: '/popup/lista-gestores',
    windowName: 'lista-gestores',
    width: 1300,
    height: 750,
  },

  'estado-cuenta': {
    path: '/popup/estado-cuenta',
    windowName: 'estado-cuenta',
    width: 1300,
    height: 650,
  },

} satisfies Record<
  FichaDeudorPopupType,
  PopupConfig
>;