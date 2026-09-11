import {
  createWritePermissionGuard,
} from '../../../utils/writePermission.utils';

export type MantenerAccesosUsuarioWritePermission =
  | 'insertar'
  | 'editar';

const permissionGuard =
  createWritePermissionGuard<MantenerAccesosUsuarioWritePermission>({
    insertar:
      'No tiene permiso para asignar accesos a usuarios.',
    editar:
      'No tiene permiso para editar los accesos de los usuarios.',
  });

export const getMantenerAccesosUsuarioPermissionMessage =
  permissionGuard.getMessage;

export const assertMantenerAccesosUsuarioPermission =
  permissionGuard.assert;
