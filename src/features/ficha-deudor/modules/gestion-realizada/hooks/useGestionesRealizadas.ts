import {
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  fetchGestionesRealizadas,
  fetchGestionesHistoricas,
} from '../api/gestionesRealizadasApi';

import { useClientSideResourceTable } from '@shared/hooks/useClientSideResourceTable';

import type {
  TextFilters,
  SelectedFilters,
} from '@shared/hooks/useClientSideTable';

import type {
  GestionRealizada,
  GestionCompleta,
} from '../../../shared/types';

import {
  GESTIONES_HISTORICAS_DEFAULT_PAGE_NUMBER,
  GESTIONES_HISTORICAS_DEFAULT_PAGE_SIZE,
  GESTIONES_HISTORICAS_INITIAL_PAGE_SIZE,
  GESTIONES_REALIZADAS_ERROR_MESSAGES,
  GESTIONES_REALIZADAS_INITIAL_PAGE_SIZE,
} from '../constants/gestionesRealizadas.constants';

import type { FichaDeudorGestionPanelParams } from '../../../shared/types/fichaDeudor.types';

import { hasRequiredValues } from '../../../shared/utils/requiredValues.utils';

export type {
  TextFilters,
  SelectedFilters,
};

interface UseGestionesRealizadasOptions {
  loadHistoricas?: boolean;
}

export interface UseGestionesRealizadasReturn {
  /* ────────────────────────────────────────────────
     Gestiones resumidas
     ──────────────────────────────────────────────── */

  allData: GestionRealizada[];
  filteredData: GestionRealizada[];
  paginatedData: GestionRealizada[];

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

  setResumido: Dispatch<
    SetStateAction<GestionRealizada[]>
  >;

  /* ────────────────────────────────────────────────
     Gestiones históricas completas
     ──────────────────────────────────────────────── */

  /**
   * Registros filtrados y paginados que se muestran
   * en la página actual.
   */
  completo: GestionCompleta[];

  /**
   * Todos los registros históricos descargados.
   * Se utiliza para construir correctamente las
   * opciones disponibles en los filtros.
   */
  completoAllData: GestionCompleta[];

  /**
   * Todos los registros que cumplen los filtros,
   * antes de aplicar la paginación.
   */
  completoFilteredData: GestionCompleta[];

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

export function useGestionesRealizadas(
  params: FichaDeudorGestionPanelParams,
  {
    loadHistoricas = true,
  }: UseGestionesRealizadasOptions = {}
): UseGestionesRealizadasReturn {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
    id_usuario,
  } = params;

  const canLoadResumidas = hasRequiredValues(
    id_cliente,
    id_cartera,
    id_deudor,
    id_usuario
  );

  const canLoadHistoricas =
    loadHistoricas &&
    hasRequiredValues(
      id_cliente,
      id_cartera,
      id_deudor
    );

  /* ════════════════════════════════════════════════
     GESTIONES RESUMIDAS
     ════════════════════════════════════════════════ */

  const fetchGestionesResumidas =
    useCallback(async () => {
      const result =
        await fetchGestionesRealizadas(
          id_cliente,
          id_cartera,
          id_deudor,
          id_usuario
        );

      return result.resumido;
    }, [
      id_cliente,
      id_cartera,
      id_deudor,
      id_usuario,
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
    setAllData,
  } =
    useClientSideResourceTable<GestionRealizada>({
      fetchData: fetchGestionesResumidas,

      resetDeps: [
        id_cliente,
        id_cartera,
        id_deudor,
        id_usuario,
      ],

      enabled: canLoadResumidas,

      initialPageSize:
        GESTIONES_REALIZADAS_INITIAL_PAGE_SIZE,

      errorMessage:
        GESTIONES_REALIZADAS_ERROR_MESSAGES
          .RESUMIDAS,
    });

  /* ════════════════════════════════════════════════
     GESTIONES HISTÓRICAS COMPLETAS
     ════════════════════════════════════════════════ */

  /**
   * Descarga la primera página con 1000 registros.
   *
   * Cuando el total supera los 1000 registros,
   * consulta automáticamente todas las páginas
   * restantes y las une en un único arreglo.
   *
   * De esta manera:
   * - los filtros trabajan sobre todos los registros;
   * - las opciones de los filtros no dependen de la
   *   página visible;
   * - la paginación se realiza después de filtrar.
   */
  const fetchTodasLasGestionesCompletas =
    useCallback(async (): Promise<
      GestionCompleta[]
    > => {
      const primeraPagina =
        await fetchGestionesHistoricas(
          id_cliente,
          id_cartera,
          id_deudor,
          GESTIONES_HISTORICAS_DEFAULT_PAGE_NUMBER,
          GESTIONES_HISTORICAS_DEFAULT_PAGE_SIZE
        );

      /*
       * Caso actual:
       * si todos los registros caben dentro de
       * la primera página de 1000, no se realizan
       * solicitudes adicionales.
       */
      if (primeraPagina.totalPages <= 1) {
        return primeraPagina.completo;
      }

      /*
       * Genera:
       * [2, 3, 4, ..., totalPages]
       */
      const numerosDePaginaRestantes =
        Array.from(
          {
            length:
              primeraPagina.totalPages - 1,
          },
          (_, index) => index + 2
        );

      /*
       * Las páginas restantes se solicitan juntas.
       * Cada consulta mantiene PageSize=1000.
       */
      const paginasRestantes =
        await Promise.all(
          numerosDePaginaRestantes.map(
            (numeroPagina) =>
              fetchGestionesHistoricas(
                id_cliente,
                id_cartera,
                id_deudor,
                numeroPagina,
                GESTIONES_HISTORICAS_DEFAULT_PAGE_SIZE
              )
          )
        );

      return [
        ...primeraPagina.completo,

        ...paginasRestantes.flatMap(
          (pagina) => pagina.completo
        ),
      ];
    }, [
      id_cliente,
      id_cartera,
      id_deudor,
    ]);

  /*
   * Las gestiones históricas pasan ahora por la
   * paginación client-side porque ya contamos con
   * la colección completa.
   *
   * El orden del proceso es:
   *
   * API completa
   *   → filtros
   *   → total filtrado
   *   → paginación
   *   → registros visibles
   */
  const {
    allData: completoAllData,

    filteredData:
      completoFilteredData,

    paginatedData: completo,

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
    useClientSideResourceTable<GestionCompleta>({
      fetchData:
        fetchTodasLasGestionesCompletas,

      resetDeps: [
        id_cliente,
        id_cartera,
        id_deudor,
      ],

      enabled:
        canLoadHistoricas,

      initialPageSize:
        GESTIONES_HISTORICAS_INITIAL_PAGE_SIZE,

      errorMessage:
        GESTIONES_REALIZADAS_ERROR_MESSAGES
          .HISTORICAS,
    });

  return {
    /* Gestiones resumidas */

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

    setResumido: setAllData,

    /* Gestiones históricas completas */

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