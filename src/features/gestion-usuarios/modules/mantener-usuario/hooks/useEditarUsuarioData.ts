import {
  useCallback,
} from 'react';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  fetchGruposByUsuario,
  fetchGruposFaltantesByUsuario,
} from '../../../api/usuarioGruposApi';

import {
  fetchUsuarioById,
} from '../../../api/usuariosApi';

interface UseEditarUsuarioDataParams {
  enabled: boolean;
  idUsuario: number | null;
}

export const useEditarUsuarioData = ({
  enabled,
  idUsuario,
}: UseEditarUsuarioDataParams) => {
  const usuarioFetcher =
    useCallback(
      (signal: AbortSignal) => {
        if (!enabled || !idUsuario) {
          return Promise.reject(
            new Error(
              'No se pudo identificar al usuario a editar.'
            )
          );
        }

        return fetchUsuarioById(
          idUsuario,
          signal
        );
      },
      [enabled, idUsuario]
    );

  const gruposFetcher =
    useCallback(
      (signal: AbortSignal) => {
        if (!enabled || !idUsuario) {
          return Promise.reject(
            new Error(
              'No se pudo identificar al usuario para cargar sus grupos.'
            )
          );
        }

        return fetchGruposByUsuario(
          idUsuario,
          signal
        );
      },
      [enabled, idUsuario]
    );

  const gruposFaltantesFetcher =
    useCallback(
      (signal: AbortSignal) => {
        if (!enabled || !idUsuario) {
          return Promise.reject(
            new Error(
              'No se pudo identificar al usuario para cargar los grupos disponibles.'
            )
          );
        }

        return fetchGruposFaltantesByUsuario(
          idUsuario,
          signal
        );
      },
      [enabled, idUsuario]
    );

  const usuario = useApiResource(
    usuarioFetcher,
    [enabled, idUsuario],
    { enabled: enabled && Boolean(idUsuario) }
  );

  const grupos = useApiResource(
    gruposFetcher,
    [enabled, idUsuario],
    { enabled: enabled && Boolean(idUsuario) }
  );

  const gruposFaltantes = useApiResource(
    gruposFaltantesFetcher,
    [enabled, idUsuario],
    { enabled: enabled && Boolean(idUsuario) }
  );

  const refetch = async (): Promise<void> => {
    await Promise.all([
      usuario.refetch(),
      grupos.refetch(),
      gruposFaltantes.refetch(),
    ]);
  };

  return {
    usuario: usuario.data,
    grupos: grupos.data,
    gruposFaltantes:
      gruposFaltantes.data,
    isLoading:
      usuario.isLoading ||
      grupos.isLoading ||
      gruposFaltantes.isLoading,
    error:
      usuario.error ??
      grupos.error ??
      gruposFaltantes.error,
    refetch,
  };
};
