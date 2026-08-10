import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

import {
  SEGURIDAD_API_ENDPOINTS,
} from '../constants/seguridadRoutes.constants';

import {
  mapClientesActivosResponse,
} from '../mappers/clienteActivo.mapper';

import type {
  ClienteActivo,
  GetClientesActivosResponse,
} from '../types/clienteActivo.types';

const CLIENTE_ERROR_MESSAGES = {
  activos:
    'No se pudo obtener la lista de clientes activos.',
} as const;

const isRecord = (
  value: unknown
): value is Record<
  string,
  unknown
> =>
  typeof value === 'object' &&
  value !== null;

const getStringProperty = (
  value: Record<string, unknown>,
  property: string
): string | null => {
  const propertyValue =
    value[property];

  if (
    typeof propertyValue !==
      'string' ||
    !propertyValue.trim()
  ) {
    return null;
  }

  return propertyValue.trim();
};

const resolveClienteApiError = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (
    error instanceof ApiError &&
    isRecord(error.data)
  ) {
    const apiMessage =
      getStringProperty(
        error.data,
        'messageUser'
      ) ??
      getStringProperty(
        error.data,
        'message'
      );

    return (
      apiMessage ||
      error.message.trim() ||
      fallbackMessage
    );
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return fallbackMessage;
};

const isSuccessfulResponse = (
  result: {
    code: string;
    statusCode: number;
  }
): boolean =>
  (
    result.statusCode >= 200 &&
    result.statusCode < 300
  ) ||
  result.code === '00' ||
  result.code === '200';

export const fetchClientesActivos = async (
  signal?: AbortSignal
): Promise<ClienteActivo[]> => {
  try {
    const result =
      await apiClient<
        GetClientesActivosResponse
      >(
        SEGURIDAD_API_ENDPOINTS
          .clientesActivos,
        {
          method: 'GET',
          signal,
        }
      );

    if (
      !isSuccessfulResponse(
        result
      )
    ) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          CLIENTE_ERROR_MESSAGES.activos
      );
    }

    return mapClientesActivosResponse(
      result.response
    );
  } catch (error) {
    throw new Error(
      resolveClienteApiError(
        error,
        CLIENTE_ERROR_MESSAGES.activos
      )
    );
  }
};
