import type {
  TelefonoFormData,
  TelefonoReferenciado,
} from '../types/telefono.types';

import { validateTelefonoEditForm } from './telefonoValidations';

export const validateModalEditarTelefono = (
  data: TelefonoFormData,
  telefonosExistentes:
    readonly TelefonoReferenciado[] = [],
  telefonoIdActual: number | null =
    data.id || null
): Record<string, string> => {
  return validateTelefonoEditForm(
    data,
    telefonosExistentes,
    telefonoIdActual
  );
};