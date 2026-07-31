import type {
  Perfil,
} from '../../../types/perfil.types';

import {
  MODAL_REGISTRAR_PERFIL_LIMITS,
} from '../constants/modalRegistrarPerfil.constants';

import type {
  RegistrarPerfilFormData,
} from '../types/registrarPerfil.types';

interface PerfilFormValidationOptions {
  perfilesExistentes?:
    readonly Perfil[];

  /**
   * Se utiliza durante la edición para
   * excluir de la validación al mismo perfil.
   */
  perfilIdActual?: number;
}

const normalizeUniqueValue = (
  value: string
): string =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es-PE');

export const normalizeRegistrarPerfilForm = (
  form: RegistrarPerfilFormData
): RegistrarPerfilFormData => ({
  nombrePerfil:
    form.nombrePerfil.trim(),

  abreviatura:
    form.abreviatura.trim(),

  estado:
    form.estado,
});

export const validateRegistrarPerfilForm = (
  form: RegistrarPerfilFormData,
  {
    perfilesExistentes = [],
    perfilIdActual,
  }: PerfilFormValidationOptions = {}
): Record<string, string> => {
  const errors:
    Record<string, string> = {};

  const normalizedForm =
    normalizeRegistrarPerfilForm(
      form
    );

  const nombreNormalizado =
    normalizeUniqueValue(
      normalizedForm.nombrePerfil
    );

  const abreviaturaNormalizada =
    normalizeUniqueValue(
      normalizedForm.abreviatura
    );

  /*
   * Durante la edición se excluye el
   * perfil que actualmente se está modificando.
   */
  const otrosPerfiles =
    perfilesExistentes.filter(
      (perfil) =>
        perfil.idPerfil !==
        perfilIdActual
    );

  if (
    !normalizedForm.nombrePerfil
  ) {
    errors.nombrePerfil =
      'El nombre del perfil es obligatorio.';
  } else if (
    normalizedForm.nombrePerfil.length >
    MODAL_REGISTRAR_PERFIL_LIMITS
      .nombrePerfil
  ) {
    errors.nombrePerfil =
      `El nombre del perfil debe tener como máximo ${
        MODAL_REGISTRAR_PERFIL_LIMITS
          .nombrePerfil
      } caracteres.`;
  } else if (
    otrosPerfiles.some(
      (perfil) =>
        normalizeUniqueValue(
          perfil.nombrePerfil
        ) === nombreNormalizado
    )
  ) {
    errors.nombrePerfil =
      'Ya existe un perfil con el mismo nombre.';
  }

  if (
    !normalizedForm.abreviatura
  ) {
    errors.abreviatura =
      'La abreviatura es obligatoria.';
  } else if (
    normalizedForm.abreviatura.length >
    MODAL_REGISTRAR_PERFIL_LIMITS
      .abreviatura
  ) {
    errors.abreviatura =
      `La abreviatura debe tener como máximo ${
        MODAL_REGISTRAR_PERFIL_LIMITS
          .abreviatura
      } caracteres.`;
  } else if (
    otrosPerfiles.some(
      (perfil) =>
        normalizeUniqueValue(
          perfil.abreviatura
        ) ===
        abreviaturaNormalizada
    )
  ) {
    errors.abreviatura =
      'Ya existe un perfil con la misma abreviatura.';
  }

  if (
    normalizedForm.estado !== 0 &&
    normalizedForm.estado !== 1
  ) {
    errors.estado =
      'El estado seleccionado no es válido.';
  }

  return errors;
};