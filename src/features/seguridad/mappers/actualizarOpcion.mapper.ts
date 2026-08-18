import {
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';

import type {
  EditarModuloFormData,
} from '../modules/mantener-modulos/types/editarModulo.types';

import {
  buildModuloRoute,
} from '../modules/mantener-modulos/utils/registrarModulo.utils';

import {
  assertModuloAvailabilityTransition,
  normalizeModuloAvailability,
} from '../modules/mantener-modulos/utils/moduloAvailability.utils';

import type {
  UpdateOpcionRequestApi,
} from '../types/actualizarOpcion.types';

import type {
  Modulo,
  OpcionApi,
} from '../types/opcion.types';

interface MutableModulo {
  idModulo: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  ruta: string;
  urlBI: string;
  icono: string;
  tipo: number;
  idPadre: number;
  orden: number;
  visible: boolean;
  estado: boolean;
}

const parseAuthenticatedUserId = (
  value: string
): number => {
  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0
  ) {
    throw new Error(
      'No se pudo identificar al usuario autenticado que modifica la operación.'
    );
  }

  return parsedValue;
};

const mapModuloToMutable = (
  modulo: Modulo
): MutableModulo => ({
  idModulo: modulo.idModulo,
  codigo: modulo.codigo,
  nombre: modulo.nombre,
  descripcion: modulo.descripcion,
  ruta: modulo.ruta,
  urlBI: modulo.urlBI?.trim() ?? '',
  icono: modulo.icono,
  tipo: modulo.tipo,
  idPadre: modulo.idPadre,
  orden: modulo.orden,
  visible: modulo.visibleActivo,
  estado: modulo.estadoActivo,
});

const mapOpcionApiToMutable = (
  modulo: OpcionApi
): MutableModulo => ({
  idModulo: Number(modulo.nId_Opcion),
  codigo:
    modulo.sCodigoOpcion?.trim() ?? '',
  nombre:
    modulo.sNombreOpcion?.trim() ?? '',
  descripcion:
    modulo.sDescripcionOpcion?.trim() ?? '',
  ruta:
    modulo.sUrlOpcion?.trim() ?? '',
  urlBI:
    modulo.sUrlBI?.trim() ?? '',
  icono:
    modulo.sIcono?.trim() ?? '',
  tipo: Number(modulo.nTipo) || 0,
  idPadre:
    Number(modulo.nId_OpcionPadre) || 0,
  orden: Number(modulo.nOrden) || 0,
  visible: Boolean(modulo.bVisible),
  estado: Boolean(modulo.bEstado),
});

const hasChanged = (
  original: MutableModulo,
  updated: MutableModulo
): boolean =>
  original.codigo !== updated.codigo ||
  original.nombre !== updated.nombre ||
  original.descripcion !== updated.descripcion ||
  original.ruta !== updated.ruta ||
  original.urlBI !== updated.urlBI ||
  original.icono !== updated.icono ||
  original.tipo !== updated.tipo ||
  original.idPadre !== updated.idPadre ||
  original.orden !== updated.orden ||
  original.visible !== updated.visible ||
  original.estado !== updated.estado;


const hasPositionChanged = (
  original: MutableModulo,
  updated: MutableModulo
): boolean =>
  original.idPadre !== updated.idPadre ||
  original.orden !== updated.orden;

const getPositionKey = (
  parentId: number,
  order: number
): string =>
  `${parentId}:${order}`;

