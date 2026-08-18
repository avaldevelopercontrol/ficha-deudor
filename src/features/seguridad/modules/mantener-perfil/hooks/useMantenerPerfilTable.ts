import {
  useCallback,
  useMemo,
} from 'react';

import {
  APPLICATION_OPTION_IDS,
  useOptionPermissions,
} from '@features/access-control';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  useClientSideTable,
} from '@shared/hooks/useClientSideTable';

import {
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';

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

import {
  assertMantenerPerfilPermission,
} from '../utils/mantenerPerfilPermissions';

export const useMantenerPerfilTable = () => {
  const permissions =
    useOptionPermissions(
      APPLICATION_OPTION_IDS.MANTENER_PERFIL
    );

  const canInsert =
    permissions.insertar;

  const canEdit =
    permissions.editar;

  const {
    feedback,
    clearFeedback,
    showSuccess,
  } = useOperationFeedback();

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
        clearFeedback();

        assertMantenerPerfilPermission(
          'insertar',
          canInsert
        );

        await createPerfil(
          form
        );

        setPageNumber(
          1
        );

        refetch();

        showSuccess({
          entity: {
            label: 'Perfil',
            gender: 'masculine',
          },
          action: 'create',
        });
      },
      [
        canInsert,
        clearFeedback,
        refetch,
        setPageNumber,
        showSuccess,
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
        clearFeedback();

        assertMantenerPerfilPermission(
          'editar',
          canEdit
        );

        await updatePerfil(
          perfil,
          form
        );

        /*
         * Durante la edición se conserva
         * la página actual de la tabla.
         */
        refetch();

        showSuccess({
          entity: {
            label: 'Perfil',
            gender: 'masculine',
          },
          action: 'update',
        });
      },
      [
        canEdit,
        clearFeedback,
        refetch,
        showSuccess,
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

    canInsert,
    canEdit,

    feedback,
    clearFeedback,

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