import {
  createObjectGuard,
  isBoolean,
  isInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type { GestionBotonApi } from '../types/gestionBoton.types';

export const isGestionBotonApi =
  createObjectGuard<GestionBotonApi>({
    nId_Boton: isInteger,
    nId_Cliente: isInteger,
    nId_Contrato: isInteger,
    nombreBoton: isString,
    descripcionBoton: isString,
    bEstado: isBoolean,
  });
