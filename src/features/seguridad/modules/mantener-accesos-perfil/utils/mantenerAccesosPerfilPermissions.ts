export type MantenerAccesosPerfilWritePermission =
  | 'insertar'
  | 'editar';

const PERMISSION_MESSAGES: Readonly<
  Record<
    MantenerAccesosPerfilWritePermission,
    string
  >
> = Object.freeze({
  insertar:
    'No tiene permiso para asignar accesos a perfiles.',
  editar:
    'No tiene permiso para editar los accesos de los perfiles.',
});

export const getMantenerAccesosPerfilPermissionMessage = (
  permission: MantenerAccesosPerfilWritePermission
): string =>
  PERMISSION_MESSAGES[
    permission
  ];

export const assertMantenerAccesosPerfilPermission = (
  permission: MantenerAccesosPerfilWritePermission,
  isAllowed: boolean
): void => {
  if (isAllowed) {
    return;
  }

  throw new Error(
    getMantenerAccesosPerfilPermissionMessage(
      permission
    )
  );
};
