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

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

const isPositiveIntegerString = (
  value: unknown
): value is string => {
  if (
    typeof value !== 'string' ||
    !/^[1-9]\d*$/.test(value)
  ) {
    return false;
  }

  const parsedValue = Number(value);

  return (
    Number.isSafeInteger(parsedValue) &&
    parsedValue > 0
  );
};

const hasStringProperty = (
  value: Record<string, unknown>,
  property: string
): boolean => {
  return typeof value[property] === 'string';
};

const hasIdProperty = (
  value: Record<string, unknown>,
  property: string
): boolean => {
  return isPositiveIntegerString(value[property]);
};

const isDeudorPopupBaseContext = (
  value: Record<string, unknown>
): boolean => {
  return (
    hasIdProperty(value, 'idCliente') &&
    hasIdProperty(value, 'idDeudor') &&
    hasStringProperty(value, 'nombre') &&
    hasStringProperty(value, 'documento')
  );
};

export const isFichaDeudorPopupType = (
  value: unknown
): value is FichaDeudorPopupType => {
  return (
    typeof value === 'string' &&
    FICHA_DEUDOR_POPUP_TYPES.some(
      (type) => type === value
    )
  );
};

export const isFichaDeudorPopupContext = <
  T extends FichaDeudorPopupType,
>(
  popupType: T,
  value: unknown
): value is FichaDeudorPopupContext<T> => {
  if (!isRecord(value)) {
    return false;
  }

  switch (popupType) {
    case 'email-deudor':
      return (
        isDeudorPopupBaseContext(value) &&
        hasIdProperty(value, 'idUsuario')
      );

    case 'agenda-deudor':
    case 'inf-deudor':
      return (
        isDeudorPopupBaseContext(value) &&
        hasIdProperty(value, 'idCartera') &&
        hasIdProperty(value, 'idUsuario')
      );

    case 'pago-deudor':
    case 'estado-cuenta':
      return (
        isDeudorPopupBaseContext(value) &&
        hasIdProperty(value, 'idCartera')
      );

    case 'lista-gestores':
      return hasIdProperty(value, 'idCliente');

    case 'produccion-gestor-hoy':
      return (
        hasIdProperty(value, 'idCliente') &&
        hasIdProperty(value, 'idUsuario')
      );
  }
};
