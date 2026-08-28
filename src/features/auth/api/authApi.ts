import { env } from '@app/config/env';
import { ApiError, apiClient } from '@shared/api/apiClient';
import { isAbortError } from '@shared/utils/asyncResource.utils';
import { toRequiredId } from '@shared/utils/number.utils';
import {
  ensureObjectResponse,
  getApiErrorMessage,
  isSuccessfulStatusCode,
} from '@shared/api/apiResponse.utils';

import {
  AUTH_API_ENDPOINTS,
  AUTH_API_MESSAGES,
  AUTH_LOGIN_CODES,
} from '../constants/authApi.constants';
import { mapUsuarioApiToUsuario } from '../mappers';
import {
  mockGetAniosByCliente,
  mockGetCarterasParametrosByClienteAnio,
  mockGetGruposClienteInicial,
  mockLogin,
} from '../mocks';
import {
  buildLoginErrorResponse,
  getLoginRequestErrorMessage,
} from '../utils/authResponse.utils';
import { buildLoginEndpoint } from '../utils/loginRequest.utils';
import {
  isLoginUsuarioApi,
  normalizeAniosByClienteResponse,
  normalizeCarterasParametrosByClienteAnioResponse,
  normalizeGruposClienteInicialResponse,
} from '../validations';
import type {
  CarteraParametro,
  Cliente,
  GetAniosByClienteResponse,
  GetCarterasParametrosByClienteAnioResponse,
  GetGruposClienteInicialResponse,
  LoginPayload,
  LoginResponse,
  LoginUsuarioApiResponse,
} from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getLoginApiMessage = (
  result: Pick<LoginUsuarioApiResponse, 'message' | 'messageUser'>,
  fallback: string
): string => getApiErrorMessage(result, fallback);

const getBackendLoginMessage = (
  result: Pick<LoginUsuarioApiResponse, 'message' | 'messageUser'>,
  fallback: string
): string => {
  const message = result.message?.trim();

  if (message) {
    return message;
  }

  return getLoginApiMessage(
    result,
    fallback
  );
};

const parseLoginResponse = (
  result: unknown
): LoginUsuarioApiResponse =>
  ensureObjectResponse<LoginUsuarioApiResponse>(
    result,
    AUTH_API_MESSAGES.LOGIN_INVALID_RESPONSE
  );

const normalizeLoginResponse = (
  result: LoginUsuarioApiResponse
): LoginResponse => {
  if (result.code === AUTH_LOGIN_CODES.PASSWORD_EXPIRED) {
    return {
      success: false,
      code: AUTH_LOGIN_CODES.PASSWORD_EXPIRED,
      message: getBackendLoginMessage(
        result,
        AUTH_API_MESSAGES.LOGIN_PASSWORD_EXPIRED
      ),
      usuario: null,
      requiresPasswordChange: true,
    };
  }

  if (result.code === AUTH_LOGIN_CODES.PASSWORD_EXPIRING) {
    if (
      result.response === null ||
      !isLoginUsuarioApi(result.response)
    ) {
      return buildLoginErrorResponse(
        AUTH_API_MESSAGES.LOGIN_INVALID_RESPONSE,
        result.code
      );
    }

    if (!result.response.bEstado) {
      return buildLoginErrorResponse(
        AUTH_API_MESSAGES.LOGIN_INACTIVE_USER,
        result.code
      );
    }

    return {
      success: true,
      code: AUTH_LOGIN_CODES.PASSWORD_EXPIRING,
      message: getBackendLoginMessage(
        result,
        AUTH_API_MESSAGES.LOGIN_PASSWORD_EXPIRING
      ),
      usuario: mapUsuarioApiToUsuario(result.response),
      requiresPasswordChangeSoon: true,
    };
  }

  if (result.code === AUTH_LOGIN_CODES.LOGIN_ATTEMPTS_EXCEEDED) {
    return buildLoginErrorResponse(
      getBackendLoginMessage(
        result,
        AUTH_API_MESSAGES.LOGIN_ATTEMPTS_EXCEEDED
      ),
      AUTH_LOGIN_CODES.LOGIN_ATTEMPTS_EXCEEDED
    );
  }

  if (
    !isSuccessfulStatusCode(result.statusCode) ||
    result.code !== AUTH_LOGIN_CODES.SUCCESS
  ) {
    return buildLoginErrorResponse(
      getLoginApiMessage(
        result,
        AUTH_API_MESSAGES.LOGIN_INVALID_CREDENTIALS
      ),
      result.code
    );
  }

  if (result.response === null) {
    return buildLoginErrorResponse(
      getLoginApiMessage(
        result,
        AUTH_API_MESSAGES.LOGIN_INVALID_CREDENTIALS
      ),
      result.code
    );
  }

  if (!isLoginUsuarioApi(result.response)) {
    return buildLoginErrorResponse(
      AUTH_API_MESSAGES.LOGIN_INVALID_RESPONSE,
      result.code
    );
  }

  if (!result.response.bEstado) {
    return buildLoginErrorResponse(
      AUTH_API_MESSAGES.LOGIN_INACTIVE_USER,
      result.code
    );
  }

  return {
    success: true,
    code: AUTH_LOGIN_CODES.SUCCESS,
    message: getLoginApiMessage(
      result,
      AUTH_API_MESSAGES.LOGIN_SUCCESS
    ),
    usuario: mapUsuarioApiToUsuario(result.response),
  };
};

