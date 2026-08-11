import {
  getCurrentPeruDateTime,
  normalizePeruApiDateTime,
} from '@shared/utils/peruDateTime.utils';
import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  RegistrarUsuarioGrupoOpcionesData,
  UsuarioGrupoOpcionAssignment,
} from '../modules/mantener-accesos-usuario/types/asignarAccesosUsuario.types';

import type {
  CreateUsuarioGrupoOpcionRequest,
  UpdateUsuarioGrupoOpcionRequest,
  UsuarioGrupoOpcionDetalle,
} from '../types/usuarioGrupoOpcion.types';

const hasSamePermissions = (
  current: UsuarioGrupoOpcionDetalle,
  assignment: UsuarioGrupoOpcionAssignment
): boolean =>
  current.consultar ===
    assignment.permissions.consultar &&
  current.insertar ===
    assignment.permissions.insertar &&
  current.editar ===
    assignment.permissions.editar &&
  current.eliminar ===
    assignment.permissions.eliminar &&
  current.exportar ===
    assignment.permissions.exportar;

const assertHasAnyPermission = (
  assignment: UsuarioGrupoOpcionAssignment
): void => {
  const permissions =
    assignment.permissions;

  if (
    !permissions.consultar &&
    !permissions.insertar &&
    !permissions.editar &&
    !permissions.eliminar &&
    !permissions.exportar
  ) {
    throw new Error(
      `La opción ${assignment.opcionId} debe tener por lo menos un permiso.`
    );
  }
};

const buildExistingByOptionId = (
  existingAssignments:
    readonly UsuarioGrupoOpcionDetalle[],
  usuarioId: number,
  grupoId: number
): Map<number, UsuarioGrupoOpcionDetalle> => {
  const result = new Map<
    number,
    UsuarioGrupoOpcionDetalle
  >();

  existingAssignments.forEach(
    (assignment) => {
      if (
        assignment.idUsuario !==
          usuarioId ||
        assignment.idGrupo !== grupoId
      ) {
        throw new Error(
          `La opción ${assignment.idOpcion} no pertenece al usuario y grupo seleccionados.`
        );
      }

      if (
        result.has(
          assignment.idOpcion
        )
      ) {
        throw new Error(
          `La opción ${assignment.idOpcion} se encuentra duplicada para el usuario y grupo seleccionados.`
        );
      }

      result.set(
        assignment.idOpcion,
        assignment
      );
    }
  );

  return result;
};

const buildCurrentByOptionId = (
  data: RegistrarUsuarioGrupoOpcionesData
): Map<number, UsuarioGrupoOpcionAssignment> => {
  const result = new Map<
    number,
    UsuarioGrupoOpcionAssignment
  >();

  data.assignments.forEach(
    (assignment) => {
      const optionId = toRequiredId(
        assignment.opcionId,
        'nId_Opcion'
      );

      if (result.has(optionId)) {
        throw new Error(
          `La opción ${optionId} se encuentra duplicada.`
        );
      }

      assertHasAnyPermission(
        assignment
      );
      result.set(optionId, assignment);
    }
  );

  return result;
};

export const buildCreateUsuarioGrupoOpcionRequests = (
  data: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  createdAt = new Date()
): CreateUsuarioGrupoOpcionRequest[] => {
  const usuarioId = toRequiredId(
    data.usuarioId,
    'nId_Usuario'
  );
  const grupoId = toRequiredId(
    data.grupoId,
    'nId_Grupo'
  );
  const creatorId = toRequiredId(
    authenticatedUserId,
    'nCrea'
  );
  const createdDate =
    getCurrentPeruDateTime(createdAt);
  const currentByOptionId =
    buildCurrentByOptionId(data);

  if (currentByOptionId.size === 0) {
    throw new Error(
      'Debe seleccionar por lo menos una opción para registrar.'
    );
  }

  return Array.from(
    currentByOptionId.values()
  ).map((assignment) => ({
    nId_Usuario: usuarioId,
    nId_Grupo: grupoId,
    nId_Opcion: assignment.opcionId,
    bConsultar:
      assignment.permissions.consultar,
    bInsertar:
      assignment.permissions.insertar,
    bEditar:
      assignment.permissions.editar,
    bEliminar:
      assignment.permissions.eliminar,
    bExportar:
      assignment.permissions.exportar,
    bEstado: true,
    nCrea: creatorId,
    dFechaCrea: createdDate,
  }));
};

