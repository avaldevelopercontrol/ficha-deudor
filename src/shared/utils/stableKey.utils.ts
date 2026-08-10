export type StableKeyPart =
  | string
  | number
  | boolean
  | null
  | undefined;

const encodeNumber = (value: number): string => {
  if (Number.isNaN(value)) {
    return 'NaN';
  }

  if (value === Number.POSITIVE_INFINITY) {
    return '+Infinity';
  }

  if (value === Number.NEGATIVE_INFINITY) {
    return '-Infinity';
  }

  if (Object.is(value, -0)) {
    return '-0';
  }

  return String(value);
};

const encodeStableKeyPart = (
  value: StableKeyPart
): string => {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return 'undefined';
  }

  switch (typeof value) {
    case 'string':
      return `string:${value}`;

    case 'number':
      return `number:${encodeNumber(value)}`;

    case 'boolean':
      return value ? 'boolean:true' : 'boolean:false';
  }
};

/**
 * Crea una clave determinista a partir de dependencias primitivas.
 *
 * Cada elemento se codifica con su tipo y longitud para evitar colisiones
 * entre valores como `null`/`undefined`, `1`/`"1"` o cadenas que contienen
 * los mismos separadores utilizados internamente.
 */
export const createStableKey = (
  parts: readonly StableKeyPart[]
): string => {
  return parts
    .map(encodeStableKeyPart)
    .map((part) => `${part.length}:${part}`)
    .join('');
};
