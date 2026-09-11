export type AnalyticsJsonRecord = Record<string, unknown>;

export class AnalyticsAccessContractError extends Error {
  readonly contract: string;
  readonly path: string;

  constructor(
    contract: string,
    path: string,
    expected: string
  ) {
    super(
      `Analytics devolvió un contrato inválido para ${contract}: ${path} debe ser ${expected}.`
    );
    this.name = 'AnalyticsAccessContractError';
    this.contract = contract;
    this.path = path;
  }
}

export const failAnalyticsContract = (
  contract: string,
  path: string,
  expected: string
): never => {
  throw new AnalyticsAccessContractError(
    contract,
    path,
    expected
  );
};

export const expectAnalyticsRecord = (
  value: unknown,
  contract: string,
  path: string
): AnalyticsJsonRecord => {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return failAnalyticsContract(contract, path, 'un objeto');
  }

  return value as AnalyticsJsonRecord;
};

export const expectAnalyticsArray = (
  value: unknown,
  contract: string,
  path: string
): readonly unknown[] => {
  if (!Array.isArray(value)) {
    return failAnalyticsContract(contract, path, 'un arreglo');
  }

  return value;
};

export const expectAnalyticsOptionalArray = (
  value: unknown,
  contract: string,
  path: string
): readonly unknown[] | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return expectAnalyticsArray(value, contract, path);
};

export const expectAnalyticsPositiveInteger = (
  value: unknown,
  contract: string,
  path: string
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value <= 0
  ) {
    return failAnalyticsContract(
      contract,
      path,
      'un entero positivo'
    );
  }

  return value;
};

export const expectAnalyticsOptionalPositiveInteger = (
  value: unknown,
  contract: string,
  path: string
): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  return expectAnalyticsPositiveInteger(
    value,
    contract,
    path
  );
};

export const expectAnalyticsBoolean = (
  value: unknown,
  contract: string,
  path: string
): boolean => {
  if (typeof value !== 'boolean') {
    return failAnalyticsContract(contract, path, 'un booleano');
  }

  return value;
};

export const expectAnalyticsNonEmptyString = (
  value: unknown,
  contract: string,
  path: string
): string => {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0
  ) {
    return failAnalyticsContract(
      contract,
      path,
      'un texto no vacío'
    );
  }

  return value;
};

export const expectAnalyticsNullableNonEmptyString = (
  value: unknown,
  contract: string,
  path: string
): string | null => {
  if (value === null) {
    return null;
  }

  return expectAnalyticsNonEmptyString(
    value,
    contract,
    path
  );
};

export const expectAnalyticsNullableRecord = (
  value: unknown,
  contract: string,
  path: string
): AnalyticsJsonRecord | null => {
  if (value === null) {
    return null;
  }

  return expectAnalyticsRecord(value, contract, path);
};

export const expectAnalyticsEnum = <T extends string>(
  value: unknown,
  allowedValues: ReadonlySet<string>,
  contract: string,
  path: string
): T => {
  if (
    typeof value !== 'string' ||
    !allowedValues.has(value)
  ) {
    return failAnalyticsContract(
      contract,
      path,
      `uno de: ${[...allowedValues].join(', ')}`
    );
  }

  return value as T;
};
