import type {
  ColumnApi,
  DocumentoApi,
} from '../../../shared/types';
import {
  CELL_EXTRA_WIDTH_PX,
  CHAR_WIDTH_PX,
  DOCUMENTOS_COLUMN_WIDTHS,
  MIN_DYNAMIC_COLUMN_WIDTH,
} from '../constants/documentosTable.constants';
import { getDocumentoColumnValue } from './documentosDynamicKeys';

export const formatDocumentoMoney = (value: number) => {
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getTextLengthForWidth = (
  value: unknown,
  column: ColumnApi
): number => {
  if (value === null || value === undefined) return 1;

  if (column.type === 'money' && typeof value === 'number') {
    return formatDocumentoMoney(value).length;
  }

  if (column.type === 'atraso') {
    return `${String(value)}d`.length;
  }

  return String(value).length;
};

export const calculateDynamicColumnWidth = (
  column: ColumnApi,
  rows: DocumentoApi[]
): string => {
  const fixedWidth = DOCUMENTOS_COLUMN_WIDTHS[column.key];

  if (fixedWidth) {
    return fixedWidth;
  }

  const maxContentLength = rows.reduce((maxLength, row) => {
    const value = getDocumentoColumnValue(row, column);
    const valueLength = getTextLengthForWidth(value, column);

    return Math.max(maxLength, valueLength);
  }, column.label.length);

  const calculatedWidth = Math.max(
    MIN_DYNAMIC_COLUMN_WIDTH,
    maxContentLength * CHAR_WIDTH_PX + CELL_EXTRA_WIDTH_PX
  );

  return `${Math.ceil(calculatedWidth)}px`;
};

export const renderDocumentoCell = (
  row: DocumentoApi,
  column: ColumnApi
) => {
  const value = getDocumentoColumnValue(row, column);

  if (value === null || value === undefined) return '-';

  switch (column.type) {
    case 'money':
      return typeof value === 'number' ? formatDocumentoMoney(value) : String(value);

    case 'atraso':
      return (
        <span style={{ color: 'red', fontWeight: 'bold' }}>
          {String(value)}d
        </span>
      );

    case 'estado': {
      const isActivo = String(value).toUpperCase() === 'ACTIVO';

      return (
        <span
          style={{
            color: isActivo ? '#2e7d32' : '#c62828',
            fontWeight: 600,
            backgroundColor: isActivo ? '#e8f5e9' : '#ffebee',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.85em',
          }}
        >
          {String(value)}
        </span>
      );
    }

    case 'date':
      return String(value);

    default:
      return String(value);
  }
};

export const buildDocumentosTableStyles = (
  columns: ColumnApi[],
  columnWidths: Record<string, string>
) => {
  const dynamicColumnStyles = columns
    .map((column, index) => {
      const width =
        columnWidths[column.key] || `${MIN_DYNAMIC_COLUMN_WIDTH}px`;
      const isFixedColumn = Boolean(DOCUMENTOS_COLUMN_WIDTHS[column.key]);

      return `
        .documentos-table-compact th:nth-child(${index + 1}),
        .documentos-table-compact td:nth-child(${index + 1}) {
          width: ${width} !important;
          min-width: ${width} !important;
          ${isFixedColumn ? `max-width: ${width} !important;` : ''}
        }
      `;
    })
    .join('\n');

  return `
    .documentos-table-compact table {
      table-layout: auto !important;
      width: max-content !important;
      min-width: 100% !important;
    }

    .documentos-table-compact th,
    .documentos-table-compact td {
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      padding: 6px 4px !important;
      font-size: 1em !important;
    }

    .documentos-table-compact th input[type="text"],
    .documentos-table-compact th input[type="search"],
    .documentos-table-compact th select {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      font-size: 1.5em !important;
      padding: 3px 4px !important;
      height: 26px !important;
    }

    .documentos-table-compact th input::placeholder {
      font-size: 0.85em !important;
    }

    .documentos-table-compact th > div:first-child {
      font-size: 0.8em !important;
      font-weight: 600 !important;
      margin-bottom: 2px !important;
    }

    ${dynamicColumnStyles}
  `;
};