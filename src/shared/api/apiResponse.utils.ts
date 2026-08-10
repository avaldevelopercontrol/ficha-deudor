interface ApiResponseStatus {
  statusCode: unknown;
  message?: unknown;
  messageUser?: unknown;
}

interface ApiResponseEnvelope<T = unknown>
  extends ApiResponseStatus {
  response: T;
}

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
  result: ApiResponseStatus,
  fallbackMessage: string
): void => {
  if (isSuccessfulStatusCode(result.statusCode)) {
    return;
  }

  throw new Error(
    getApiErrorMessage(result, fallbackMessage)
  );
};

export const unwrapApiResponse = <T>(
  result: ApiResponseEnvelope<T>,
  fallbackMessage: string
): NonNullable<T> => {
  assertApiSuccess(result, fallbackMessage);

  if (
    result.response === null ||
    result.response === undefined
  ) {
    throw new Error(
      buildInvalidResponseMessage(fallbackMessage)
    );
  }

  return result.response as NonNullable<T>;
};

export const ensureArrayResponse = <T>(
  response: unknown,
  fallbackMessage: string
): T[] => {
  if (!Array.isArray(response)) {
    throw new Error(
      buildInvalidResponseMessage(fallbackMessage)
    );
  }

  return response as T[];
};

export const ensureObjectResponse = <
  T extends object,
>(
  response: unknown,
  fallbackMessage: string
): T => {
  if (
    typeof response !== 'object' ||
    response === null ||
    Array.isArray(response)
  ) {
    throw new Error(
      buildInvalidResponseMessage(fallbackMessage)
    );
  }

  return response as T;
};

export const normalizeApiCollectionResponse = <T>(
  response: unknown,
  fallbackMessage: string
): T[] => {
  if (
    response === null ||
    response === undefined
  ) {
    return [];
  }

  if (Array.isArray(response)) {
    return response as T[];
  }

  if (typeof response === 'object') {
    return [response as T];
  }

  throw new Error(
    buildInvalidResponseMessage(fallbackMessage)
  );
};

export const unwrapApiArrayResponse = <T>(
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

export const unwrapApiCollectionResponse = <T>(
  result: ApiResponseEnvelope<unknown>,
  fallbackMessage: string
): T[] => {
  assertApiSuccess(result, fallbackMessage);

  return normalizeApiCollectionResponse<T>(
    result.response,
    fallbackMessage
  );
};
