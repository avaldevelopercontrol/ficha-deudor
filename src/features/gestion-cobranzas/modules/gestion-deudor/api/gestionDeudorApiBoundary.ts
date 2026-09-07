interface ApiEnvelopeRecord {
  statusCode: number;
  message?: unknown;
  messageUser?: unknown;
  response: unknown;
}

export interface GestionDeudorApiPagination {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

const INVALID_RESPONSE_SUFFIX =
  'La respuesta del servidor no contiene datos válidos.';

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

const isPositiveSafeInteger = (
  value: unknown
): value is number => {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value > 0
  );
};

const isNonNegativeSafeInteger = (
  value: unknown
): value is number => {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
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

export const createInvalidGestionDeudorApiResponseError = (
  fallbackMessage: string
): Error => {
  return new Error(
    buildInvalidResponseMessage(fallbackMessage)
  );
};

export const parseGestionDeudorApiEnvelope = (
  value: unknown,
  fallbackMessage: string
): ApiEnvelopeRecord => {
  if (
    !isRecord(value) ||
    typeof value.statusCode !== 'number' ||
    !Number.isInteger(value.statusCode)
  ) {
    throw createInvalidGestionDeudorApiResponseError(
      fallbackMessage
    );
  }

  return {
    statusCode: value.statusCode,
    message: value.message,
    messageUser: value.messageUser,
    response: value.response,
  };
};

export const parseGestionDeudorApiPagination = (
  value: unknown,
  fallbackMessage: string
): GestionDeudorApiPagination => {
  if (!isRecord(value)) {
    throw createInvalidGestionDeudorApiResponseError(
      fallbackMessage
    );
  }

  const {
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
  } = value;

  if (
    !isPositiveSafeInteger(pageNumber) ||
    !isPositiveSafeInteger(pageSize) ||
    !isNonNegativeSafeInteger(totalRecords) ||
    !isNonNegativeSafeInteger(totalPages) ||
    (totalRecords > 0 && totalPages === 0) ||
    pageNumber > Math.max(totalPages, 1)
  ) {
    throw createInvalidGestionDeudorApiResponseError(
      fallbackMessage
    );
  }

  return {
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
  };
};

export const parseGestionDeudorApiRecordCollection = (
  response: unknown,
  fallbackMessage: string
): Record<string, unknown>[] => {
  if (response === null) {
    return [];
  }

  if (Array.isArray(response)) {
    if (response.every(isRecord)) {
      return response;
    }

    throw createInvalidGestionDeudorApiResponseError(
      fallbackMessage
    );
  }

  if (isRecord(response)) {
    return [response];
  }

  throw createInvalidGestionDeudorApiResponseError(
    fallbackMessage
  );
};
