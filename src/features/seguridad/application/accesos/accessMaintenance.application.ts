import {
  createPerfilOpciones,
  fetchPerfilOptionsCount,
  fetchPerfilesAcceso,
  updatePerfilOpciones,
} from '../../api/perfilOpcionesApi';
import {
  addUsuarioGrupoOpciones,
  fetchUsuarioGrupoOpcionesByUsuarioGrupo,
  fetchUsuarioGrupoOpcionesListado,
  syncUsuarioGrupoOpciones,
} from '../../api/usuarioGrupoOpcionesApi';

import type {
  PerfilOpcionCount,
  PerfilOpcionDetalle,
} from '../../types/perfilOpcion.types';
import type {
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionListado,
} from '../../types/usuarioGrupoOpcion.types';
import type {
  RegistrarPerfilOpcionesData,
} from '../../domain/accesos/perfilAccess.types';
import type {
  RegistrarUsuarioGrupoOpcionesData,
} from '../../domain/accesos/usuarioAccess.types';
import {
  ACCESS_USER_RULE_MESSAGES,
} from '../../domain/accesos/accessRuleMessages';

export interface AccessMaintenanceDependencies {
  createPerfilOpciones: typeof createPerfilOpciones;
  fetchPerfilOptionsCount: typeof fetchPerfilOptionsCount;
  fetchPerfilesAcceso: typeof fetchPerfilesAcceso;
  updatePerfilOpciones: typeof updatePerfilOpciones;
  addUsuarioGrupoOpciones: typeof addUsuarioGrupoOpciones;
  fetchUsuarioGrupoOpcionesByUsuarioGrupo:
    typeof fetchUsuarioGrupoOpcionesByUsuarioGrupo;
  fetchUsuarioGrupoOpcionesListado:
    typeof fetchUsuarioGrupoOpcionesListado;
  syncUsuarioGrupoOpciones:
    typeof syncUsuarioGrupoOpciones;
}

const DEFAULT_DEPENDENCIES: AccessMaintenanceDependencies = {
  createPerfilOpciones,
  fetchPerfilOptionsCount,
  fetchPerfilesAcceso,
  updatePerfilOpciones,
  addUsuarioGrupoOpciones,
  fetchUsuarioGrupoOpcionesByUsuarioGrupo,
  fetchUsuarioGrupoOpcionesListado,
  syncUsuarioGrupoOpciones,
};

export const loadPerfilesConEstado = async (
  signal: AbortSignal,
  dependencies: AccessMaintenanceDependencies =
    DEFAULT_DEPENDENCIES
): Promise<PerfilOpcionCount[]> => {
  const [perfiles, perfilesCatalogo] = await Promise.all([
    dependencies.fetchPerfilOptionsCount(signal),
    dependencies.fetchPerfilesAcceso(signal),
  ]);

  const estadoByPerfilId = new Map(
    perfilesCatalogo.map((perfil) => [
      perfil.idPerfil,
      perfil.estadoActivo,
    ])
  );

  return perfiles.map((perfil) => ({
    ...perfil,
    estadoActivo: estadoByPerfilId.get(perfil.idPerfil),
  }));
};

export const loadAccesosUsuarioListado = (
  signal: AbortSignal,
  dependencies: AccessMaintenanceDependencies =
    DEFAULT_DEPENDENCIES
): Promise<UsuarioGrupoOpcionListado[]> =>
  dependencies.fetchUsuarioGrupoOpcionesListado(signal);

export const registrarAccesosPerfil = (
  form: RegistrarPerfilOpcionesData,
  authenticatedUserId: string,
  dependencies: AccessMaintenanceDependencies =
    DEFAULT_DEPENDENCIES
): Promise<void> =>
  dependencies.createPerfilOpciones(
    form,
    authenticatedUserId
  );

export const actualizarAccesosPerfil = (
  asignacionesActuales: readonly PerfilOpcionDetalle[],
  form: RegistrarPerfilOpcionesData,
  authenticatedUserId: string,
  dependencies: AccessMaintenanceDependencies =
    DEFAULT_DEPENDENCIES
): Promise<void> =>
  dependencies.updatePerfilOpciones(
    asignacionesActuales,
    form,
    authenticatedUserId
  );

export const registrarAccesosUsuario = async (
  form: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  dependencies: AccessMaintenanceDependencies =
    DEFAULT_DEPENDENCIES
): Promise<void> => {
  const existingAssignments =
    await dependencies.fetchUsuarioGrupoOpcionesByUsuarioGrupo(
      form.usuarioId,
      form.grupoId
    );

  if (existingAssignments.length > 0) {
    throw new Error(
      ACCESS_USER_RULE_MESSAGES.alreadyAssignedUserGroup
    );
  }

  await dependencies.addUsuarioGrupoOpciones(
    existingAssignments,
    form,
    authenticatedUserId
  );
};

export const actualizarAccesosUsuario = (
  asignacionesActuales:
    readonly UsuarioGrupoOpcionDetalle[],
  form: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  dependencies: AccessMaintenanceDependencies =
    DEFAULT_DEPENDENCIES
): Promise<void> =>
  dependencies.syncUsuarioGrupoOpciones(
    asignacionesActuales,
    form,
    authenticatedUserId
  );
