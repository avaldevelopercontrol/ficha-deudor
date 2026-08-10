import {
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';
import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  PerfilOpcionAssignment,
  RegistrarPerfilOpcionesData,
} from '../modules/mantener-accesos-perfil/types/asignarAccesosPerfil.types';

import type {
  PerfilOpcionDetalle,
  UpdatePerfilOpcionRequest,
} from '../types/perfilOpcion.types';

const hasSamePermissions = (
  current: PerfilOpcionDetalle,
  assignment: PerfilOpcionAssignment
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

export interface PerfilOpcionUpdatePlan {
  updateRequests: UpdatePerfilOpcionRequest[];
  newAssignments: PerfilOpcionAssignment[];
}

export const buildPerfilOpcionUpdatePlan = (
  existingAssignments: readonly PerfilOpcionDetalle[],
  data: RegistrarPerfilOpcionesData,
  authenticatedUserId: string,
  updatedAt = new Date()
): PerfilOpcionUpdatePlan => {
  const perfilId = toRequiredId(
    data.perfilId,
    'nId_Perfil'
  );

  const userId = toRequiredId(
    authenticatedUserId,
    'nModifica'
  );

  const date =
    getCurrentPeruDateTime(
      updatedAt
    );
  const existingByOptionId = new Map<
    number,
    PerfilOpcionDetalle
  >();

  existingAssignments.forEach(
    (assignment) => {
      const optionId = toRequiredId(
        assignment.idOpcion,
        'nId_Opcion'
      );

      if (assignment.idPerfil !== perfilId) {
        throw new Error(
          `La opción ${optionId} no pertenece al perfil ${perfilId}.`
        );
      }

      if (
        existingByOptionId.has(optionId)
      ) {
        throw new Error(
          `La opción ${optionId} se encuentra duplicada en los accesos actuales.`
        );
      }

      existingByOptionId.set(
        optionId,
        assignment
      );
    }
  );

  const currentByOptionId = new Map<
    number,
    PerfilOpcionAssignment
  >();

  data.assignments.forEach(
    (assignment) => {
      const optionId = toRequiredId(
        assignment.opcionId,
        'nId_Opcion'
      );

      if (
        currentByOptionId.has(optionId)
      ) {
        throw new Error(
          `La opción ${optionId} se encuentra duplicada.`
        );
      }

      currentByOptionId.set(
        optionId,
        assignment
      );
    }
  );

  const updateRequests =
    existingAssignments.flatMap(
      (existingAssignment) => {
        const currentAssignment =
          currentByOptionId.get(
            existingAssignment.idOpcion
          );

        const nextState = Boolean(
          currentAssignment
        );

        if (
          currentAssignment &&
          existingAssignment.estadoActivo &&
          hasSamePermissions(
            existingAssignment,
            currentAssignment
          )
        ) {
          return [];
        }

        if (
          !currentAssignment &&
          !existingAssignment.estadoActivo &&
          !existingAssignment.consultar &&
          !existingAssignment.insertar &&
          !existingAssignment.editar &&
          !existingAssignment.eliminar &&
          !existingAssignment.exportar
        ) {
          return [];
        }

        return [
          {
            nId_PerfilOpcion:
              toRequiredId(
                existingAssignment.idPerfilOpcion,
                'nId_PerfilOpcion'
              ),
            nId_Perfil: perfilId,
            nId_Opcion:
              existingAssignment.idOpcion,
            bConsultar:
              currentAssignment?.permissions
                .consultar ?? false,
            bInsertar:
              currentAssignment?.permissions
                .insertar ?? false,
            bEditar:
              currentAssignment?.permissions
                .editar ?? false,
            bEliminar:
              currentAssignment?.permissions
                .eliminar ?? false,
            bExportar:
              currentAssignment?.permissions
                .exportar ?? false,
            bEstado: nextState,
            nModifica: userId,
            dFechaModifica: date,
          },
        ];
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
