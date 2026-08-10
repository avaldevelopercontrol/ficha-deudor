export type MantenerPerfilWritePermission =
  | 'insertar'
  | 'editar';

const PERMISSION_MESSAGES: Readonly<
  Record<
    MantenerPerfilWritePermission,
    string
  >
> = Object.freeze({
  insertar:
    'No tiene permiso para agregar perfiles.',
  editar:
    'No tiene permiso para editar perfiles.',
});

export const getMantenerPerfilPermissionMessage = (
  permission: MantenerPerfilWritePermission
): string =>
  PERMISSION_MESSAGES[
    permission
  ];

export const assertMantenerPerfilPermission = (
  permission: MantenerPerfilWritePermission,
  isAllowed: boolean
): void => {
  if (isAllowed) {
    return;
  }

  throw new Error(
    getMantenerPerfilPermissionMessage(
      permission
    )
  );
};
