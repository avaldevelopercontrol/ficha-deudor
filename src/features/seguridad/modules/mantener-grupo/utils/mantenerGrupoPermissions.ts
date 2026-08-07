export type MantenerGrupoWritePermission =
  | 'insertar'
  | 'editar';

const PERMISSION_MESSAGES: Readonly<
  Record<
    MantenerGrupoWritePermission,
    string
  >
> = Object.freeze({
  insertar:
    'No tiene permiso para agregar grupos.',

  editar:
    'No tiene permiso para editar grupos.',
});

export const getMantenerGrupoPermissionMessage = (
  permission: MantenerGrupoWritePermission
): string =>
  PERMISSION_MESSAGES[
    permission
  ];

export const assertMantenerGrupoPermission = (
  permission: MantenerGrupoWritePermission,
  isAllowed: boolean
): void => {
  if (isAllowed) {
    return;
  }

  throw new Error(
    getMantenerGrupoPermissionMessage(
      permission
    )
  );
};
