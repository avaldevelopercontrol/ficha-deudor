import {
  fetchGrupos,
} from '@features/gestion-usuarios/api/usuarioCatalogosApi';
import {
  fetchUsuariosList,
} from '@features/gestion-usuarios/api/usuariosApi';

import {
  fetchOpciones,
} from '../../api/opcionesApi';
import {
  fetchPerfilOpcionesByPerfil,
  fetchPerfilesAcceso,
} from '../../api/perfilOpcionesApi';
import {
  fetchUsuarioGrupoOpcionById,
  fetchUsuarioGrupoOpcionesByUsuarioGrupo,
} from '../../api/usuarioGrupoOpcionesApi';

import type {
  PerfilOpcionDetalle,
} from '../../types/perfilOpcion.types';
import type {
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionListado,
} from '../../types/usuarioGrupoOpcion.types';
import type {
  AsignarAccesosPerfilCatalog,
} from '../../domain/accesos/perfilAccess.types';

export interface AsignarAccesosUsuarioCatalog {
  usuarios: Awaited<ReturnType<typeof fetchUsuariosList>>;
  grupos: Awaited<ReturnType<typeof fetchGrupos>>;
  opciones: Awaited<ReturnType<typeof fetchOpciones>>;
}

export interface EditarAccesosPerfilCatalog {
  opciones: Awaited<ReturnType<typeof fetchOpciones>>;
  asignaciones: PerfilOpcionDetalle[];
}

export interface EditarAccesosUsuarioCatalog {
  opciones: Awaited<ReturnType<typeof fetchOpciones>>;
  asignaciones: UsuarioGrupoOpcionDetalle[];
}

export const loadAsignarAccesosPerfilCatalog = async (
  signal: AbortSignal
): Promise<AsignarAccesosPerfilCatalog> => {
  const [perfiles, opciones] = await Promise.all([
    fetchPerfilesAcceso(signal),
    fetchOpciones(signal),
  ]);

  return {
    perfiles,
    opciones,
  };
};

export const loadAsignarAccesosUsuarioCatalog = async (
  signal: AbortSignal
): Promise<AsignarAccesosUsuarioCatalog> => {
  const [usuarios, grupos, opciones] = await Promise.all([
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

export const loadEditarAccesosPerfilCatalog = async (
  perfilId: number,
  signal: AbortSignal
): Promise<EditarAccesosPerfilCatalog> => {
  const [opciones, asignaciones] = await Promise.all([
    fetchOpciones(signal),
    fetchPerfilOpcionesByPerfil(perfilId, signal),
  ]);

  return {
    opciones,
    asignaciones,
  };
};

export const loadEditarAccesosUsuarioCatalog = async (
  acceso: Pick<
    UsuarioGrupoOpcionListado,
    'idUsuarioGrupoOpcion' | 'idUsuario' | 'idGrupo'
  >,
  signal: AbortSignal
): Promise<EditarAccesosUsuarioCatalog> => {
  const [opciones, detalleSeleccionado, asignaciones] =
    await Promise.all([
      fetchOpciones(signal),
      fetchUsuarioGrupoOpcionById(
        acceso.idUsuarioGrupoOpcion,
        signal
      ),
      fetchUsuarioGrupoOpcionesByUsuarioGrupo(
        acceso.idUsuario,
        acceso.idGrupo,
        signal
      ),
    ]);

  if (
    detalleSeleccionado.idUsuario !== acceso.idUsuario ||
    detalleSeleccionado.idGrupo !== acceso.idGrupo
  ) {
    throw new Error(
      'El acceso seleccionado ya no pertenece al usuario y grupo mostrados en la tabla.'
    );
  }

  return {
    opciones,
    asignaciones,
  };
};
