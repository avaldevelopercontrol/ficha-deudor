export type MantenerModulosWritePermission =
  | 'insertar'
  | 'editar';

const PERMISSION_MESSAGES: Readonly<
  Record<
    MantenerModulosWritePermission,
    string
  >
> = Object.freeze({
  insertar:
    'No tiene permiso para agregar módulos.',
  editar:
    'No tiene permiso para editar módulos.',
});

export const getMantenerModulosPermissionMessage = (
  permission: MantenerModulosWritePermission
): string =>
  PERMISSION_MESSAGES[
    permission
  ];

export const assertMantenerModulosPermission = (
  permission: MantenerModulosWritePermission,
  isAllowed: boolean
): void => {
  if (isAllowed) {
    return;
  }

  throw new Error(
    getMantenerModulosPermissionMessage(
      permission
    )
  );
};
