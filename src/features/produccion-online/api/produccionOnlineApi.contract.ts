export interface ProduccionApiEnvelope {
  code: string;
  statusCode: number;
  message?: unknown;
  messageUser?: unknown;
  response: unknown;
}

const INVALID_RESPONSE_SUFFIX =
  'La respuesta del servidor no contiene datos válidos.';

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const buildInvalidResponseError = (
  fallbackMessage: string
): Error => {
  const normalizedFallback = fallbackMessage
    .trim()
    .replace(/[.:;!?]+$/, '');

  return new Error(
    normalizedFallback
      ? `${normalizedFallback}. ${INVALID_RESPONSE_SUFFIX}`
      : INVALID_RESPONSE_SUFFIX
  );
};

export const parseProduccionApiEnvelope = (
  value: unknown,
  fallbackMessage: string
): ProduccionApiEnvelope => {
  if (!isRecord(value)) {
    throw buildInvalidResponseError(
      fallbackMessage
    );
  }

  const code = value.code;
  const statusCode = value.statusCode;

  if (
    typeof code !== 'string' ||
    !code.trim() ||
    typeof statusCode !== 'number' ||
    !Number.isInteger(statusCode) ||
    !Object.prototype.hasOwnProperty.call(
      value,
      'response'
    )
  ) {
    throw buildInvalidResponseError(
      fallbackMessage
    );
  }

  return {
    code,
    statusCode,
    message: value.message,
    messageUser: value.messageUser,
    response: value.response,
  };
};
