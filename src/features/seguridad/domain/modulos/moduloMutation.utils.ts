import type {
  ModuloMutationState,
} from './moduloMutation.types';

export const hasModuloMutationChanged = (
  original: ModuloMutationState,
  updated: ModuloMutationState
): boolean =>
  original.codigo !== updated.codigo ||
  original.nombre !== updated.nombre ||
  original.descripcion !== updated.descripcion ||
  original.ruta !== updated.ruta ||
  original.urlBI !== updated.urlBI ||
  original.imagenOpcion !== updated.imagenOpcion ||
  original.emailOpcion !== updated.emailOpcion ||
  original.icono !== updated.icono ||
  original.tipo !== updated.tipo ||
  original.idPadre !== updated.idPadre ||
  original.orden !== updated.orden ||
  original.visible !== updated.visible ||
  original.estado !== updated.estado;

export const hasModuloPositionChanged = (
  original: ModuloMutationState,
  updated: ModuloMutationState
): boolean =>
  original.idPadre !== updated.idPadre ||
  original.orden !== updated.orden;
