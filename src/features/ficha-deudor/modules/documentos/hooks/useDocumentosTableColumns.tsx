import { useMemo } from 'react';

import type {
  ColumnApi,
  DocumentoApi,
} from '../../../shared/types';
import {
  buildDocumentosTableStyles,
  calculateDynamicColumnWidth,
  renderDocumentoCell,
} from '../utils/documentosTable.utils';

interface UseDocumentosTableColumnsParams {
  columns: ColumnApi[];
  allData: DocumentoApi[];
  paginatedData: DocumentoApi[];
}

export const useDocumentosTableColumns = ({
  columns,
  allData,
  paginatedData,
}: UseDocumentosTableColumnsParams) => {
  const columnWidths = useMemo(() => {
    const rowsForWidth = allData.length > 0 ? allData : paginatedData;

    return columns.reduce<Record<string, string>>((acc, column) => {
      acc[column.key] = calculateDynamicColumnWidth(column, rowsForWidth);
      return acc;
    }, {});
  }, [columns, allData, paginatedData]);

  const tableStyles = useMemo(() => {
    return buildDocumentosTableStyles(columns, columnWidths);
  }, [columns, columnWidths]);

  const tableColumns = useMemo(() => {
    return columns.map((column) => ({
      key: column.key,
      label: column.label,
      render: (row: DocumentoApi) => renderDocumentoCell(row, column),
    }));
  }, [columns]);

  return {
    tableStyles,
    tableColumns,
  };
};