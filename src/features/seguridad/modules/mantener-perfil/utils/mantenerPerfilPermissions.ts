import {
  createWritePermissionGuard,
} from '../../../utils/writePermission.utils';

export type MantenerPerfilWritePermission =
  | 'insertar'
  | 'editar';

const permissionGuard =
  createWritePermissionGuard<MantenerPerfilWritePermission>({
    insertar:
      'No tiene permiso para agregar perfiles.',
    editar:
      'No tiene permiso para editar perfiles.',
  });

export const getMantenerPerfilPermissionMessage =
  permissionGuard.getMessage;

export const assertMantenerPerfilPermission =
  permissionGuard.assert;
