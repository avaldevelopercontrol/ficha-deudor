import {
  useCallback,
  useMemo,
} from 'react';

import {
  useAccessControl,
  useOptionPermissions,
} from '@features/access-control';
import {
  useAuth,
} from '@features/auth/hooks/useAuth';
import {
  resolveClienteGrupoId,
} from '@features/auth/utils/clienteGrupo.utils';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';
import {
  useClientSideTable,
} from '@shared/hooks/useClientSideTable';

import {
  addUsuarioGrupoOpciones,
  fetchUsuarioGrupoOpcionesByUsuarioGrupo,
  fetchUsuarioGrupoOpcionesListado,
  syncUsuarioGrupoOpciones,
} from '../../../api/usuarioGrupoOpcionesApi';

import type {
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import type {
  RegistrarUsuarioGrupoOpcionesData,
} from '../types/asignarAccesosUsuario.types';

import {
  MANTENER_ACCESOS_USUARIO_RULE_MESSAGES,
} from '../constants/mantenerAccesosUsuario.constants';

import {
  assertMantenerAccesosUsuarioPermission,
} from '../utils/mantenerAccesosUsuarioPermissions';

export const useMantenerAccesosUsuarioTable = () => {
  const {
    usuario,
    clienteSeleccionada,
  } = useAuth();
  const {
    refresh: refreshAccessControl,
  } = useAccessControl();

  const permissions =
    useOptionPermissions(
      'mMantenerAccesosPorUsuario'
    );
  const canInsert =
    permissions.insertar;
  const canEdit = permissions.editar;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiResource<UsuarioGrupoOpcionListado[]>(
    fetchUsuarioGrupoOpcionesListado,
    []
  );

  const allData = useMemo(
    () => data ?? [],
    [data]
  );

  const table =
    useClientSideTable<UsuarioGrupoOpcionListado>(
      allData,
      [],
      {
        initialPageSize: 10,
      }
    );

  const {
    setPageNumber,
  } = table;

  const selectedGroupId =
    resolveClienteGrupoId(
      clienteSeleccionada
    );

  const refreshAffectedState = useCallback(
    async (
      targetUsuarioId: number,
      targetGrupoId: number
    ): Promise<void> => {
      refetch();

      const authenticatedUserId = Number(
        usuario?.id_usuario
      );

      if (
        Number.isSafeInteger(
          authenticatedUserId
        ) &&
        authenticatedUserId ===
          targetUsuarioId &&
        selectedGroupId === targetGrupoId
      ) {
        await refreshAccessControl();
      }
    },
    [
      refetch,
      refreshAccessControl,
      selectedGroupId,
      usuario?.id_usuario,
    ]
  );

  const registrarAccesosUsuario =
    useCallback(
      async (
        form: RegistrarUsuarioGrupoOpcionesData
      ): Promise<void> => {
        assertMantenerAccesosUsuarioPermission(
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

        try {
          const existingAssignments =
            await fetchUsuarioGrupoOpcionesByUsuarioGrupo(
              form.usuarioId,
              form.grupoId
            );

          if (existingAssignments.length > 0) {
            throw new Error(
              MANTENER_ACCESOS_USUARIO_RULE_MESSAGES
                .alreadyAssignedUserGroup
            );
          }

          await addUsuarioGrupoOpciones(
            existingAssignments,
            form,
            authenticatedUserId
          );
        } catch (error) {
          await refreshAffectedState(
            form.usuarioId,
            form.grupoId
          );
          throw error;
        }

        setPageNumber(1);
        await refreshAffectedState(
          form.usuarioId,
          form.grupoId
        );
      },
      [
        canInsert,
        refreshAffectedState,
        setPageNumber,
        usuario?.id_usuario,
      ]
    );

  const actualizarAccesosUsuario =
    useCallback(
      async (
        asignacionesActuales:
          readonly UsuarioGrupoOpcionDetalle[],
        form: RegistrarUsuarioGrupoOpcionesData
      ): Promise<void> => {
        assertMantenerAccesosUsuarioPermission(
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

        try {
          await syncUsuarioGrupoOpciones(
            asignacionesActuales,
            form,
            authenticatedUserId
          );
        } catch (error) {
          await refreshAffectedState(
            form.usuarioId,
            form.grupoId
          );
          throw error;
        }

        await refreshAffectedState(
          form.usuarioId,
          form.grupoId
        );
      },
      [
        canEdit,
        refreshAffectedState,
        usuario?.id_usuario,
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
    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords:
      table.totalRecords,
    totalPages: table.totalPages,
    indiceInicio,
    indiceFin,
    textFilters: table.textFilters,
    selectedFilters:
      table.selectedFilters,
    setPageNumber,
    setPageSize: table.setPageSize,
    onTextFilterChange:
      table.onTextFilterChange,
    onSelectedFilterChange:
      table.onSelectedFilterChange,
    registrarAccesosUsuario,
    actualizarAccesosUsuario,
  };
};
