import {
  createWritePermissionGuard,
} from '../../../utils/writePermission.utils';

export type MantenerGrupoWritePermission =
  | 'insertar'
  | 'editar';

const permissionGuard =
  createWritePermissionGuard<MantenerGrupoWritePermission>({
    insertar:
      'No tiene permiso para agregar grupos.',
    editar:
      'No tiene permiso para editar grupos.',
  });

export const getMantenerGrupoPermissionMessage =
  permissionGuard.getMessage;

export const assertMantenerGrupoPermission =
  permissionGuard.assert;
