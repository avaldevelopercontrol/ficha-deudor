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
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';

import {
  createPerfilOpciones,
  fetchPerfilOptionsCount,
  fetchPerfilesAcceso,
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

const loadPerfilesConEstado = async (
  signal: AbortSignal
): Promise<PerfilOpcionCount[]> => {
  const [perfiles, perfilesCatalogo] =
    await Promise.all([
      fetchPerfilOptionsCount(signal),
      fetchPerfilesAcceso(signal),
    ]);

  const estadoByPerfilId = new Map(
    perfilesCatalogo.map((perfil) => [
      perfil.idPerfil,
      perfil.estadoActivo,
    ])
  );

  return perfiles.map((perfil) => ({
    ...perfil,
    estadoActivo: estadoByPerfilId.get(
      perfil.idPerfil
    ),
  }));
};

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
    feedback,
    clearFeedback,
    showSuccess,
  } = useOperationFeedback();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiResource<PerfilOpcionCount[]>(
    loadPerfilesConEstado,
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
        clearFeedback();

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

        showSuccess({
          entity: {
            label: 'Accesos por perfil',
            gender: 'masculine',
            number: 'plural',
          },
          action: 'assign',
        });
      },
      [
        canInsert,
        clearFeedback,
        refetch,
        refreshAccessControl,
        setPageNumber,
        showSuccess,
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
        clearFeedback();

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

        showSuccess({
          entity: {
            label: 'Accesos por perfil',
            gender: 'masculine',
            number: 'plural',
          },
          action: 'update',
        });
      },
      [
        canEdit,
        clearFeedback,
        refetch,
        refreshAccessControl,
        showSuccess,
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

    registrarAccesosPerfil,
    actualizarAccesosPerfil,
  };
};
