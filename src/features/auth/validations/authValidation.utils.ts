type UnknownRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

export const hasOwn = (
  value: UnknownRecord,
  property: string
): boolean => Object.prototype.hasOwnProperty.call(value, property);

export const normalizeNonEmptyText = (
  value: unknown
): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue || null;
};

export const isNonNegativeSafeInteger = (
  value: unknown
): value is number =>
  typeof value === 'number' &&
  Number.isSafeInteger(value) &&
  value >= 0;
