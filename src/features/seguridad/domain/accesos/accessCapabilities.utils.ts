import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control';

import type {
  AccessTreeItem,
  AccessPermissionKey,
  AccessPermissions,
} from './access.types';

import {
  ACCESS_PERMISSION_KEYS,
} from './access.constants';

export type AccessPermissionAvailability =
  Record<
    AccessPermissionKey,
    boolean
  >;

const ALL_PERMISSIONS_AVAILABLE:
  AccessPermissionAvailability = {
    consultar: true,
    insertar: true,
    editar: true,
    eliminar: true,
    exportar: true,
  };

const NO_PERMISSIONS_AVAILABLE:
  AccessPermissionAvailability = {
    consultar: false,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  };

const MAINTENANCE_PERMISSIONS:
  AccessPermissionAvailability = {
    consultar: true,
    insertar: true,
    editar: true,
    eliminar: false,
    exportar: false,
  };

const READ_ONLY_PERMISSIONS:
  AccessPermissionAvailability = {
    consultar: true,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  };

const READ_EXPORT_PERMISSIONS:
  AccessPermissionAvailability = {
    consultar: true,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: true,
  };

const CHANGE_PASSWORD_PERMISSIONS:
  AccessPermissionAvailability = {
    consultar: true,
    insertar: false,
    editar: true,
    eliminar: false,
    exportar: false,
  };

const CONSULT_ONLY_PERMISSION_KEYS = [
  'consultar',
] as const satisfies readonly AccessPermissionKey[];

const CONSULT_EXPORT_PERMISSION_KEYS = [
  'consultar',
  'exportar',
] as const satisfies readonly AccessPermissionKey[];

/**
 * Capacidades funcionales reales de cada opción final.
 *
 * Se indexan por nId_Opcion para que renombrar el módulo, regenerar su código
 * o moverlo dentro de la jerarquía no cambie sus capacidades funcionales.
 */
const OPTION_PERMISSION_AVAILABILITY_BY_ID:
  ReadonlyMap<
    number,
    AccessPermissionAvailability
  > = new Map([
    [
      APPLICATION_OPTION_IDS
        .CAMBIAR_CLAVE,
      CHANGE_PASSWORD_PERMISSIONS,
    ],
    [
      APPLICATION_OPTION_IDS
        .PORTFOLIO_CONTROL_CENTER,
      READ_EXPORT_PERMISSIONS,
    ],
    [
      APPLICATION_OPTION_IDS
        .REPORTERIA,
      READ_ONLY_PERMISSIONS,
    ],
    [
      APPLICATION_OPTION_IDS
        .SESIONES_BI,
      READ_ONLY_PERMISSIONS,
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
        .MANTENER_USUARIO,
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

/**
 * Permisos que se muestran en el editor de accesos.
 *
 * Las excepciones se indexan por nId_Opcion para no depender del nombre o
 * código configurable del módulo: Sesiones BI es solo consulta, mientras que
 * Análisis de Carteras permite consulta y exportación del seguimiento.
 */
export const getVisibleAccessPermissionKeys = (
  option: AccessTreeItem | null | undefined
): readonly AccessPermissionKey[] => {
  if (!option?.isPermissionTarget) {
    return ACCESS_PERMISSION_KEYS;
  }

  if (
    option.idModulo ===
    APPLICATION_OPTION_IDS.SESIONES_BI
  ) {
    return CONSULT_ONLY_PERMISSION_KEYS;
  }

  if (
    option.idModulo ===
    APPLICATION_OPTION_IDS.PORTFOLIO_CONTROL_CENTER
  ) {
    return CONSULT_EXPORT_PERMISSION_KEYS;
  }

  return ACCESS_PERMISSION_KEYS;
};

export const getAccessPermissionAvailability = (
  option: AccessTreeItem | null | undefined
): AccessPermissionAvailability => {
  if (!option?.isPermissionTarget) {
    return {
      ...NO_PERMISSIONS_AVAILABLE,
    };
  }

  const configuredAvailability =
    OPTION_PERMISSION_AVAILABILITY_BY_ID.get(
      option.idModulo
    );

  if (configuredAvailability) {
    return {
      ...configuredAvailability,
    };
  }

  if (option.urlBI?.trim()) {
    return {
      ...READ_ONLY_PERMISSIONS,
    };
  }

  return {
    ...ALL_PERMISSIONS_AVAILABLE,
  };
};

export const isAccessPermissionAvailable = (
  option: AccessTreeItem | null | undefined,
  permission: AccessPermissionKey
): boolean =>
  getAccessPermissionAvailability(
    option
  )[permission];

export const sanitizeAccessPermissions = (
  option: AccessTreeItem | null | undefined,
  permissions: AccessPermissions
): AccessPermissions => {
  const availability =
    getAccessPermissionAvailability(
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
