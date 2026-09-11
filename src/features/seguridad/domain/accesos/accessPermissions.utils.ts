import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  AccessCheckState,
  AccessOptionsFormData,
  AccessPermissionKey,
  AccessPermissionStates,
  AccessTreeItem,
} from './access.types';
import {
  ACCESS_PERMISSION_KEYS,
  UNCHECKED_ACCESS_PERMISSION_STATES,
} from './access.constants';
import {
  getAccessPermissionAvailability,
  isAccessPermissionAvailable,
  sanitizeAccessPermissions,
} from './accessCapabilities.utils';
import {
  getAccessPermissions,
  getAccessTreeItemById,
  getSelectedLeafIds,
  keepSelectedLeafPermissions,
  resolveSelectedAccessAssignmentIds,
} from './accessFormState.utils';

export const getAccessBranchPermissionStates = (
  form: AccessOptionsFormData,
  treeItems: readonly AccessTreeItem[],
  optionId: number
): AccessPermissionStates => {
  const activeOption =
    getAccessTreeItemById(
      treeItems,
      optionId
    );

  if (!activeOption) {
    return {
      ...UNCHECKED_ACCESS_PERMISSION_STATES,
    };
  }

  if (!activeOption.isPermissionTarget) {
    const isAutomaticParentSelected =
      activeOption.isAssignmentTarget &&
      form.selectedOptionIds.includes(
        activeOption.idModulo
      );

    return isAutomaticParentSelected
      ? {
          consultar: 'checked',
          insertar: 'unchecked',
          editar: 'unchecked',
          eliminar: 'unchecked',
          exportar: 'unchecked',
        }
      : {
          ...UNCHECKED_ACCESS_PERMISSION_STATES,
        };
  }

  const isSelected =
    form.selectedOptionIds.includes(
      activeOption.idModulo
    );
  const permissions = sanitizeAccessPermissions(
    activeOption,
    getAccessPermissions(
      form,
      activeOption.idModulo
    )
  );

  return ACCESS_PERMISSION_KEYS.reduce<AccessPermissionStates>(
    (states, permission) => {
      states[permission] =
        isSelected && permissions[permission]
          ? 'checked'
          : 'unchecked';

      return states;
    },
    {
      ...UNCHECKED_ACCESS_PERMISSION_STATES,
    }
  );
};

export const getAccessBranchAllPermissionsState = (
  permissionStates: AccessPermissionStates,
  option?: AccessTreeItem | null
): AccessCheckState => {
  const availability = option
    ? getAccessPermissionAvailability(option)
    : null;
  const states = ACCESS_PERMISSION_KEYS
    .filter(
      (key) => availability?.[key] ?? true
    )
    .map((key) => permissionStates[key]);

  if (states.length === 0) {
    return 'unchecked';
  }

  if (
    states.every(
      (state) => state === 'checked'
    )
  ) {
    return 'checked';
  }

  if (
    states.every(
      (state) => state === 'unchecked'
    )
  ) {
    return 'unchecked';
  }

  return 'mixed';
};

export const setAccessBranchPermission = <
  T extends AccessOptionsFormData,
>(
  form: T,
  treeItems: readonly AccessTreeItem[],
  optionId: number,
  permission: AccessPermissionKey,
  checked: boolean
): T => {
  const normalizedOptionId =
    toRequiredId(optionId, 'nId_Opcion');
  const activeOption = getAccessTreeItemById(
    treeItems,
    normalizedOptionId
  );

  if (
    !activeOption?.isPermissionTarget ||
    !isAccessPermissionAvailable(
      activeOption,
      permission
    )
  ) {
    return {
      ...form,
      activeOptionId: normalizedOptionId,
    };
  }

  const selectedLeafIds = new Set(
    getSelectedLeafIds(form, treeItems)
  );
  const permissionsByOptionId = {
    ...form.permissionsByOptionId,
  };

  if (checked) {
    selectedLeafIds.add(normalizedOptionId);
  }

  permissionsByOptionId[
    String(normalizedOptionId)
  ] = {
    ...getAccessPermissions(
      form,
      normalizedOptionId
    ),
    [permission]: checked,
  };

  return {
    ...form,
    activeOptionId: normalizedOptionId,
    selectedOptionIds:
      resolveSelectedAccessAssignmentIds(
        [...selectedLeafIds],
        treeItems
      ),
    permissionsByOptionId:
      keepSelectedLeafPermissions(
        permissionsByOptionId,
        selectedLeafIds
      ),
  };
};

export const setAllAccessBranchPermissions = <
  T extends AccessOptionsFormData,
>(
  form: T,
  treeItems: readonly AccessTreeItem[],
  optionId: number,
  checked: boolean
): T => {
  const normalizedOptionId =
    toRequiredId(optionId, 'nId_Opcion');
  const activeOption = getAccessTreeItemById(
    treeItems,
    normalizedOptionId
  );

  if (!activeOption?.isPermissionTarget) {
    return {
      ...form,
      activeOptionId: normalizedOptionId,
    };
  }

  const selectedLeafIds = new Set(
    getSelectedLeafIds(form, treeItems)
  );

  if (checked) {
    selectedLeafIds.add(normalizedOptionId);
  }

  const availability =
    getAccessPermissionAvailability(
      activeOption
    );
  const permissionsByOptionId = {
    ...form.permissionsByOptionId,
    [String(normalizedOptionId)]: {
      consultar:
        availability.consultar && checked,
      insertar:
        availability.insertar && checked,
      editar:
        availability.editar && checked,
      eliminar:
        availability.eliminar && checked,
      exportar:
        availability.exportar && checked,
    },
  };

  return {
    ...form,
    activeOptionId: normalizedOptionId,
    selectedOptionIds:
      resolveSelectedAccessAssignmentIds(
        [...selectedLeafIds],
        treeItems
      ),
    permissionsByOptionId:
      keepSelectedLeafPermissions(
        permissionsByOptionId,
        selectedLeafIds
      ),
  };
};
