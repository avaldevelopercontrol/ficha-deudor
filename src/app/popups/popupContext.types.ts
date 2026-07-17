export const FICHA_DEUDOR_POPUP_TYPES = [
  'email-deudor',
  'agenda-deudor',
  'pago-deudor',
  'inf-deudor',
  'lista-gestores',
  'estado-cuenta',
  'produccion-gestor-hoy',
] as const;

export type FichaDeudorPopupType =
  (typeof FICHA_DEUDOR_POPUP_TYPES)[number];

interface DeudorPopupBaseContext {
  idCliente: string;
  idDeudor: string;
  nombre: string;
  documento: string;
}

export interface FichaDeudorPopupContextMap {
  'email-deudor': DeudorPopupBaseContext & {
    idUsuario: string;
  };

  'agenda-deudor': DeudorPopupBaseContext & {
    idCartera: string;
    idUsuario: string;
  };

  'pago-deudor': DeudorPopupBaseContext & {
    idCartera: string;
  };

  'inf-deudor': DeudorPopupBaseContext & {
    idCartera: string;
    idUsuario: string;
  };

  'lista-gestores': {
    idCliente: string;
  };

  'estado-cuenta': DeudorPopupBaseContext & {
    idCartera: string;
  };

  'produccion-gestor-hoy': {
    idCliente: string;
    idUsuario: string;
  };
}


export type FichaDeudorPopupContext<
  T extends FichaDeudorPopupType,
> = FichaDeudorPopupContextMap[T];

export const isFichaDeudorPopupType = (
  value: unknown
): value is FichaDeudorPopupType => {
  return (
    typeof value === 'string' &&
    FICHA_DEUDOR_POPUP_TYPES.some((type) => type === value)
  );
};