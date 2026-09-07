import { env } from '@app/config/env';
import { apiClient } from '@shared/api/apiClient';
import { toRequiredId } from '@shared/utils/number.utils';

import {
  AUTH_API_ENDPOINTS,
  AUTH_API_MESSAGES,
} from '../constants/authApi.constants';
import {
  mockGetAniosByCliente,
  mockGetCarterasParametrosByClienteAnio,
  mockGetGruposClienteInicial,
} from '../mocks';
import type { CarteraParametro, Cliente } from '../types';
import {
  normalizeAniosByClienteResponse,
  normalizeCarterasParametrosByClienteAnioResponse,
  normalizeGruposClienteInicialResponse,
} from '../validations';

const normalizeRequiredId = (
  value: string,
  parameterName: string,
  invalidMessage: string
): number => {
  try {
    return toRequiredId(value, parameterName);
  } catch {
    throw new Error(invalidMessage);
  }
};

export async function fetchGruposClienteInicial(
  idUsuario: string,
  signal?: AbortSignal
): Promise<Cliente[]> {
  const normalizedUsuarioId = normalizeRequiredId(
    idUsuario,
    'nId_Usuario',
    AUTH_API_MESSAGES.CLIENTES_INVALID_USER
  );

  if (env.useMocks) {
    return mockGetGruposClienteInicial(signal);
  }

  const params = new URLSearchParams({
    nId_Usuario: String(normalizedUsuarioId),
  });

  const result = await apiClient<unknown>(
    `${AUTH_API_ENDPOINTS.GRUPOS_CLIENTE_INICIAL}?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  return normalizeGruposClienteInicialResponse(result);
}

export async function fetchAniosByCliente(
  idCliente: string,
  signal?: AbortSignal
): Promise<number[]> {
  const normalizedClienteId = normalizeRequiredId(
    idCliente,
    'nId_Cliente',
    AUTH_API_MESSAGES.ANIOS_INVALID_CLIENT
  );

  if (env.useMocks) {
    return mockGetAniosByCliente(signal);
  }

  const params = new URLSearchParams({
    nId_Cliente: String(normalizedClienteId),
  });

  const result = await apiClient<unknown>(
    `${AUTH_API_ENDPOINTS.ANIOS_BY_CLIENTE}?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  return normalizeAniosByClienteResponse(result);
}

export async function fetchCarterasParametrosByClienteAnio(
  idCliente: string,
  anio: number,
  signal?: AbortSignal
): Promise<CarteraParametro[]> {
  const normalizedClienteId = normalizeRequiredId(
    idCliente,
    'nId_Cliente',
    AUTH_API_MESSAGES.CARTERAS_INVALID_CLIENT
  );

  if (
    !Number.isSafeInteger(anio) ||
    anio < 1900 ||
    anio > 9999
  ) {
    throw new Error(AUTH_API_MESSAGES.CARTERAS_INVALID_ANIO);
  }

  if (env.useMocks) {
    return mockGetCarterasParametrosByClienteAnio(signal);
  }

  const params = new URLSearchParams({
    nId_Cliente: String(normalizedClienteId),
    anio: String(anio),
  });

  const result = await apiClient<unknown>(
    `${AUTH_API_ENDPOINTS.CARTERAS_PARAMETROS_BY_CLIENTE_ANIO}?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  return normalizeCarterasParametrosByClienteAnioResponse(result);
}
