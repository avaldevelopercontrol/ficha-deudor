import {
  createObjectGuard,
  isInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type { GestorApi } from '../types/gestor.types';

export const isGestorApi = createObjectGuard<GestorApi>({
  id: isInteger,
  nombre: isString,
  perfil: isString,
  login: isString,
  subZona: isString,
  codRecaudacion: isString,
});
