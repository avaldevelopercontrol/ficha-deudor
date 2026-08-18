import {
  hasRegisteredOptionRoute,
} from '@features/access-control';

import type {
  Modulo,
  ModuloImplementacion,
} from '../../../types/opcion.types';

export const resolveModuloImplementacion = (
  modulo: Modulo,
  modulos: readonly Modulo[]
): ModuloImplementacion => {
  if (
    hasRegisteredOptionRoute(
      modulo.idModulo
    )
  ) {
    return 'IMPLEMENTADA';
  }

  const tieneHijos =
    modulos.some(
      (item) =>
        item.idPadre ===
        modulo.idModulo
    );

  if (
    modulo.tipo === 1 ||
    tieneHijos
  ) {
    return 'ESTRUCTURA';
  }

  return 'SIN PANTALLA';
};
