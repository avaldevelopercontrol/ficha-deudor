export type MantenerAccesosUsuarioWritePermission =
  | 'insertar'
  | 'editar';

const PERMISSION_MESSAGES: Readonly<
  Record<
    MantenerAccesosUsuarioWritePermission,
    string
  >
> = Object.freeze({
  insertar:
    'No tiene permiso para asignar accesos a usuarios.',
  editar:
    'No tiene permiso para editar los accesos de los usuarios.',
});

export const getMantenerAccesosUsuarioPermissionMessage = (
  permission: MantenerAccesosUsuarioWritePermission
): string =>
  PERMISSION_MESSAGES[
    permission
  ];

export const assertMantenerAccesosUsuarioPermission = (
  permission: MantenerAccesosUsuarioWritePermission,
  isAllowed: boolean
): void => {
  if (isAllowed) {
    return;
  }

  throw new Error(
    getMantenerAccesosUsuarioPermissionMessage(
      permission
    )
  );
};
