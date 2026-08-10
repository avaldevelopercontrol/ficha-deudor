const parseFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value
      : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : undefined;
};

export const toOptionalNumber = (
  value: unknown
): number | undefined => {
  return parseFiniteNumber(value);
};

export const toNullableNumber = (
  value: unknown
): number | null => {
  return parseFiniteNumber(value) ?? null;
};

export const toNumberOrZero = (
  value: unknown
): number => {
  return parseFiniteNumber(value) ?? 0;
};

export const toRequiredNumber = (
  value: unknown,
  fieldName: string
): number => {
  const parsedValue = parseFiniteNumber(value);

  if (parsedValue === undefined) {
    throw new Error(
      `El campo ${fieldName} debe contener un número válido.`
    );
  }

  return parsedValue;
};

const parseIntegerId = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value)
      ? value
      : undefined;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();

  if (!/^\d+$/.test(normalizedValue)) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isSafeInteger(parsedValue)
    ? parsedValue
    : undefined;
};

export const toRequiredId = (
  value: unknown,
  fieldName: string
): number => {
  const parsedValue = parseIntegerId(value);

  if (
    parsedValue === undefined ||
    parsedValue <= 0
  ) {
    throw new Error(
      `El identificador ${fieldName} debe ser un entero positivo.`
    );
  }

  return parsedValue;
};

export const toOptionalIdOrZero = (
  value: unknown,
  fieldName: string
): number => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && !value.trim())
  ) {
    return 0;
  }

  const parsedValue = parseIntegerId(value);

  if (parsedValue === 0) {
    return 0;
  }

  if (
    parsedValue === undefined ||
    parsedValue < 0
  ) {
    throw new Error(
      `El identificador ${fieldName} debe ser cero o un entero positivo.`
    );
  }

  return parsedValue;
};

export const isPositiveIntegerValue = (
  value: unknown
): boolean => {
  const parsedValue = parseIntegerId(value);

  return Boolean(
    parsedValue !== undefined &&
      parsedValue > 0
  );
};

export const toDecimalNumber = (
  value: string | number | null | undefined
) => {
  if (value === null || value === undefined || value === '') return 0;

  const parsedValue = Number(String(value).replace(',', '.'));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const sanitizeDecimalValue = (value: string) => {
  const cleanedValue = value.replace(/[^0-9.]/g, '');
  const [integerPart, ...decimalParts] = cleanedValue.split('.');

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join('')}`;
};
