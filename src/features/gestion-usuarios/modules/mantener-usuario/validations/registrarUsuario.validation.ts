import type {
  SelectOption,
} from '@shared/types';

import {
  areUsuarioPasswordRequirementsMet,
} from '../../../validations/usuarioPassword.validation';

import {
  MODAL_REGISTRAR_USUARIO_LIMITS,
} from '../constants/modalRegistrarUsuario.constants';

import type {
  RegistrarUsuarioCatalogos,
  RegistrarUsuarioFormData,
} from '../types/registrarUsuario.types';

const DNI_PATTERN = /^\d{8}$/;

const NAME_PATTERN =
  /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u;

const USERNAME_PATTERN =
  /^[A-Za-z0-9._-]+$/;

const PHONE_PATTERN = /^\d{7,15}$/;

const ANNEX_PATTERN = /^\d{4}$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegistrarUsuarioValidationContext {
  catalogos?: Pick<
    RegistrarUsuarioCatalogos,
    | 'perfiles'
    | 'grupos'
    | 'departamentosLabor'
    | 'subZonalesOficina'
    | 'campanasDiscador'
  >;
}

const normalizeHumanText = (
  value: string
): string =>
  value.trim().replace(/\s+/g, ' ');

const isValidDateInput = (
  value: string
): boolean => {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value
    );

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const isFutureDate = (
  value: string
): boolean => {
  const [year, month, day] =
    value.split('-').map(Number);

  const selectedDate = Date.UTC(
    year,
    month - 1,
    day
  );

  const now = new Date();
  const today = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return selectedDate > today;
};

const validateRequiredName = (
  value: string,
  label: string,
  maxLength: number
): string | null => {
  if (!value) {
    return `${label} es obligatorio.`;
  }

  if (value.length > maxLength) {
    return `${label} debe tener como máximo ${maxLength} caracteres.`;
  }

  if (!NAME_PATTERN.test(value)) {
    return `${label} solo debe contener letras y separadores válidos como espacios, punto, apóstrofe o guion.`;
  }

  return null;
};

const isPositiveIntegerId = (
  value: string
): boolean => {
  const parsed = Number(value);

  return (
    Number.isInteger(parsed) &&
    parsed > 0
  );
};

const findOption = <T extends string | number | boolean>(
  options: readonly SelectOption<T>[],
  value: string
): SelectOption<T> | undefined =>
  options.find(
    (option) =>
      String(option.id) === value
  );

const validateRequiredCatalogSelection = (
  value: string,
  options: readonly SelectOption<string>[] | undefined,
  fieldLabel: string
): string | null => {
  if (!value || !isPositiveIntegerId(value)) {
    return `Seleccione ${fieldLabel}.`;
  }

  if (!options) {
    return null;
  }

  const option = findOption(options, value);

  if (!option) {
    return `Seleccione ${fieldLabel} válido.`;
  }

  if (option.disabled) {
    return `Seleccione ${fieldLabel} activo.`;
  }

  return null;
};

const validateOptionalCatalogSelection = (
  value: string,
  options: readonly SelectOption<string>[] | undefined,
  fieldLabel: string
): string | null => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 0
  ) {
    return `Seleccione ${fieldLabel} válido.`;
  }

  if (
    options &&
    !findOption(options, value)
  ) {
    return `Seleccione ${fieldLabel} válido.`;
  }

  return null;
};

export const normalizeRegistrarUsuarioForm = (
  form: RegistrarUsuarioFormData
): RegistrarUsuarioFormData => ({
  ...form,

  dni: form.dni.trim(),

  nombre:
    normalizeHumanText(form.nombre),

  apellidoPaterno:
    normalizeHumanText(
      form.apellidoPaterno
    ),

  apellidoMaterno:
    normalizeHumanText(
      form.apellidoMaterno
    ),

  usuario: form.usuario.trim(),

  /*
   * La contraseña se conserva exactamente
   * como fue ingresada por el usuario.
   */
  contrasena: form.contrasena,

  perfil: form.perfil.trim(),

  grupo: form.grupo.trim(),

  estado: form.estado,

  fechaNacimiento:
    form.fechaNacimiento.trim(),

  sexo: form.sexo,

  departamentoLabor:
    form.departamentoLabor.trim(),

  ciudadGestor:
    normalizeHumanText(
      form.ciudadGestor
    ),

  subZonalOficina:
    form.subZonalOficina.trim(),

  movilEmpresa:
    form.movilEmpresa.trim(),

  anexo: form.anexo.trim(),

  emailEmpresa:
    form.emailEmpresa
      .trim()
      .toLowerCase(),

  emailPersonal:
    form.emailPersonal
      .trim()
      .toLowerCase(),

  campanaDiscador:
    form.campanaDiscador.trim(),
});

