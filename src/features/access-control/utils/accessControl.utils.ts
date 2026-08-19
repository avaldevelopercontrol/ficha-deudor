import {
  normalizeSisgesIconName,
} from '@shared/icons/sisges';

import {
  getOptionRoute,
} from '../registry/optionRoute.registry';

import type {
  AccessControlSnapshot,
  AccessOptionSource,
  AccessPermissions,
  AuthorizedOption,
  ProfileOptionAccessSource,
  UserGroupOptionAccessSource,
} from '../types/accessControl.types';

export const EMPTY_ACCESS_PERMISSIONS: AccessPermissions = Object.freeze({
  consultar: false,
  insertar: false,
  editar: false,
  eliminar: false,
  exportar: false,
});

const compareOptions = (
  left: AccessOptionSource,
  right: AccessOptionSource
): number => {
  if (left.order !== right.order) {
    return left.order - right.order;
  }

  const nameComparison =
    left.name.localeCompare(
      right.name,
      'es-PE',
      {
        sensitivity: 'base',
      }
    );

  return nameComparison ||
    left.id - right.id;
};

const flattenAuthorizedOptions = (
  options: readonly AuthorizedOption[],
  target: Map<number, AuthorizedOption>
): void => {
  for (const option of options) {
    target.set(option.id, option);

    flattenAuthorizedOptions(
      option.children,
      target
    );
  }
};

const buildNavigableTree = (
  options: readonly AuthorizedOption[]
): AuthorizedOption[] => {
  const navigableOptions:
    AuthorizedOption[] = [];

  for (const option of options) {
    const children =
      buildNavigableTree(
        option.children
      );

    if (
      option.route === null &&
      children.length === 0
    ) {
      continue;
    }

    navigableOptions.push({
      ...option,
      children,
    });
  }

  return navigableOptions;
};

export const buildAccessControlSnapshot = (
  profileId: number,
  options: readonly AccessOptionSource[],
  assignments: readonly ProfileOptionAccessSource[],
  userGroupAssignments: readonly UserGroupOptionAccessSource[] = []
): AccessControlSnapshot => {
  const optionIds = new Set<number>();
  const optionCodes = new Set<string>();

  for (const option of options) {
    if (optionIds.has(option.id)) {
      throw new Error(
        `La opción ${option.id} está duplicada en el catálogo.`
      );
    }

    if (optionCodes.has(option.code)) {
      throw new Error(
        `El código de opción ${option.code} está duplicado en el catálogo.`
      );
    }

    optionIds.add(option.id);
    optionCodes.add(option.code);
  }

  const profileAssignments = assignments.filter(
    (assignment) =>
      assignment.profileId === profileId
  );

  const assignedOptionIds = new Set<number>();

  for (const assignment of profileAssignments) {
    if (
      assignedOptionIds.has(
        assignment.optionId
      )
    ) {
      throw new Error(
        `La opción ${assignment.optionId} tiene más de un acceso registrado para el perfil ${profileId}.`
      );
    }

    assignedOptionIds.add(
      assignment.optionId
    );
  }

  const assignmentByOptionId = new Map<
    number,
    {
      permissions: AccessPermissions;
      active: boolean;
    }
  >(
    profileAssignments.map(
      (assignment) => [
        assignment.optionId,
        assignment,
      ]
    )
  );

  const specialOptionIds = new Set<number>();

  for (const assignment of userGroupAssignments) {
    if (
      specialOptionIds.has(
        assignment.optionId
      )
    ) {
      throw new Error(
        `La opción ${assignment.optionId} tiene más de un acceso especial registrado para el usuario y grupo seleccionados.`
      );
    }

    specialOptionIds.add(
      assignment.optionId
    );

    /*
     * Una relación inactiva representa una excepción retirada:
     * en ese caso se conserva el permiso heredado del perfil.
     * Una relación activa reemplaza por completo los permisos de
     * esa opción, incluso cuando todos son false.
     */
    if (assignment.active) {
      assignmentByOptionId.set(
        assignment.optionId,
        assignment
      );
    }
  }

  const childrenByParentId = new Map<
    number,
    AccessOptionSource[]
  >();

  for (const option of options) {
    const siblings =
      childrenByParentId.get(
        option.parentId
      ) ?? [];

    siblings.push(option);
    childrenByParentId.set(
      option.parentId,
      siblings
    );
  }

  for (const siblings of childrenByParentId.values()) {
    siblings.sort(compareOptions);
  }

  const buildAuthorizedOption = (
    option: AccessOptionSource,
    ancestorIds: ReadonlySet<number>
  ): AuthorizedOption | null => {
    if (ancestorIds.has(option.id)) {
      return null;
    }

    const assignment =
      assignmentByOptionId.get(
        option.id
      );

    if (
      !assignment ||
      !assignment.active ||
      !option.active ||
      !option.visible
    ) {
      return null;
    }

    const nextAncestorIds = new Set(
      ancestorIds
    );

    nextAncestorIds.add(option.id);

    const children = (
      childrenByParentId.get(
        option.id
      ) ?? []
    )
      .map(
        (child) =>
          buildAuthorizedOption(
            child,
            nextAncestorIds
          )
      )
      .filter(
        (
          child
        ): child is AuthorizedOption =>
          child !== null
      );

    const route = getOptionRoute(
      option.id
    );

    return {
      id: option.id,
      code: option.code,
      name: option.name,
      description:
        option.description,
      urlBI: option.urlBI,
      image: option.image,
      email: option.email?.trim() || null,
      icon:
        normalizeSisgesIconName(
          option.icon
        ),
      type: option.type,
      parentId: option.parentId,
      order: option.order,
      route,
      permissions: {
        ...assignment.permissions,
      },
      children,
    };
  };

  const rootIds = new Set(
    options
      .filter(
        (option) =>
          option.type === 1
      )
      .map(
        (option) => option.id
      )
  );

  const menuTree = options
    .filter(
      (option) =>
        option.type === 2 &&
        (
          rootIds.has(
            option.parentId
          ) ||
          (
            rootIds.size === 0 &&
            option.parentId <= 0
          )
        )
    )
    .sort(compareOptions)
    .map(
      (option) =>
        buildAuthorizedOption(
          option,
          new Set<number>()
        )
    )
    .filter(
      (
        option
      ): option is AuthorizedOption =>
        option !== null
    );

  const optionsById = new Map<
    number,
    AuthorizedOption
  >();

  flattenAuthorizedOptions(
    menuTree,
    optionsById
  );

  const navigationTree =
    buildNavigableTree(menuTree);

  return {
    profileId,
    menuTree,
    navigationTree,
    optionsById,
  };
};
