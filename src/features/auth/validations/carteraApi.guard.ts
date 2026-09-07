import { AUTH_API_MESSAGES } from '../constants/authApi.constants';
import type { CarteraParametro } from '../types';
import { unwrapAuthApiArrayResponse } from './authApiEnvelope.guard';
import {
  isNonNegativeSafeInteger,
  isRecord,
  normalizeNonEmptyText,
} from './authValidation.utils';

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
): number[] =>
  unwrapAuthApiArrayResponse(
    value,
    AUTH_API_MESSAGES.ANIOS_INVALID_RESPONSE,
    AUTH_API_MESSAGES.ANIOS_LOAD_ERROR
  ).map(normalizeAnioCartera);

export const normalizeCarteraParametro = (
  value: unknown
): CarteraParametro => {
  if (!isRecord(value)) {
    throw new Error(AUTH_API_MESSAGES.CARTERAS_INVALID_RESPONSE);
  }

  const estado = normalizeNonEmptyText(value.desEstado);

  if (
    !isNonNegativeSafeInteger(value.campanna) ||
    !isValidAnio(value.anio) ||
    !estado ||
    !isNonNegativeSafeInteger(value.numero)
  ) {
    throw new Error(AUTH_API_MESSAGES.CARTERAS_INVALID_RESPONSE);
  }

  return {
    campania: value.campanna,
    anio: value.anio,
    estado,
    numero: value.numero,
  };
};

export const normalizeCarterasParametrosByClienteAnioResponse = (
  value: unknown
): CarteraParametro[] =>
  unwrapAuthApiArrayResponse(
    value,
    AUTH_API_MESSAGES.CARTERAS_INVALID_RESPONSE,
    AUTH_API_MESSAGES.CARTERAS_LOAD_ERROR
  ).map(normalizeCarteraParametro);
