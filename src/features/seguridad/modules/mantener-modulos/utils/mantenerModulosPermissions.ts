import {
  createWritePermissionGuard,
} from '../../../utils/writePermission.utils';

export type MantenerModulosWritePermission =
  | 'insertar'
  | 'editar';

const permissionGuard =
  createWritePermissionGuard<MantenerModulosWritePermission>({
    insertar:
      'No tiene permiso para agregar módulos.',
    editar:
      'No tiene permiso para editar módulos.',
  });

export const getMantenerModulosPermissionMessage =
  permissionGuard.getMessage;

export const assertMantenerModulosPermission =
  permissionGuard.assert;
