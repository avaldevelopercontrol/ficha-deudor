import {
  createWritePermissionGuard,
} from '../../../utils/writePermission.utils';

export type MantenerAccesosPerfilWritePermission =
  | 'insertar'
  | 'editar';

const permissionGuard =
  createWritePermissionGuard<MantenerAccesosPerfilWritePermission>({
    insertar:
      'No tiene permiso para asignar accesos a perfiles.',
    editar:
      'No tiene permiso para editar los accesos de los perfiles.',
  });

export const getMantenerAccesosPerfilPermissionMessage =
  permissionGuard.getMessage;

export const assertMantenerAccesosPerfilPermission =
  permissionGuard.assert;
