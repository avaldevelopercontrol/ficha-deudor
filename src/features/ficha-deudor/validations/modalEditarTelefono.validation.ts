import { isEmptyValue } from '@shared/utils/validators';
import type { TelefonoFormData } from '../../../shared/types';
import { validateTelefonoEditForm } from './telefonoValidations';

export const validateModalEditarTelefono = (
  data: TelefonoFormData
): Record<string, string> => {
  const errors = validateTelefonoEditForm(data);

  if (isEmptyValue(data.prioridad)) {
    errors.prioridad = 'La prioridad es obligatoria';
  }

  if (isEmptyValue(data.horarioGestion)) {
    errors.horarioGestion = 'El horario de gestión es obligatorio';
  }

  if (isEmptyValue(data.fuenteBusqueda)) {
    errors.fuenteBusqueda = 'La fuente de búsqueda es obligatoria';
  }

  return errors;
};