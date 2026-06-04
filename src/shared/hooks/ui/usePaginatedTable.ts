// hooks/usePaginatedTable.ts
import { useState, useMemo, useEffect, useCallback } from 'react';

export interface UsePaginatedTableOptions<T> {
  data: T[];
  defaultPageSize?: number;
  resetDeps?: React.DependencyList;
}

export interface UsePaginatedTableResult<T> {
  // Paginación
  paginaActual: number;
  setPaginaActual: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  totalPaginas: number;
  indiceInicio: number;
  indiceFin: number;
  datosPaginados: T[];
  datosFiltrados: T[];
  
  // Filtros
  textFilters: Record<string, string>;
  selectedFilters: Record<string, string[]>;
  setTextFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setSelectedFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  onTextFilterChange: (colKey: string, text: string) => void;
  onSelectedFilterChange: (colKey: string, selected: string[]) => void;
  
  // Reset
  resetAll: () => void;
}

export function usePaginatedTable<T extends object>({
  data,
  defaultPageSize = 5,
  resetDeps = [],
}: UsePaginatedTableOptions<T>): UsePaginatedTableResult<T> {
  const [paginaActual, setPaginaActual] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [textFilters, setTextFilters] = useState<Record<string, string>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  // Aplicar filtros
  const datosFiltrados = useMemo(() => {
    let filtered = [...data];

    Object.entries(textFilters).forEach(([key, text]) => {
      if (text) {
        filtered = filtered.filter(item => {
          const value = item[key as keyof T];
          return value != null && String(value).toLowerCase().includes(text.toLowerCase());
        });
      }
    });

    Object.entries(selectedFilters).forEach(([key, selectedVals]) => {
      if (selectedVals.length) {
        filtered = filtered.filter(item => {
          const value = item[key as keyof T];
          return value != null && selectedVals.includes(String(value));
        });
      }
    });

    return filtered;
  }, [data, textFilters, selectedFilters]);

  // Paginación
  const totalPaginas = Math.ceil(datosFiltrados.length / pageSize) || 1;
  const indiceInicio = (paginaActual - 1) * pageSize;
  const datosPaginados = datosFiltrados.slice(indiceInicio, indiceInicio + pageSize);
  const indiceFin = Math.min(indiceInicio + pageSize, datosFiltrados.length);

  // Reset página cuando cambian filtros o pageSize
  useEffect(() => {
    setPaginaActual(1);
  }, [datosFiltrados.length, pageSize]);

  // Reset completo
  const resetAll = useCallback(() => {
    setPaginaActual(1);
    setPageSize(defaultPageSize);
    setTextFilters({});
    setSelectedFilters({});
  }, [defaultPageSize]);

  // Reset externo (cuando isActive cambia)
  useEffect(() => {
    resetAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const onTextFilterChange = useCallback((colKey: string, text: string) => {
    setTextFilters(prev => ({ ...prev, [colKey]: text }));
  }, []);

  const onSelectedFilterChange = useCallback((colKey: string, selected: string[]) => {
    setSelectedFilters(prev => ({ ...prev, [colKey]: selected }));
  }, []);

  return {
    paginaActual,
    setPaginaActual,
    pageSize,
    setPageSize,
    totalPaginas,
    indiceInicio,
    indiceFin,
    datosPaginados,
    datosFiltrados,
    textFilters,
    selectedFilters,
    setTextFilters,
    setSelectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
    resetAll,
  };
}