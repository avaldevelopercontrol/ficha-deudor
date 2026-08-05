import type { FichaDeudorParams } from '../types/fichaDeudor.types';
import { isPositiveIntegerValue } from './number.utils';

const FICHA_DEUDOR_SESSION_KEY = 'ficha_deudor_active_context';
const FICHA_DEUDOR_SESSION_VERSION = 1;

interface StoredFichaDeudorContext {
  version: typeof FICHA_DEUDOR_SESSION_VERSION;
  params: FichaDeudorParams;
}

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const isValidIdParam = (value: unknown): value is string => {
  return (
    isNonEmptyString(value) &&
    isPositiveIntegerValue(value)
  );
};

export const isFichaDeudorParams = (
  value: unknown
): value is FichaDeudorParams => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const params = value as Partial<FichaDeudorParams>;

  return (
    isValidIdParam(params.id_cliente) &&
    isValidIdParam(params.id_cartera) &&
    isValidIdParam(params.id_deudor) &&
    isValidIdParam(params.id_contrato) &&
    isValidIdParam(params.id_usuario) &&
    isNonEmptyString(params.fecha_inicio_gestion)
  );
};

export const saveFichaDeudorSession = (
  params: FichaDeudorParams
): void => {
  try {
    const context: StoredFichaDeudorContext = {
      version: FICHA_DEUDOR_SESSION_VERSION,
      params,
    };

    sessionStorage.setItem(
      FICHA_DEUDOR_SESSION_KEY,
      JSON.stringify(context)
    );
  } catch {
    // La navegación continuará, pero la recarga no podrá recuperar la ficha.
  }
};

export const loadFichaDeudorSession =
  (): FichaDeudorParams | null => {
    try {
      const rawContext = sessionStorage.getItem(
        FICHA_DEUDOR_SESSION_KEY
      );

      if (!rawContext) {
        return null;
      }

      const context = JSON.parse(
        rawContext
      ) as Partial<StoredFichaDeudorContext>;

      if (
        context.version !== FICHA_DEUDOR_SESSION_VERSION ||
        !isFichaDeudorParams(context.params)
      ) {
        sessionStorage.removeItem(FICHA_DEUDOR_SESSION_KEY);
        return null;
      }

      return context.params;
    } catch {
      try {
        sessionStorage.removeItem(FICHA_DEUDOR_SESSION_KEY);
      } catch {
        // No hay acceso al almacenamiento de sesión.
      }

      return null;
    }
  };

export const clearFichaDeudorSession = (): void => {
  try {
    sessionStorage.removeItem(FICHA_DEUDOR_SESSION_KEY);
  } catch {
    // No hay acceso al almacenamiento de sesión.
  }
};