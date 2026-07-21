import { useCallback } from 'react';

import {
  fetchEstadosGestion,
  fetchEstadosGestionHistoricos,
} from '../api/estadosGestionApi';

import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';

import type {
  TextFilters,
  SelectedFilters,
} from '@shared/hooks/useClientSideTable';

import type {
  EstadoGestion,
  EstadoGestionCompleta,
} from '../../../shared/types';

import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';

import {
  ESTADOS_GESTION_ERROR_MESSAGES,
  ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_NUMBER,
  ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_SIZE,
  ESTADOS_GESTION_HISTORICOS_INITIAL_PAGE_SIZE,
  ESTADOS_GESTION_INITIAL_PAGE_SIZE,
} from '../constants/estadosGestion.constants';

import { hasRequiredValues } from '../../../shared/utils/requiredValues.utils';

export type {
  TextFilters,
  SelectedFilters,
};

interface UseEstadosGestionOptions {
  loadHistoricos?: boolean;
}

export interface UseEstadosGestionReturn {
  /* ────────────────────────────────────────────────
     Estados de gestión resumidos
     ──────────────────────────────────────────────── */

  allData: EstadoGestion[];
  filteredData: EstadoGestion[];
  paginatedData: EstadoGestion[];

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

  onTextFilterChange: (
    columnKey: string,
    value: string
  ) => void;

  onSelectedFilterChange: (
    columnKey: string,
    values: string[]
  ) => void;

  /* ────────────────────────────────────────────────
     Estados de gestión históricos completos
     ──────────────────────────────────────────────── */

  /**
   * Registros históricos filtrados y paginados
   * que se muestran en la página actual.
   */
  completo: EstadoGestionCompleta[];

  /**
   * Colección completa obtenida de todas las páginas
   * del endpoint histórico.
   */
  completoAllData: EstadoGestionCompleta[];

  /**
   * Registros históricos que cumplen los filtros,
   * antes de aplicar la paginación.
   */
  completoFilteredData: EstadoGestionCompleta[];

  completoLoading: boolean;
  completoError: string | null;

  completoPageNumber: number;
  completoPageSize: number;
  completoTotalRecords: number;
  completoTotalPages: number;

  completoTextFilters: TextFilters;
  completoSelectedFilters: SelectedFilters;

  setCompletoPageNumber: (
    page: number
  ) => void;

  setCompletoPageSize: (
    size: number
  ) => void;

  onCompletoTextFilterChange: (
    columnKey: string,
    value: string
  ) => void;

  onCompletoSelectedFilterChange: (
    columnKey: string,
    values: string[]
  ) => void;

  refetchCompleto: () => Promise<void>;
}

export function useEstadosGestion(
  params: FichaDeudorCarteraPanelParams,
  {
    loadHistoricos = true,
  }: UseEstadosGestionOptions = {}
): UseEstadosGestionReturn {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
  } = params;

  const canLoadEstadosGestion =
    hasRequiredValues(
      id_cliente,
      id_cartera,
      id_deudor
    );

  const canLoadEstadosHistoricos =
    loadHistoricos &&
    canLoadEstadosGestion;

  /* ════════════════════════════════════════════════
     ESTADOS DE GESTIÓN RESUMIDOS
     ════════════════════════════════════════════════ */

  const fetchEstadosGestionResumidos =
    useCallback(async () => {
      const result =
        await fetchEstadosGestion(
          id_cliente,
          id_cartera,
          id_deudor
        );

      return result.resumido;
    }, [
      id_cliente,
      id_cartera,
      id_deudor,
    ]);

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
  } =
    useClientSideResourceTable<EstadoGestion>({
      fetchData:
        fetchEstadosGestionResumidos,

      resetDeps: [
        id_cliente,
        id_cartera,
        id_deudor,
      ],

      enabled:
        canLoadEstadosGestion,

      initialPageSize:
        ESTADOS_GESTION_INITIAL_PAGE_SIZE,

      errorMessage:
        ESTADOS_GESTION_ERROR_MESSAGES
          .RESUMIDOS,
    });

  /* ════════════════════════════════════════════════
     ESTADOS DE GESTIÓN HISTÓRICOS
     ════════════════════════════════════════════════ */

  /**
   * Obtiene todos los registros históricos.
   *
   * Primero solicita una página de hasta 1000 registros.
   * Si el endpoint indica que existen más páginas,
   * obtiene las páginas restantes y une los resultados.
   */
  const fetchTodosLosEstadosHistoricos =
    useCallback(async (): Promise<
      EstadoGestionCompleta[]
    > => {
      const primeraPagina =
        await fetchEstadosGestionHistoricos(
          id_cliente,
          id_cartera,
          id_deudor,
          ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_NUMBER,
          ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_SIZE
        );

      if (primeraPagina.totalPages <= 1) {
        return primeraPagina.completo;
      }

      const paginasPendientes =
        Array.from(
          {
            length:
              primeraPagina.totalPages - 1,
          },
          (_, index) => index + 2
        );

      const resultadosPendientes =
        await Promise.all(
          paginasPendientes.map(
            (numeroPagina) =>
              fetchEstadosGestionHistoricos(
                id_cliente,
                id_cartera,
                id_deudor,
                numeroPagina,
                ESTADOS_GESTION_HISTORICOS_DEFAULT_PAGE_SIZE
              )
          )
        );

      return [
        ...primeraPagina.completo,

        ...resultadosPendientes.flatMap(
          (pagina) => pagina.completo
        ),
      ];
    }, [
      id_cliente,
      id_cartera,
      id_deudor,
    ]);

  /**
   * Al tener todos los registros históricos:
   *
   * colección completa
   *   → filtros
   *   → total filtrado
   *   → paginación
   *   → registros visibles
   */
  const {
    allData:
      completoAllData,

    filteredData:
      completoFilteredData,

    paginatedData:
      completo,

    isLoading:
      completoLoading,

    error:
      completoError,

    pageNumber:
      completoPageNumber,

    pageSize:
      completoPageSize,

    totalRecords:
      completoTotalRecords,

    totalPages:
      completoTotalPages,

    setPageNumber:
      setCompletoPageNumber,

    setPageSize:
      setCompletoPageSize,

    refetch:
      refetchCompleto,

    textFilters:
      completoTextFilters,

    selectedFilters:
      completoSelectedFilters,

    onTextFilterChange:
      onCompletoTextFilterChange,

    onSelectedFilterChange:
      onCompletoSelectedFilterChange,
  } =
    useClientSideResourceTable<EstadoGestionCompleta>({
      fetchData:
        fetchTodosLosEstadosHistoricos,

      resetDeps: [
        id_cliente,
        id_cartera,
        id_deudor,
      ],

      enabled:
        canLoadEstadosHistoricos,

      initialPageSize:
        ESTADOS_GESTION_HISTORICOS_INITIAL_PAGE_SIZE,

      errorMessage:
        ESTADOS_GESTION_ERROR_MESSAGES
          .HISTORICOS,
    });

  return {
    /* Estados resumidos */

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

    /* Estados históricos */

    completo,
    completoAllData,
    completoFilteredData,

    completoLoading,
    completoError,

    completoPageNumber,
    completoPageSize,
    completoTotalRecords,
    completoTotalPages,

    completoTextFilters,
    completoSelectedFilters,

    setCompletoPageNumber,
    setCompletoPageSize,

    onCompletoTextFilterChange,
    onCompletoSelectedFilterChange,

    refetchCompleto,
  };
}