import { useMemo } from 'react';

import {
  useClientSideTable,
  type SelectedFilters,
  type TextFilters,
} from '@shared/hooks/useClientSideTable';
import type {
  ColumnApi,
  DocumentoApi,
} from '../../../shared/types';
import { DOCUMENTOS_INITIAL_PAGE_SIZE } from '../constants/documentos.constants';
import { enrichDocumentoWithDynamicColumns } from '../utils/documentosDynamicKeys';

interface UseDocumentosTableDataParams {
  columns: ColumnApi[];
  rawData: DocumentoApi[];
  resetDeps: readonly unknown[];
}

export type { TextFilters, SelectedFilters };

export const useDocumentosTableData = ({
  columns,
  rawData,
  resetDeps,
}: UseDocumentosTableDataParams) => {
  const allData = useMemo(
    () => enrichDocumentoWithDynamicColumns(rawData, columns),
    [rawData, columns]
  );

  const table = useClientSideTable<DocumentoApi>(allData, resetDeps, {
    initialPageSize: DOCUMENTOS_INITIAL_PAGE_SIZE,
  });

  return {
    allData,
    filteredData: table.filteredData,
    paginatedData: table.paginatedData,
    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords: table.totalRecords,
    totalPages: table.totalPages,
    setPageNumber: table.setPageNumber,
    setPageSize: table.setPageSize,
    textFilters: table.textFilters,
    selectedFilters: table.selectedFilters,
    onTextFilterChange: table.onTextFilterChange,
    onSelectedFilterChange: table.onSelectedFilterChange,
  };
};