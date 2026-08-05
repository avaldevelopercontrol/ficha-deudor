import {
  useCallback,
  useMemo,
} from 'react';

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

export const useMantenerAccesosPerfilTable = () => {
  const {
    usuario,
  } = useAuth();

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
        const authenticatedUserId =
          usuario?.id_usuario;

        if (!authenticatedUserId) {
          throw new Error(
            'No se pudo identificar al usuario autenticado que registra los accesos.'
          );
        }

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
          refetch();
          throw error;
        }

        setPageNumber(1);
        refetch();
      },
      [
        refetch,
        setPageNumber,
        usuario?.id_usuario,
      ]
    );


  const actualizarAccesosPerfil =
    useCallback(
      async (
        asignacionesActuales:
          readonly PerfilOpcionDetalle[],
        form: RegistrarPerfilOpcionesData
      ): Promise<void> => {
        const authenticatedUserId =
          usuario?.id_usuario;

        if (!authenticatedUserId) {
          throw new Error(
            'No se pudo identificar al usuario autenticado que actualiza los accesos.'
          );
        }

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
          refetch();
          throw error;
        }

        refetch();
      },
      [
        refetch,
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
