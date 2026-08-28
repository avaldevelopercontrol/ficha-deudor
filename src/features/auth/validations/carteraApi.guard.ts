import {
  getApiErrorMessage,
  isSuccessfulStatusCode,
} from '@shared/api/apiResponse.utils';

import { AUTH_API_MESSAGES } from '../constants/authApi.constants';
import type { CarteraParametro } from '../types';

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const isValidAnio = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isSafeInteger(value) &&
  value >= 1900 &&
  value <= 9999;

export const normalizeAnioCartera = (
  value: unknown
): number => {
  if (!isRecord(value) || !isValidAnio(value.anio)) {
    throw new Error(AUTH_API_MESSAGES.ANIOS_INVALID_RESPONSE);
  }

  return value.anio;
};

export const normalizeAniosByClienteResponse = (
  value: unknown
): number[] => {
  if (!isRecord(value)) {
    throw new Error(AUTH_API_MESSAGES.ANIOS_INVALID_RESPONSE);
  }

  if (
    typeof value.statusCode !== 'number' ||
    !Number.isInteger(value.statusCode) ||
    typeof value.code !== 'string'
  ) {
    throw new Error(AUTH_API_MESSAGES.ANIOS_INVALID_RESPONSE);
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
        AUTH_API_MESSAGES.ANIOS_LOAD_ERROR
      )
    );
  }

  if (!Array.isArray(value.response)) {
    throw new Error(AUTH_API_MESSAGES.ANIOS_INVALID_RESPONSE);
  }

  return value.response.map(normalizeAnioCartera);
};

export const normalizeCarteraParametro = (
  value: unknown
): CarteraParametro => {
  if (
    !isRecord(value) ||
    typeof value.campanna !== 'number' ||
    !Number.isSafeInteger(value.campanna) ||
    value.campanna < 0 ||
    !isValidAnio(value.anio) ||
    typeof value.desEstado !== 'string' ||
    value.desEstado.trim() === '' ||
    typeof value.numero !== 'number' ||
    !Number.isSafeInteger(value.numero) ||
    value.numero < 0
  ) {
    throw new Error(AUTH_API_MESSAGES.CARTERAS_INVALID_RESPONSE);
  }

  return {
    campania: value.campanna,
    anio: value.anio,
    estado: value.desEstado.trim(),
    numero: value.numero,
  };
};

export const normalizeCarterasParametrosByClienteAnioResponse = (
  value: unknown
): CarteraParametro[] => {
  if (!isRecord(value)) {
    throw new Error(AUTH_API_MESSAGES.CARTERAS_INVALID_RESPONSE);
  }

  if (
    typeof value.statusCode !== 'number' ||
    !Number.isInteger(value.statusCode) ||
    typeof value.code !== 'string'
  ) {
    throw new Error(AUTH_API_MESSAGES.CARTERAS_INVALID_RESPONSE);
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
        AUTH_API_MESSAGES.CARTERAS_LOAD_ERROR
      )
    );
  }

  if (!Array.isArray(value.response)) {
    throw new Error(AUTH_API_MESSAGES.CARTERAS_INVALID_RESPONSE);
  }

  return value.response.map(normalizeCarteraParametro);
};
