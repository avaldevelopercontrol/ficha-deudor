import {
  useCallback,
  useMemo,
} from 'react';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  useClientSideTable,
} from '@shared/hooks/useClientSideTable';

import {
  createPerfil,
  fetchPerfiles,
  updatePerfil,
} from '../../../api/perfilesApi';

import type {
  Perfil,
  PerfilApi,
} from '../../../types/perfil.types';

import type {
  RegistrarPerfilFormData,
} from '../types/registrarPerfil.types';

export const useMantenerPerfilTable = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } =
    useApiResource<
      Perfil[]
    >(
      fetchPerfiles,
      []
    );

  const allData =
    useMemo(
      () =>
        data ?? [],
      [
        data,
      ]
    );

  const table =
    useClientSideTable<
      Perfil
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

  const registrarPerfil =
    useCallback(
      async (
        form:
          RegistrarPerfilFormData
      ): Promise<void> => {
        await createPerfil(
          form
        );

        setPageNumber(
          1
        );

        refetch();
      },
      [
        refetch,
        setPageNumber,
      ]
    );

  const actualizarPerfil =
    useCallback(
      async (
        perfil:
          PerfilApi,

        form:
          RegistrarPerfilFormData
      ): Promise<void> => {
        await updatePerfil(
          perfil,
          form
        );

        /*
         * Durante la edición se conserva
         * la página actual de la tabla.
         */
        refetch();
      },
      [
        refetch,
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

    registrarPerfil,
    actualizarPerfil,
  };
};