import type {
  DireccionFormData,
  DireccionEditFormData,
} from '../types/direccion.types';
import { isEmptyValue } from '@shared/utils/validators';

type DireccionValidationData = DireccionFormData | DireccionEditFormData;
type DireccionFormErrors = Record<string, string>;

const MIN_DIRECCION_LENGTH = 5;
const MAX_DIRECCION_LENGTH = 200;
const MAX_COMENTARIO_LENGTH = 500;

function validateDireccionBase(
  data: DireccionValidationData
): DireccionFormErrors {
  const errors: DireccionFormErrors = {};

  const direccion = data.direccion.trim();

  if (isEmptyValue(direccion)) {
    errors.direccion = 'La dirección es obligatoria';
  } else if (direccion.length < MIN_DIRECCION_LENGTH) {
    errors.direccion = 'Ingrese una dirección más completa (mínimo 5 caracteres)';
  } else if (direccion.length > MAX_DIRECCION_LENGTH) {
    errors.direccion = 'La dirección no puede exceder 200 caracteres';
  }

  if (isEmptyValue(data.departamento)) {
    errors.departamento = 'Seleccione un departamento';
  }

  if (isEmptyValue(data.provincia)) {
    errors.provincia = 'Seleccione una provincia';
  }

  if (isEmptyValue(data.distrito)) {
    errors.distrito = 'Seleccione un distrito';
  }

  if (
    !isEmptyValue(data.comentario) &&
    data.comentario.length > MAX_COMENTARIO_LENGTH
  ) {
    errors.comentario = 'El comentario no puede exceder 500 caracteres';
  }

  return errors;
}

// Validación para registrar dirección
export const validateDireccionForm = (
  data: DireccionFormData
): DireccionFormErrors => {
  return validateDireccionBase(data);
};

// Validación para editar dirección
export const validateDireccionEditForm = (
  data: DireccionEditFormData
): DireccionFormErrors => {
  return validateDireccionBase(data);
};