import {
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';
import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  RegistrarPerfilOpcionesData,
} from '../modules/mantener-accesos-perfil/types/asignarAccesosPerfil.types';

import type {
  CreatePerfilOpcionRequest,
} from '../types/perfilOpcion.types';

export const buildCreatePerfilOpcionRequests = (
  data: RegistrarPerfilOpcionesData,
  authenticatedUserId: string,
  createdAt = new Date()
): CreatePerfilOpcionRequest[] => {
  const perfilId = toRequiredId(
    data.perfilId,
    'nId_Perfil'
  );

  const userId = toRequiredId(
    authenticatedUserId,
    'nCrea'
  );

  if (data.assignments.length === 0) {
    throw new Error(
      'Debe seleccionar por lo menos una opción para registrar.'
    );
  }

  const date =
    getCurrentPeruDateTime(
      createdAt
    );
  const seenOptionIds = new Set<number>();

  return data.assignments.map(
    ({
      opcionId,
      permissions,
    }) => {
      const normalizedOptionId =
        toRequiredId(
          opcionId,
          'nId_Opcion'
        );

      if (
        seenOptionIds.has(
          normalizedOptionId
        )
      ) {
        throw new Error(
          `La opción ${normalizedOptionId} se encuentra duplicada.`
        );
      }

      seenOptionIds.add(
        normalizedOptionId
      );

      const hasPermission =
        permissions.consultar ||
        permissions.insertar ||
        permissions.editar ||
        permissions.eliminar ||
        permissions.exportar;

      if (!hasPermission) {
        throw new Error(
          `La opción ${normalizedOptionId} debe tener por lo menos un permiso.`
        );
      }

      return {
        nId_Perfil: perfilId,
        nId_Opcion:
          normalizedOptionId,
        bConsultar:
          permissions.consultar,
        bInsertar:
          permissions.insertar,
        bEditar:
          permissions.editar,
        bEliminar:
          permissions.eliminar,
        bExportar:
          permissions.exportar,
        bEstado: true,
        nCrea: userId,
        dFechaCrea: date,
      };
    }
  );
};
