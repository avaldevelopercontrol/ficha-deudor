import type {
  Email,
  EmailFormData,
  EmailEditFormData,
} from '../types/email.types';

import { normalizeEmailForComparison } from '../utils/emailNormalization.utils';

type EmailFormErrors = Record<string, string>;

export const EMAIL_DUPLICADO_MESSAGE =
  'El email ya se encuentra registrado';

function validateEmailBase(
  data: EmailFormData
): EmailFormErrors {
  const errors: EmailFormErrors = {};
  const email = data.email.trim();

  if (!email) {
    errors.email =
      'El email es obligatorio';
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    errors.email =
      'El formato del email no es válido';
  }

  if (
    !data.contacto ||
    data.contacto.trim() === ''
  ) {
    errors.contacto =
      'El contacto es obligatorio';
  }

  if (
    !data.prioridad ||
    data.prioridad === ''
  ) {
    errors.prioridad =
      'La prioridad es obligatoria';
  }

  if (
    data.status === undefined ||
    data.status === null ||
    data.status === ''
  ) {
    errors.status =
      'El status es obligatorio';
  }

  if (
    data.estado === true &&
    data.status !== '1'
  ) {
    errors.status =
      'Para estado Activo, el status debe ser Operativo';
  }

  return errors;
}

function validateEmailDuplicado(
  data: EmailFormData,
  emailsExistentes: readonly Email[],
  emailIdActual: string | null,
  errors: EmailFormErrors
): void {
  /*
   * Si ya existe un error de obligatoriedad
   * o formato, no lo reemplazamos.
   */
  if (errors.email) {
    return;
  }

  const emailIngresado =
    normalizeEmailForComparison(
      data.email
    );

  if (!emailIngresado) {
    return;
  }

  const existeDuplicado =
    emailsExistentes.some(
      (email) => {
        /*
         * En edición se excluye el registro actual.
         * Esto permite guardar sin cambiar el email.
         */
        if (
          emailIdActual !== null &&
          String(email.id) ===
            String(emailIdActual)
        ) {
          return false;
        }

        const emailExistente =
          normalizeEmailForComparison(
            email.email
          );

        return (
          emailExistente === emailIngresado
        );
      }
    );

  if (existeDuplicado) {
    errors.email =
      EMAIL_DUPLICADO_MESSAGE;
  }
}

/**
 * Validación para registrar.
 */
export function validateEmailForm(
  data: EmailFormData,
  emailsExistentes:
    readonly Email[] = []
): EmailFormErrors {
  const errors =
    validateEmailBase(data);

  validateEmailDuplicado(
    data,
    emailsExistentes,
    null,
    errors
  );

  return errors;
}

/**
 * Validación para editar.
 */
export function validateEmailEditForm(
  data: EmailEditFormData,
  emailsExistentes:
    readonly Email[] = [],
  emailIdActual: string | null =
    data.id || null
): EmailFormErrors {
  const errors =
    validateEmailBase(data);

  if (
    !data.id ||
    data.id.trim() === ''
  ) {
    errors.id =
      'El ID del email es obligatorio';
  }

  validateEmailDuplicado(
    data,
    emailsExistentes,
    emailIdActual,
    errors
  );

  return errors;
}