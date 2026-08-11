import {
  fetchGrupos,
} from '@features/gestion-usuarios/api/usuarioCatalogosApi';
import {
  fetchUsuariosList,
} from '@features/gestion-usuarios/api/usuariosApi';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  fetchOpciones,
} from '../../../api/opcionesApi';

export interface AsignarAccesosUsuarioCatalog {
  usuarios: Awaited<
    ReturnType<typeof fetchUsuariosList>
  >;
  grupos: Awaited<
    ReturnType<typeof fetchGrupos>
  >;
  opciones: Awaited<
    ReturnType<typeof fetchOpciones>
  >;
}

export interface AsignarAccesosUsuarioCatalogResource {
  catalog: AsignarAccesosUsuarioCatalog | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const loadAsignarAccesosUsuarioCatalog = async (
  signal: AbortSignal
): Promise<AsignarAccesosUsuarioCatalog> => {
  const [usuarios, grupos, opciones] =
    await Promise.all([
      fetchUsuariosList(signal),
      fetchGrupos(signal),
      fetchOpciones(signal),
    ]);

  return {
    usuarios,
    grupos,
    opciones,
  };
};

/**
 * Precarga los catálogos apenas se monta el listado del módulo.
 * Así el modal no espera la consulta de usuarios al abrirse y los
 * datos se reutilizan durante toda la permanencia en la pantalla.
 */
export const useAsignarAccesosUsuarioCatalog =
  (
    enabled = true
  ): AsignarAccesosUsuarioCatalogResource => {
    const {
      data,
      isLoading,
      error,
      refetch,
    } = useApiResource<AsignarAccesosUsuarioCatalog>(
      loadAsignarAccesosUsuarioCatalog,
      [],
      {
        enabled,
        initialLoading: enabled,
        errorMessage:
          'No se pudieron cargar los usuarios, grupos y opciones.',
      }
    );

    return {
      catalog: data,
      isLoading,
      error,
      refetch,
    };
  };
