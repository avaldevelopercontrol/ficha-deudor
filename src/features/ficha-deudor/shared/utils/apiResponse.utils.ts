import type { RuntimeTypeGuard } from './runtimeTypeGuards.utils';
import { isObjectRecord } from './runtimeTypeGuards.utils';

interface ApiResponseStatus {
  code: unknown;
  statusCode: unknown;
  message?: unknown;
  messageUser?: unknown;
}

export interface ApiPagination {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiPaginatedData<T>
  extends ApiPagination {
  data: T[];
}

const SUCCESS_BUSINESS_CODES = new Set(['00', '200']);

const PAGINATION_FIELDS = [
  'pageNumber',
  'pageSize',
  'totalRecords',
  'totalPages',
] as const;

const INVALID_RESPONSE_SUFFIX =
  'La respuesta del servidor no contiene datos válidos.';

const getNonEmptyMessage = (
  value: unknown
): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
};

const buildInvalidResponseMessage = (
  fallbackMessage: string
): string => {
  const normalizedFallback = fallbackMessage
    .trim()
    .replace(/[.:;!?]+$/, '');

  return normalizedFallback
    ? `${normalizedFallback}. ${INVALID_RESPONSE_SUFFIX}`
    : INVALID_RESPONSE_SUFFIX;
};

const throwInvalidResponse = (
  fallbackMessage: string
): never => {
  throw new Error(
    buildInvalidResponseMessage(fallbackMessage)
  );
};

const isOptionalMessage = (value: unknown): boolean => {
  return (
    value === undefined ||
    value === null ||
    typeof value === 'string'
  );
};

const isNonNegativeInteger = (
  value: unknown
): value is number => {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0
  );
};

const assertValidPagination = (
  result: Record<string, unknown>,
  fallbackMessage: string
): void => {
  const hasPagination = PAGINATION_FIELDS.some(
    (field) => Object.hasOwn(result, field)
  );

  if (!hasPagination) {
    return;
  }

  const hasValidPagination = PAGINATION_FIELDS.every(
    (field) =>
      Object.hasOwn(result, field) &&
      isNonNegativeInteger(result[field])
  );

  if (!hasValidPagination) {
    return throwInvalidResponse(fallbackMessage);
  }
};

const getValidResponseEnvelope = (
  result: unknown,
  fallbackMessage: string
): Record<string, unknown> => {
  assertApiSuccess(result, fallbackMessage);

  if (!isObjectRecord(result)) {
    return throwInvalidResponse(fallbackMessage);
  }

  return result;
};

const getRequiredPagination = (
  result: Record<string, unknown>,
  fallbackMessage: string
): ApiPagination => {
  const {
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
  } = result;

  if (
    !isNonNegativeInteger(pageNumber) ||
    !isNonNegativeInteger(pageSize) ||
    !isNonNegativeInteger(totalRecords) ||
    !isNonNegativeInteger(totalPages)
  ) {
    return throwInvalidResponse(fallbackMessage);
  }

  return {
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
  };
};

export const isSuccessfulStatusCode = (
  statusCode: unknown
): statusCode is number => {
  return (
    typeof statusCode === 'number' &&
    Number.isInteger(statusCode) &&
    statusCode >= 200 &&
    statusCode < 300
  );
};

export const getApiErrorMessage = (
  result: Pick<
    ApiResponseStatus,
    'message' | 'messageUser'
  >,
  fallbackMessage: string
): string => {
  return (
    getNonEmptyMessage(result.messageUser) ??
    getNonEmptyMessage(result.message) ??
    fallbackMessage
  );
};

export const assertApiSuccess = (
  result: unknown,
  fallbackMessage: string
): void => {
  if (!isObjectRecord(result)) {
    return throwInvalidResponse(fallbackMessage);
  }

  if (
    typeof result.statusCode !== 'number' ||
    !Number.isInteger(result.statusCode)
  ) {
    return throwInvalidResponse(fallbackMessage);
  }

  if (!isSuccessfulStatusCode(result.statusCode)) {
    throw new Error(
      getApiErrorMessage(result, fallbackMessage)
    );
  }

  if (
    !isOptionalMessage(result.message) ||
    !isOptionalMessage(result.messageUser)
  ) {
    return throwInvalidResponse(fallbackMessage);
  }

  if (typeof result.code !== 'string') {
    return throwInvalidResponse(fallbackMessage);
  }

  if (!SUCCESS_BUSINESS_CODES.has(result.code.trim())) {
    throw new Error(
      getApiErrorMessage(result, fallbackMessage)
    );
  }

  assertValidPagination(result, fallbackMessage);
};

export const unwrapApiResponse = (
  result: unknown,
  fallbackMessage: string
): unknown => {
  const envelope = getValidResponseEnvelope(
    result,
    fallbackMessage
  );

  if (
    !Object.hasOwn(envelope, 'response') ||
    envelope.response === null ||
    envelope.response === undefined
  ) {
    return throwInvalidResponse(fallbackMessage);
  }

  return envelope.response;
};

export const ensureArrayResponse = <T>(
  response: unknown,
  fallbackMessage: string,
  isItem: RuntimeTypeGuard<T>
): T[] => {
  if (
    !Array.isArray(response) ||
    !response.every(isItem)
  ) {
    return throwInvalidResponse(fallbackMessage);
  }

  return response;
};

export const ensureObjectResponse = <T>(
  response: unknown,
  fallbackMessage: string,
  isObject: RuntimeTypeGuard<T>
): T => {
  if (!isObject(response)) {
    return throwInvalidResponse(fallbackMessage);
  }

  return response;
};

export const unwrapApiArrayResponse = <T>(
  result: unknown,
  fallbackMessage: string,
  isItem: RuntimeTypeGuard<T>
): T[] => {
  return ensureArrayResponse(
    unwrapApiResponse(result, fallbackMessage),
    fallbackMessage,
    isItem
  );
};

export const unwrapApiObjectResponse = <T>(
  result: unknown,
  fallbackMessage: string,
  isObject: RuntimeTypeGuard<T>
): T => {
  return ensureObjectResponse(
    unwrapApiResponse(result, fallbackMessage),
    fallbackMessage,
    isObject
  );
};

export const unwrapApiPaginatedArrayResponse = <T>(
  result: unknown,
  fallbackMessage: string,
  isItem: RuntimeTypeGuard<T>
): ApiPaginatedData<T> => {
  const envelope = getValidResponseEnvelope(
    result,
    fallbackMessage
  );

  if (!Object.hasOwn(envelope, 'response')) {
    return throwInvalidResponse(fallbackMessage);
  }

  return {
    data: ensureArrayResponse(
      envelope.response,
      fallbackMessage,
      isItem
    ),
    ...getRequiredPagination(
      envelope,
      fallbackMessage
    ),
  };
};
