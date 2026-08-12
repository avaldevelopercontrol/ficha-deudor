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
 * Las opciones que todavía no estén declaradas mantienen temporalmente
 * todos los permisos disponibles para no alterar módulos que aún no han
 * sido revisados. A medida que se valide cada módulo se agrega aquí su
 * matriz real de operaciones.
 */
const OPTION_PERMISSION_AVAILABILITY_BY_CODE:
  Readonly<
    Record<
      string,
      PerfilOpcionPermissionAvailability
    >
  > = {
    mCambiarClave: CHANGE_PASSWORD_PERMISSIONS,
    mMantenerPerfil: MAINTENANCE_PERMISSIONS,
    mMantenerModulo: MAINTENANCE_PERMISSIONS,
    mMantenerGrupo: MAINTENANCE_PERMISSIONS,
    mMantenerAccesosPorPerfil:
      MAINTENANCE_PERMISSIONS,
    mMantenerAccesosPorUsuario:
      MAINTENANCE_PERMISSIONS,
  };

export const getPerfilOpcionPermissionAvailability = (
  option: OpcionTreeItem | null | undefined
): PerfilOpcionPermissionAvailability => {
  if (!option?.isPermissionTarget) {
    return {
      ...NO_PERMISSIONS_AVAILABLE,
    };
  }

  return {
    ...(OPTION_PERMISSION_AVAILABILITY_BY_CODE[
      option.codigo
    ] ?? ALL_PERMISSIONS_AVAILABLE),
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
