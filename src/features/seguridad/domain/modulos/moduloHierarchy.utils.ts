import {
  buildModuloRoute,
} from './moduloForm.utils';
import type {
  ModuloMutationState,
} from './moduloMutation.types';
import {
  buildModuloChildrenIndex,
} from './moduloTree.utils';

const sortByOrder = (
  left: ModuloMutationState,
  right: ModuloMutationState
): number => {
  if (left.orden !== right.orden) {
    return left.orden - right.orden;
  }

  return left.idModulo - right.idModulo;
};

export const resolveModuloRouteSegment = (
  route: string,
  fallbackCode: string
): string => {
  const normalizedRoute = route
    .trim()
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/')
    .replace(/^\/+|\/+$/g, '');

  if (!normalizedRoute) {
    return fallbackCode.trim();
  }

  const segments = normalizedRoute
    .split('/')
    .filter(Boolean);

  return (
    segments.at(-1) ??
    fallbackCode.trim()
  );
};

export const renumberModuloParentChildren = (
  modulesById: Map<number, ModuloMutationState>,
  parentId: number,
  currentModuloId: number,
  desiredCurrentOrder?: number
): void => {
  if (parentId === 0) {
    return;
  }

  const children = [
    ...modulesById.values(),
  ]
    .filter(
      (module) =>
        module.idPadre === parentId &&
        module.idModulo !== currentModuloId
    )
    .sort(sortByOrder);

  const currentModule =
    modulesById.get(currentModuloId);

  if (
    currentModule?.idPadre === parentId &&
    desiredCurrentOrder !== undefined
  ) {
    const safePosition = Math.max(
      1,
      Math.min(
        desiredCurrentOrder,
        children.length + 1
      )
    );

    children.splice(
      safePosition - 1,
      0,
      currentModule
    );
  }

  children.forEach((module, index) => {
    modulesById.set(
      module.idModulo,
      {
        ...module,
        orden: index + 1,
      }
    );
  });
};

export const cascadeModuloHierarchyValues = (
  modulesById: Map<number, ModuloMutationState>,
  rootModuloId: number
): void => {
  const childrenByParent =
    buildModuloChildrenIndex(
      modulesById.values()
    );
  const pendingParentIds = [rootModuloId];

  for (
    let index = 0;
    index < pendingParentIds.length;
    index += 1
  ) {
    const parentId = pendingParentIds[index];

    if (parentId === undefined) {
      continue;
    }

    const parent = modulesById.get(parentId);

    if (!parent) {
      continue;
    }

    const children =
      childrenByParent.get(parentId) ?? [];

    children.forEach((child) => {
      const routeSegment =
        resolveModuloRouteSegment(
          child.ruta,
          child.codigo
        );

      modulesById.set(
        child.idModulo,
        {
          ...child,
          ruta: buildModuloRoute(
            parent.ruta,
            routeSegment
          ),
          tipo: parent.tipo + 1,
        }
      );

      pendingParentIds.push(
        child.idModulo
      );
    });
  }
};