const buildSafeReorderSequence = (
  originalById: ReadonlyMap<
    number,
    MutableModulo
  >,
  changedModules: readonly MutableModulo[],
  updatedCurrent: MutableModulo
): MutableModulo[] => {
  const currentOriginal =
    originalById.get(
      updatedCurrent.idModulo
    );

  if (
    !currentOriginal ||
    !hasPositionChanged(
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
          module.idPadre ===
            updatedCurrent.idPadre &&
          module.idModulo !==
            updatedCurrent.idModulo
      )
      .map((module) => module.orden),
    ...changedModules
      .filter(
        (module) =>
          module.idPadre ===
            updatedCurrent.idPadre &&
          module.idModulo !==
            updatedCurrent.idModulo
      )
      .map((module) => module.orden)
  );

  // Se usa una posición temporal libre para sacar al módulo actual
  // del rango ocupado antes de mover a sus hermanos. Esto evita
  // colisiones cuando la base de datos exige que el orden sea único
  // dentro de un mismo padre.
  const temporaryCurrent: MutableModulo = {
    ...updatedCurrent,
    orden: maximumTargetOrder + 2,
  };

  const occupancy = new Map<
    string,
    number
  >();

  const currentPositions = new Map<
    number,
    {
      parentId: number;
      order: number;
    }
  >();

  originalById.forEach((module) => {
    if (
      module.idModulo ===
      updatedCurrent.idModulo
    ) {
      return;
    }

    occupancy.set(
      getPositionKey(
        module.idPadre,
        module.orden
      ),
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
      parentId:
        temporaryCurrent.idPadre,
      order: temporaryCurrent.orden,
    }
  );

  const pendingPositionUpdates =
    changedModules
      .filter((module) => {
        if (
          module.idModulo ===
          updatedCurrent.idModulo
        ) {
          return false;
        }

        const original =
          originalById.get(
            module.idModulo
          );

        return Boolean(
          original &&
          hasPositionChanged(
            original,
            module
          )
        );
      })
      .map((module) => ({
        ...module,
      }));

  const orderedPositionUpdates:
    MutableModulo[] = [];

  while (
    pendingPositionUpdates.length > 0
  ) {
    const availableIndex =
      pendingPositionUpdates.findIndex(
        (module) => {
          const occupant =
            occupancy.get(
              getPositionKey(
                module.idPadre,
                module.orden
              )
            );

          return (
            occupant === undefined ||
            occupant === module.idModulo
          );
        }
      );

    if (availableIndex < 0) {
      throw new Error(
        'No se pudo construir una secuencia segura para reordenar los módulos.'
      );
    }

    const [module] =
      pendingPositionUpdates.splice(
        availableIndex,
        1
      );

    const previousPosition =
      currentPositions.get(
        module.idModulo
      );

    if (previousPosition) {
      occupancy.delete(
        getPositionKey(
          previousPosition.parentId,
          previousPosition.order
        )
      );
    }

    occupancy.set(
      getPositionKey(
        module.idPadre,
        module.orden
      ),
      module.idModulo
    );

    currentPositions.set(
      module.idModulo,
      {
        parentId: module.idPadre,
        order: module.orden,
      }
    );

    orderedPositionUpdates.push(
      module
    );
  }

  const remainingUpdates =
    changedModules.filter((module) => {
      if (
        module.idModulo ===
        updatedCurrent.idModulo
      ) {
        return false;
      }

      const original =
        originalById.get(
          module.idModulo
        );

      return !(
        original &&
        hasPositionChanged(
          original,
          module
        )
      );
    });

  return [
    temporaryCurrent,
    ...orderedPositionUpdates,
    updatedCurrent,
    ...remainingUpdates,
  ];
};

const sortByOrder = (
  left: MutableModulo,
  right: MutableModulo
): number => {
  if (left.orden !== right.orden) {
    return left.orden - right.orden;
  }

  return left.idModulo - right.idModulo;
};

const resolveRouteSegment = (
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

  const segments =
    normalizedRoute
      .split('/')
      .filter(Boolean);

  return (
    segments.at(-1) ??
    fallbackCode.trim()
  );
};

const renumberParentChildren = (
  modulesById: Map<number, MutableModulo>,
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

  children.forEach(
    (module, index) => {
      modulesById.set(
        module.idModulo,
        {
          ...module,
          orden: index + 1,
        }
      );
    }
  );
};

const cascadeHierarchyValues = (
  modulesById: Map<number, MutableModulo>,
  rootModuloId: number
): void => {
  const pendingParentIds = [
    rootModuloId,
  ];

  while (pendingParentIds.length > 0) {
    const parentId =
      pendingParentIds.shift();

    if (parentId === undefined) {
      continue;
    }

    const parent =
      modulesById.get(parentId);

    if (!parent) {
      continue;
    }

    const children = [
      ...modulesById.values(),
    ].filter(
      (module) =>
        module.idPadre === parentId
    );

    children.forEach((child) => {
      const routeSegment =
        resolveRouteSegment(
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

const toUpdateRequest = (
  modulo: MutableModulo,
  authenticatedUserId: number,
  modifiedAt: string
): UpdateOpcionRequestApi => ({
  nId_Opcion: modulo.idModulo,
  sCodigoOpcion: modulo.codigo,
  sNombreOpcion: modulo.nombre,
  sDescripcionOpcion: modulo.descripcion,
  sUrlOpcion: modulo.ruta,
  sUrlBI: modulo.urlBI,
  sIcono: modulo.icono,
  nTipo: modulo.tipo,
  nId_OpcionPadre: modulo.idPadre,
  nOrden: modulo.orden,
  bVisible: modulo.visible,
  bEstado: modulo.estado,
  nModifica: authenticatedUserId,
  dFechaModifica: modifiedAt,
});

export const buildUpdateOpcionRequests = (
  moduloDetalle: OpcionApi,
  form: EditarModuloFormData,
  modulos: readonly Modulo[],
  authenticatedUserId: string,
  currentDate = new Date()
): UpdateOpcionRequestApi[] => {
  const currentModuloId =
    Number(moduloDetalle.nId_Opcion);

  const normalizedForm =
    normalizeModuloAvailability(
      form
    );

  assertModuloAvailabilityTransition(
    normalizedForm,
    currentModuloId,
    modulos
  );

  const originalCurrent =
    mapOpcionApiToMutable(
      moduloDetalle
    );

  const originalById = new Map<
    number,
    MutableModulo
  >(
    modulos.map((modulo) => [
      modulo.idModulo,
      mapModuloToMutable(modulo),
    ])
  );

  originalById.set(
    currentModuloId,
    originalCurrent
  );

  const modulesById = new Map(
    [...originalById.entries()].map(
      ([id, modulo]) => [
        id,
        {
          ...modulo,
        },
      ]
    )
  );

  const originalParentId =
    originalCurrent.idPadre;

  if (
    originalParentId === 0 &&
    normalizedForm.padreId !== 0
  ) {
    throw new Error(
      'La opción raíz no puede asignarse a otro padre.'
    );
  }

  const parentOption =
    normalizedForm.padreId === 0
      ? null
      : modulesById.get(
          normalizedForm.padreId
        );

  if (
    normalizedForm.padreId !== 0 &&
    !parentOption
  ) {
    throw new Error(
      'El padre seleccionado no se encuentra disponible.'
    );
  }

  const codigo = normalizedForm.codigo.trim();

  const currentRouteSegment =
    originalCurrent.codigo !== codigo
      ? codigo
      : resolveRouteSegment(
          originalCurrent.ruta,
          codigo
        );

  const hierarchyChanged =
    originalCurrent.idPadre !==
      normalizedForm.padreId ||
    originalCurrent.codigo !== codigo;

  const updatedRoute =
    !hierarchyChanged &&
    originalCurrent.ruta
      ? originalCurrent.ruta
      : parentOption
        ? buildModuloRoute(
            parentOption.ruta,
            currentRouteSegment
          )
        : buildModuloRoute(
            '',
            currentRouteSegment
          );

  const updatedCurrent:
    MutableModulo = {
      ...originalCurrent,
      codigo,
      nombre: normalizedForm.nombre.trim(),
      descripcion:
        normalizedForm.descripcion.trim(),
      ruta: updatedRoute,
      icono: normalizedForm.icono.trim(),
      tipo: parentOption
        ? parentOption.tipo + 1
        : originalCurrent.tipo,
      idPadre: normalizedForm.padreId,
      orden:
        normalizedForm.padreId === 0
          ? 0
          : normalizedForm.orden,
      visible: normalizedForm.visible,
      estado: normalizedForm.estado,
    };

  modulesById.set(
    currentModuloId,
    updatedCurrent
  );

  if (
    originalParentId !==
    updatedCurrent.idPadre
  ) {
    renumberParentChildren(
      modulesById,
      originalParentId,
      currentModuloId
    );
  }

  renumberParentChildren(
    modulesById,
    updatedCurrent.idPadre,
    currentModuloId,
    updatedCurrent.orden
  );

  cascadeHierarchyValues(
    modulesById,
    currentModuloId
  );

  const modifierId =
    parseAuthenticatedUserId(
      authenticatedUserId
    );

  const modifiedAt =
    getCurrentPeruDateTime(
      currentDate
    );

  const changedModules = [
    ...modulesById.values(),
  ].filter((updated) => {
    const original =
      originalById.get(
        updated.idModulo
      );

    return Boolean(
      original &&
      hasChanged(
        original,
        updated
      )
    );
  });

  changedModules.sort((left, right) => {
    if (left.tipo !== right.tipo) {
      return left.tipo - right.tipo;
    }

    return left.orden - right.orden;
  });

  const safeUpdateSequence =
    buildSafeReorderSequence(
      originalById,
      changedModules,
      updatedCurrent
    );

  return safeUpdateSequence.map(
    (modulo) =>
      toUpdateRequest(
        modulo,
        modifierId,
        modifiedAt
      )
  );
};
