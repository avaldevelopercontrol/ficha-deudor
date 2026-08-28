import { useCallback } from 'react';
import type {
  ColumnApi,
  DocumentoApi,
  BotonApi,
} from '../../../shared/types';
import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import { useDocumentosData } from './useDocumentosData';
import { useDocumentosMetadata } from './useDocumentosMetadata';
import {
  useDocumentosTableData,
  type SelectedFilters,
  type TextFilters,
} from './useDocumentosTableData';

export type { TextFilters, SelectedFilters };

interface UseDocumentosReturn {
  columns: ColumnApi[];
  allData: DocumentoApi[];
  filteredData: DocumentoApi[];
  paginatedData: DocumentoApi[];
  botones: BotonApi[];
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => Promise<void>;
  textFilters: TextFilters;
  selectedFilters: SelectedFilters;
  onTextFilterChange: (columnKey: string, value: string) => void;
  onSelectedFilterChange: (columnKey: string, values: string[]) => void;
}

export function useDocumentos(
  params: FichaDeudorDocumentosParams
): UseDocumentosReturn {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
    id_contrato,
  } = params;

  const {
    columns,
    botones,
    isLoading: metaLoading,
    error: metaError,
    refetch: refetchMetadata,
  } = useDocumentosMetadata({
    id_cliente,
    id_contrato,
  });

  const {
    rawData,
    isLoading: dataLoading,
    error: dataError,
    refetch: refetchData,
  } = useDocumentosData({
    id_cliente,
    id_cartera,
    id_deudor,
  });

  const documentosTable = useDocumentosTableData({
    columns,
    rawData,
    resetDeps: [id_cliente, id_cartera, id_deudor, id_contrato],
  });

  const isLoading = metaLoading || dataLoading;
  const error = metaError || dataError;

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchMetadata(),
      refetchData(),
    ]);
  }, [
    refetchMetadata,
    refetchData,
  ]);

  return {
    columns,
    botones,
    isLoading,
    error,
    refetch,
    ...documentosTable,
  };
}