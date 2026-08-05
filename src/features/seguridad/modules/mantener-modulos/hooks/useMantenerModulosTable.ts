import {
  useCallback,
  useMemo,
} from 'react';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import {
  useAccessControl,
  useOptionPermissions,
} from '@features/access-control';

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

import {
  assertMantenerModulosPermission,
} from '../utils/mantenerModulosPermissions';

export const useMantenerModulosTable = () => {
  const {
    usuario,
  } = useAuth();

  const {
    refresh: refreshAccessControl,
  } = useAccessControl();

  const permissions =
    useOptionPermissions(
      'mMantenerModulo'
    );

  const canInsert =
    permissions.insertar;

  const canEdit =
    permissions.editar;

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
        assertMantenerModulosPermission(
          'insertar',
          canInsert
        );

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
        await refreshAccessControl();
      },
      [
        allData,
        canInsert,
        refetch,
        refreshAccessControl,
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
        assertMantenerModulosPermission(
          'editar',
          canEdit
        );

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
        await refreshAccessControl();
      },
      [
        allData,
        canEdit,
        refetch,
        refreshAccessControl,
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

    canInsert,
    canEdit,

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
