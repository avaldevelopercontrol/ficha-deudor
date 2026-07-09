import type { TelefonoFormData } from '../types/telefono.types';
import { isEmptyValue } from '@shared/utils/validators';

type TelefonoFormErrors = Record<string, string>;

const MAX_ANEXO_LENGTH = 10;
const MAX_COMENTARIO_LENGTH = 500;
const MIN_TELEFONO_LENGTH = 6;

function isValidTelefonoFormat(value: string): boolean {
  return /^[0-9+\-\s]+$/.test(value);
}

function validateTelefonoBase(data: TelefonoFormData): TelefonoFormErrors {
  const errors: TelefonoFormErrors = {};
  const numero = data.numero.trim();

  if (isEmptyValue(numero)) {
    errors.numero = 'El número telefónico es obligatorio';
  } else if (numero.length < MIN_TELEFONO_LENGTH) {
    errors.numero = 'El número debe tener al menos 6 dígitos';
  } else if (!isValidTelefonoFormat(numero)) {
    errors.numero = 'Ingrese un número telefónico válido';
  }

  if (isEmptyValue(data.resultado)) {
    errors.resultado = 'El resultado es obligatorio';
  }

  if (isEmptyValue(data.operadorTelefonico)) {
    errors.operadorTelefonico = 'El operador es obligatorio';
  }

  if (isEmptyValue(data.ubicacion)) {
    errors.ubicacion = 'La ubicación es obligatoria';
  }

  if (!isEmptyValue(data.anexo) && data.anexo.length > MAX_ANEXO_LENGTH) {
    errors.anexo = 'El anexo no puede tener más de 10 caracteres';
  }

  if (
    !isEmptyValue(data.comentario) &&
    data.comentario.length > MAX_COMENTARIO_LENGTH
  ) {
    errors.comentario = 'El comentario no puede exceder 500 caracteres';
  }

  return errors;
}

// Validación para registrar teléfono
export const validateTelefonoForm = (
  data: TelefonoFormData
): TelefonoFormErrors => {
  return validateTelefonoBase(data);
};

// Validación para editar teléfono
export const validateTelefonoEditForm = (
  data: TelefonoFormData
): TelefonoFormErrors => {
  return validateTelefonoBase(data);
};