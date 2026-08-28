import { toRequiredId } from '@shared/utils/number.utils';
import {
  getApiErrorMessage,
  isSuccessfulStatusCode,
} from '@shared/api/apiResponse.utils';

import { AUTH_API_MESSAGES } from '../constants/authApi.constants';
import type { Cliente } from '../types';

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const toRequiredText = (
  value: unknown,
  fieldName: string
): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(
      `${AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE} El campo ${fieldName} no es válido.`
    );
  }

  return value.trim();
};

export const normalizeGrupoClienteInicial = (
  value: unknown
): Cliente => {
  if (!isRecord(value)) {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }

  try {
    return {
      id_cliente: String(
        toRequiredId(value.nId_Cliente, 'nId_Cliente')
      ),
      id_grupo: toRequiredId(value.nId_Grupo, 'nId_Grupo'),
      nombre: toRequiredText(value.cCli_Nombre, 'cCli_Nombre'),
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith(
        AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE
      )
    ) {
      throw error;
    }

    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }
};

export const normalizeGruposClienteInicialResponse = (
  value: unknown
): Cliente[] => {
  if (!isRecord(value)) {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }

  if (
    typeof value.statusCode !== 'number' ||
    !Number.isInteger(value.statusCode) ||
    typeof value.code !== 'string'
  ) {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }

  const isSuccessfulCode =
    value.code === '00' || value.code === '200';

  if (
    !isSuccessfulStatusCode(value.statusCode) ||
    !isSuccessfulCode
  ) {
    throw new Error(
      getApiErrorMessage(
        {
          message: value.message,
          messageUser: value.messageUser,
        },
        AUTH_API_MESSAGES.CLIENTES_LOAD_ERROR
      )
    );
  }

  if (!Array.isArray(value.response)) {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }

  return value.response.map(normalizeGrupoClienteInicial);
};
