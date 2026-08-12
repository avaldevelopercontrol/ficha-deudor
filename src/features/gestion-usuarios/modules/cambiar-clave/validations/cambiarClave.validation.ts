import type {
  CambiarClaveFormData,
  CambiarClaveFormErrors,
} from '../../../types/cambiarClave.types';

import {
  areUsuarioPasswordRequirementsMet,
  getUsuarioPasswordRequirementStatus,
  type UsuarioPasswordRequirementStatus,
} from '../../../validations/usuarioPassword.validation';

export type CambiarClaveRequirementStatus =
  UsuarioPasswordRequirementStatus;

export const getCambiarClaveRequirementStatus =
  getUsuarioPasswordRequirementStatus;

export const areCambiarClaveRequirementsMet =
  areUsuarioPasswordRequirementsMet;

export const validateCambiarClaveForm = (
  form: CambiarClaveFormData
): CambiarClaveFormErrors => {
  const errors: CambiarClaveFormErrors = {};

  if (!form.claveActual) {
    errors.claveActual =
      'Ingrese su clave actual.';
  }

  if (!form.claveNueva) {
    errors.claveNueva =
      'Ingrese una nueva clave.';
  } else if (
    !areCambiarClaveRequirementsMet(
      form.claveNueva
    )
  ) {
    errors.claveNueva =
      'La nueva clave debe cumplir todos los requisitos indicados.';
  } else if (
    form.claveActual &&
    form.claveNueva ===
      form.claveActual
  ) {
    errors.claveNueva =
      'La nueva clave debe ser diferente de la clave actual.';
  }

  if (!form.confirmarClaveNueva) {
    errors.confirmarClaveNueva =
      'Confirme su nueva clave.';
  } else if (
    form.claveNueva !==
    form.confirmarClaveNueva
  ) {
    errors.confirmarClaveNueva =
      'La confirmación no coincide con la nueva clave.';
  }

  return errors;
};
