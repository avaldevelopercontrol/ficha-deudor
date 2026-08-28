interface ApiResponseStatus {
  code: unknown;
  statusCode: unknown;
  message?: unknown;
  messageUser?: unknown;
}

interface ApiResponseEnvelope<T = unknown>
  extends ApiResponseStatus {
  response: T;
  pageNumber?: unknown;
  pageSize?: unknown;
  totalRecords?: unknown;
  totalPages?: unknown;
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

const isObjectRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

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

export const unwrapApiResponse = <T>(
  result: ApiResponseEnvelope<T>,
  fallbackMessage: string
): NonNullable<T> => {
  assertApiSuccess(result, fallbackMessage);

  if (
    !Object.hasOwn(result, 'response') ||
    result.response === null ||
    result.response === undefined
  ) {
    return throwInvalidResponse(fallbackMessage);
  }

  return result.response as NonNullable<T>;
};

export const ensureArrayResponse = <T extends object>(
  response: unknown,
  fallbackMessage: string
): T[] => {
  if (
    !Array.isArray(response) ||
    !response.every(isObjectRecord)
  ) {
    return throwInvalidResponse(fallbackMessage);
  }

  return response as T[];
};

export const ensureObjectResponse = <
  T extends object,
>(
  response: unknown,
  fallbackMessage: string
): T => {
  if (!isObjectRecord(response)) {
    return throwInvalidResponse(fallbackMessage);
  }

  return response as T;
};

export const normalizeApiCollectionResponse = <
  T extends object,
>(
  response: unknown,
  fallbackMessage: string
): T[] => {
  if (response === null || response === undefined) {
    return [];
  }

  if (Array.isArray(response)) {
    return ensureArrayResponse<T>(
      response,
      fallbackMessage
    );
  }

  if (isObjectRecord(response)) {
    return [response as T];
  }

  return throwInvalidResponse(fallbackMessage);
};

export const unwrapApiArrayResponse = <T extends object>(
  result: ApiResponseEnvelope<unknown>,
  fallbackMessage: string
): T[] => {
  return ensureArrayResponse<T>(
    unwrapApiResponse(result, fallbackMessage),
    fallbackMessage
  );
};

export const unwrapApiObjectResponse = <
  T extends object,
>(
  result: ApiResponseEnvelope<unknown>,
  fallbackMessage: string
): T => {
  return ensureObjectResponse<T>(
    unwrapApiResponse(result, fallbackMessage),
    fallbackMessage
  );
};

export const unwrapApiCollectionResponse = <
  T extends object,
>(
  result: ApiResponseEnvelope<unknown>,
  fallbackMessage: string
): T[] => {
  assertApiSuccess(result, fallbackMessage);

  if (!Object.hasOwn(result, 'response')) {
    return throwInvalidResponse(fallbackMessage);
  }

  return normalizeApiCollectionResponse<T>(
    result.response,
    fallbackMessage
  );
};
