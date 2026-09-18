import {
  expectRuntimeArray,
  expectRuntimeBoolean,
  expectRuntimeEnum,
  expectRuntimeFiniteNumber,
  expectRuntimeNonEmptyString,
  expectRuntimeNonNegativeInteger,
  expectRuntimePositiveInteger,
  expectRuntimeRecord,
  type RuntimeJsonRecord,
} from '../../../shared/api/runtimeValidation';

export type JsonRecord = RuntimeJsonRecord;

export type ContractParser<T> = (value: unknown) => T;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T/;
export class CentroControlCarteraContractError extends Error {
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
    this.name = 'CentroControlCarteraContractError';
    this.contract = contract;
    this.path = path;
  }
}

export const fail = (
  contract: string,
  path: string,
  expected: string
): never => {
  throw new CentroControlCarteraContractError(
    contract,
    path,
    expected
  );
};

export const expectRecord = (
  value: unknown,
  contract: string,
  path: string
): JsonRecord =>
  expectRuntimeRecord(
    value,
    path,
    (failurePath, expected) =>
      fail(contract, failurePath, expected)
  );

export const expectArray = (
  value: unknown,
  contract: string,
  path: string
): readonly unknown[] =>
  expectRuntimeArray(
    value,
    path,
    (failurePath, expected) =>
      fail(contract, failurePath, expected)
  );

export const expectNonEmptyString = (
  value: unknown,
  contract: string,
  path: string
): string =>
  expectRuntimeNonEmptyString(
    value,
    path,
    (failurePath, expected) =>
      fail(contract, failurePath, expected)
  );

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
): number =>
  expectRuntimeFiniteNumber(
    value,
    path,
    (failurePath, expected) =>
      fail(contract, failurePath, expected)
  );

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
): number =>
  expectRuntimeNonNegativeInteger(
    value,
    path,
    (failurePath, expected) =>
      fail(contract, failurePath, expected)
  );

export const expectPositiveInteger = (
  value: unknown,
  contract: string,
  path: string
): number =>
  expectRuntimePositiveInteger(
    value,
    path,
    (failurePath, expected) =>
      fail(contract, failurePath, expected)
  );

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
): boolean =>
  expectRuntimeBoolean(
    value,
    path,
    (failurePath, expected) =>
      fail(contract, failurePath, expected)
  );

export const expectNullableBoolean = (
  value: unknown,
  contract: string,
  path: string
): boolean | null => {
  if (value === null) {
    return null;
  }

  return expectBoolean(value, contract, path);
};

export const expectEnum = <T extends string>(
  value: unknown,
  allowedValues: ReadonlySet<string>,
  contract: string,
  path: string
): T =>
  expectRuntimeEnum<T>(
    value,
    allowedValues,
    path,
    (failurePath, expected) =>
      fail(contract, failurePath, expected)
  );

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
