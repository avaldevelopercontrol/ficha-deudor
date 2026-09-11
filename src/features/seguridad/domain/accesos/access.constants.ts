import type {
  AccessPermissionKey,
  AccessPermissions,
  AccessPermissionStates,
} from './access.types';

export const ACCESS_PERMISSION_LABELS = {
  consultar: 'CONSULTAR',
  insertar: 'INSERTAR',
  editar: 'EDITAR',
  eliminar: 'ELIMINAR',
  exportar: 'EXPORTAR',
} as const;

export const ACCESS_PERMISSION_KEYS = [
  'consultar',
  'insertar',
  'editar',
  'eliminar',
  'exportar',
] as const satisfies readonly AccessPermissionKey[];

export const EMPTY_ACCESS_PERMISSIONS:
  AccessPermissions = {
    consultar: false,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  };

export const AUTOMATIC_PARENT_ACCESS_PERMISSIONS:
  AccessPermissions = {
    consultar: true,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  };

export const UNCHECKED_ACCESS_PERMISSION_STATES:
  AccessPermissionStates = {
    consultar: 'unchecked',
    insertar: 'unchecked',
    editar: 'unchecked',
    eliminar: 'unchecked',
    exportar: 'unchecked',
  };
