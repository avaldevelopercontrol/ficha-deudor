import {
  useCallback,
} from 'react';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';

import {
  createUsuario,
} from '../../../api/usuariosApi';

import {
  useUsuariosListTable,
} from '../../../hooks/useUsuariosListTable';

import type {
  RegistrarUsuarioFormData,
} from '../types/registrarUsuario.types';

export const useMantenerUsuarioTable = () => {
  const {
    usuario,
  } = useAuth();

  const table =
    useUsuariosListTable({
      initialPageSize: 10,
    });

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
        /*
         * Si createUsuario lanza un error,
         * useModalForm lo mostrará y el modal
         * permanecerá abierto.
         */
        const authenticatedUserId =
          usuario?.id_usuario;

        if (!authenticatedUserId) {
          throw new Error(
            'No se pudo identificar al usuario autenticado que registra la operación.'
          );
        }

        await createUsuario(
          form,
          authenticatedUserId
        );

        /*
         * Después del registro se actualiza
         * la tabla y se regresa a la primera
         * página para facilitar la revisión.
         */
        setPageNumber(1);

        await refetch();
      },
      [
        refetch,
        setPageNumber,
        usuario?.id_usuario,
      ]
    );

  return {
    ...table,
    registrarUsuario,
  };
};