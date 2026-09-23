import {
  createWritePermissionGuard,
} from '../../../utils/writePermission.utils';

export type MantenerBiWritePermission =
  | 'insertar'
  | 'editar';

const permissionGuard =
  createWritePermissionGuard<MantenerBiWritePermission>({
    insertar:
      'No tiene permiso para agregar BI.',
    editar:
      'No tiene permiso para editar BI.',
  });

export const getMantenerBiPermissionMessage =
  permissionGuard.getMessage;

export const assertMantenerBiPermission =
  permissionGuard.assert;
