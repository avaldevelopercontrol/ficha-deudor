import {
  getApiErrorMessage,
  isSuccessfulStatusCode,
} from '@shared/api/apiResponse.utils';

import {
  hasOwn,
  isRecord,
  normalizeNonEmptyText,
} from './authValidation.utils';

export interface AuthApiEnvelope {
  code: string;
  statusCode: number;
  message?: unknown;
  messageUser?: unknown;
  response: unknown;
}

const AUTH_API_SUCCESS_CODES = new Set(['00', '200']);

const isValidStatusCode = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value);

export const parseAuthApiEnvelope = (
  value: unknown,
  invalidResponseMessage: string
): AuthApiEnvelope => {
  if (
    !isRecord(value) ||
    typeof value.code !== 'string' ||
    !normalizeNonEmptyText(value.code) ||
    !isValidStatusCode(value.statusCode) ||
    !hasOwn(value, 'response')
  ) {
    throw new Error(invalidResponseMessage);
  }

  return {
    code: value.code,
    statusCode: value.statusCode,
    message: value.message,
    messageUser: value.messageUser,
    response: value.response,
  };
};

const assertSuccessfulAuthApiEnvelope = (
  envelope: AuthApiEnvelope,
  loadErrorMessage: string
): void => {
  if (
    isSuccessfulStatusCode(envelope.statusCode) &&
    AUTH_API_SUCCESS_CODES.has(envelope.code)
  ) {
    return;
  }

  throw new Error(getApiErrorMessage(envelope, loadErrorMessage));
};

export const unwrapAuthApiArrayResponse = (
  value: unknown,
  invalidResponseMessage: string,
  loadErrorMessage: string
): unknown[] => {
  const envelope = parseAuthApiEnvelope(
    value,
    invalidResponseMessage
  );

  assertSuccessfulAuthApiEnvelope(envelope, loadErrorMessage);

  if (!Array.isArray(envelope.response)) {
    throw new Error(invalidResponseMessage);
  }

  return envelope.response;
};
