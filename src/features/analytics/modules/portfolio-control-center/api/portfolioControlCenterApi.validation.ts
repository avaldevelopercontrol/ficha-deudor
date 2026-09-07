export type JsonRecord = Record<string, unknown>;

export type ContractParser<T> = (value: unknown) => T;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T/;
export class PortfolioControlCenterContractError extends Error {
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
    this.name = 'PortfolioControlCenterContractError';
    this.contract = contract;
    this.path = path;
  }
}

export const fail = (
  contract: string,
  path: string,
  expected: string
): never => {
  throw new PortfolioControlCenterContractError(
    contract,
    path,
    expected
  );
};

export const expectRecord = (
  value: unknown,
  contract: string,
  path: string
): JsonRecord => {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return fail(contract, path, 'un objeto');
  }

  return value as JsonRecord;
};

export const expectArray = (
  value: unknown,
  contract: string,
  path: string
): readonly unknown[] => {
  if (!Array.isArray(value)) {
    return fail(contract, path, 'un arreglo');
  }

  return value;
};

export const expectNonEmptyString = (
  value: unknown,
  contract: string,
  path: string
): string => {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0
  ) {
    return fail(contract, path, 'un texto no vacío');
  }

  return value;
};

export const expectNullableString = (
  value: unknown,
  contract: string,
  path: string
): string | null => {
  if (value === null) {
    return null;
  }

  return expectNonEmptyString(value, contract, path);
};

const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
};

export const expectDate = (
  value: unknown,
  contract: string,
  path: string
): string => {
  if (
    typeof value !== 'string' ||
    !isValidIsoDate(value)
  ) {
    return fail(
      contract,
      path,
      'una fecha ISO YYYY-MM-DD válida'
    );
  }

  return value;
};

export const expectNullableDate = (
  value: unknown,
  contract: string,
  path: string
): string | null => {
  if (value === null) {
    return null;
  }

  return expectDate(value, contract, path);
};

export const expectNullableDateTime = (
  value: unknown,
  contract: string,
  path: string
): string | null => {
  if (value === null) {
    return null;
  }

  if (
    typeof value !== 'string' ||
    !ISO_DATE_TIME_PATTERN.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    return fail(contract, path, 'una fecha/hora ISO válida o null');
  }

  return value;
};

export const expectFiniteNumber = (
  value: unknown,
  contract: string,
  path: string
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return fail(contract, path, 'un número finito');
  }

  return value;
};

export const expectNullableFiniteNumber = (
  value: unknown,
  contract: string,
  path: string
): number | null => {
  if (value === null) {
    return null;
  }

  return expectFiniteNumber(value, contract, path);
};

export const expectNonNegativeInteger = (
  value: unknown,
  contract: string,
  path: string
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    return fail(contract, path, 'un entero no negativo');
  }

  return value;
};

export const expectPositiveInteger = (
  value: unknown,
  contract: string,
  path: string
): number => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value <= 0
  ) {
    return fail(contract, path, 'un entero positivo');
  }

  return value;
};

export const expectNullablePositiveInteger = (
  value: unknown,
  contract: string,
  path: string
): number | null => {
  if (value === null) {
    return null;
  }

  return expectPositiveInteger(value, contract, path);
};

export const expectBoolean = (
  value: unknown,
  contract: string,
  path: string
): boolean => {
  if (typeof value !== 'boolean') {
    return fail(contract, path, 'un booleano');
  }

  return value;
};

export const expectEnum = <T extends string>(
  value: unknown,
  allowedValues: ReadonlySet<string>,
  contract: string,
  path: string
): T => {
  if (
    typeof value !== 'string' ||
    !allowedValues.has(value)
  ) {
    return fail(
      contract,
      path,
      `uno de: ${[...allowedValues].join(', ')}`
    );
  }

  return value as T;
};

export const validateCampaign = (
  value: unknown,
  contract: string,
  path: string
): void => {
  const campaign = expectRecord(value, contract, path);
  expectNonEmptyString(campaign.code, contract, `${path}.code`);
  expectNonEmptyString(campaign.name, contract, `${path}.name`);
};

export const validatePagination = (
  value: unknown,
  contract: string,
  path: string
): void => {
  const pagination = expectRecord(value, contract, path);
  expectPositiveInteger(pagination.page, contract, `${path}.page`);
  expectPositiveInteger(
    pagination.pageSize,
    contract,
    `${path}.pageSize`
  );
  expectNonNegativeInteger(
    pagination.totalItems,
    contract,
    `${path}.totalItems`
  );
  expectNonNegativeInteger(
    pagination.totalPages,
    contract,
    `${path}.totalPages`
  );
  expectBoolean(
    pagination.hasPreviousPage,
    contract,
    `${path}.hasPreviousPage`
  );
  expectBoolean(
    pagination.hasNextPage,
    contract,
    `${path}.hasNextPage`
  );
};
