import {
  useCallback,
  useMemo,
} from 'react';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  useClientSideTable,
} from '@shared/hooks/useClientSideTable';

import {
  createOpcion,
  fetchOpciones,
  updateOpcion,
} from '../../../api/opcionesApi';

import type {
  Modulo,
  OpcionApi,
} from '../../../types/opcion.types';

import type {
  EditarModuloFormData,
} from '../types/editarModulo.types';

import type {
  RegistrarModuloFormData,
} from '../types/registrarModulo.types';

export const useMantenerModulosTable = () => {
  const {
    usuario,
  } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch,
  } =
    useApiResource<
      Modulo[]
    >(
      fetchOpciones,
      []
    );

  const allData =
    useMemo(
      () =>
        data ?? [],
      [data]
    );

  const table =
    useClientSideTable<
      Modulo
    >(
      allData,
      [],
      {
        initialPageSize:
          10,
      }
    );

  const {
    setPageNumber,
  } = table;

  const registrarModulo =
    useCallback(
      async (
        form:
          RegistrarModuloFormData
      ): Promise<void> => {
        const authenticatedUserId =
          usuario?.id_usuario;

        if (!authenticatedUserId) {
          throw new Error(
            'No se pudo identificar al usuario autenticado que registra la operación.'
          );
        }

        await createOpcion(
          form,
          allData,
          authenticatedUserId
        );

        setPageNumber(
          1
        );

        refetch();
      },
      [
        allData,
        refetch,
        setPageNumber,
        usuario?.id_usuario,
      ]
    );

  const actualizarModulo =
    useCallback(
      async (
        moduloDetalle:
          OpcionApi,

        form:
          EditarModuloFormData
      ): Promise<void> => {
        const authenticatedUserId =
          usuario?.id_usuario;

        if (!authenticatedUserId) {
          throw new Error(
            'No se pudo identificar al usuario autenticado que modifica la operación.'
          );
        }

        await updateOpcion(
          moduloDetalle,
          form,
          allData,
          authenticatedUserId
        );

        refetch();
      },
      [
        allData,
        refetch,
        usuario?.id_usuario,
      ]
    );

  const indiceInicio =
    (
      table.pageNumber -
      1
    ) *
    table.pageSize;

  const indiceFin =
    Math.min(
      indiceInicio +
        table.pageSize,

      table.totalRecords
    );

  return {
    allData,

    paginatedData:
      table.paginatedData,

    isLoading,
    error,
    refetch,

    pageNumber:
      table.pageNumber,

    pageSize:
      table.pageSize,

    totalRecords:
      table.totalRecords,

    totalPages:
      table.totalPages,

    indiceInicio,
    indiceFin,

    textFilters:
      table.textFilters,

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

    registrarModulo,
    actualizarModulo,
  };
};
