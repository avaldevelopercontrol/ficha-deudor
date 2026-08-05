import type {
  Modulo,
} from '../../../types/opcion.types';

interface ModuloAvailabilityForm {
  visible: boolean;
  estado: boolean;
}

export interface ModuloAvailabilityErrors {
  estado?: string;
  visible?: string;
}

const summarizeModules = (
  modules: readonly Modulo[]
): string => {
  const labels = modules
    .slice(0, 3)
    .map(
      (module) =>
        module.nombre ||
        module.codigo ||
        `Id ${module.idModulo}`
    );

  const remaining =
    modules.length - labels.length;

  if (remaining > 0) {
    labels.push(
      `y ${remaining} más`
    );
  }

  return labels.join(', ');
};

export const normalizeModuloAvailability = <
  TForm extends ModuloAvailabilityForm,
>(
  form: TForm
): TForm => {
  if (form.estado) {
    return form;
  }

  return {
    ...form,
    visible: false,
  };
};

export const getModuloDescendants = (
  moduloId: number,
  modulos: readonly Modulo[]
): Modulo[] => {
  const descendants: Modulo[] = [];
  const visitedIds = new Set<number>([
    moduloId,
  ]);
  const pendingParentIds = [
    moduloId,
  ];

  while (pendingParentIds.length > 0) {
    const parentId =
      pendingParentIds.shift();

    if (parentId === undefined) {
      continue;
    }

    modulos.forEach((modulo) => {
      if (
        modulo.idPadre !== parentId ||
        visitedIds.has(modulo.idModulo)
      ) {
        return;
      }

      visitedIds.add(modulo.idModulo);
      descendants.push(modulo);
      pendingParentIds.push(
        modulo.idModulo
      );
    });
  }

  return descendants;
};

export const validateModuloAvailabilityTransition = (
  form: ModuloAvailabilityForm,
  moduloId: number,
  modulos: readonly Modulo[]
): ModuloAvailabilityErrors => {
  const currentModule =
    modulos.find(
      (module) =>
        module.idModulo ===
        moduloId
    );

  if (!currentModule) {
    return {};
  }

  const normalizedForm =
    normalizeModuloAvailability(
      form
    );

  const descendants =
    getModuloDescendants(
      moduloId,
      modulos
    );

  const errors:
    ModuloAvailabilityErrors = {};

  if (
    currentModule.estadoActivo &&
    !normalizedForm.estado
  ) {
    const activeDescendants =
      descendants.filter(
        (module) =>
          module.estadoActivo
      );

    if (
      activeDescendants.length > 0
    ) {
      errors.estado =
        `Para inactivar este módulo, primero inactive sus opciones hijas activas: ${summarizeModules(activeDescendants)}.`;
    }
  }

  if (
    currentModule.visibleActivo &&
    !normalizedForm.visible
  ) {
    const visibleDescendants =
      descendants.filter(
        (module) =>
          module.visibleActivo
      );

    if (
      visibleDescendants.length > 0
    ) {
      errors.visible =
        `Para ocultar este módulo, primero oculte sus opciones hijas visibles: ${summarizeModules(visibleDescendants)}.`;
    }
  }

  return errors;
};

export const assertModuloAvailabilityTransition = (
  form: ModuloAvailabilityForm,
  moduloId: number,
  modulos: readonly Modulo[]
): void => {
  const errors =
    validateModuloAvailabilityTransition(
      form,
      moduloId,
      modulos
    );

  const firstError =
    errors.estado ??
    errors.visible;

  if (firstError) {
    throw new Error(firstError);
  }
};
