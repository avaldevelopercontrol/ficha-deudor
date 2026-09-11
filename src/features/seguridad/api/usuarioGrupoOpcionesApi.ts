import {
  buildCreateUsuarioGrupoOpcionRequests,
  buildUsuarioGrupoOpcionAddPlan,
  buildUsuarioGrupoOpcionSyncPlan,
} from '../mappers/usuarioGrupoOpcionMutation.mapper';
import type {
  RegistrarUsuarioGrupoOpcionesData,
} from '../domain/accesos/usuarioAccess.types';
import type {
  UsuarioGrupoOpcionDetalle,
} from '../types/usuarioGrupoOpcion.types';
import {
  executeUsuarioGrupoOpcionMutationPlan,
} from './usuarioGrupoOpcionesMutationApi';

export {
  fetchUsuarioGrupoOpcionById,
  fetchUsuarioGrupoOpcionesByUsuarioGrupo,
  fetchUsuarioGrupoOpcionesListado,
  fetchUsuarioGrupoOpcionesPermisosByUsuarioGrupo,
} from './usuarioGrupoOpcionesQueryApi';

const buildCreateRequestsFromPlan = (
  data: RegistrarUsuarioGrupoOpcionesData,
  newAssignments:
    RegistrarUsuarioGrupoOpcionesData['assignments'],
  authenticatedUserId: string
) =>
  newAssignments.length > 0
    ? buildCreateUsuarioGrupoOpcionRequests(
        {
          ...data,
          assignments: newAssignments,
        },
        authenticatedUserId
      )
    : [];

export const addUsuarioGrupoOpciones = async (
  existingAssignments:
    readonly UsuarioGrupoOpcionDetalle[],
  data: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  signal?: AbortSignal
): Promise<void> => {
  const plan = buildUsuarioGrupoOpcionAddPlan(
    existingAssignments,
    data,
    authenticatedUserId
  );
  const createRequests =
    buildCreateRequestsFromPlan(
      data,
      plan.newAssignments,
      authenticatedUserId
    );

  await executeUsuarioGrupoOpcionMutationPlan(
    plan.updateRequests,
    createRequests,
    signal
  );
};

export const syncUsuarioGrupoOpciones = async (
  existingAssignments:
    readonly UsuarioGrupoOpcionDetalle[],
  data: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  signal?: AbortSignal
): Promise<void> => {
  const plan = buildUsuarioGrupoOpcionSyncPlan(
    existingAssignments,
    data,
    authenticatedUserId
  );
  const createRequests =
    buildCreateRequestsFromPlan(
      data,
      plan.newAssignments,
      authenticatedUserId
    );

  await executeUsuarioGrupoOpcionMutationPlan(
    plan.updateRequests,
    createRequests,
    signal
  );
};
