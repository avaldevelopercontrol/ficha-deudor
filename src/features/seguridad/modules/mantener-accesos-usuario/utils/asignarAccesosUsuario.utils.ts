import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  UsuarioGrupoOpcionDetalle,
} from '../../../types/usuarioGrupoOpcion.types';

import type {
  AccessTreeItem,
} from '../../../domain/accesos/access.types';

import {
  AUTOMATIC_PARENT_ACCESS_PERMISSIONS,
} from '../../../domain/accesos/access.constants';

import {
  getAccessPermissions,
  getSelectedLeafIds,
  hasAnyAccessPermission,
  resolveSelectedAccessAssignmentIds,
} from '../../../domain/accesos/accessFormState.utils';

import {
  sanitizeAccessPermissions,
} from '../../../domain/accesos/accessCapabilities.utils';

import type {
  AsignarAccesosUsuarioFormData,
  RegistrarUsuarioGrupoOpcionesData,
} from '../types/asignarAccesosUsuario.types';

export const ASIGNAR_ACCESOS_USUARIO_INITIAL_FORM:
  AsignarAccesosUsuarioFormData = {
    usuarioId: '',
    grupoId: '',
    selectedOptionIds: [],
    activeOptionId: null,
    permissionsByOptionId: {},
  };

export const createAsignarAccesosUsuarioFormFromAssignments = (
  usuarioId: number,
  grupoId: number,
  assignments:
    readonly UsuarioGrupoOpcionDetalle[],
  treeItems: readonly AccessTreeItem[]
): AsignarAccesosUsuarioFormData => {
  const normalizedUsuarioId =
    toRequiredId(
      usuarioId,
      'nId_Usuario'
    );
  const normalizedGrupoId =
    toRequiredId(
      grupoId,
      'nId_Grupo'
    );

  const activeAssignmentsByOptionId =
    new Map(
      assignments
        .filter(
          (assignment) =>
            assignment.estadoActivo &&
            assignment.idUsuario ===
              normalizedUsuarioId &&
            assignment.idGrupo ===
              normalizedGrupoId
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
    usuarioId: normalizedUsuarioId,
    grupoId: normalizedGrupoId,
    selectedOptionIds:
      resolveSelectedAccessAssignmentIds(
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

const validateAccessSelection = (
  form: AsignarAccesosUsuarioFormData,
  treeItems: readonly AccessTreeItem[],
  requireSelection: boolean
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (
    form.usuarioId === '' ||
    !Number.isSafeInteger(
      Number(form.usuarioId)
    ) ||
    Number(form.usuarioId) <= 0
  ) {
    errors.usuarioId =
      'Seleccione el usuario al que se asignarán los accesos.';
  }

  if (
    form.grupoId === '' ||
    !Number.isSafeInteger(
      Number(form.grupoId)
    ) ||
    Number(form.grupoId) <= 0
  ) {
    errors.grupoId =
      'Seleccione el grupo sobre el que se aplicarán los accesos.';
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

export const validateAsignarAccesosUsuarioForm = (
  form: AsignarAccesosUsuarioFormData,
  treeItems: readonly AccessTreeItem[]
): Record<string, string> =>
  validateAccessSelection(
    form,
    treeItems,
    true
  );

export const validateEditarAccesosUsuarioForm = (
  form: AsignarAccesosUsuarioFormData,
  treeItems: readonly AccessTreeItem[]
): Record<string, string> =>
  validateAccessSelection(
    form,
    treeItems,
    false
  );

export const normalizeAsignarAccesosUsuarioForm = (
  form: AsignarAccesosUsuarioFormData,
  treeItems: readonly AccessTreeItem[]
): RegistrarUsuarioGrupoOpcionesData => {
  const selectedLeafIds =
    getSelectedLeafIds(
      form,
      treeItems
    );
  const selectedAssignmentIds =
    new Set(
      resolveSelectedAccessAssignmentIds(
        selectedLeafIds,
        treeItems
      )
    );

  return {
    usuarioId: toRequiredId(
      form.usuarioId,
      'nId_Usuario'
    ),
    grupoId: toRequiredId(
      form.grupoId,
      'nId_Grupo'
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

export const areAccesosUsuarioFormsEqual = (
  left: AsignarAccesosUsuarioFormData,
  right: AsignarAccesosUsuarioFormData,
  treeItems: readonly AccessTreeItem[]
): boolean =>
  JSON.stringify(
    normalizeAsignarAccesosUsuarioForm(
      left,
      treeItems
    )
  ) ===
  JSON.stringify(
    normalizeAsignarAccesosUsuarioForm(
      right,
      treeItems
    )
  );
