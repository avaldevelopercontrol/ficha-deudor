import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchCabeceraDatosAdicionales, fetchAllDatosAdicionales } from '../api/datosAdicionalesApi';
import type { ColumnApi, DatoAdicionalApi } from '../../../shared/types/indexApi';

export interface TextFilters {
  [columnKey: string]: string;
}

export interface SelectedFilters {
  [columnKey: string]: string[];
}

interface UseDatosAdicionalesReturn {
  columns: ColumnApi[];
  allData: DatoAdicionalApi[];
  filteredData: DatoAdicionalApi[];
  paginatedData: DatoAdicionalApi[];
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
  // Filtros
  textFilters: TextFilters;
  selectedFilters: SelectedFilters;
  onTextFilterChange: (columnKey: string, value: string) => void;
  onSelectedFilterChange: (columnKey: string, values: string[]) => void;
}

export function useDatosAdicionales(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  pantalla: number = 3
): UseDatosAdicionalesReturn {

  const [columns, setColumns] = useState<ColumnApi[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [allData, setAllData] = useState<DatoAdicionalApi[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtros
  const [textFilters, setTextFilters] = useState<TextFilters>({});
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});

  // ─── Efecto 1: Cargar cabeceras ───
  useEffect(() => {
    if (!id_cliente) return;
    let cancelled = false;

    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const cols = await fetchCabeceraDatosAdicionales(id_cliente, pantalla);
        if (!cancelled) {
          setColumns(cols);
        }
      } catch (err) {
        if (!cancelled) {
          setMetaError(err instanceof Error ? err.message : 'Error cargando cabeceras');
        }
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    };

    loadMeta();
    return () => { cancelled = true; };
  }, [id_cliente, pantalla]);

  // ─── Efecto 2: Cargar TODOS los registros de una vez ───
  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;
    let cancelled = false;

    const loadData = async () => {
      setDataLoading(true);
      setDataError(null);
      try {
        const result = await fetchAllDatosAdicionales(id_cliente, id_cartera, id_deudor);
        if (cancelled) return;
        setAllData(result);
      } catch (err) {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : 'Error cargando datos adicionales');
          setAllData([]);
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_deudor]);

  // ─── Resetear pagina y filtros cuando cambian IDs ───
  useEffect(() => {
    setPageNumber(1);
    setTextFilters({});
    setSelectedFilters({});
  }, [id_cliente, id_cartera, id_deudor]);

  // Resetear pagina cuando cambia pageSize
  useEffect(() => {
    setPageNumber(1);
  }, [pageSize]);

  // ─── Aplicar filtros sobre TODOS los datos ───
  const filteredData = useMemo(() => {
    return allData.filter((row) => {
      // Filtro de texto (contiene)
      for (const [columnKey, filterText] of Object.entries(textFilters)) {
        if (!filterText) continue;
        const cellValue = String(row[columnKey] ?? '').toLowerCase();
        if (!cellValue.includes(filterText.toLowerCase())) {
          return false;
        }
      }

      // Filtro de seleccion (exacto)
      for (const [columnKey, selectedValues] of Object.entries(selectedFilters)) {
        if (!selectedValues || selectedValues.length === 0) continue;
        const cellValue = String(row[columnKey] ?? '');
        if (!selectedValues.includes(cellValue)) {
          return false;
        }
      }

      return true;
    });
  }, [allData, textFilters, selectedFilters]);

  // ─── Paginacion client-side sobre datos filtrados ───
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(indiceInicio + pageSize, totalRecords);
  const paginatedData = filteredData.slice(indiceInicio, indiceFin);

  const refetch = useCallback(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);

    fetchAllDatosAdicionales(id_cliente, id_cartera, id_deudor)
      .then((result) => {
        if (cancelled) return;
        setAllData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : 'Error cargando datos adicionales');
          setAllData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_deudor]);

  const onTextFilterChange = useCallback((columnKey: string, value: string) => {
    setTextFilters((prev) => ({ ...prev, [columnKey]: value }));
    setPageNumber(1);
  }, []);

  const onSelectedFilterChange = useCallback((columnKey: string, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [columnKey]: values }));
    setPageNumber(1);
  }, []);

  const isLoading = metaLoading || dataLoading;
  const error = metaError || dataError;

  return {
    columns,
    allData,
    filteredData,
    paginatedData,
    isLoading,
    error,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber,
    setPageSize,
    refetch,
    textFilters,
    selectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
  };
}
