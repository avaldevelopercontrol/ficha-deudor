import type {
  AccessOptionsFormData,
  AccessPermissions,
  AccessTreeItem,
  AccessCheckState,
} from './access.types';
import {
  ACCESS_PERMISSION_KEYS,
  EMPTY_ACCESS_PERMISSIONS,
} from './access.constants';
import {
  getAutomaticAncestorOptionIds,
} from './accessTree.utils';

export const createEmptyAccessPermissions =
  (): AccessPermissions => ({
    ...EMPTY_ACCESS_PERMISSIONS,
  });

export const hasAnyAccessPermission = (
  permissions: AccessPermissions | undefined
): boolean =>
  Boolean(
    permissions &&
      ACCESS_PERMISSION_KEYS.some(
        (key) => permissions[key]
      )
  );

export const getAccessPermissions = (
  form: AccessOptionsFormData,
  optionId: number
): AccessPermissions =>
  form.permissionsByOptionId[
    String(optionId)
  ] ?? createEmptyAccessPermissions();

export const getAccessTreeItemById = (
  treeItems: readonly AccessTreeItem[],
  optionId: number
): AccessTreeItem | undefined =>
  treeItems.find(
    (item) => item.idModulo === optionId
  );

export const getSelectedLeafIds = (
  form: AccessOptionsFormData,
  treeItems: readonly AccessTreeItem[]
): number[] => {
  const selectedIds = new Set(
    form.selectedOptionIds
  );

  return treeItems
    .filter(
      (item) =>
        item.isPermissionTarget &&
        selectedIds.has(item.idModulo)
    )
    .map((item) => item.idModulo);
};

export const resolveSelectedAccessAssignmentIds = (
  selectedLeafIds: readonly number[],
  treeItems: readonly AccessTreeItem[]
): number[] => {
  const selectedIds = new Set([
    ...selectedLeafIds,
    ...getAutomaticAncestorOptionIds(
      treeItems,
      selectedLeafIds
    ),
  ]);

  return treeItems
    .filter(
      (item) =>
        item.isAssignmentTarget &&
        selectedIds.has(item.idModulo)
    )
    .map((item) => item.idModulo);
};

export const keepSelectedLeafPermissions = (
  permissionsByOptionId:
    AccessOptionsFormData['permissionsByOptionId'],
  selectedLeafIds: ReadonlySet<number>
): AccessOptionsFormData['permissionsByOptionId'] =>
  Object.fromEntries(
    Object.entries(
      permissionsByOptionId
    ).filter(([optionId]) =>
      selectedLeafIds.has(Number(optionId))
    )
  );

export const resolveAccessCheckState = (
  checkedCount: number,
  totalCount: number
): AccessCheckState => {
  if (
    totalCount === 0 ||
    checkedCount === 0
  ) {
    return 'unchecked';
  }

  return checkedCount === totalCount
    ? 'checked'
    : 'mixed';
};
