import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchColumnas, fetchBotones, fetchAllGestiones } from '../api/gestionesApi';
import { useClientSideTable, type TextFilters, type SelectedFilters } from '../../../shared/hooks/useClientSideTable';
import type { ColumnApi, DocumentoApi, BotonApi } from '../../../shared/types/indexApi';

export type { TextFilters, SelectedFilters };

const STATIC_KEYS = [
  'nId_DocxCobrar', 'mejorStatus', 'nId_Moneda', 'bEstado',
  'nZona', 'bSelected', 'nId_Estrategia', 'nId_Cartera',
];

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

// ─── Helper: Enriquece filas con keys dyn_N para que useClientSideTable filtre correctamente ───
function enrichWithDynamicKeys(data: DocumentoApi[], columns: ColumnApi[]): DocumentoApi[] {
  if (!columns.length || !data.length) return data;

  return data.map((row) => {
    const allKeys = Object.keys(row);
    const dynamicKeys = allKeys.filter((k) => !STATIC_KEYS.includes(k));
    const enriched: DocumentoApi = { ...row };

    columns.forEach((col) => {
      const match = col.key.match(/dyn_(\d+)/);
      if (match) {
        const index = parseInt(match[1], 10);
        const fieldName = dynamicKeys[index];
        if (fieldName !== undefined) {
          enriched[col.key] = row[fieldName];
        }
      }
    });

    return enriched;
  });
}

export function useDocumentos(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_contrato: string,
): UseDocumentosReturn {

  const [columns, setColumns] = useState<ColumnApi[]>([]);
  const [botones, setBotones] = useState<BotonApi[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [rawData, setRawData] = useState<DocumentoApi[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Enriquecer datos con keys dyn_N para filtros
  const allData = useMemo(() => enrichWithDynamicKeys(rawData, columns), [rawData, columns]);

  // ─── Hook genérico: filtros + paginación ───
  const table = useClientSideTable<DocumentoApi>(
    allData,
    [id_cliente, id_cartera, id_deudor, id_contrato],
    { initialPageSize: 10 }
  );

  // ─── Efecto 1: Cargar cabeceras y botones ───
  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_contrato) return;
    let cancelled = false;

    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const [cols, btns] = await Promise.all([
          fetchColumnas(id_cliente, id_contrato),
          fetchBotones(id_cliente, id_cartera),
        ]);
        if (!cancelled) {
          setColumns(cols);
          setBotones(btns);
        }
      } catch (err) {
        if (!cancelled) {
          setMetaError(err instanceof Error ? err.message : 'Error cargando metadatos');
        }
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    };

    loadMeta();
    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_contrato]);

  // ─── Efecto 2: Cargar TODOS los datos ───
  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;
    let cancelled = false;

    const loadData = async () => {
      setDataLoading(true);
      setDataError(null);
      try {
        const result = await fetchAllGestiones(id_cliente, id_cartera, id_deudor);
        if (cancelled) return;
        setRawData(result);
      } catch (err) {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : 'Error cargando documentos');
          setRawData([]);
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_deudor]);

  // ─── Refetch ───
  const refetch = useCallback(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);

    fetchAllGestiones(id_cliente, id_cartera, id_deudor)
      .then((result) => {
        if (cancelled) return;
        setRawData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : 'Error cargando documentos');
          setRawData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_deudor]);

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