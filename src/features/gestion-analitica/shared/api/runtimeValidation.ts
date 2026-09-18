export type RuntimeJsonRecord = Record<string, unknown>;

export type RuntimeValidationFailure = (
  path: string,
  expected: string
) => never;

export const expectRuntimeRecord = (
  value: unknown,
  path: string,
  fail: RuntimeValidationFailure,
  expected = 'un objeto'
): RuntimeJsonRecord => {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return fail(path, expected);
  }

  return value as RuntimeJsonRecord;
};

export const expectRuntimeArray = (
  value: unknown,
  path: string,
  fail: RuntimeValidationFailure,
  expected = 'un arreglo'
): readonly unknown[] => {
  if (!Array.isArray(value)) {
    return fail(path, expected);
  }

  return value;
};

export const expectRuntimeNonEmptyString = (
  value: unknown,
  path: string,
  fail: RuntimeValidationFailure,
  expected = 'un texto no vacío'
): string => {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0
  ) {
    return fail(path, expected);
  }

  return value;
};

export const expectRuntimeBoolean = (
  value: unknown,
  path: string,
  fail: RuntimeValidationFailure,
  expected = 'un booleano'
): boolean => {
  if (typeof value !== 'boolean') {
    return fail(path, expected);
  }

  return value;
};

export const expectRuntimeNonNegativeInteger = (
  value: unknown,
  path: string,
  fail: RuntimeValidationFailure,
  expected = 'un entero no negativo'
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    return fail(path, expected);
  }

  return value;
};

export const expectRuntimePositiveInteger = (
  value: unknown,
  path: string,
  fail: RuntimeValidationFailure,
  expected = 'un entero positivo'
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value <= 0
  ) {
    return fail(path, expected);
  }

  return value;
};

export const expectRuntimeFiniteNumber = (
  value: unknown,
  path: string,
  fail: RuntimeValidationFailure,
  expected = 'un número finito'
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return fail(path, expected);
  }

  return value;
};

export const expectRuntimeEnum = <T extends string>(
  value: unknown,
  allowedValues: ReadonlySet<string>,
  path: string,
  fail: RuntimeValidationFailure,
  expected = `uno de: ${[...allowedValues].join(', ')}`
): T => {
  if (
    typeof value !== 'string' ||
    !allowedValues.has(value)
  ) {
    return fail(path, expected);
  }

  return value as T;
};
