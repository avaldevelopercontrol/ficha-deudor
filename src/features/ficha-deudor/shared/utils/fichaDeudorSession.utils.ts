import type { FichaDeudorParams } from '../types/fichaDeudor.types';

const FICHA_DEUDOR_SESSION_KEY = 'ficha_deudor_active_context';
const FICHA_DEUDOR_SESSION_VERSION = 1;

interface StoredFichaDeudorContext {
  version: typeof FICHA_DEUDOR_SESSION_VERSION;
  params: FichaDeudorParams;
}

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export const isFichaDeudorParams = (
  value: unknown
): value is FichaDeudorParams => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const params = value as Partial<FichaDeudorParams>;

  return (
    isNonEmptyString(params.id_cliente) &&
    isNonEmptyString(params.id_cartera) &&
    isNonEmptyString(params.id_deudor) &&
    isNonEmptyString(params.id_contrato) &&
    isNonEmptyString(params.id_usuario) &&
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