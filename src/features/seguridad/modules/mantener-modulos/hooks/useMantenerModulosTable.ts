import {
  useCallback,
  useMemo,
} from 'react';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import {
  replaceAnalyticsOptionReportClientEmbeds,
  syncAnalyticsOption,
  type AnalyticsReportClientPublicationInput,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

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

import {
  resolveModuloImplementacion,
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
      fetchOpciones,
      []
    );

  const allData =
    useMemo(
      () => {
        const modulos =
          data ?? [];

        return modulos.map(
          (modulo) => ({
            ...modulo,
            implementacion:
              resolveModuloImplementacion(
                modulo,
                modulos
              ),
          })
        );
      },
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

        const created =
          await createOpcion(
            form,
            allData,
            authenticatedUserId
          );

        if (form.esPowerBI) {
          try {
            await syncAnalyticsOption({
              optionId:
                created.nId_Opcion,
              optionCode:
                form.codigo,
              optionName:
                form.nombre,
              isActive:
                form.estado,
              groupIds,
            });
          } catch (error) {
            setPageNumber(
              1
            );
            refetch();
            await refreshAccessControl();

            const detail =
              error instanceof Error &&
              error.message.trim()
                ? ` ${error.message}`
                : '';

            throw new Error(
              'El módulo fue creado correctamente en SISGES, pero no se pudo completar su configuración de grupos en Analytics.' +
                detail +
                ' No vuelva a registrarlo; complete la configuración de grupos Analytics para la opción creada.'
            );
          }
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
          readonly AnalyticsReportClientPublicationInput[] | null = null
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

        await updateOpcion(
          moduloDetalle,
          form,
          allData,
          authenticatedUserId
        );

        if (form.esPowerBI) {
          try {
            await syncAnalyticsOption({
              optionId:
                moduloDetalle
                  .nId_Opcion,
              optionCode:
                form.codigo,
              optionName:
                form.nombre,
              isActive:
                form.estado,
              groupIds,
            });
          } catch (error) {
            refetch();
            await refreshAccessControl();

            const detail =
              error instanceof Error &&
              error.message.trim()
                ? ` ${error.message}`
                : '';

            throw new Error(
              'El módulo fue actualizado correctamente en SISGES, pero no se pudo completar su configuración de grupos en Analytics.' +
                detail +
                ' Vuelva a editar el módulo y reintente el guardado del grupo.'
            );
          }

          if (reportClientPublications !== null) {
            try {
              await replaceAnalyticsOptionReportClientEmbeds(
                moduloDetalle.nId_Opcion,
                reportClientPublications
              );
            } catch (error) {
              refetch();
              await refreshAccessControl();

              const detail =
                error instanceof Error &&
                error.message.trim()
                  ? ` ${error.message}`
                  : '';

              throw new Error(
                'El módulo y su grupo fueron actualizados correctamente, pero no se pudieron guardar las publicaciones por cartera en Analytics.' +
                  detail +
                  ' Vuelva a editar el módulo y reintente el guardado de la configuración por cartera.'
              );
            }
          }
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
