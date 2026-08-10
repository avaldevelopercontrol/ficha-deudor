import type {
  ModuloFormData,
} from './registrarModulo.types';

export interface EditarModuloFormData
  extends ModuloFormData {
  orden: number;
}
