import type {
  ModuloMutationState,
} from './moduloMutation.types';
import {
  hasModuloPositionChanged,
} from './moduloMutation.utils';

const getPositionKey = (
  parentId: number,
  order: number
): string => `${parentId}:${order}`;

/**
 * Construye una secuencia de actualizaciones que evita ocupar temporalmente
 * una posición que todavía pertenece a otro hermano. El módulo que se mueve
 * sale primero a una posición temporal libre y vuelve a su posición final
 * después de desplazar al resto de hermanos.
 */
export const buildSafeModuloReorderSequence = (
  originalById: ReadonlyMap<
    number,
    ModuloMutationState
  >,
  changedModules: readonly ModuloMutationState[],
  updatedCurrent: ModuloMutationState
): ModuloMutationState[] => {
  const currentOriginal =
    originalById.get(updatedCurrent.idModulo);

  if (
    !currentOriginal ||
    !hasModuloPositionChanged(
      currentOriginal,
      updatedCurrent
    ) ||
    updatedCurrent.idPadre === 0
  ) {
    return [...changedModules];
  }

  const maximumTargetOrder = Math.max(
    updatedCurrent.orden,
    ...[...originalById.values()]
      .filter(
        (module) =>
          module.idPadre === updatedCurrent.idPadre &&
          module.idModulo !== updatedCurrent.idModulo
      )
      .map((module) => module.orden),
    ...changedModules
      .filter(
        (module) =>
          module.idPadre === updatedCurrent.idPadre &&
          module.idModulo !== updatedCurrent.idModulo
      )
      .map((module) => module.orden)
  );

  const temporaryCurrent: ModuloMutationState = {
    ...updatedCurrent,
    orden: maximumTargetOrder + 2,
  };

  const occupancy = new Map<string, number>();
  const currentPositions = new Map<
    number,
    { parentId: number; order: number }
  >();

  originalById.forEach((module) => {
    if (module.idModulo === updatedCurrent.idModulo) {
      return;
    }

    occupancy.set(
      getPositionKey(module.idPadre, module.orden),
      module.idModulo
    );
    currentPositions.set(
      module.idModulo,
      {
        parentId: module.idPadre,
        order: module.orden,
      }
    );
  });

  occupancy.set(
    getPositionKey(
      temporaryCurrent.idPadre,
      temporaryCurrent.orden
    ),
    temporaryCurrent.idModulo
  );
  currentPositions.set(
    temporaryCurrent.idModulo,
    {
      parentId: temporaryCurrent.idPadre,
      order: temporaryCurrent.orden,
    }
  );

  const pendingPositionUpdates = changedModules
    .filter((module) => {
      if (module.idModulo === updatedCurrent.idModulo) {
        return false;
      }

      const original = originalById.get(module.idModulo);

      return Boolean(
        original &&
        hasModuloPositionChanged(original, module)
      );
    })
    .map((module) => ({ ...module }));

  const orderedPositionUpdates: ModuloMutationState[] = [];

  while (pendingPositionUpdates.length > 0) {
    const availableIndex =
      pendingPositionUpdates.findIndex((module) => {
        const occupant = occupancy.get(
          getPositionKey(module.idPadre, module.orden)
        );

        return (
          occupant === undefined ||
          occupant === module.idModulo
        );
      });

    if (availableIndex < 0) {
      throw new Error(
        'No se pudo construir una secuencia segura para reordenar los módulos.'
      );
    }

    const [module] = pendingPositionUpdates.splice(
      availableIndex,
      1
    );

    if (!module) {
      continue;
    }

    const previousPosition =
      currentPositions.get(module.idModulo);

    if (previousPosition) {
      occupancy.delete(
        getPositionKey(
          previousPosition.parentId,
          previousPosition.order
        )
      );
    }

    occupancy.set(
      getPositionKey(module.idPadre, module.orden),
      module.idModulo
    );
    currentPositions.set(
      module.idModulo,
      {
        parentId: module.idPadre,
        order: module.orden,
      }
    );
    orderedPositionUpdates.push(module);
  }

  const remainingUpdates = changedModules.filter((module) => {
    if (module.idModulo === updatedCurrent.idModulo) {
      return false;
    }

    const original = originalById.get(module.idModulo);

    return !(
      original &&
      hasModuloPositionChanged(original, module)
    );
  });

  return [
    temporaryCurrent,
    ...orderedPositionUpdates,
    updatedCurrent,
    ...remainingUpdates,
  ];
};
