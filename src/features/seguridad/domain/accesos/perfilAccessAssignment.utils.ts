import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  PerfilOpcionDetalle,
} from '../../types/perfilOpcion.types';
import type {
  AccessTreeItem,
} from './access.types';
import type {
  AsignarAccesosPerfilFormData,
  PerfilAccesoOption,
  RegistrarPerfilOpcionesData,
} from './perfilAccess.types';
import {
  AUTOMATIC_PARENT_ACCESS_PERMISSIONS,
} from './access.constants';
import {
  sanitizeAccessPermissions,
} from './accessCapabilities.utils';
import {
  getAccessPermissions,
  getSelectedLeafIds,
  hasAnyAccessPermission,
  resolveSelectedAccessAssignmentIds,
} from './accessFormState.utils';

export const ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM:
  AsignarAccesosPerfilFormData = {
    perfilId: '',
    selectedOptionIds: [],
    activeOptionId: null,
    permissionsByOptionId: {},
  };

export const filterAssignablePerfilOptions = (
  perfiles: readonly PerfilAccesoOption[],
  assignedPerfilIds: readonly number[]
): PerfilAccesoOption[] => {
  const assignedPerfilIdSet = new Set(
    assignedPerfilIds.filter(
      (perfilId) =>
        Number.isSafeInteger(perfilId) &&
        perfilId > 0
    )
  );

  return perfiles.filter(
    (perfil) =>
      perfil.estadoActivo &&
      !assignedPerfilIdSet.has(
        perfil.idPerfil
      )
  );
};

export const createAsignarAccesosPerfilFormFromAssignments = (
  perfilId: number,
  assignments: readonly PerfilOpcionDetalle[],
  treeItems: readonly AccessTreeItem[]
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
  const treeItemsById = new Map(
    treeItems.map((item) => [
      item.idModulo,
      item,
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
          sanitizeAccessPermissions(
            treeItemsById.get(optionId),
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
            }
          ),
        ];
      })
    );

  return {
    perfilId: normalizedPerfilId,
    selectedOptionIds:
      resolveSelectedAccessAssignmentIds(
        selectedLeafIds,
        treeItems
      ),
    activeOptionId:
      selectedLeafIds[0] ??
      treeItems.find(
        (item) => item.isPermissionTarget
      )?.idModulo ??
      null,
    permissionsByOptionId,
  };
};

const validateAccesosPerfilForm = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly AccessTreeItem[],
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
    getSelectedLeafIds(form, treeItems);

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
        (item) => item.isAssignmentTarget
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
      .filter((optionId) => {
        const option =
          assignmentTargets.get(optionId);
        const permissions =
          form.permissionsByOptionId[
            String(optionId)
          ];

        return !hasAnyAccessPermission(
          permissions
            ? sanitizeAccessPermissions(
                option,
                permissions
              )
            : permissions
        );
      })
      .map(
        (optionId) =>
          assignmentTargets.get(optionId)
            ?.displayLabel ??
          `Id ${optionId}`
      );

  if (optionsWithoutPermissions.length > 0) {
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
  treeItems: readonly AccessTreeItem[]
): RegistrarPerfilOpcionesData => {
  const selectedLeafIds =
    getSelectedLeafIds(form, treeItems);
  const selectedAssignmentIds = new Set(
    resolveSelectedAccessAssignmentIds(
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
        permissions: item.isPermissionTarget
          ? sanitizeAccessPermissions(
              item,
              getAccessPermissions(
                form,
                item.idModulo
              )
            )
          : {
              ...AUTOMATIC_PARENT_ACCESS_PERMISSIONS,
            },
      })),
  };
};

export const validateAsignarAccesosPerfilForm = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly AccessTreeItem[]
): Record<string, string> =>
  validateAccesosPerfilForm(
    form,
    treeItems,
    true
  );

export const validateEditarAccesosPerfilForm = (
  form: AsignarAccesosPerfilFormData,
  treeItems: readonly AccessTreeItem[]
): Record<string, string> =>
  validateAccesosPerfilForm(
    form,
    treeItems,
    false
  );

export const areAccesosPerfilFormsEqual = (
  left: AsignarAccesosPerfilFormData,
  right: AsignarAccesosPerfilFormData,
  treeItems: readonly AccessTreeItem[]
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
