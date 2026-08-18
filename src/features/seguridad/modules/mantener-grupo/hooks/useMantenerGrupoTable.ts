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
  createGrupo,
  fetchGruposListado,
  updateGrupo,
} from '../../../api/gruposApi';

import type {
  Grupo,
  GrupoDetalleApi,
} from '../../../types/grupo.types';

import type {
  RegistrarGrupoFormData,
} from '../types/registrarGrupo.types';

import {
  assertMantenerGrupoPermission,
} from '../utils/mantenerGrupoPermissions';

export const useMantenerGrupoTable = () => {
  const permissions =
    useOptionPermissions(
      APPLICATION_OPTION_IDS.MANTENER_GRUPO
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
      Grupo[]
    >(
      fetchGruposListado,
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
      Grupo
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

  const registrarGrupo =
    useCallback(
      async (
        form:
          RegistrarGrupoFormData
      ): Promise<void> => {
        clearFeedback();

        assertMantenerGrupoPermission(
          'insertar',
          canInsert
        );

        await createGrupo(
          form
        );

        setPageNumber(
          1
        );

        refetch();

        showSuccess({
          entity: {
            label: 'Grupo',
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


  const actualizarGrupo =
    useCallback(
      async (
        grupoId: number,

        grupo:
          GrupoDetalleApi,

        form:
          RegistrarGrupoFormData
      ): Promise<void> => {
        clearFeedback();

        assertMantenerGrupoPermission(
          'editar',
          canEdit
        );

        await updateGrupo(
          grupoId,
          grupo,
          form
        );

        /*
         * Durante la edición se conserva
         * la página actual de la tabla.
         */
        refetch();

        showSuccess({
          entity: {
            label: 'Grupo',
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

    paginatedData:
      table.paginatedData,

    canInsert,
    canEdit,

    feedback,
    clearFeedback,

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

    registrarGrupo,
    actualizarGrupo,
  };
};
