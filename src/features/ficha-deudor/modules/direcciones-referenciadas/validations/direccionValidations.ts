import type {
  DireccionFormData,
  DireccionEditFormData,
  DireccionReferenciada,
} from '../types/direccion.types';

import { isEmptyValue } from '@shared/utils/validators';

import { normalizeDireccionForComparison } from '../utils/direccionNormalization.utils';

type DireccionValidationData =
  | DireccionFormData
  | DireccionEditFormData;

type DireccionFormErrors =
  Record<string, string>;

const MIN_DIRECCION_LENGTH = 5;
const MAX_DIRECCION_LENGTH = 200;
const MAX_COMENTARIO_LENGTH = 500;

export const DIRECCION_DUPLICADA_MESSAGE =
  'La dirección ya se encuentra registrada';

function validateDireccionBase(
  data: DireccionValidationData
): DireccionFormErrors {
  const errors: DireccionFormErrors = {};

  const direccion = data.direccion.trim();

  if (isEmptyValue(direccion)) {
    errors.direccion =
      'La dirección es obligatoria';
  } else if (
    direccion.length < MIN_DIRECCION_LENGTH
  ) {
    errors.direccion =
      'Ingrese una dirección más completa (mínimo 5 caracteres)';
  } else if (
    direccion.length > MAX_DIRECCION_LENGTH
  ) {
    errors.direccion =
      'La dirección no puede exceder 200 caracteres';
  }

  if (isEmptyValue(data.departamento)) {
    errors.departamento =
      'Seleccione un departamento';
  }

  if (isEmptyValue(data.provincia)) {
    errors.provincia =
      'Seleccione una provincia';
  }

  if (isEmptyValue(data.distrito)) {
    errors.distrito =
      'Seleccione un distrito';
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

function validateDireccionDuplicada(
  data: DireccionValidationData,
  direccionesExistentes:
    readonly DireccionReferenciada[],
  direccionIdActual: string | null,
  errors: DireccionFormErrors
): void {
  /*
   * No reemplaza errores anteriores como:
   * obligatorio, longitud mínima o longitud máxima.
   */
  if (errors.direccion) {
    return;
  }

  const direccionNormalizada =
    normalizeDireccionForComparison(
      data.direccion
    );

  if (!direccionNormalizada) {
    return;
  }

  const existeDuplicado =
    direccionesExistentes.some(
      (direccion) => {
        /*
         * Cuando se edita, se excluye la propia
         * dirección del registro actual.
         *
         * Así se permite guardar sin modificarla.
         */
        if (
          direccionIdActual !== null &&
          String(direccion.id) ===
            String(direccionIdActual)
        ) {
          return false;
        }

        const direccionExistenteNormalizada =
          normalizeDireccionForComparison(
            direccion.direccion
          );

        return (
          direccionExistenteNormalizada ===
          direccionNormalizada
        );
      }
    );

  if (existeDuplicado) {
    errors.direccion =
      DIRECCION_DUPLICADA_MESSAGE;
  }
}

/**
 * Validación para registrar una dirección.
 */
export const validateDireccionForm = (
  data: DireccionFormData,
  direccionesExistentes:
    readonly DireccionReferenciada[] = []
): DireccionFormErrors => {
  const errors =
    validateDireccionBase(data);

  validateDireccionDuplicada(
    data,
    direccionesExistentes,
    null,
    errors
  );

  return errors;
};

/**
 * Validación para editar una dirección.
 *
 * direccionIdActual permite excluir el registro
 * que se está modificando.
 */
export const validateDireccionEditForm = (
  data: DireccionEditFormData,
  direccionesExistentes:
    readonly DireccionReferenciada[] = [],
  direccionIdActual: string | null =
    data.id || null
): DireccionFormErrors => {
  const errors =
    validateDireccionBase(data);

  validateDireccionDuplicada(
    data,
    direccionesExistentes,
    direccionIdActual,
    errors
  );

  return errors;
};