const buildUpdateRequest = (
  existing: UsuarioGrupoOpcionDetalle,
  assignment:
    | UsuarioGrupoOpcionAssignment
    | undefined,
  active: boolean,
  modifierId: number,
  updatedDate: string
): UpdateUsuarioGrupoOpcionRequest => ({
  nId_UsuarioGrupoOpcion:
    toRequiredId(
      existing.idUsuarioGrupoOpcion,
      'nId_UsuarioGrupoOpcion'
    ),
  nId_Usuario: existing.idUsuario,
  nId_Grupo: existing.idGrupo,
  nId_Opcion: existing.idOpcion,
  bConsultar:
    assignment?.permissions.consultar ??
    existing.consultar,
  bInsertar:
    assignment?.permissions.insertar ??
    existing.insertar,
  bEditar:
    assignment?.permissions.editar ??
    existing.editar,
  bEliminar:
    assignment?.permissions.eliminar ??
    existing.eliminar,
  bExportar:
    assignment?.permissions.exportar ??
    existing.exportar,
  bEstado: active,
  nCrea: toRequiredId(
    existing.crea,
    'nCrea'
  ),
  dFechaCrea: normalizePeruApiDateTime(
    existing.fechaCrea,
    'dFechaCrea'
  ),
  nModifica: modifierId,
  dFechaModifica: updatedDate,
});

export interface UsuarioGrupoOpcionMutationPlan {
  updateRequests:
    UpdateUsuarioGrupoOpcionRequest[];
  newAssignments:
    UsuarioGrupoOpcionAssignment[];
}

interface BuildPlanOptions {
  deactivateMissing: boolean;
}

const buildUsuarioGrupoOpcionMutationPlan = (
  existingAssignments:
    readonly UsuarioGrupoOpcionDetalle[],
  data: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  options: BuildPlanOptions,
  updatedAt = new Date()
): UsuarioGrupoOpcionMutationPlan => {
  const usuarioId = toRequiredId(
    data.usuarioId,
    'nId_Usuario'
  );
  const grupoId = toRequiredId(
    data.grupoId,
    'nId_Grupo'
  );
  const modifierId = toRequiredId(
    authenticatedUserId,
    'nModifica'
  );
  const updatedDate =
    getCurrentPeruDateTime(updatedAt);

  const existingByOptionId =
    buildExistingByOptionId(
      existingAssignments,
      usuarioId,
      grupoId
    );
  const currentByOptionId =
    buildCurrentByOptionId(data);

  const updateRequests:
    UpdateUsuarioGrupoOpcionRequest[] = [];

  existingAssignments.forEach(
    (existing) => {
      const current =
        currentByOptionId.get(
          existing.idOpcion
        );

      if (!current) {
        if (
          options.deactivateMissing &&
          existing.estadoActivo
        ) {
          updateRequests.push(
            buildUpdateRequest(
              existing,
              undefined,
              false,
              modifierId,
              updatedDate
            )
          );
        }

        return;
      }

      if (
        existing.estadoActivo &&
        hasSamePermissions(
          existing,
          current
        )
      ) {
        return;
      }

      updateRequests.push(
        buildUpdateRequest(
          existing,
          current,
          true,
          modifierId,
          updatedDate
        )
      );
    }
  );

  const newAssignments =
    data.assignments.filter(
      (assignment) =>
        !existingByOptionId.has(
          assignment.opcionId
        )
    );

  return {
    updateRequests,
    newAssignments,
  };
};

/**
 * Alta incremental: no desactiva accesos existentes que no hayan
 * sido seleccionados en el formulario de asignación.
 */
export const buildUsuarioGrupoOpcionAddPlan = (
  existingAssignments:
    readonly UsuarioGrupoOpcionDetalle[],
  data: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  updatedAt = new Date()
): UsuarioGrupoOpcionMutationPlan =>
  buildUsuarioGrupoOpcionMutationPlan(
    existingAssignments,
    data,
    authenticatedUserId,
    { deactivateMissing: false },
    updatedAt
  );

/**
 * Edición completa del Usuario + Grupo: una opción existente que
 * deja de estar seleccionada se conserva y pasa a bEstado=false.
 */
export const buildUsuarioGrupoOpcionSyncPlan = (
  existingAssignments:
    readonly UsuarioGrupoOpcionDetalle[],
  data: RegistrarUsuarioGrupoOpcionesData,
  authenticatedUserId: string,
  updatedAt = new Date()
): UsuarioGrupoOpcionMutationPlan =>
  buildUsuarioGrupoOpcionMutationPlan(
    existingAssignments,
    data,
    authenticatedUserId,
    { deactivateMissing: true },
    updatedAt
  );
