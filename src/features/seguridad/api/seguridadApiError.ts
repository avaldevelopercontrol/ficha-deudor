import {
  ApiError,
} from '@shared/api/apiClient';
import {
  getApiErrorMessage,
} from '@shared/api/apiResponse.utils';
import {
  isAbortError,
} from '@shared/utils/asyncResource.utils';

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const normalizeFallback = (
  fallbackMessage: string
): string =>
  fallbackMessage.trim() ||
  'Ocurrió un error al procesar la solicitud.';

/**
 * Normaliza los errores HTTP y de negocio del feature Seguridad.
 *
 * Las cancelaciones deben conservarse sin envolver para que los
 * controladores asíncronos puedan distinguirlas de un error real.
 */
export const resolveSeguridadApiError = (
  error: unknown,
  fallbackMessage: string
): Error => {
  if (
    error instanceof Error &&
    isAbortError(error)
  ) {
    return error;
  }

  const fallback = normalizeFallback(
    fallbackMessage
  );

  if (
    error instanceof ApiError &&
    isRecord(error.data)
  ) {
    return new Error(
      getApiErrorMessage(
        error.data,
        error.message.trim() || fallback
      )
    );
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error;
  }

  return new Error(fallback);
};
