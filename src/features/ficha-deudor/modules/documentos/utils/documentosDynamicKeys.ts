import type {
  ColumnApi,
  DocumentoApi,
} from '../../../shared/types';

export const DOCUMENTO_STATIC_KEYS = [
  'nId_DocxCobrar',
  'mejorStatus',
  'nId_Moneda',
  'bEstado',
  'nZona',
  'bSelected',
  'nId_Estrategia',
  'nId_Cartera',
] as const;

const DOCUMENTO_STATIC_KEYS_SET = new Set<string>(DOCUMENTO_STATIC_KEYS);
const DOCUMENTO_DYNAMIC_COLUMN_PATTERN = /^dyn_(\d+)$/;

export const isDocumentoStaticKey = (key: string): boolean =>
  DOCUMENTO_STATIC_KEYS_SET.has(key);

export const getDocumentoDynamicKeys = (row: DocumentoApi): string[] =>
  Object.keys(row).filter(
    (key) =>
      !isDocumentoStaticKey(key) &&
      !DOCUMENTO_DYNAMIC_COLUMN_PATTERN.test(key)
  );

const getDocumentoDynamicColumnIndex = (
  columnKey: string
): number | null => {
  const match = columnKey.match(
    DOCUMENTO_DYNAMIC_COLUMN_PATTERN
  );

  if (!match) {
    return null;
  }

  return Number(match[1]);
};

/**
 * Obtiene una única secuencia de campos dinámicos para toda la colección.
 *
 * La API no entrega el nombre técnico del campo en la definición de cada
 * cabecera, por lo que la relación inicial continúa dependiendo del orden
 * contractual de los campos. Se usa la fila más completa como referencia y
 * se agregan al final los campos adicionales encontrados en otras filas.
 */
export const getDocumentoCanonicalDynamicKeys = (
  data: readonly DocumentoApi[]
): string[] => {
  const keysByRow = data.map(getDocumentoDynamicKeys);

  const referenceKeys = keysByRow.reduce<string[]>(
    (current, keys) =>
      keys.length > current.length ? keys : current,
    []
  );

  const canonicalKeys = [...referenceKeys];
  const knownKeys = new Set(canonicalKeys);

  keysByRow.forEach((keys) => {
    keys.forEach((key) => {
      if (knownKeys.has(key)) {
        return;
      }

      knownKeys.add(key);
      canonicalKeys.push(key);
    });
  });

  return canonicalKeys;
};

export const getDocumentoColumnValue = (
  row: DocumentoApi,
  column: ColumnApi
): unknown => {
  return row[column.key];
};

export const enrichDocumentoWithDynamicColumns = (
  data: readonly DocumentoApi[],
  columns: readonly ColumnApi[]
): DocumentoApi[] => {
  if (!columns.length || !data.length) return [...data];

  const canonicalDynamicKeys =
    getDocumentoCanonicalDynamicKeys(data);

  return data.map((row) => {
    const enriched: DocumentoApi = { ...row };

    columns.forEach((column) => {
      const index = getDocumentoDynamicColumnIndex(
        column.key
      );

      if (index === null) {
        return;
      }

      const fieldName = canonicalDynamicKeys[index];

      enriched[column.key] =
        fieldName === undefined
          ? undefined
          : row[fieldName];
    });

    return enriched;
  });
};
