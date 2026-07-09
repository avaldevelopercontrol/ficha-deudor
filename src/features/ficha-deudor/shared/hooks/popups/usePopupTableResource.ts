import { useCallback, useEffect, useReducer, useRef } from 'react';

import {
  useClientSideTable,
  type TextFilters,
  type SelectedFilters,
} from '@shared/hooks/useClientSideTable';

export type { TextFilters, SelectedFilters };

interface PopupTableResourceState<T> {
  allData: T[];
  isLoading: boolean;
  error: string | null;
}

type PopupTableResourceAction<T> =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; data: T[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'RESET_WITH_ERROR'; error: string };

export interface UsePopupTableResourceReturn<T> {
  allData: T[];
  filteredData: T[];
  paginatedData: T[];
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
  resetFilters: () => void;
}

interface UsePopupTableResourceParams<T> {
  areParamsReady: boolean;
  missingParamsError: string;
  loadError: string;
  resetDeps: readonly unknown[];
  fetcher: (signal?: AbortSignal) => Promise<T[]>;
  initialPageSize?: number;
}

const createInitialState = <T>(): PopupTableResourceState<T> => ({
  allData: [],
  isLoading: false,
  error: null,
});

const popupTableResourceReducer = <T>(
  state: PopupTableResourceState<T>,
  action: PopupTableResourceAction<T>
): PopupTableResourceState<T> => {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOAD_SUCCESS':
      return {
        allData: action.data,
        isLoading: false,
        error: null,
      };

    case 'LOAD_ERROR':
    case 'RESET_WITH_ERROR':
      return {
        allData: [],
        isLoading: false,
        error: action.error,
      };

    default:
      return state;
  }
};

export const usePopupTableResource = <T>({
  areParamsReady,
  missingParamsError,
  loadError,
  resetDeps,
  fetcher,
  initialPageSize = 10,
}: UsePopupTableResourceParams<T>): UsePopupTableResourceReturn<T> => {
  const [state, dispatch] = useReducer(
    popupTableResourceReducer<T>,
    createInitialState<T>()
  );

  const { allData, isLoading, error } = state;

  const table = useClientSideTable(allData, resetDeps, {
    initialPageSize,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!areParamsReady) {
      dispatch({
        type: 'RESET_WITH_ERROR',
        error: missingParamsError,
      });

      return;
    }

    const controller = new AbortController();

    const loadData = async () => {
      dispatch({
        type: 'LOAD_START',
      });

      try {
        const result = await fetcher(controller.signal);

        if (controller.signal.aborted) return;

        dispatch({
          type: 'LOAD_SUCCESS',
          data: result,
        });
      } catch (err) {
        if (!controller.signal.aborted) {
          dispatch({
            type: 'LOAD_ERROR',
            error: err instanceof Error ? err.message : loadError,
          });
        }
      }
    };

    void loadData();

    return () => {
      controller.abort();
    };
  }, [areParamsReady, fetcher, loadError, missingParamsError]);

  const refetch = useCallback(() => {
    if (!areParamsReady) return;

    dispatch({
      type: 'LOAD_START',
    });

    fetcher()
      .then((result) => {
        if (!isMountedRef.current) return;

        dispatch({
          type: 'LOAD_SUCCESS',
          data: result,
        });
      })
      .catch((err) => {
        if (!isMountedRef.current) return;

        dispatch({
          type: 'LOAD_ERROR',
          error: err instanceof Error ? err.message : loadError,
        });
      });
  }, [areParamsReady, fetcher, loadError]);

  return {
    allData,
    filteredData: table.filteredData,
    paginatedData: table.paginatedData,
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
    resetFilters: table.resetFilters,
  };
};