import { useCallback } from 'react';
import {
  fetchTelefonosReferenciados,
  fetchTelefonoResultados,
  createTelefono,
  updateTelefono,
  fetchTelefonoOperadores,
  fetchTelefonoUbicaciones,
  fetchTelefonoHorarioGestion,
  fetchTelefonoFuenteBusqueda,
  fetchTelefonoById,
} from '../api/telefonosReferenciadosApi';
import type {
  TelefonoReferenciado,
  TelefonoFormData,
  TelefonoList,
  TelefonoEditarApi,
} from '../../../shared/types';
import { useApiResource } from '../../../shared/hooks/useApiResource';
import { useNullableResourceById } from '../../../shared/hooks/useNullableResourceById';
import { useClientSideResourceTable } from '../../../shared/hooks/useClientSideResourceTable';
import type {
  TextFilters,
  SelectedFilters,
} from '../../../shared/hooks/useClientSideTable';

export type { TextFilters, SelectedFilters };

export interface UseTelefonosReferenciadosReturn {
  allData: TelefonoReferenciado[];
  filteredData: TelefonoReferenciado[];
  paginatedData: TelefonoReferenciado[];
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
  create: (formData: TelefonoFormData) => Promise<void>;
  update: (id: number, formData: TelefonoFormData) => Promise<void>;
}

type TelefonoCatalogFetcher = (
  signal: AbortSignal
) => Promise<TelefonoList[]>;

function useTelefonoCatalog(fetchCatalog: TelefonoCatalogFetcher) {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchCatalog(signal),
    [fetchCatalog]
  );

  return useApiResource<TelefonoList[]>(fetcher, []);
}

export function useTelefonosReferenciados(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string
): UseTelefonosReferenciadosReturn {
  const fetchData = useCallback(() => {
    return fetchTelefonosReferenciados(id_cliente, id_deudor);
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
    setError,
  } = useClientSideResourceTable<TelefonoReferenciado>({
    fetchData,
    resetDeps: [id_cliente, id_deudor],
    enabled: Boolean(id_cliente && id_deudor),
    initialPageSize: 10,
    errorMessage: 'Error cargando teléfonos',
  });

  const create = useCallback(
    async (formData: TelefonoFormData) => {
      try {
        await createTelefono(id_cliente, id_deudor, id_usuario, formData);
        await refetch();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al crear teléfono';

        setError(msg);
        throw err;
      }
    },
    [id_cliente, id_deudor, id_usuario, refetch, setError]
  );

  const update = useCallback(
    async (id: number, formData: TelefonoFormData) => {
      try {
        await updateTelefono(id_cliente, id_deudor, id_usuario, id, formData);
        await refetch();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al actualizar teléfono';

        setError(msg);
        throw err;
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
    create,
    update,
  };
}

export function useTelefonoById(idTelefono: number | null) {
  const fetcher = useCallback(
    (id: number, signal: AbortSignal) => fetchTelefonoById(id, signal),
    []
  );

  return useNullableResourceById<number, TelefonoEditarApi>({
    id: idTelefono,
    fetcher,
    errorMessage: 'Error cargando teléfono',
  });
}

export function useTelefonoResultados() {
  return useTelefonoCatalog(fetchTelefonoResultados);
}

export function useTelefonoOperadores() {
  return useTelefonoCatalog(fetchTelefonoOperadores);
}

export function useTelefonoUbicaciones() {
  return useTelefonoCatalog(fetchTelefonoUbicaciones);
}

export function useTelefonoHorarioGestion() {
  return useTelefonoCatalog(fetchTelefonoHorarioGestion);
}

export function useTelefonoFuenteBusqueda() {
  return useTelefonoCatalog(fetchTelefonoFuenteBusqueda);
}