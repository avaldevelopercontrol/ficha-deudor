import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control';

import type {
  OpcionTreeItem,
  PerfilOpcionPermissionKey,
  PerfilOpcionPermissions,
} from '../types/asignarAccesosPerfil.types';

export type PerfilOpcionPermissionAvailability =
  Record<
    PerfilOpcionPermissionKey,
    boolean
  >;

const ALL_PERMISSIONS_AVAILABLE:
  PerfilOpcionPermissionAvailability = {
    consultar: true,
    insertar: true,
    editar: true,
    eliminar: true,
    exportar: true,
  };

const NO_PERMISSIONS_AVAILABLE:
  PerfilOpcionPermissionAvailability = {
    consultar: false,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  };

const MAINTENANCE_PERMISSIONS:
  PerfilOpcionPermissionAvailability = {
    consultar: true,
    insertar: true,
    editar: true,
    eliminar: false,
    exportar: false,
  };

const CHANGE_PASSWORD_PERMISSIONS:
  PerfilOpcionPermissionAvailability = {
    consultar: true,
    insertar: false,
    editar: true,
    eliminar: false,
    exportar: false,
  };

/**
 * Capacidades funcionales reales de cada opción final.
 *
 * Se indexan por nId_Opcion para que renombrar el módulo, regenerar su código
 * o moverlo dentro de la jerarquía no cambie sus capacidades funcionales.
 */
const OPTION_PERMISSION_AVAILABILITY_BY_ID:
  ReadonlyMap<
    number,
    PerfilOpcionPermissionAvailability
  > = new Map([
    [
      APPLICATION_OPTION_IDS
        .CAMBIAR_CLAVE,
      CHANGE_PASSWORD_PERMISSIONS,
    ],
    [
      APPLICATION_OPTION_IDS
        .MANTENER_PERFIL,
      MAINTENANCE_PERMISSIONS,
    ],
    [
      APPLICATION_OPTION_IDS
        .MANTENER_MODULO,
      MAINTENANCE_PERMISSIONS,
    ],
    [
      APPLICATION_OPTION_IDS
        .MANTENER_GRUPO,
      MAINTENANCE_PERMISSIONS,
    ],
    [
      APPLICATION_OPTION_IDS
        .MANTENER_ACCESOS_POR_PERFIL,
      MAINTENANCE_PERMISSIONS,
    ],
    [
      APPLICATION_OPTION_IDS
        .MANTENER_ACCESOS_POR_USUARIO,
      MAINTENANCE_PERMISSIONS,
    ],
  ]);

export const getPerfilOpcionPermissionAvailability = (
  option: OpcionTreeItem | null | undefined
): PerfilOpcionPermissionAvailability => {
  if (!option?.isPermissionTarget) {
    return {
      ...NO_PERMISSIONS_AVAILABLE,
    };
  }

  return {
    ...(OPTION_PERMISSION_AVAILABILITY_BY_ID.get(
      option.idModulo
    ) ?? ALL_PERMISSIONS_AVAILABLE),
  };
};

export const isPerfilOpcionPermissionAvailable = (
  option: OpcionTreeItem | null | undefined,
  permission: PerfilOpcionPermissionKey
): boolean =>
  getPerfilOpcionPermissionAvailability(
    option
  )[permission];

export const sanitizePerfilOpcionPermissions = (
  option: OpcionTreeItem | null | undefined,
  permissions: PerfilOpcionPermissions
): PerfilOpcionPermissions => {
  const availability =
    getPerfilOpcionPermissionAvailability(
      option
    );

  return {
    consultar:
      availability.consultar &&
      permissions.consultar,
    insertar:
      availability.insertar &&
      permissions.insertar,
    editar:
      availability.editar &&
      permissions.editar,
    eliminar:
      availability.eliminar &&
      permissions.eliminar,
    exportar:
      availability.exportar &&
      permissions.exportar,
  };
};
