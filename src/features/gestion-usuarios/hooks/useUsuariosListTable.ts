import { useMemo } from 'react';

import { useApiResource } from '@shared/hooks/useApiResource';
import { useClientSideTable } from '@shared/hooks/useClientSideTable';

import { fetchUsuariosList } from '../api/usuariosApi';
import type { UsuarioListado } from '../types/usuarioListado.types';

interface UseUsuariosListTableOptions {
  initialPageSize?: number;
}

export const useUsuariosListTable = ({
  initialPageSize = 10,
}: UseUsuariosListTableOptions = {}) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiResource<UsuarioListado[]>(
    fetchUsuariosList,
    []
  );

  const allData = useMemo(
    () => data ?? [],
    [data]
  );

  const table =
    useClientSideTable<UsuarioListado>(
      allData,
      [],
      {
        initialPageSize,
      }
    );

  const indiceInicio =
    (table.pageNumber - 1) *
    table.pageSize;

  const indiceFin = Math.min(
    indiceInicio + table.pageSize,
    table.totalRecords
  );

  return {
    allData,
    filteredData: table.filteredData,
    paginatedData: table.paginatedData,

    isLoading,
    error,
    refetch,

    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords: table.totalRecords,
    totalPages: table.totalPages,

    indiceInicio,
    indiceFin,

    textFilters: table.textFilters,
    selectedFilters:
      table.selectedFilters,

    setPageNumber:
      table.setPageNumber,
    setPageSize:
      table.setPageSize,

    onTextFilterChange:
      table.onTextFilterChange,
    onSelectedFilterChange:
      table.onSelectedFilterChange,

    resetFilters:
      table.resetFilters,
  };
};