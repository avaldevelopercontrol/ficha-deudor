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
import { mockGetClientesByUsuario, mockLogin } from '../mocks';
import {
  buildLoginErrorResponse,
  getLoginRequestErrorMessage,
} from '../utils/authResponse.utils';
import { buildLoginEndpoint } from '../utils/loginRequest.utils';
import {
  isLoginUsuarioApi,
  normalizeClientesResponse,
} from '../validations';
import type {
  ClientesResponse,
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

export async function fetchClientesByUsuario(
  idUsuario: string,
  signal?: AbortSignal
): Promise<ClientesResponse> {
  let normalizedUsuarioId: string;

  try {
    normalizedUsuarioId = String(
      toRequiredId(idUsuario, 'id_usuario')
    );
  } catch {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_USER);
  }

  if (env.useMocks || env.useClientesMock) {
    return normalizeClientesResponse(
      await mockGetClientesByUsuario(
        normalizedUsuarioId,
        signal
      )
    );
  }

  throw new Error(AUTH_API_MESSAGES.CLIENTES_ENDPOINT_NOT_CONFIGURED);
}
