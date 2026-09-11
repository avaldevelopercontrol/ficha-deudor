import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  loadAsignarAccesosUsuarioCatalog,
  type AsignarAccesosUsuarioCatalog,
} from '../../../application/accesos/accessCatalog.application';

export interface AsignarAccesosUsuarioCatalogResource {
  catalog: AsignarAccesosUsuarioCatalog | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

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