export const validateRegistrarUsuarioForm = (
  form: RegistrarUsuarioFormData,
  context: RegistrarUsuarioValidationContext = {}
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const normalizedForm =
    normalizeRegistrarUsuarioForm(form);

  const { catalogos } = context;

  if (!normalizedForm.dni) {
    errors.dni =
      'El DNI es obligatorio.';
  } else if (
    !DNI_PATTERN.test(
      normalizedForm.dni
    )
  ) {
    errors.dni =
      'El DNI debe contener exactamente 8 dígitos.';
  }

  const nombreError =
    validateRequiredName(
      normalizedForm.nombre,
      'El nombre',
      MODAL_REGISTRAR_USUARIO_LIMITS
        .nombre
    );

  if (nombreError) {
    errors.nombre = nombreError;
  }

  const apellidoPaternoError =
    validateRequiredName(
      normalizedForm.apellidoPaterno,
      'El apellido paterno',
      MODAL_REGISTRAR_USUARIO_LIMITS
        .apellido
    );

  if (apellidoPaternoError) {
    errors.apellidoPaterno =
      apellidoPaternoError;
  }

  const apellidoMaternoError =
    validateRequiredName(
      normalizedForm.apellidoMaterno,
      'El apellido materno',
      MODAL_REGISTRAR_USUARIO_LIMITS
        .apellido
    );

  if (apellidoMaternoError) {
    errors.apellidoMaterno =
      apellidoMaternoError;
  }

  if (!normalizedForm.usuario) {
    errors.usuario =
      'El usuario es obligatorio.';
  } else if (
    normalizedForm.usuario.length >
    MODAL_REGISTRAR_USUARIO_LIMITS
      .usuario
  ) {
    errors.usuario =
      `El usuario debe tener como máximo ${MODAL_REGISTRAR_USUARIO_LIMITS.usuario} caracteres.`;
  } else if (
    !USERNAME_PATTERN.test(
      normalizedForm.usuario
    )
  ) {
    errors.usuario =
      'El usuario solo puede incluir letras, números, punto, guion o guion bajo.';
  }

  if (!form.contrasena) {
    errors.contrasena =
      'La contraseña es obligatoria.';
  } else if (
    !areUsuarioPasswordRequirementsMet(
      form.contrasena
    )
  ) {
    errors.contrasena =
      'La contraseña debe tener entre 8 y 20 caracteres e incluir al menos una letra, un número y un carácter especial.';
  }

  const perfilError =
    validateRequiredCatalogSelection(
      normalizedForm.perfil,
      catalogos?.perfiles,
      'un perfil'
    );

  if (perfilError) {
    errors.perfil = perfilError;
  }

  const grupoError =
    validateRequiredCatalogSelection(
      normalizedForm.grupo,
      catalogos?.grupos,
      'un grupo'
    );

  if (grupoError) {
    errors.grupo = grupoError;
  }

  if (!normalizedForm.fechaNacimiento) {
    errors.fechaNacimiento =
      'La fecha de nacimiento es obligatoria.';
  } else if (
    !isValidDateInput(
      normalizedForm.fechaNacimiento
    )
  ) {
    errors.fechaNacimiento =
      'Ingrese una fecha de nacimiento válida.';
  } else if (
    isFutureDate(
      normalizedForm.fechaNacimiento
    )
  ) {
    errors.fechaNacimiento =
      'La fecha de nacimiento no puede ser futura.';
  }

  if (normalizedForm.sexo === '') {
    errors.sexo =
      'Seleccione el sexo.';
  } else if (
    normalizedForm.sexo !== 1 &&
    normalizedForm.sexo !== 2
  ) {
    errors.sexo =
      'Seleccione un sexo válido.';
  }

  const departamentoError =
    validateRequiredCatalogSelection(
      normalizedForm.departamentoLabor,
      catalogos?.departamentosLabor,
      'el departamento de labor'
    );

  if (departamentoError) {
    errors.departamentoLabor =
      departamentoError;
  }

  if (
    normalizedForm.ciudadGestor.length >
    MODAL_REGISTRAR_USUARIO_LIMITS
      .ciudadGestor
  ) {
    errors.ciudadGestor =
      `La ciudad del gestor debe tener como máximo ${MODAL_REGISTRAR_USUARIO_LIMITS.ciudadGestor} caracteres.`;
  }

  const subZonaError =
    validateOptionalCatalogSelection(
      normalizedForm.subZonalOficina,
      catalogos?.subZonalesOficina,
      'una sub zonal - oficina'
    );

  if (subZonaError) {
    errors.subZonalOficina =
      subZonaError;
  }

  if (
    normalizedForm.movilEmpresa &&
    !PHONE_PATTERN.test(
      normalizedForm.movilEmpresa
    )
  ) {
    errors.movilEmpresa =
      'El móvil debe contener entre 7 y 15 dígitos.';
  }

  if (!normalizedForm.anexo) {
    errors.anexo =
      'El anexo es obligatorio.';
  } else if (
    !ANNEX_PATTERN.test(
      normalizedForm.anexo
    )
  ) {
    errors.anexo =
      'El anexo debe contener exactamente 4 dígitos.';
  }

  if (
    normalizedForm.emailEmpresa.length >
    MODAL_REGISTRAR_USUARIO_LIMITS.email
  ) {
    errors.emailEmpresa =
      `El email de empresa debe tener como máximo ${MODAL_REGISTRAR_USUARIO_LIMITS.email} caracteres.`;
  } else if (
    normalizedForm.emailEmpresa &&
    !EMAIL_PATTERN.test(
      normalizedForm.emailEmpresa
    )
  ) {
    errors.emailEmpresa =
      'Ingrese un email de empresa válido.';
  }

  if (
    normalizedForm.emailPersonal.length >
    MODAL_REGISTRAR_USUARIO_LIMITS.email
  ) {
    errors.emailPersonal =
      `El email personal debe tener como máximo ${MODAL_REGISTRAR_USUARIO_LIMITS.email} caracteres.`;
  } else if (
    normalizedForm.emailPersonal &&
    !EMAIL_PATTERN.test(
      normalizedForm.emailPersonal
    )
  ) {
    errors.emailPersonal =
      'Ingrese un email personal válido.';
  }

  const campanaError =
    validateOptionalCatalogSelection(
      normalizedForm.campanaDiscador,
      catalogos?.campanasDiscador,
      'una campaña de discador'
    );

  if (campanaError) {
    errors.campanaDiscador =
      campanaError;
  }

  return errors;
};
