import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  AsignarAccesosPerfilFormData,
  OpcionTreeItem,
  PerfilOpcionCheckState,
  PerfilOpcionPermissionKey,
  PerfilOpcionPermissions,
  PerfilOpcionPermissionStates,
  RegistrarPerfilOpcionesData,
} from '../types/asignarAccesosPerfil.types';

import type {
  PerfilOpcionDetalle,
} from '../../../types/perfilOpcion.types';

import {
  getAutomaticAncestorOptionIds,
  getConfigurableBranchOptionIds,
} from './accesosPerfilTree.utils';

export const PERFIL_OPCION_PERMISSION_KEYS = [
  'consultar',
  'insertar',
  'editar',
  'eliminar',
  'exportar',
] as const satisfies readonly PerfilOpcionPermissionKey[];

export const EMPTY_PERFIL_OPCION_PERMISSIONS:
  PerfilOpcionPermissions = {
    consultar: false,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  };

export const AUTOMATIC_PARENT_PERMISSIONS:
  PerfilOpcionPermissions = {
    consultar: true,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  };

const UNCHECKED_PERMISSION_STATES:
  PerfilOpcionPermissionStates = {
    consultar: 'unchecked',
    insertar: 'unchecked',
    editar: 'unchecked',
    eliminar: 'unchecked',
    exportar: 'unchecked',
  };

export const ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM:
  AsignarAccesosPerfilFormData = {
    perfilId: '',
    selectedOptionIds: [],
    activeOptionId: null,
    permissionsByOptionId: {},
  };

export const createEmptyPerfilOpcionPermissions =
  (): PerfilOpcionPermissions => ({
    ...EMPTY_PERFIL_OPCION_PERMISSIONS,
  });

export const createAsignarAccesosPerfilFormFromAssignments = (
  perfilId: number,
  assignments: readonly PerfilOpcionDetalle[],
  treeItems: readonly OpcionTreeItem[]
): AsignarAccesosPerfilFormData => {
  const normalizedPerfilId = toRequiredId(
    perfilId,
    'nId_Perfil'
  );

  const activeAssignmentsByOptionId = new Map(
    assignments
      .filter(
        (assignment) =>
          assignment.estadoActivo &&
          assignment.idPerfil === normalizedPerfilId
      )
      .map((assignment) => [
        assignment.idOpcion,
        assignment,
      ])
  );

  const selectedLeafIds = treeItems
    .filter(
      (item) =>
        item.isPermissionTarget &&
        activeAssignmentsByOptionId.has(
          item.idModulo
        )
    )
    .map((item) => item.idModulo);

  const permissionsByOptionId =
    Object.fromEntries(
      selectedLeafIds.map((optionId) => {
        const assignment =
          activeAssignmentsByOptionId.get(
            optionId
          );

        return [
          String(optionId),
          {
            consultar:
              assignment?.consultar ?? false,
            insertar:
              assignment?.insertar ?? false,
            editar:
              assignment?.editar ?? false,
            eliminar:
              assignment?.eliminar ?? false,
            exportar:
              assignment?.exportar ?? false,
          },
        ];
      })
    );

  return {
    perfilId: normalizedPerfilId,
    selectedOptionIds:
      resolveSelectedAssignmentIds(
        selectedLeafIds,
        treeItems
      ),
    activeOptionId:
      selectedLeafIds[0] ??
      treeItems.find(
        (item) =>
          item.isPermissionTarget
      )?.idModulo ??
      null,
    permissionsByOptionId,
  };
};

export const hasAnyPerfilOpcionPermission = (
  permissions:
    PerfilOpcionPermissions | undefined
): boolean =>
  Boolean(
    permissions &&
      PERFIL_OPCION_PERMISSION_KEYS.some(
        (key) => permissions[key]
      )
  );

const getPermissions = (
  form: AsignarAccesosPerfilFormData,
  optionId: number
): PerfilOpcionPermissions =>
  form.permissionsByOptionId[
    String(optionId)
  ] ??
  createEmptyPerfilOpcionPermissions();

const getTreeItemById = (
  treeItems: readonly OpcionTreeItem[],
  optionId: number
): OpcionTreeItem | undefined =>
  treeItems.find(
    (item) => item.idModulo === optionId
  );

const getSelectedLeafIds = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[]
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

