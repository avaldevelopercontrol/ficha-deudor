const encodeRouteParam = (value: string | number) => {
  return encodeURIComponent(String(value));
};

export const FICHA_DEUDOR_ROUTES = {
  FICHA_DEUDOR: '/ficha-deudor',

  POPUP_EMAIL_DEUDOR:
    '/popup/email-deudor/:id_cliente/:id_deudor/:id_usuario',

  POPUP_AGENDA_DEUDOR:
    '/popup/agenda-deudor/:id_cliente/:id_cartera/:id_deudor/:id_usuario',

  POPUP_PAGO_DEUDOR:
    '/popup/pago-deudor/:id_cliente/:id_cartera/:id_deudor',

  POPUP_INF_DEUDOR:
    '/popup/inf-deudor/:id_cliente/:id_cartera/:id_deudor/:id_usuario',

  POPUP_LISTA_GESTORES: '/popup/lista-gestores/:id_cliente',
} as const;

export const FICHA_DEUDOR_POPUP_WINDOW_NAMES = {
  LISTA_GESTORES: 'lista-gestores',
} as const;

export const FICHA_DEUDOR_POPUP_WINDOW_FEATURES = {
  LARGE: 'width=1100,height=700,scrollbars=yes,resizable=yes',
} as const;

interface PagoDeudorPathParams {
  idCliente: string | number;
  idCartera: string | number;
  idDeudor: string | number;
}

interface EmailDeudorPathParams {
  idCliente: string | number;
  idDeudor: string | number;
  idUsuario: string | number;
}

interface AgendaDeudorPathParams {
  idCliente: string | number;
  idCartera: string | number;
  idDeudor: string | number;
  idUsuario: string | number;
}

interface InfDeudorPathParams {
  idCliente: string | number;
  idCartera: string | number;
  idDeudor: string | number;
  idUsuario: string | number;
}

export const buildFichaDeudorPopupPath = {
  listaGestores: (idCliente: string | number) => {
    return `/popup/lista-gestores/${encodeRouteParam(idCliente)}`;
  },

  pagoDeudor: ({
    idCliente,
    idCartera,
    idDeudor,
  }: PagoDeudorPathParams) => {
    return `/popup/pago-deudor/${encodeRouteParam(
      idCliente
    )}/${encodeRouteParam(idCartera)}/${encodeRouteParam(idDeudor)}`;
  },

  emailDeudor: ({
    idCliente,
    idDeudor,
    idUsuario,
  }: EmailDeudorPathParams) => {
    return `/popup/email-deudor/${encodeRouteParam(
      idCliente
    )}/${encodeRouteParam(idDeudor)}/${encodeRouteParam(idUsuario)}`;
  },

  agendaDeudor: ({
    idCliente,
    idCartera,
    idDeudor,
    idUsuario,
  }: AgendaDeudorPathParams) => {
    return `/popup/agenda-deudor/${encodeRouteParam(
      idCliente
    )}/${encodeRouteParam(idCartera)}/${encodeRouteParam(
      idDeudor
    )}/${encodeRouteParam(idUsuario)}`;
  },

  infDeudor: ({
    idCliente,
    idCartera,
    idDeudor,
    idUsuario,
  }: InfDeudorPathParams) => {
    return `/popup/inf-deudor/${encodeRouteParam(idCliente)}/${encodeRouteParam(
      idCartera
    )}/${encodeRouteParam(idDeudor)}/${encodeRouteParam(idUsuario)}`;
  },
} as const;