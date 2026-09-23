import {
  useCallback,
  useMemo,
} from 'react';

import {
  APPLICATION_OPTION_IDS,
  useAccessControl,
  useOptionPermissions,
} from '@features/access-control';

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
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';

import {
  ModuloAnalyticsSyncError,
  loadModulos,
  actualizarModulo as ejecutarActualizacionModulo,
  registrarModulo as ejecutarRegistroModulo,
  type ModuloReportClientPublicationInput,
} from '../../../application/modulos/moduloMaintenance.application';

import {
  asPowerBiEditarModuloForm,
  asPowerBiRegistrarModuloForm,
} from '../../../domain/modulos/moduloForm.utils';

import {
  attachModuloImplementacion,
} from '../../../domain/modulos/moduloImplementation.utils';

import {
  isPowerBiCatalogModulo,
  POWER_BI_PARENT_OPTION_ID,
} from '../../../domain/modulos/powerBiModulo.utils';

import type {
  Modulo,
  OpcionApi,
} from '../../../types/opcion.types';

import type {
  EditarModuloFormData,
  RegistrarModuloFormData,
} from '../../../domain/modulos/moduloForm.types';

import {
  MANTENER_BI_TEXTS,
} from '../constants/mantenerBi.constants';

import {
  assertMantenerBiPermission,
} from '../utils/mantenerBiPermissions';

export const useMantenerBiTable = () => {
  const {
    usuario,
  } = useAuth();

  const {
    refresh: refreshAccessControl,
  } = useAccessControl();

  const permissions =
    useOptionPermissions(
      APPLICATION_OPTION_IDS.MANTENER_BI
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

  const modulos =
    useMemo(
      () =>
        attachModuloImplementacion(
          data ?? []
        ),
      [data]
    );

  const allData =
    useMemo(
      () =>
        modulos.filter(
          isPowerBiCatalogModulo
        ),
      [modulos]
    );

  const powerBiParentAvailable =
    useMemo(
      () =>
        modulos.some(
          (modulo) =>
            modulo.idModulo ===
            POWER_BI_PARENT_OPTION_ID
        ),
      [modulos]
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

  const registrarBi =
    useCallback(
      async (
        form:
          RegistrarModuloFormData,
        groupIds:
          readonly number[] = []
      ): Promise<void> => {
        clearFeedback();

        assertMantenerBiPermission(
          'insertar',
          canInsert
        );

        if (!powerBiParentAvailable) {
          throw new Error(
            MANTENER_BI_TEXTS.powerBiParentUnavailable
          );
        }

        const authenticatedUserId =
          usuario?.id_usuario;

        if (!authenticatedUserId) {
          throw new Error(
            'No se pudo identificar al usuario autenticado que registra la operación.'
          );
        }

        const powerBiForm =
          asPowerBiRegistrarModuloForm(
            form
          );

        try {
          await ejecutarRegistroModulo({
            form: powerBiForm,
            modulos,
            authenticatedUserId,
            groupIds,
          });
        } catch (error) {
          if (
            error instanceof
            ModuloAnalyticsSyncError
          ) {
            setPageNumber(1);
            refetch();
            await refreshAccessControl();
          }

          throw error;
        }

        setPageNumber(1);
        refetch();
        await refreshAccessControl();

        showSuccess({
          entity: {
            label: 'BI',
            gender: 'masculine',
          },
          action: 'create',
        });
      },
      [
        canInsert,
        clearFeedback,
        modulos,
        powerBiParentAvailable,
        refetch,
        refreshAccessControl,
        setPageNumber,
        showSuccess,
        usuario?.id_usuario,
      ]
    );

  const actualizarBi =
    useCallback(
      async (
        moduloDetalle: OpcionApi,
        form: EditarModuloFormData,
        groupIds: readonly number[] = [],
        reportClientPublications:
          readonly ModuloReportClientPublicationInput[] | null = null
      ): Promise<void> => {
        clearFeedback();

        assertMantenerBiPermission(
          'editar',
          canEdit
        );

        const moduloId =
          Number(
            moduloDetalle.nId_Opcion
          );

        if (
          !allData.some(
            (modulo) =>
              modulo.idModulo ===
              moduloId
          )
        ) {
          throw new Error(
            'El módulo seleccionado no pertenece al catálogo BI.'
          );
        }

        const authenticatedUserId =
          usuario?.id_usuario;

        if (!authenticatedUserId) {
          throw new Error(
            'No se pudo identificar al usuario autenticado que modifica la operación.'
          );
        }

        const powerBiForm =
          asPowerBiEditarModuloForm(
            form
          );

        try {
          await ejecutarActualizacionModulo({
            moduloDetalle,
            form: powerBiForm,
            modulos,
            authenticatedUserId,
            groupIds,
            reportClientPublications,
          });
        } catch (error) {
          if (
            error instanceof
            ModuloAnalyticsSyncError
          ) {
            refetch();
            await refreshAccessControl();
          }

          throw error;
        }

        refetch();
        await refreshAccessControl();

        showSuccess({
          entity: {
            label: 'BI',
            gender: 'masculine',
          },
          action: 'update',
        });
      },
      [
        allData,
        canEdit,
        clearFeedback,
        modulos,
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
    modulos,
    allData,

    canInsert,
    canEdit,
    powerBiParentAvailable,

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

    registrarBi,
    actualizarBi,
  };
};