const resolveSelectedAssignmentIds = (
  selectedLeafIds: readonly number[],
  treeItems: readonly OpcionTreeItem[]
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

const keepSelectedLeafPermissions = (
  permissionsByOptionId:
    AsignarAccesosPerfilFormData['permissionsByOptionId'],
  selectedLeafIds: ReadonlySet<number>
): AsignarAccesosPerfilFormData['permissionsByOptionId'] =>
  Object.fromEntries(
    Object.entries(
      permissionsByOptionId
    ).filter(([optionId]) =>
      selectedLeafIds.has(Number(optionId))
    )
  );

const resolveCheckState = (
  checkedCount: number,
  totalCount: number
): PerfilOpcionCheckState => {
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

export const getPerfilOpcionBranchSelectionState = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[],
  optionId: number
): PerfilOpcionCheckState => {
  const branchIds =
    getConfigurableBranchOptionIds(
      treeItems,
      optionId
    );
  const selectedLeafIds = new Set(
    getSelectedLeafIds(form, treeItems)
  );
  const selectedCount = branchIds.filter(
    (id) => selectedLeafIds.has(id)
  ).length;

  return resolveCheckState(
    selectedCount,
    branchIds.length
  );
};

export const getPerfilOpcionBranchPermissionStates = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[],
  optionId: number
): PerfilOpcionPermissionStates => {
  const activeOption = getTreeItemById(
    treeItems,
    optionId
  );

  if (!activeOption) {
    return {
      ...UNCHECKED_PERMISSION_STATES,
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
          ...UNCHECKED_PERMISSION_STATES,
        };
  }

  const isSelected =
    form.selectedOptionIds.includes(
      activeOption.idModulo
    );
  const permissions = getPermissions(
    form,
    activeOption.idModulo
  );

  return PERFIL_OPCION_PERMISSION_KEYS.reduce<PerfilOpcionPermissionStates>(
    (states, permission) => {
      states[permission] =
        isSelected &&
        permissions[permission]
          ? 'checked'
          : 'unchecked';

      return states;
    },
    {
      ...UNCHECKED_PERMISSION_STATES,
    }
  );
};

