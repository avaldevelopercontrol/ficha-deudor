import {
  expectRuntimeArray,
  expectRuntimeBoolean,
  expectRuntimeEnum,
  expectRuntimeNonEmptyString,
  expectRuntimePositiveInteger,
  expectRuntimeRecord,
  type RuntimeJsonRecord,
} from '../../shared/api/runtimeValidation';

export type AnalyticsJsonRecord = RuntimeJsonRecord;

export class AccesoAnaliticaContractError extends Error {
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
    this.name = 'AccesoAnaliticaContractError';
    this.contract = contract;
    this.path = path;
  }
}

export const failAnalyticsContract = (
  contract: string,
  path: string,
  expected: string
): never => {
  throw new AccesoAnaliticaContractError(
    contract,
    path,
    expected
  );
};

const createContractFailure = (
  contract: string
) => (
  path: string,
  expected: string
): never => failAnalyticsContract(contract, path, expected);

export const expectAnalyticsRecord = (
  value: unknown,
  contract: string,
  path: string
): AnalyticsJsonRecord =>
  expectRuntimeRecord(
    value,
    path,
    createContractFailure(contract)
  );

export const expectAnalyticsArray = (
  value: unknown,
  contract: string,
  path: string
): readonly unknown[] =>
  expectRuntimeArray(
    value,
    path,
    createContractFailure(contract)
  );

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
): number =>
  expectRuntimePositiveInteger(
    value,
    path,
    createContractFailure(contract)
  );

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
): boolean =>
  expectRuntimeBoolean(
    value,
    path,
    createContractFailure(contract)
  );

export const expectAnalyticsNonEmptyString = (
  value: unknown,
  contract: string,
  path: string
): string =>
  expectRuntimeNonEmptyString(
    value,
    path,
    createContractFailure(contract)
  );

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
): T =>
  expectRuntimeEnum<T>(
    value,
    allowedValues,
    path,
    createContractFailure(contract)
  );
