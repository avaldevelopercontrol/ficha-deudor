export const isProduccionRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const toNumber = (
  value: unknown
): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    return Number(value);
  }

  return Number.NaN;
};

export const toProduccionInteger = (
  value: unknown
): number | null => {
  const parsed = toNumber(value);

  return Number.isSafeInteger(parsed)
    ? parsed
    : null;
};

export const toProduccionFiniteNumber = (
  value: unknown
): number | null => {
  const parsed = toNumber(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
};

export const toProduccionNonEmptyString = (
  value: unknown
): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();

  return normalized || null;
};

export const ensureProduccionArray = (
  response: unknown,
  fallbackMessage: string
): unknown[] => {
  if (!Array.isArray(response)) {
    throw new Error(fallbackMessage);
  }

  return response;
};
