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
}

export const useDocumentosTableColumns = ({
  columns,
  allData,
}: UseDocumentosTableColumnsParams) => {
  const columnWidths = useMemo(() => {
    return columns.reduce<Record<string, string>>((acc, column) => {
      acc[column.key] = calculateDynamicColumnWidth(column, allData);
      return acc;
    }, {});
  }, [columns, allData]);

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