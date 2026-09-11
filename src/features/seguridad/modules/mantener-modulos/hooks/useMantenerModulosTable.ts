import {
  useCallback,
  useMemo,
} from 'react';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import {
  APPLICATION_OPTION_IDS,
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
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';

import {
  ModuloAnalyticsSyncError,
  actualizarModulo as ejecutarActualizacionModulo,
  loadModulos,
  registrarModulo as ejecutarRegistroModulo,
  type ModuloReportClientPublicationInput,
} from '../../../application/modulos/moduloMaintenance.application';

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

import {
  attachModuloImplementacion,
} from '../utils/moduloImplementation.utils';

export const useMantenerModulosTable = () => {
  const {
    usuario,
  } = useAuth();

  const {
    refresh: refreshAccessControl,
  } = useAccessControl();

  const permissions =
    useOptionPermissions(
      APPLICATION_OPTION_IDS.MANTENER_MODULO
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
      Modulo[]
    >(
      loadModulos,
      []
    );

  const allData =
    useMemo(
      () =>
        attachModuloImplementacion(
          data ?? []
        ),
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
          RegistrarModuloFormData,
        groupIds:
          readonly number[] = []
      ): Promise<void> => {
        clearFeedback();

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

        try {
          await ejecutarRegistroModulo({
            form,
            modulos: allData,
            authenticatedUserId,
            groupIds,
          });
        } catch (error) {
          if (error instanceof ModuloAnalyticsSyncError) {
            setPageNumber(1);
            refetch();
            await refreshAccessControl();
          }

          throw error;
        }

        setPageNumber(
          1
        );

        refetch();
        await refreshAccessControl();

        showSuccess({
          entity: {
            label: 'Módulo',
            gender: 'masculine',
          },
          action: 'create',
        });
      },
      [
        allData,
        canInsert,
        clearFeedback,
        refetch,
        refreshAccessControl,
        setPageNumber,
        showSuccess,
        usuario?.id_usuario,
      ]
    );

  const actualizarModulo =
    useCallback(
      async (
        moduloDetalle:
          OpcionApi,

        form:
          EditarModuloFormData,
        groupIds:
          readonly number[] = [],
        reportClientPublications:
          readonly ModuloReportClientPublicationInput[] | null = null
      ): Promise<void> => {
        clearFeedback();

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

        try {
          await ejecutarActualizacionModulo({
            moduloDetalle,
            form,
            modulos: allData,
            authenticatedUserId,
            groupIds,
            reportClientPublications,
          });
        } catch (error) {
          if (error instanceof ModuloAnalyticsSyncError) {
            refetch();
            await refreshAccessControl();
          }

          throw error;
        }

        refetch();
        await refreshAccessControl();

        showSuccess({
          entity: {
            label: 'Módulo',
            gender: 'masculine',
          },
          action: 'update',
        });
      },
      [
        allData,
        canEdit,
        clearFeedback,
        refetch,
        refreshAccessControl,
        showSuccess,
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

    registrarModulo,
    actualizarModulo,
  };
};
