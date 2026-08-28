export type RuntimeTypeGuard<T> = (
  value: unknown
) => value is T;

type ObjectGuardShape<T extends object> = {
  [K in keyof T]-?: RuntimeTypeGuard<T[K]>;
};

export const isObjectRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
};

export const isString = (
  value: unknown
): value is string => {
  return typeof value === 'string';
};

export const isNumber = (
  value: unknown
): value is number => {
  return (
    typeof value === 'number' &&
    Number.isFinite(value)
  );
};

export const isInteger = (
  value: unknown
): value is number => {
  return isNumber(value) && Number.isInteger(value);
};

export const isBoolean = (
  value: unknown
): value is boolean => {
  return typeof value === 'boolean';
};

export const isOptionalString = (
  value: unknown
): value is string | undefined => {
  return value === undefined || isString(value);
};

export const isOptionalBoolean = (
  value: unknown
): value is boolean | undefined => {
  return value === undefined || isBoolean(value);
};

export const isOptionalNullableBoolean = (
  value: unknown
): value is boolean | null | undefined => {
  return (
    value === undefined ||
    value === null ||
    isBoolean(value)
  );
};

const isNullableInteger = (
  value: unknown
): value is number | null => {
  return value === null || isInteger(value);
};

export const isOptionalNullableInteger = (
  value: unknown
): value is number | null | undefined => {
  return (
    value === undefined ||
    isNullableInteger(value)
  );
};

export const createObjectGuard = <T extends object>(
  shape: ObjectGuardShape<T>
): RuntimeTypeGuard<T> => {
  return (value: unknown): value is T => {
    if (!isObjectRecord(value)) {
      return false;
    }

    return Object.entries(shape).every(
      ([key, guard]) =>
        typeof guard === 'function' &&
        guard(value[key])
    );
  };
};
