import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';
import {
  useClientSideTable,
} from '@shared/hooks/useClientSideTable';

import {
  buildProduccionOnlineCatalogOptions,
  createDefaultProduccionOnlineFilters,
  createProduccionOnlineFilterDependencies,
} from '../application/produccionOnlineView.application';
import {
  fetchProduccionOnlineCatalogs,
  fetchProduccionResumen,
} from '../api/produccionOnlineApi';
import {
  PRODUCCION_ONLINE_SORT_DIRECTION_OPTIONS,
  PRODUCCION_ONLINE_SORT_FIELD_OPTIONS,
  PRODUCCION_ONLINE_TIPO_LLAMADA_OPTIONS,
} from '../constants/produccionOnline.constants';
import type {
  ProduccionOnlineFilters,
  ProduccionOnlineSortDirection,
  ProduccionOnlineSortKey,
} from '../types/produccionOnline.types';
import {
  sortProduccionOnlineRows,
} from '../utils/produccionOnlineSort.utils';

export const useProduccionOnline = () => {
  const [filters, setFilters] =
    useState<ProduccionOnlineFilters>(
      createDefaultProduccionOnlineFilters
    );
  const [sortKey, setSortKey] =
    useState<ProduccionOnlineSortKey | ''>('');
  const [sortDirection, setSortDirection] =
    useState<ProduccionOnlineSortDirection>('desc');

  const filterDependencies =
    createProduccionOnlineFilterDependencies(
      filters
    );

  const catalogsResource =
    useApiResource(
      fetchProduccionOnlineCatalogs,
      []
    );

  const summaryFetcher = useCallback(
    (signal: AbortSignal) =>
      fetchProduccionResumen(
        filters,
        signal
      ),
    [filters]
  );

  const summaryResource =
    useApiResource(
      summaryFetcher,
      filterDependencies
    );

  const rows = useMemo(
    () => summaryResource.data ?? [],
    [summaryResource.data]
  );
  const sortedRows = useMemo(
    () =>
      sortProduccionOnlineRows(
        rows,
        sortKey,
        sortDirection
      ),
    [rows, sortDirection, sortKey]
  );

  const table = useClientSideTable(
    sortedRows,
    filterDependencies,
    {
      initialPageSize: 10,
    }
  );

  const catalogOptions = useMemo(
    () =>
      buildProduccionOnlineCatalogOptions(
        catalogsResource.data
      ),
    [catalogsResource.data]
  );

  const setFilter = useCallback(
    <K extends keyof ProduccionOnlineFilters>(
      key: K,
      value: ProduccionOnlineFilters[K]
    ) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }));
    },
    []
  );

  const handleSortKeyChange = useCallback(
    (value: ProduccionOnlineSortKey | '') => {
      setSortKey(value);
      table.setPageNumber(1);
    },
    [table]
  );

  const handleSortDirectionChange = useCallback(
    (value: ProduccionOnlineSortDirection) => {
      setSortDirection(value);
      table.setPageNumber(1);
    },
    [table]
  );

  const resetFilters = useCallback(() => {
    setFilters(
      createDefaultProduccionOnlineFilters()
    );
    setSortKey('');
    setSortDirection('desc');
  }, []);

  return {
    filters,
    setFilter,
    resetFilters,

    provinciaOptions:
      catalogOptions.provincias,
    perfilOptions: catalogOptions.perfiles,
    clienteOptions: catalogOptions.clientes,
    tipoLlamadaOptions:
      PRODUCCION_ONLINE_TIPO_LLAMADA_OPTIONS,

    sortKey,
    sortDirection,
    sortFieldOptions:
      PRODUCCION_ONLINE_SORT_FIELD_OPTIONS,
    sortDirectionOptions:
      PRODUCCION_ONLINE_SORT_DIRECTION_OPTIONS,
    onSortKeyChange: handleSortKeyChange,
    onSortDirectionChange:
      handleSortDirectionChange,

    catalogs: {
      isLoading: catalogsResource.isLoading,
      error: catalogsResource.error,
      refetch: catalogsResource.refetch,
    },

    summary: {
      isLoading: summaryResource.isLoading,
      error: summaryResource.error,
      refetch: summaryResource.refetch,
    },

    allData: sortedRows,
    paginatedData: table.paginatedData,
    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords: table.totalRecords,
    totalPages: table.totalPages,
    textFilters: table.textFilters,
    selectedFilters: table.selectedFilters,
    setPageNumber: table.setPageNumber,
    setPageSize: table.setPageSize,
    onTextFilterChange:
      table.onTextFilterChange,
    onSelectedFilterChange:
      table.onSelectedFilterChange,
  };
};
