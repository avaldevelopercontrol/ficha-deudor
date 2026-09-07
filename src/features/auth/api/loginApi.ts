import { env } from '@app/config/env';
import { ApiError, apiClient } from '@shared/api/apiClient';
import { getApiErrorMessage, isSuccessfulStatusCode } from '@shared/api/apiResponse.utils';
import { isAbortError } from '@shared/utils/asyncResource.utils';

import {
  AUTH_API_ENDPOINTS,
  AUTH_API_MESSAGES,
  AUTH_LOGIN_CODES,
} from '../constants/authApi.constants';
import { mapUsuarioApiToUsuario } from '../mappers';
import { mockLogin } from '../mocks';
import type { LoginPayload, LoginResponse } from '../types';
import {
  buildLoginErrorResponse,
  getLoginRequestErrorMessage,
} from '../utils/authResponse.utils';
import { buildLoginEndpoint } from '../utils/loginRequest.utils';
import {
  isLoginUsuarioApi,
  parseAuthApiEnvelope,
} from '../validations';
import type { AuthApiEnvelope } from '../validations';

const getLoginApiMessage = (
  result: Pick<AuthApiEnvelope, 'message' | 'messageUser'>,
  fallback: string
): string => getApiErrorMessage(result, fallback);

const getBackendLoginMessage = (
  result: Pick<AuthApiEnvelope, 'message' | 'messageUser'>,
  fallback: string
): string => {
  const message =
    typeof result.message === 'string'
      ? result.message.trim()
      : '';

  if (message) {
    return message;
  }

  return getLoginApiMessage(result, fallback);
};

const parseLoginResponse = (result: unknown): AuthApiEnvelope =>
  parseAuthApiEnvelope(result, AUTH_API_MESSAGES.LOGIN_INVALID_RESPONSE);

const normalizeLoginResponse = (
  result: AuthApiEnvelope
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
  if (!(error instanceof ApiError)) {
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

    return buildLoginErrorResponse(getLoginRequestErrorMessage(error));
  }
};