const getSpecialLoginResponseFromApiError = (
  error: unknown
): LoginResponse | null => {
  if (!(error instanceof ApiError) || !isRecord(error.data)) {
    return null;
  }

  try {
    const result = parseLoginResponse(error.data);

    if (
      result.code !== AUTH_LOGIN_CODES.PASSWORD_EXPIRED &&
      result.code !== AUTH_LOGIN_CODES.PASSWORD_EXPIRING &&
      result.code !== AUTH_LOGIN_CODES.LOGIN_ATTEMPTS_EXCEEDED
    ) {
      return null;
    }

    return normalizeLoginResponse(result);
  } catch {
    return null;
  }
};

export const login = async (
  payload: LoginPayload,
  signal?: AbortSignal
): Promise<LoginResponse> => {
  if (env.useMocks) {
    return mockLogin(payload);
  }

  try {
    const result = parseLoginResponse(
      await apiClient<unknown>(
        buildLoginEndpoint(AUTH_API_ENDPOINTS.LOGIN_USUARIO, payload),
        {
          method: 'GET',
          signal,
          cache: 'no-store',
          referrerPolicy: 'no-referrer',
        }
      )
    );

    return normalizeLoginResponse(result);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    const specialLoginResponse = getSpecialLoginResponseFromApiError(error);

    if (specialLoginResponse) {
      return specialLoginResponse;
    }

    return buildLoginErrorResponse(
      getLoginRequestErrorMessage(error)
    );
  }
};

export async function fetchGruposClienteInicial(
  idUsuario: string,
  signal?: AbortSignal
): Promise<Cliente[]> {
  let normalizedUsuarioId: number;

  try {
    normalizedUsuarioId = toRequiredId(
      idUsuario,
      'nId_Usuario'
    );
  } catch {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_USER);
  }

  if (env.useMocks) {
    return mockGetGruposClienteInicial(signal);
  }

  const params = new URLSearchParams({
    nId_Usuario: String(normalizedUsuarioId),
  });

  const result = await apiClient<GetGruposClienteInicialResponse>(
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
  let normalizedClienteId: number;

  try {
    normalizedClienteId = toRequiredId(
      idCliente,
      'nId_Cliente'
    );
  } catch {
    throw new Error(AUTH_API_MESSAGES.ANIOS_INVALID_CLIENT);
  }

  if (env.useMocks) {
    return mockGetAniosByCliente(signal);
  }

  const params = new URLSearchParams({
    nId_Cliente: String(normalizedClienteId),
  });

  const result = await apiClient<GetAniosByClienteResponse>(
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
  let normalizedClienteId: number;

  try {
    normalizedClienteId = toRequiredId(
      idCliente,
      'nId_Cliente'
    );
  } catch {
    throw new Error(AUTH_API_MESSAGES.CARTERAS_INVALID_CLIENT);
  }

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

  const result =
    await apiClient<GetCarterasParametrosByClienteAnioResponse>(
      `${AUTH_API_ENDPOINTS.CARTERAS_PARAMETROS_BY_CLIENTE_ANIO}?${params.toString()}`,
      {
        method: 'GET',
        signal,
      }
    );

  return normalizeCarterasParametrosByClienteAnioResponse(result);
}
