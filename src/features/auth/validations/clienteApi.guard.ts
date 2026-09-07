import { toRequiredId } from '@shared/utils/number.utils';

import { AUTH_API_MESSAGES } from '../constants/authApi.constants';
import type { Cliente } from '../types';
import { unwrapAuthApiArrayResponse } from './authApiEnvelope.guard';
import {
  isRecord,
  normalizeNonEmptyText,
} from './authValidation.utils';

const normalizeRequiredTextField = (
  value: unknown,
  fieldName: string
): string => {
  const normalizedValue = normalizeNonEmptyText(value);

  if (!normalizedValue) {
    throw new Error(
      `${AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE} El campo ${fieldName} no es válido.`
    );
  }

  return normalizedValue;
};

const normalizeRequiredIdField = (
  value: unknown,
  fieldName: string
): number => {
  try {
    return toRequiredId(value, fieldName);
  } catch {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }
};

export const normalizeGrupoClienteInicial = (
  value: unknown
): Cliente => {
  if (!isRecord(value)) {
    throw new Error(AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE);
  }

  return {
    id_cliente: String(
      normalizeRequiredIdField(value.nId_Cliente, 'nId_Cliente')
    ),
    id_grupo: normalizeRequiredIdField(value.nId_Grupo, 'nId_Grupo'),
    nombre: normalizeRequiredTextField(value.cCli_Nombre, 'cCli_Nombre'),
  };
};

export const normalizeGruposClienteInicialResponse = (
  value: unknown
): Cliente[] =>
  unwrapAuthApiArrayResponse(
    value,
    AUTH_API_MESSAGES.CLIENTES_INVALID_RESPONSE,
    AUTH_API_MESSAGES.CLIENTES_LOAD_ERROR
  ).map(normalizeGrupoClienteInicial);
