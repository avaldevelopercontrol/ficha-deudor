import {
  useCallback,
} from 'react';

import {
  useOptionPermissions,
} from '@features/access-control';

import {
  useOperationFeedback,
} from '@shared/hooks/useOperationFeedback';

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
  const permissions =
    useOptionPermissions(
      'mMantenerUsuario'
    );

  const canInsert =
    permissions.insertar;

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



  return {
    ...table,
    canInsert,
    registrarUsuario,
    feedback,
    clearFeedback,
  };
};
