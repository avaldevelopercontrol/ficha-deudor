import type {
  Modulo,
} from '../../../types/opcion.types';

import type {
  OpcionTreeItem,
} from '../types/asignarAccesosPerfil.types';

const ALL_OPTIONS_LABEL =
  'Todas las opciones';

const compareOpciones = (
  left: Modulo,
  right: Modulo
): number => {
  const orderDifference =
    left.orden - right.orden;

  if (orderDifference !== 0) {
    return orderDifference;
  }

  const nameDifference =
    left.nombre.localeCompare(
      right.nombre,
      'es',
      {
        sensitivity: 'base',
      }
    );

  if (nameDifference !== 0) {
    return nameDifference;
  }

  return left.idModulo - right.idModulo;
};

const assertValidOption = (
  option: Modulo
): void => {
  if (
    !Number.isSafeInteger(
      option.idModulo
    ) ||
    option.idModulo <= 0
  ) {
    throw new Error(
      'La lista de opciones contiene un identificador inválido.'
    );
  }

  if (!option.nombre.trim()) {
    throw new Error(
      `La opción ${option.idModulo} no contiene un nombre válido.`
    );
  }

  if (
    !Number.isSafeInteger(
      option.idPadre
    ) ||
    option.idPadre < 0
  ) {
    throw new Error(
      `La opción ${option.idModulo} contiene un identificador de padre inválido.`
    );
  }
};

const isTechnicalRoot = (
  option: Modulo
): boolean =>
  option.tipo === 1 &&
  option.idPadre === 0;

const buildDisplayLabel = (
  option: Modulo,
  treeCode: string,
  assignmentTarget: boolean
): string =>
  assignmentTarget
    ? `${treeCode}. ${option.nombre.trim()}`
    : ALL_OPTIONS_LABEL;

export const buildAccesosPerfilTree = (
  options: readonly Modulo[]
): OpcionTreeItem[] => {
  const optionIdsWithChildren = new Set(
    options
      .filter(
        (option) =>
          Number.isSafeInteger(
            option.idPadre
          ) &&
          option.idPadre > 0
      )
      .map((option) => option.idPadre)
  );

  const activeOptions = options.filter(
    (option) => option.estadoActivo
  );

  const optionsById = new Map<
    number,
    Modulo
  >();

  activeOptions.forEach((option) => {
    assertValidOption(option);

    if (
      optionsById.has(
        option.idModulo
      )
    ) {
      throw new Error(
        `La opción ${option.idModulo} se encuentra duplicada.`
      );
    }

    optionsById.set(
      option.idModulo,
      option
    );
  });

  const childrenByParent = new Map<
    number,
    Modulo[]
  >();

  activeOptions.forEach((option) => {
    const parentId =
      option.idPadre > 0 &&
      optionsById.has(option.idPadre)
        ? option.idPadre
        : 0;

    const children =
      childrenByParent.get(parentId) ?? [];

    children.push(option);
    childrenByParent.set(
      parentId,
      children
    );
  });

  childrenByParent.forEach(
    (children) => {
      children.sort(compareOpciones);
    }
  );

  const result: OpcionTreeItem[] = [];
  const visited = new Set<number>();
  const activePath = new Set<number>();

  const visit = (
    option: Modulo,
    depth: number,
    treeCode: string
  ): void => {
    if (
      activePath.has(
        option.idModulo
      )
    ) {
      throw new Error(
        `La jerarquía de opciones contiene un ciclo en la opción ${option.idModulo}.`
      );
    }

    if (
      visited.has(
        option.idModulo
      )
    ) {
      return;
    }

    activePath.add(option.idModulo);

    const children =
      childrenByParent.get(
        option.idModulo
      ) ?? [];

    const assignmentTarget =
      !isTechnicalRoot(option);
    const hasChildren =
      children.length > 0 ||
      optionIdsWithChildren.has(
        option.idModulo
      );

    result.push({
      ...option,
      depth,
      treeCode,
      displayLabel:
        buildDisplayLabel(
          option,
          treeCode,
          assignmentTarget
        ),
      hasChildren,
      isAssignmentTarget:
        assignmentTarget,
      isPermissionTarget:
        assignmentTarget &&
        !hasChildren,
    });

    children.forEach(
      (child, index) => {
        const childCode =
          assignmentTarget
            ? `${treeCode}.${index + 1}`
            : String(index + 1);

        visit(
          child,
          depth + 1,
          childCode
        );
      }
    );

    activePath.delete(option.idModulo);
    visited.add(option.idModulo);
  };

  const roots = [
    ...(childrenByParent.get(0) ?? []),
  ].sort((left, right) => {
    const leftIsNaturalRoot =
      left.idPadre <= 0;
    const rightIsNaturalRoot =
      right.idPadre <= 0;

    if (
      leftIsNaturalRoot !==
      rightIsNaturalRoot
    ) {
      return leftIsNaturalRoot
        ? -1
        : 1;
    }

    return compareOpciones(
      left,
      right
    );
  });

  roots.forEach((root, index) => {
    visit(
      root,
      0,
      String(index + 1)
    );
  });

  if (
    visited.size !==
    activeOptions.length
  ) {
    const remaining = activeOptions
      .filter(
        (option) =>
          !visited.has(
            option.idModulo
          )
      )
      .sort(compareOpciones);

    remaining.forEach(
      (option, index) => {
        visit(
          option,
          0,
          String(
            roots.length + index + 1
          )
        );
      }
    );
  }

  return result;
};

export const getAccesosPerfilBranchItems = (
  items: readonly OpcionTreeItem[],
  optionId: number
): OpcionTreeItem[] => {
  const startIndex = items.findIndex(
    (item) =>
      item.idModulo === optionId
  );

  if (startIndex < 0) {
    return [];
  }

  const parentDepth =
    items[startIndex]?.depth ?? 0;
  const branch: OpcionTreeItem[] = [];

  for (
    let index = startIndex;
    index < items.length;
    index += 1
  ) {
    const item = items[index];

    if (!item) {
      continue;
    }

    if (
      index > startIndex &&
      item.depth <= parentDepth
    ) {
      break;
    }

    branch.push(item);
  }

  return branch;
};

export const getConfigurableBranchOptionIds = (
  items: readonly OpcionTreeItem[],
  optionId: number
): number[] =>
  getAccesosPerfilBranchItems(
    items,
    optionId
  )
    .filter(
      (item) =>
        item.isPermissionTarget
    )
    .map((item) => item.idModulo);

export const getAutomaticAncestorOptionIds = (
  items: readonly OpcionTreeItem[],
  selectedLeafIds: readonly number[]
): number[] => {
  const itemsById = new Map(
    items.map((item) => [
      item.idModulo,
      item,
    ])
  );
  const automaticIds = new Set<number>();

  selectedLeafIds.forEach((leafId) => {
    let current = itemsById.get(leafId);
    const visited = new Set<number>();

    while (
      current &&
      current.idPadre > 0 &&
      !visited.has(current.idModulo)
    ) {
      visited.add(current.idModulo);
      const parent = itemsById.get(
        current.idPadre
      );

      if (!parent) {
        break;
      }

      if (
        parent.isAssignmentTarget &&
        parent.hasChildren
      ) {
        automaticIds.add(
          parent.idModulo
        );
      }

      current = parent;
    }
  });

  return items
    .filter((item) =>
      automaticIds.has(item.idModulo)
    )
    .map((item) => item.idModulo);
};
