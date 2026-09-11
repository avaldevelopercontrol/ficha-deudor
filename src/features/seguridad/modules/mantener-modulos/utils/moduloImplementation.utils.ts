import {
  hasRegisteredOptionRoute,
} from '@features/access-control';

import type {
  Modulo,
  ModuloImplementacion,
} from '../../../types/opcion.types';

const buildParentIdsWithChildren = (
  modulos: readonly Modulo[]
): ReadonlySet<number> =>
  new Set(
    modulos
      .map((modulo) => modulo.idPadre)
      .filter((parentId) => parentId > 0)
  );

const resolveModuloImplementacionWithParentIndex = (
  modulo: Modulo,
  parentIdsWithChildren: ReadonlySet<number>
): ModuloImplementacion => {
  if (
    hasRegisteredOptionRoute(
      modulo.idModulo
    )
  ) {
    return 'IMPLEMENTADO';
  }

  if (modulo.urlBI?.trim()) {
    return 'POWER BI';
  }

  if (
    modulo.tipo === 1 ||
    parentIdsWithChildren.has(
      modulo.idModulo
    )
  ) {
    return 'AGRUPADOR';
  }

  return 'SIN IMPLEMENTAR';
};

export const resolveModuloImplementacion = (
  modulo: Modulo,
  modulos: readonly Modulo[]
): ModuloImplementacion =>
  resolveModuloImplementacionWithParentIndex(
    modulo,
    buildParentIdsWithChildren(modulos)
  );

/**
 * Resuelve la implementación de la colección completa construyendo una sola
 * vez el índice de módulos que tienen hijos. Evita el `.some()` por cada fila
 * de la tabla de mantenimiento.
 */
export const attachModuloImplementacion = (
  modulos: readonly Modulo[]
): Modulo[] => {
  const parentIdsWithChildren =
    buildParentIdsWithChildren(modulos);

  return modulos.map((modulo) => ({
    ...modulo,
    implementacion:
      resolveModuloImplementacionWithParentIndex(
        modulo,
        parentIdsWithChildren
      ),
  }));
};