export const getPerfilOpcionBranchAllPermissionsState = (
  permissionStates: PerfilOpcionPermissionStates
): PerfilOpcionCheckState => {
  const states =
    PERFIL_OPCION_PERMISSION_KEYS.map(
      (key) => permissionStates[key]
    );

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

export const setPerfilOpcionBranchSelected = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[],
  optionId: number,
  selected: boolean
): AsignarAccesosPerfilFormData => {
  const normalizedOptionId =
    toRequiredId(
      optionId,
      'nId_Opcion'
    );
  const branchLeafIds =
    getConfigurableBranchOptionIds(
      treeItems,
      normalizedOptionId
    );

  if (branchLeafIds.length === 0) {
    return {
      ...form,
      activeOptionId:
        normalizedOptionId,
    };
  }

  const selectedLeafIds = new Set(
    getSelectedLeafIds(
      form,
      treeItems
    )
  );
  const permissionsByOptionId = {
    ...form.permissionsByOptionId,
  };

  branchLeafIds.forEach((id) => {
    if (selected) {
      selectedLeafIds.add(id);
      permissionsByOptionId[
        String(id)
      ] = getPermissions(form, id);
      return;
    }

    selectedLeafIds.delete(id);
    delete permissionsByOptionId[
      String(id)
    ];
  });

  return {
    ...form,
    activeOptionId:
      normalizedOptionId,
    selectedOptionIds:
      resolveSelectedAssignmentIds(
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

export const setPerfilOpcionBranchPermission = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[],
  optionId: number,
  permission:
    PerfilOpcionPermissionKey,
  checked: boolean
): AsignarAccesosPerfilFormData => {
  const normalizedOptionId =
    toRequiredId(
      optionId,
      'nId_Opcion'
    );
  const activeOption = getTreeItemById(
    treeItems,
    normalizedOptionId
  );

  if (!activeOption?.isPermissionTarget) {
    return {
      ...form,
      activeOptionId:
        normalizedOptionId,
    };
  }

  const selectedLeafIds = new Set(
    getSelectedLeafIds(
      form,
      treeItems
    )
  );
  const permissionsByOptionId = {
    ...form.permissionsByOptionId,
  };

  if (checked) {
    selectedLeafIds.add(
      normalizedOptionId
    );
  }

  permissionsByOptionId[
    String(normalizedOptionId)
  ] = {
    ...getPermissions(
      form,
      normalizedOptionId
    ),
    [permission]: checked,
  };

  return {
    ...form,
    activeOptionId:
      normalizedOptionId,
    selectedOptionIds:
      resolveSelectedAssignmentIds(
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

export const setAllPerfilOpcionBranchPermissions = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[],
  optionId: number,
  checked: boolean
): AsignarAccesosPerfilFormData => {
  const normalizedOptionId =
    toRequiredId(
      optionId,
      'nId_Opcion'
    );
  const activeOption = getTreeItemById(
    treeItems,
    normalizedOptionId
  );

  if (!activeOption?.isPermissionTarget) {
    return {
      ...form,
      activeOptionId:
        normalizedOptionId,
    };
  }

  const selectedLeafIds = new Set(
    getSelectedLeafIds(
      form,
      treeItems
    )
  );

  if (checked) {
    selectedLeafIds.add(
      normalizedOptionId
    );
  }

  const permissionsByOptionId = {
    ...form.permissionsByOptionId,
    [String(normalizedOptionId)]: {
      consultar: checked,
      insertar: checked,
      editar: checked,
      eliminar: checked,
      exportar: checked,
    },
  };

  return {
    ...form,
    activeOptionId:
      normalizedOptionId,
    selectedOptionIds:
      resolveSelectedAssignmentIds(
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

const validateAccesosPerfilForm = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[],
  requireSelection: boolean
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (
    form.perfilId === '' ||
    !Number.isSafeInteger(
      Number(form.perfilId)
    ) ||
    Number(form.perfilId) <= 0
  ) {
    errors.perfilId =
      'Seleccione el perfil al que se asignarán los accesos.';
  }

  const selectedLeafIds =
    getSelectedLeafIds(
      form,
      treeItems
    );

  if (selectedLeafIds.length === 0) {
    if (requireSelection) {
      errors.selectedOptionIds =
        'Seleccione por lo menos una opción final del árbol.';
    }

    return errors;
  }

  const assignmentTargets = new Map(
    treeItems
      .filter(
        (item) =>
          item.isAssignmentTarget
      )
      .map((item) => [
        item.idModulo,
        item,
      ])
  );

  const invalidOptions =
    form.selectedOptionIds.filter(
      (optionId) =>
        !assignmentTargets.has(optionId)
    );

  if (invalidOptions.length > 0) {
    errors.selectedOptionIds =
      'La selección contiene opciones que ya no están disponibles.';
  }

  const optionsWithoutPermissions =
    selectedLeafIds
      .filter(
        (optionId) =>
          !hasAnyPerfilOpcionPermission(
            form.permissionsByOptionId[
              String(optionId)
            ]
          )
      )
      .map(
        (optionId) =>
          assignmentTargets.get(optionId)
            ?.displayLabel ??
          `Id ${optionId}`
      );

  if (
    optionsWithoutPermissions.length > 0
  ) {
    const visibleOptions =
      optionsWithoutPermissions.slice(0, 3);
    const remaining =
      optionsWithoutPermissions.length -
      visibleOptions.length;
    const suffix =
      remaining > 0
        ? ` y ${remaining} más`
        : '';

    errors.permissionsByOptionId =
      optionsWithoutPermissions.length === 1
        ? `Seleccione por lo menos un permiso para ${visibleOptions[0]}.`
        : `${optionsWithoutPermissions.length} opciones finales seleccionadas no tienen permisos: ${visibleOptions.join(', ')}${suffix}.`;
  }

  return errors;
};

export const normalizeAsignarAccesosPerfilForm = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[]
): RegistrarPerfilOpcionesData => {
  const selectedLeafIds =
    getSelectedLeafIds(
      form,
      treeItems
    );
  const selectedAssignmentIds =
    new Set(
      resolveSelectedAssignmentIds(
        selectedLeafIds,
        treeItems
      )
    );

  return {
    perfilId: toRequiredId(
      form.perfilId,
      'nId_Perfil'
    ),
    assignments: treeItems
      .filter(
        (item) =>
          item.isAssignmentTarget &&
          selectedAssignmentIds.has(
            item.idModulo
          )
      )
      .map((item) => ({
        opcionId: toRequiredId(
          item.idModulo,
          'nId_Opcion'
        ),
        permissions:
          item.isPermissionTarget
            ? {
                ...getPermissions(
                  form,
                  item.idModulo
                ),
              }
            : {
                ...AUTOMATIC_PARENT_PERMISSIONS,
              },
      })),
  };
};
export const validateAsignarAccesosPerfilForm = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[]
): Record<string, string> =>
  validateAccesosPerfilForm(
    form,
    treeItems,
    true
  );

export const validateEditarAccesosPerfilForm = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[]
): Record<string, string> =>
  validateAccesosPerfilForm(
    form,
    treeItems,
    false
  );

export const areAccesosPerfilFormsEqual = (
  left: AsignarAccesosPerfilFormData,
  right: AsignarAccesosPerfilFormData,
  treeItems: readonly OpcionTreeItem[]
): boolean => {
  const leftData =
    normalizeAsignarAccesosPerfilForm(
      left,
      treeItems
    );

  const rightData =
    normalizeAsignarAccesosPerfilForm(
      right,
      treeItems
    );

  return JSON.stringify(leftData) ===
    JSON.stringify(rightData);
};
