import {
  apiClient,
} from '@shared/api/apiClient';

import {
  assertApiBusinessSuccess,
} from '@shared/api/apiResponse.utils';

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

import {
  resolveSeguridadApiError,
} from './seguridadApiError';

const CLIENTE_ERROR_MESSAGES = {
  activos:
    'No se pudo obtener la lista de clientes activos.',
} as const;

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

    assertApiBusinessSuccess(
      result,
      CLIENTE_ERROR_MESSAGES.activos
    );

    return mapClientesActivosResponse(
      result.response
    );
  } catch (error) {
    throw resolveSeguridadApiError(
      error,
      CLIENTE_ERROR_MESSAGES.activos
    );
  }
};
