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

export const isDocumentoStaticKey = (key: string): boolean =>
  DOCUMENTO_STATIC_KEYS_SET.has(key);

export const getDocumentoDynamicKeys = (row: DocumentoApi): string[] =>
  Object.keys(row).filter((key) => !isDocumentoStaticKey(key));

export const getDocumentoColumnValue = (
  row: DocumentoApi,
  column: ColumnApi
): unknown => {
  const match = column.key.match(/^dyn_(\d+)$/);

  if (!match) {
    return row[column.key];
  }

  const index = parseInt(match[1], 10);
  const fieldName = getDocumentoDynamicKeys(row)[index];

  if (fieldName === undefined) {
    return undefined;
  }

  return row[fieldName];
};

export const enrichDocumentoWithDynamicColumns = (
  data: DocumentoApi[],
  columns: ColumnApi[]
): DocumentoApi[] => {
  if (!columns.length || !data.length) return data;

  return data.map((row) => {
    const dynamicKeys = getDocumentoDynamicKeys(row);
    const enriched: DocumentoApi = { ...row };

    columns.forEach((column) => {
      const match = column.key.match(/^dyn_(\d+)$/);

      if (!match) return;

      const index = parseInt(match[1], 10);
      const fieldName = dynamicKeys[index];

      if (fieldName !== undefined) {
        enriched[column.key] = row[fieldName];
      }
    });

    return enriched;
  });
};