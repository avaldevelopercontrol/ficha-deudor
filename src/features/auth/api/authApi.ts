import { env } from '@app/config/env';
import { apiClient } from '@shared/api/apiClient';

import {
  AUTH_API_ENDPOINTS,
  AUTH_API_MESSAGES,
} from '../constants/authApi.constants';
import { mapUsuarioApiToUsuario } from '../mappers';
import { mockGetClientesByUsuario, mockLogin } from '../mocks';
import { buildLoginErrorResponse } from '../utils/authResponse.utils';
import type {
  ClientesResponse,
  LoginPayload,
  LoginResponse,
  LoginUsuarioApiResponse,
} from '../types';

const buildLoginParams = (payload: LoginPayload): URLSearchParams => {
  return new URLSearchParams({
    cUsr_Login: payload.username.trim(),
    cUsr_Pass: payload.password,
  });
};

const getLoginApiMessage = (
  result: LoginUsuarioApiResponse,
  fallback: string
): string => {
  return result.messageUser || result.message || fallback;
};

export const login = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  if (env.useMocks) {
    return mockLogin(payload);
  }

  const params = buildLoginParams(payload);

  try {
    const result = await apiClient<LoginUsuarioApiResponse>(
      `${AUTH_API_ENDPOINTS.LOGIN_USUARIO}?${params.toString()}`
    );

    const usuarioApi = result.response;

    if (result.statusCode !== 200 || result.code !== '00' || !usuarioApi) {
      return buildLoginErrorResponse(
        getLoginApiMessage(
          result,
          AUTH_API_MESSAGES.LOGIN_INVALID_CREDENTIALS
        )
      );
    }

    if (!usuarioApi.bEstado) {
      return buildLoginErrorResponse(AUTH_API_MESSAGES.LOGIN_INACTIVE_USER);
    }

    return {
      success: true,
      message: getLoginApiMessage(result, AUTH_API_MESSAGES.LOGIN_SUCCESS),
      usuario: mapUsuarioApiToUsuario(usuarioApi),
    };
  } catch (error) {
    return buildLoginErrorResponse(
      error instanceof Error
        ? error.message
        : AUTH_API_MESSAGES.LOGIN_UNEXPECTED_ERROR
    );
  }
};

export async function fetchClientesByUsuario(
  idUsuario: string
): Promise<ClientesResponse> {
  if (env.useMocks || env.useClientesMock) {
    return mockGetClientesByUsuario(idUsuario);
  }

  throw new Error(AUTH_API_MESSAGES.CLIENTES_ENDPOINT_NOT_CONFIGURED);
}
