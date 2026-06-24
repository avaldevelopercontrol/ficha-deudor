import { useState, useMemo, useCallback, useEffect } from 'react';

export interface TextFilters {
  [columnKey: string]: string;
}

export interface SelectedFilters {
  [columnKey: string]: string[];
}

interface UseClientSideTableOptions {
  initialPageSize?: number;
}

interface UseClientSideTableReturn<T extends Record<string, any>> {
  filteredData: T[];
  paginatedData: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  textFilters: TextFilters;
  selectedFilters: SelectedFilters;
  onTextFilterChange: (columnKey: string, value: string) => void;
  onSelectedFilterChange: (columnKey: string, values: string[]) => void;
  resetFilters: () => void;
}

export function useClientSideTable<T extends Record<string, any>>(
  data: T[],
  resetDeps: readonly unknown[] = [],
  options: UseClientSideTableOptions = {}
): UseClientSideTableReturn<T> {
  const { initialPageSize = 10 } = options;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [textFilters, setTextFilters] = useState<TextFilters>({});
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});

  // Resetear página y filtros cuando cambian IDs/dependencias clave
  useEffect(() => {
    setPageNumber(1);
    setTextFilters({});
    setSelectedFilters({});
  }, resetDeps);

  // Resetear página cuando cambia el tamaño
  useEffect(() => {
    setPageNumber(1);
  }, [pageSize]);

  // ─── Aplicar filtros ───
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Filtro de texto (contiene, case-insensitive)
      for (const [columnKey, filterText] of Object.entries(textFilters)) {
        if (!filterText) continue;
        const cellValue = String(row[columnKey] ?? '').toLowerCase();
        if (!cellValue.includes(filterText.toLowerCase())) return false;
      }

      // Filtro de selección (exacto)
      for (const [columnKey, selectedValues] of Object.entries(selectedFilters)) {
        if (!selectedValues || selectedValues.length === 0) continue;
        const cellValue = String(row[columnKey] ?? '');
        if (!selectedValues.includes(cellValue)) return false;
      }

      return true;
    });
  }, [data, textFilters, selectedFilters]);

  // ─── Paginación client-side ───
  const totalRecords = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(indiceInicio + pageSize, totalRecords);
  const paginatedData = filteredData.slice(indiceInicio, indiceFin);

  // ─── Handlers ───
  const handleSetPageNumber = useCallback((page: number) => setPageNumber(page), []);
  const handleSetPageSize = useCallback((size: number) => setPageSize(size), []);

  const onTextFilterChange = useCallback((columnKey: string, value: string) => {
    setTextFilters((prev) => ({ ...prev, [columnKey]: value }));
    setPageNumber(1);
  }, []);

  const onSelectedFilterChange = useCallback((columnKey: string, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [columnKey]: values }));
    setPageNumber(1);
  }, []);

  const resetFilters = useCallback(() => {
    setTextFilters({});
    setSelectedFilters({});
    setPageNumber(1);
  }, []);

  return {
    filteredData,
    paginatedData,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber: handleSetPageNumber,
    setPageSize: handleSetPageSize,
    textFilters,
    selectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
    resetFilters,
  };
}