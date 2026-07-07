import { useState, useEffect, useCallback, useMemo } from 'react';

import {
  fetchColumnas,
  fetchBotones,
  fetchAllGestiones,
} from '../api/gestionesApi';

import {
  useClientSideTable,
  type TextFilters,
  type SelectedFilters,
} from '../../../shared/hooks/useClientSideTable';

import type {
  ColumnApi,
  DocumentoApi,
  BotonApi,
} from '../../../shared/types/indexApi';

import { enrichDocumentoWithDynamicColumns } from '../utils/documentosDynamicKeys';
import {
  DOCUMENTOS_ERROR_MESSAGES,
  DOCUMENTOS_INITIAL_PAGE_SIZE,
} from '../constants/documentos.constants';

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
  refetch: () => void;
  textFilters: TextFilters;
  selectedFilters: SelectedFilters;
  onTextFilterChange: (columnKey: string, value: string) => void;
  onSelectedFilterChange: (columnKey: string, values: string[]) => void;
}

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  return error instanceof Error ? error.message : fallbackMessage;
};

const hasRequiredMetaParams = (
  idCliente: string,
  idCartera: string,
  idDeudor: string,
  idContrato: string,
  idUsuario: string
) => {
  return Boolean(idCliente && idCartera && idDeudor && idContrato && idUsuario);
};

const hasRequiredDataParams = (
  idCliente: string,
  idCartera: string,
  idDeudor: string
) => {
  return Boolean(idCliente && idCartera && idDeudor);
};

export function useDocumentos(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_contrato: string,
  id_usuario: string
): UseDocumentosReturn {
  const [columns, setColumns] = useState<ColumnApi[]>([]);
  const [botones, setBotones] = useState<BotonApi[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [rawData, setRawData] = useState<DocumentoApi[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const allData = useMemo(
    () => enrichDocumentoWithDynamicColumns(rawData, columns),
    [rawData, columns]
  );

  const table = useClientSideTable<DocumentoApi>(
    allData,
    [id_cliente, id_cartera, id_deudor, id_contrato],
    { initialPageSize: DOCUMENTOS_INITIAL_PAGE_SIZE }
  );

  const fetchDocumentosData = useCallback(async () => {
    if (!hasRequiredDataParams(id_cliente, id_cartera, id_deudor)) {
      return [];
    }

    return fetchAllGestiones(id_cliente, id_cartera, id_deudor);
  }, [id_cliente, id_cartera, id_deudor]);

  useEffect(() => {
    if (
      !hasRequiredMetaParams(
        id_cliente,
        id_cartera,
        id_deudor,
        id_contrato,
        id_usuario
      )
    ) {
      return;
    }

    let cancelled = false;

    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError(null);

      try {
        const [cols, btns] = await Promise.all([
          fetchColumnas(id_cliente, id_contrato),
          fetchBotones(id_cliente, id_cartera, id_deudor, id_usuario),
        ]);

        if (cancelled) return;

        setColumns(cols);
        setBotones(btns);
      } catch (error) {
        if (cancelled) return;

        setMetaError(getErrorMessage(error, DOCUMENTOS_ERROR_MESSAGES.META));
      } finally {
        if (!cancelled) {
          setMetaLoading(false);
        }
      }
    };

    void loadMeta();

    return () => {
      cancelled = true;
    };
  }, [id_cliente, id_cartera, id_deudor, id_contrato, id_usuario]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setDataLoading(true);
      setDataError(null);

      try {
        const result = await fetchDocumentosData();

        if (cancelled) return;

        setRawData(result);
      } catch (error) {
        if (cancelled) return;

        setDataError(getErrorMessage(error, DOCUMENTOS_ERROR_MESSAGES.DATA));
        setRawData([]);
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [fetchDocumentosData]);

  const refetch = useCallback(() => {
    const loadData = async () => {
      setDataLoading(true);
      setDataError(null);

      try {
        const result = await fetchDocumentosData();

        setRawData(result);
      } catch (error) {
        setDataError(getErrorMessage(error, DOCUMENTOS_ERROR_MESSAGES.DATA));
        setRawData([]);
      } finally {
        setDataLoading(false);
      }
    };

    void loadData();
  }, [fetchDocumentosData]);

  const isLoading = metaLoading || dataLoading;
  const error = metaError || dataError;

  return {
    columns,
    allData,
    filteredData: table.filteredData,
    paginatedData: table.paginatedData,
    botones,
    isLoading,
    error,
    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords: table.totalRecords,
    totalPages: table.totalPages,
    setPageNumber: table.setPageNumber,
    setPageSize: table.setPageSize,
    refetch,
    textFilters: table.textFilters,
    selectedFilters: table.selectedFilters,
    onTextFilterChange: table.onTextFilterChange,
    onSelectedFilterChange: table.onSelectedFilterChange,
  };
}