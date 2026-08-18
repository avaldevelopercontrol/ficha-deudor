import {
  useCallback,
} from 'react';

import {
  APPLICATION_OPTION_IDS,
  useOptionPermissions,
} from '@features/access-control';

import {
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';

import {
  createUsuarioGrupo,
  fetchGruposByUsuario,
  removeUsuarioGrupo,
} from '../../../api/usuarioGruposApi';

import {
  createUsuario,
  updateUsuario,
} from '../../../api/usuariosApi';

import {
  useUsuariosListTable,
} from '../../../hooks/useUsuariosListTable';

import {
  getUsuarioGrupoDiff,
} from '../../../mappers/editarUsuario.mapper';

import type {
  EditarUsuarioPayload,
} from '../types/editarUsuario.types';

import type {
  RegistrarUsuarioFormData,
} from '../types/registrarUsuario.types';

export const useMantenerUsuarioTable = () => {
  const permissions =
    useOptionPermissions(
      APPLICATION_OPTION_IDS.MANTENER_USUARIO
    );

  const canInsert =
    permissions.insertar;

  const canEdit =
    permissions.editar;

  const table =
    useUsuariosListTable({
      initialPageSize: 10,
    });

  const {
    feedback,
    clearFeedback,
    showSuccess,
  } = useOperationFeedback();

  const {
    refetch,
    setPageNumber,
  } = table;

  const registrarUsuario =
    useCallback(
      async (
        form:
          RegistrarUsuarioFormData
      ): Promise<void> => {
        clearFeedback();

        if (!canInsert) {
          throw new Error(
            'No tiene permiso para agregar usuarios.'
          );
        }

        /*
         * Los errores 400/500 conservan el modal abierto
         * porque createUsuario propaga messageUser mediante
         * useModalForm.
         */
        await createUsuario(form);

        /*
         * Después del registro se actualiza la tabla y se
         * regresa a la primera página para facilitar la revisión.
         */
        setPageNumber(1);

        await refetch();

        showSuccess({
          entity: {
            label: 'Usuario',
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



  const editarUsuario =
    useCallback(
      async (
        payload: EditarUsuarioPayload
      ): Promise<void> => {
        clearFeedback();

        if (!canEdit) {
          throw new Error(
            'No tiene permiso para editar usuarios.'
          );
        }

        const {
          agregar,
          quitar,
        } = getUsuarioGrupoDiff(
          payload.gruposIniciales,
          payload.gruposActuales
        );

        const gruposModificados =
          agregar.length > 0 ||
          quitar.length > 0;

        /*
         * /v1/Usuario y /v1/UGrupo son responsabilidades distintas.
         * Si el usuario solo agregó o quitó grupos, no ejecutamos un
         * PUT innecesario de Usuario (y por tanto tampoco involucramos
         * las validaciones de contraseña de ese endpoint).
         */
        if (payload.usuarioModificado) {
          await updateUsuario(
            payload.form,
            payload.original
          );
        }

        /*
         * Los grupos se persisten únicamente al guardar. Antes de
         * aplicar el diff se consulta el estado vigente del backend:
         * esto hace que un reintento sea seguro si una operación de
         * grupos falló después de haber actualizado parcialmente la BD.
         */
        if (gruposModificados) {
          try {
            const gruposPersistidos =
              await fetchGruposByUsuario(
                payload.original.idUsuario
              );

            const persistidosPorGrupo =
              new Map(
                gruposPersistidos.map(
                  (grupo) => [
                    grupo.idGrupo,
                    grupo,
                  ]
                )
              );

            for (const grupo of quitar) {
              const grupoPersistido =
                persistidosPorGrupo.get(
                  grupo.idGrupo
                );

              if (!grupoPersistido) {
                continue;
              }

              await removeUsuarioGrupo(
                grupoPersistido
              );

              persistidosPorGrupo.delete(
                grupo.idGrupo
              );
            }

            for (const grupo of agregar) {
              if (
                persistidosPorGrupo.has(
                  grupo.idGrupo
                )
              ) {
                continue;
              }

              await createUsuarioGrupo(
                payload.original.idUsuario,
                grupo.idGrupo
              );

              persistidosPorGrupo.set(
                grupo.idGrupo,
                grupo
              );
            }
          } catch (error) {
            const detail =
              error instanceof Error &&
              error.message.trim()
                ? ` ${error.message.trim()}`
                : '';

            throw new Error(
              payload.usuarioModificado
                ? `Los datos del usuario se actualizaron, pero no se pudieron sincronizar todos sus grupos.${detail}`
                : `No se pudieron sincronizar todos los grupos del usuario.${detail}`
            );
          }
        }

        await refetch();

        showSuccess({
          entity: {
            label: 'Usuario',
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


  return {
    ...table,
    canInsert,
    canEdit,
    registrarUsuario,
    editarUsuario,
    feedback,
    clearFeedback,
  };
};
