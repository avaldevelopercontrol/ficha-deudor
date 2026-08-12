import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

import {
  GESTION_USUARIOS_API_ENDPOINTS,
} from '../constants/gestionUsuariosRoutes.constants';

import {
  CAMBIAR_CLAVE_TEXTS,
} from '../modules/constants/cambiarClave.constants';

import {
  buildResetearClaveUsuarioRequest,
} from '../mappers/cambiarClave.mapper';

import type {
  CambiarClaveFormData,
  ResetearClaveUsuarioApiResponse,
} from '../types/cambiarClave.types';

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null;

const getStringProperty = (
  value: Record<string, unknown>,
  property: string
): string | null => {
  const propertyValue = value[property];

  if (
    typeof propertyValue !== 'string' ||
    !propertyValue.trim()
  ) {
    return null;
  }

  return propertyValue.trim();
};

const resolveCambiarClaveApiError = (
  error: unknown
): string => {
  if (
    error instanceof ApiError &&
    isRecord(error.data)
  ) {
    return (
      getStringProperty(error.data, 'messageUser') ??
      getStringProperty(error.data, 'message') ??
      (error.message.trim() ||
        CAMBIAR_CLAVE_TEXTS.apiErrorFallback)
    );
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return CAMBIAR_CLAVE_TEXTS.apiErrorFallback;
};

const isSuccessfulResponse = (
  result: Pick<
    ResetearClaveUsuarioApiResponse,
    'code' | 'statusCode'
  >
): boolean =>
  (
    result.statusCode >= 200 &&
    result.statusCode < 300
  ) ||
  result.code === '00' ||
  result.code === '200';

const isGenericSuccessMessage = (
  message: string
): boolean => message.trim().toUpperCase() === 'OK';

const resolveCambiarClaveSuccessMessage = (
  result: ResetearClaveUsuarioApiResponse
): string => {
  const candidates = [
    result.messageUser,
    result.message,
  ];

  for (const candidate of candidates) {
    const normalized = candidate?.trim();

    if (
      normalized &&
      !isGenericSuccessMessage(normalized)
    ) {
      return normalized;
    }
  }

  return CAMBIAR_CLAVE_TEXTS.successFallback;
};

export const resetearClaveUsuario = async (
  form: CambiarClaveFormData,
  authenticatedUserId: string,
  signal?: AbortSignal
): Promise<string> => {
  const body = buildResetearClaveUsuarioRequest(
    form,
    authenticatedUserId
  );

  try {
    const result =
      await apiClient<ResetearClaveUsuarioApiResponse>(
        GESTION_USUARIOS_API_ENDPOINTS.resetearClaveUsuario,
        {
          method: 'PUT',
          body,
          signal,
        }
      );

    if (!isSuccessfulResponse(result)) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          CAMBIAR_CLAVE_TEXTS.apiErrorFallback
      );
    }

    return resolveCambiarClaveSuccessMessage(result);
  } catch (error) {
    throw new Error(
      resolveCambiarClaveApiError(error)
    );
  }
};
