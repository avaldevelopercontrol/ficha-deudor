import {
  useCallback,
  useMemo,
} from 'react';

import {
  APPLICATION_OPTION_IDS,
  useOptionPermissions,
} from '@features/access-control';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import {
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';

import {
  createUsuarioZona,
  fetchZonasAsignadasByClienteUsuario,
  fetchZonasFaltantesByClienteUsuario,
  updateUsuarioZona,
} from '../../../api/usuarioZonasApi';

import {
  useUsuariosListTable,
} from '../../../hooks/useUsuariosListTable';

import {
  getUsuarioZonaDiff,
} from '../../../mappers/usuarioZonas.mapper';

import type {
  GuardarUsuarioZonasPayload,
} from '../types/usuarioZonas.types';

const toPositiveIntegerOrNull = (
  value: string | null | undefined
): number | null => {
  const parsed = Number(value);

  return Number.isInteger(parsed) &&
    parsed > 0
    ? parsed
    : null;
};

export const useAsignarUsuarioTable = () => {
  const permissions =
    useOptionPermissions(
      APPLICATION_OPTION_IDS.ASIGNAR_USUARIO
    );

  const {
    clienteSeleccionada,
  } = useAuth();

  const table = useUsuariosListTable({
    initialPageSize: 10,
  });

  const {
    feedback,
    clearFeedback,
    showSuccess,
  } = useOperationFeedback();

  const canInsert = permissions.insertar;
  const canEdit = permissions.editar;

  const idCliente = useMemo(
    () =>
      toPositiveIntegerOrNull(
        clienteSeleccionada?.id_cliente
      ),
    [clienteSeleccionada?.id_cliente]
  );

  const guardarUsuarioZonas =
    useCallback(
      async (
        payload: GuardarUsuarioZonasPayload
      ): Promise<void> => {
        clearFeedback();

        const {
          agregar,
          quitar,
        } = getUsuarioZonaDiff(
          payload.zonasIniciales,
          payload.zonasActuales
        );

        if (
          agregar.length === 0 &&
          quitar.length === 0
        ) {
          return;
        }

        if (
          quitar.length > 0 &&
          !canEdit
        ) {
          throw new Error(
            'No tiene permiso para quitar zonas asignadas.'
          );
        }

        try {
          /*
           * Antes de aplicar el diff se vuelve a consultar el backend.
           * Así un reintento después de una operación parcial no duplica
           * asignaciones que ya quedaron guardadas.
           */
          const [
            zonasAsignadasPersistidas,
            zonasFaltantesPersistidas,
          ] = await Promise.all([
            fetchZonasAsignadasByClienteUsuario(
              payload.idCliente,
              payload.idUsuario
            ),
            fetchZonasFaltantesByClienteUsuario(
              payload.idCliente,
              payload.idUsuario
            ),
          ]);

          const asignadasPorZona =
            new Map(
              zonasAsignadasPersistidas.map(
                (zona) => [
                  zona.zona,
                  zona,
                ]
              )
            );

          const faltantesPorZona =
            new Map(
              zonasFaltantesPersistidas.map(
                (zona) => [
                  zona.zona,
                  zona,
                ]
              )
            );

          for (const zona of quitar) {
            const persisted =
              asignadasPorZona.get(
                zona.zona
              );

            if (!persisted) {
              continue;
            }

            await updateUsuarioZona(
              persisted,
              false
            );

            asignadasPorZona.delete(
              zona.zona
            );
          }

          for (const zona of agregar) {
            if (
              asignadasPorZona.has(
                zona.zona
              )
            ) {
              continue;
            }

            const persisted =
              faltantesPorZona.get(
                zona.zona
              ) ?? zona;

            /*
             * bEstado=null + nid_asignacion=null: relación nueva -> POST.
             * bEstado=false + nid_asignacion real: relación inactiva -> PUT.
             */
            if (persisted.estado === false) {
              if (!canEdit) {
                throw new Error(
                  `No tiene permiso para reactivar la zona "${persisted.nombre}".`
                );
              }

              await updateUsuarioZona(
                persisted,
                true
              );
            } else {
              if (!canInsert) {
                throw new Error(
                  `No tiene permiso para asignar la zona "${persisted.nombre}".`
                );
              }

              await createUsuarioZona(
                persisted
              );
            }

            asignadasPorZona.set(
              zona.zona,
              persisted
            );
          }
        } catch (error) {
          const detail =
            error instanceof Error &&
            error.message.trim()
              ? ` ${error.message.trim()}`
              : '';

          throw new Error(
            `No se pudieron sincronizar todas las zonas del usuario.${detail}`
          );
        }

        showSuccess({
          entity: {
            label:
              'Zonas del usuario',
            gender: 'feminine',
            number: 'plural',
          },
          action: 'save',
          message:
            'Las zonas asignadas al usuario se actualizaron correctamente.',
        });
      },
      [
        canEdit,
        canInsert,
        clearFeedback,
        showSuccess,
      ]
    );

  return {
    ...table,
    idCliente,
    clienteNombre:
      clienteSeleccionada?.nombre ?? '',
    canInsert,
    canEdit,
    canManage:
      canInsert || canEdit,
    guardarUsuarioZonas,
    feedback,
    clearFeedback,
  };
};
