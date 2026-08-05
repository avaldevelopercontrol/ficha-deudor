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
  createPerfilOpciones,
  fetchPerfilOptionsCount,
  updatePerfilOpciones,
} from '../../../api/perfilOpcionesApi';

import type {
  PerfilOpcionCount,
  PerfilOpcionDetalle,
} from '../../../types/perfilOpcion.types';

import type {
  RegistrarPerfilOpcionesData,
} from '../types/asignarAccesosPerfil.types';

import {
  assertMantenerAccesosPerfilPermission,
} from '../utils/mantenerAccesosPerfilPermissions';

export const useMantenerAccesosPerfilTable = () => {
  const {
    usuario,
  } = useAuth();

  const {
    refresh: refreshAccessControl,
  } = useAccessControl();

  const permissions =
    useOptionPermissions(
      'mMantenerAccesosPorPerfil'
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
  } = useApiResource<PerfilOpcionCount[]>(
    fetchPerfilOptionsCount,
    []
  );

  const allData = useMemo(
    () => data ?? [],
    [data]
  );

  const table =
    useClientSideTable<PerfilOpcionCount>(
      allData,
      [],
      {
        initialPageSize: 10,
      }
    );

  const {
    setPageNumber,
  } = table;

  const registrarAccesosPerfil =
    useCallback(
      async (
        form: RegistrarPerfilOpcionesData
      ): Promise<void> => {
        assertMantenerAccesosPerfilPermission(
          'insertar',
          canInsert
        );

        const authenticatedUserId =
          usuario?.id_usuario;

        if (!authenticatedUserId) {
          throw new Error(
            'No se pudo identificar al usuario autenticado que registra los accesos.'
          );
        }

        const refreshAffectedState =
          async (): Promise<void> => {
            refetch();

            if (
              form.perfilId ===
              usuario?.perfilId
            ) {
              await refreshAccessControl();
            }
          };

        try {
          await createPerfilOpciones(
            form,
            authenticatedUserId
          );
        } catch (error) {
          /*
           * Una API individual puede haber registrado
           * opciones anteriores antes de fallar. Se
           * actualiza el conteo para reflejar ese estado.
           */
          await refreshAffectedState();
          throw error;
        }

        setPageNumber(1);
        await refreshAffectedState();
      },
      [
        canInsert,
        refetch,
        refreshAccessControl,
        setPageNumber,
        usuario?.id_usuario,
        usuario?.perfilId,
      ]
    );


  const actualizarAccesosPerfil =
    useCallback(
      async (
        asignacionesActuales:
          readonly PerfilOpcionDetalle[],
        form: RegistrarPerfilOpcionesData
      ): Promise<void> => {
        assertMantenerAccesosPerfilPermission(
          'editar',
          canEdit
        );

        const authenticatedUserId =
          usuario?.id_usuario;

        if (!authenticatedUserId) {
          throw new Error(
            'No se pudo identificar al usuario autenticado que actualiza los accesos.'
          );
        }

        const refreshAffectedState =
          async (): Promise<void> => {
            refetch();

            if (
              form.perfilId ===
              usuario?.perfilId
            ) {
              await refreshAccessControl();
            }
          };

        try {
          await updatePerfilOpciones(
            asignacionesActuales,
            form,
            authenticatedUserId
          );
        } catch (error) {
          /*
           * La actualización puede procesar cambios
           * anteriores antes de que una operación falle.
           */
          await refreshAffectedState();
          throw error;
        }

        await refreshAffectedState();
      },
      [
        canEdit,
        refetch,
        refreshAccessControl,
        usuario?.id_usuario,
        usuario?.perfilId,
      ]
    );

  const indiceInicio =
    (table.pageNumber - 1) *
    table.pageSize;

  const indiceFin = Math.min(
    indiceInicio + table.pageSize,
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

    registrarAccesosPerfil,
    actualizarAccesosPerfil,
  };
};
