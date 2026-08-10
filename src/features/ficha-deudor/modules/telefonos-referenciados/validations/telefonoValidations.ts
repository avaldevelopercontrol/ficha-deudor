import type {
  TelefonoFormData,
  TelefonoReferenciado,
} from '../types/telefono.types';

import { isEmptyValue } from '@shared/utils/validators';

import { normalizeTelefonoForComparison } from '../utils/telefonoNormalization.utils';

type TelefonoFormErrors = Record<string, string>;

const MAX_ANEXO_LENGTH = 10;
const MAX_COMENTARIO_LENGTH = 500;
const MIN_TELEFONO_LENGTH = 6;

export const TELEFONO_DUPLICADO_MESSAGE =
  'El número telefónico ya se encuentra registrado';

function isValidTelefonoFormat(
  value: string
): boolean {
  return /^[0-9+\-\s]+$/.test(value);
}

function validateTelefonoBase(
  data: TelefonoFormData
): TelefonoFormErrors {
  const errors: TelefonoFormErrors = {};
  const numero = data.numero.trim();

  if (isEmptyValue(numero)) {
    errors.numero =
      'El número telefónico es obligatorio';
  } else if (
    numero.length < MIN_TELEFONO_LENGTH
  ) {
    errors.numero =
      'El número debe tener al menos 6 dígitos';
  } else if (
    !isValidTelefonoFormat(numero)
  ) {
    errors.numero =
      'Ingrese un número telefónico válido';
  }

  if (isEmptyValue(data.resultado)) {
    errors.resultado =
      'El resultado es obligatorio';
  }

  if (
    isEmptyValue(data.operadorTelefonico)
  ) {
    errors.operadorTelefonico =
      'El operador es obligatorio';
  }

  if (isEmptyValue(data.ubicacion)) {
    errors.ubicacion =
      'La ubicación es obligatoria';
  }

  if (isEmptyValue(data.prioridad)) {
    errors.prioridad =
      'La prioridad es obligatoria';
  }

  if (
    isEmptyValue(data.horarioGestion)
  ) {
    errors.horarioGestion =
      'El horario de gestión es obligatorio';
  }

  if (
    isEmptyValue(data.fuenteBusqueda)
  ) {
    errors.fuenteBusqueda =
      'La fuente de búsqueda es obligatoria';
  }

  if (data.referencia <= 0) {
    errors.referencia =
      'La referencia es obligatoria';
  }

  if (
    !isEmptyValue(data.anexo) &&
    data.anexo.length > MAX_ANEXO_LENGTH
  ) {
    errors.anexo =
      'El anexo no puede tener más de 10 caracteres';
  }

  if (
    !isEmptyValue(data.comentario) &&
    data.comentario.length >
      MAX_COMENTARIO_LENGTH
  ) {
    errors.comentario =
      'El comentario no puede exceder 500 caracteres';
  }

  return errors;
}

function validateTelefonoDuplicado(
  data: TelefonoFormData,
  telefonosExistentes:
    readonly TelefonoReferenciado[],
  telefonoIdActual: number | null,
  errors: TelefonoFormErrors
): void {
  /*
   * Si el número ya tiene otro error, como obligatorio
   * o formato inválido, no se reemplaza ese mensaje.
   */
  if (errors.numero) {
    return;
  }

  const numeroIngresado =
    normalizeTelefonoForComparison(
      data.numero
    );

  if (!numeroIngresado) {
    return;
  }

  const existeDuplicado =
    telefonosExistentes.some(
      (telefono) => {
        /*
         * Durante la edición se ignora el registro
         * que se está modificando.
         *
         * De esta forma, guardar sin cambiar el
         * número no genera un falso duplicado.
         */
        if (
          telefonoIdActual !== null &&
          telefono.id === telefonoIdActual
        ) {
          return false;
        }

        const numeroExistente =
          normalizeTelefonoForComparison(
            telefono.numero
          );

        return (
          numeroExistente === numeroIngresado
        );
      }
    );

  if (existeDuplicado) {
    errors.numero =
      TELEFONO_DUPLICADO_MESSAGE;
  }
}

/**
 * Validación para registrar un teléfono.
 */
export const validateTelefonoForm = (
  data: TelefonoFormData,
  telefonosExistentes:
    readonly TelefonoReferenciado[] = []
): TelefonoFormErrors => {
  const errors =
    validateTelefonoBase(data);

  validateTelefonoDuplicado(
    data,
    telefonosExistentes,
    null,
    errors
  );

  return errors;
};

/**
 * Validación para editar un teléfono.
 *
 * telefonoIdActual permite ignorar el registro
 * que se está editando.
 */
export const validateTelefonoEditForm = (
  data: TelefonoFormData,
  telefonosExistentes:
    readonly TelefonoReferenciado[] = [],
  telefonoIdActual: number | null =
    data.id || null
): TelefonoFormErrors => {
  const errors =
    validateTelefonoBase(data);

  validateTelefonoDuplicado(
    data,
    telefonosExistentes,
    telefonoIdActual,
    errors
  );

  return errors;
};