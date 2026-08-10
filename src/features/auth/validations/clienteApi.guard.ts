import { toRequiredId } from '@shared/utils/number.utils';

import { AUTH_API_MESSAGES } from '../constants/authApi.constants';
import type { Cliente, ClientesResponse } from '../types';

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

export const normalizeCliente = (
  value: unknown
): Cliente => {
  if (!isRecord(value)) {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }

  if (typeof value.activa !== 'boolean') {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }

  try {
    return {
      id_cliente: String(
        toRequiredId(value.id_cliente, 'id_cliente')
      ),
      nombre: toRequiredText(value.nombre, 'nombre'),
      codigo: toRequiredText(value.codigo, 'codigo'),
      activa: value.activa,
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

export const normalizeClientesResponse = (
  value: unknown
): ClientesResponse => {
  if (
    !isRecord(value) ||
    typeof value.success !== 'boolean' ||
    !Array.isArray(value.clientes)
  ) {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }

  return {
    success: value.success,
    clientes: value.clientes.map(normalizeCliente),
  };
};
