import { useCallback } from 'react';
import {
  fetchDireccionesReferenciadas,
  createDireccion,
  updateDireccion,
  fetchDepartamentos,
  fetchProvincias,
  fetchDistritos,
  fetchDireccionUbicaciones,
  fetchDireccionById,
} from '../api/direccionesReferenciadasApi';
import type {
  DireccionReferenciada,
  DireccionFormData,
  DireccionEditFormData,
  Departamento,
  Provincia,
  Distrito,
  DireccionUbicacion,
  DireccionByIdApi,
} from '../../../shared/types';
import { useApiResource } from '../../../shared/hooks/useApiResource';
import { useNullableResourceById } from '../../../shared/hooks/useNullableResourceById';
import { useClientSideResourceTable } from '../../../shared/hooks/useClientSideResourceTable';
import type {
  TextFilters,
  SelectedFilters,
} from '../../../shared/hooks/useClientSideTable';
import {
  DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES,
  DIRECCIONES_REFERENCIADAS_INITIAL_PAGE_SIZE,
} from '../constants/direccionesReferenciadas.constants';

export type { TextFilters, SelectedFilters };

interface UseDireccionesReferenciadasReturn {
  allData: DireccionReferenciada[];
  filteredData: DireccionReferenciada[];
  paginatedData: DireccionReferenciada[];
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
  resetFilters: () => void;
  create: (formData: DireccionFormData) => Promise<void>;
  update: (id: string, formData: DireccionEditFormData) => Promise<void>;
}

type DireccionCatalogFetcher<T> = (signal: AbortSignal) => Promise<T[]>;

const hasRequiredValues = (...values: string[]) => {
  return values.every((value) => value.trim() !== '');
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  return error instanceof Error ? error.message : fallbackMessage;
};

function useDireccionCatalog<T>(fetchCatalog: DireccionCatalogFetcher<T>) {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchCatalog(signal),
    [fetchCatalog]
  );

  return useApiResource<T[]>(fetcher, []);
}

export function useDireccionesReferenciadas(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string
): UseDireccionesReferenciadasReturn {
  const canLoadDireccionesReferenciadas = hasRequiredValues(
    id_cliente,
    id_deudor
  );

  const fetchDireccionesReferenciadasData = useCallback(() => {
    return fetchDireccionesReferenciadas(id_cliente, id_deudor);
  }, [id_cliente, id_deudor]);

  const {
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
    resetFilters,
    setError,
  } = useClientSideResourceTable<DireccionReferenciada>({
    fetchData: fetchDireccionesReferenciadasData,
    resetDeps: [id_cliente, id_deudor],
    enabled: canLoadDireccionesReferenciadas,
    initialPageSize: DIRECCIONES_REFERENCIADAS_INITIAL_PAGE_SIZE,
    errorMessage: DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.LIST,
  });

  const create = useCallback(
    async (formData: DireccionFormData) => {
      try {
        await createDireccion(id_cliente, id_deudor, id_usuario, formData);
        await refetch();
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.CREATE
          )
        );

        throw error;
      }
    },
    [id_cliente, id_deudor, id_usuario, refetch, setError]
  );

  const update = useCallback(
    async (id: string, formData: DireccionEditFormData) => {
      try {
        await updateDireccion(id_cliente, id_deudor, id_usuario, id, formData);
        await refetch();
      } catch (error) {
        setError(
          getErrorMessage(
            error,
            DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.UPDATE
          )
        );

        throw error;
      }
    },
    [id_cliente, id_deudor, id_usuario, refetch, setError]
  );

  return {
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
    resetFilters,
    create,
    update,
  };
}

export function useDireccionById(idDireccion: string | null) {
  const fetcher = useCallback(
    (id: string, signal: AbortSignal) => fetchDireccionById(id, signal),
    []
  );

  return useNullableResourceById<string, DireccionByIdApi>({
    id: idDireccion,
    fetcher,
    errorMessage: DIRECCIONES_REFERENCIADAS_ERROR_MESSAGES.BY_ID,
  });
}

export function useDepartamentos() {
  return useDireccionCatalog<Departamento>(fetchDepartamentos);
}

export function useProvincias(idDepartamento: string | null) {
  const fetcher = useCallback(
    (signal: AbortSignal) => {
      if (!idDepartamento) {
        return Promise.resolve([] as Provincia[]);
      }

      return fetchProvincias(idDepartamento, signal);
    },
    [idDepartamento]
  );

  return useApiResource<Provincia[]>(fetcher, [idDepartamento]);
}

export function useDistritos(
  idDepartamento: string | null,
  idProvincia: string | null
) {
  const fetcher = useCallback(
    (signal: AbortSignal) => {
      if (!idDepartamento || !idProvincia) {
        return Promise.resolve([] as Distrito[]);
      }

      return fetchDistritos(idDepartamento, idProvincia, signal);
    },
    [idDepartamento, idProvincia]
  );

  return useApiResource<Distrito[]>(fetcher, [idDepartamento, idProvincia]);
}

export function useDireccionUbicaciones() {
  return useDireccionCatalog<DireccionUbicacion>(fetchDireccionUbicaciones);
}