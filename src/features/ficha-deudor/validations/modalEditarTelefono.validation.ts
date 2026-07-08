import type { TelefonoFormData } from '../types';
import { validateTelefonoEditForm } from './telefonoValidations';

export const validateModalEditarTelefono = (
  data: TelefonoFormData
): Record<string, string> => {
  const errors = validateTelefonoEditForm(data);
  return errors;
};