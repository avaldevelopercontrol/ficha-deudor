export type WritePermissionMessages<
  TPermission extends string,
> = Readonly<Record<TPermission, string>>;

export interface WritePermissionGuard<
  TPermission extends string,
> {
  getMessage: (
    permission: TPermission
  ) => string;
  assert: (
    permission: TPermission,
    isAllowed: boolean
  ) => void;
}

/**
 * Construye un guard reutilizable manteniendo los mensajes específicos
 * de cada pantalla en el módulo que los define.
 */
export const createWritePermissionGuard = <
  TPermission extends string,
>(
  messages: WritePermissionMessages<TPermission>
): WritePermissionGuard<TPermission> => {
  const getMessage = (
    permission: TPermission
  ): string => messages[permission];

  const assert = (
    permission: TPermission,
    isAllowed: boolean
  ): void => {
    if (isAllowed) {
      return;
    }

    throw new Error(
      getMessage(permission)
    );
  };

  return {
    getMessage,
    assert,
  };
};
