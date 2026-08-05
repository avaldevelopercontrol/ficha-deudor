import { env } from '@app/config/env';
import { apiClient } from '@shared/api/apiClient';
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

const getLoginApiMessage = (
  result: Pick<LoginUsuarioApiResponse, 'message' | 'messageUser'>,
  fallback: string
): string => getApiErrorMessage(result, fallback);

const parseLoginResponse = (
  result: unknown
): LoginUsuarioApiResponse =>
  ensureObjectResponse<LoginUsuarioApiResponse>(
    result,
    AUTH_API_MESSAGES.LOGIN_INVALID_RESPONSE
  );

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

    if (
      !isSuccessfulStatusCode(result.statusCode) ||
      result.code !== '00'
    ) {
      return buildLoginErrorResponse(
        getLoginApiMessage(
          result,
          AUTH_API_MESSAGES.LOGIN_INVALID_CREDENTIALS
        )
      );
    }

    if (result.response === null) {
      return buildLoginErrorResponse(
        getLoginApiMessage(
          result,
          AUTH_API_MESSAGES.LOGIN_INVALID_CREDENTIALS
        )
      );
    }

    if (!isLoginUsuarioApi(result.response)) {
      return buildLoginErrorResponse(
        AUTH_API_MESSAGES.LOGIN_INVALID_RESPONSE
      );
    }

    if (!result.response.bEstado) {
      return buildLoginErrorResponse(
        AUTH_API_MESSAGES.LOGIN_INACTIVE_USER
      );
    }

    return {
      success: true,
      message: getLoginApiMessage(
        result,
        AUTH_API_MESSAGES.LOGIN_SUCCESS
      ),
      usuario: mapUsuarioApiToUsuario(result.response),
    };
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
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
