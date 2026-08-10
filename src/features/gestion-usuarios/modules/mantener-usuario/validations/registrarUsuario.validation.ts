import type {
  RegistrarUsuarioFormData,
} from '../types/registrarUsuario.types';

const DNI_PATTERN =
  /^\d{8}$/;

const NAME_PATTERN =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

const USERNAME_PATTERN =
  /^[A-Za-z0-9._-]{5,30}$/;

const PHONE_PATTERN =
  /^\d{7,15}$/;

const ANNEX_PATTERN =
  /^\d{4}$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NOMBRE_MIN_LENGTH = 4;
const NOMBRE_MAX_LENGTH = 150;

const APELLIDO_MIN_LENGTH = 6;
const APELLIDO_MAX_LENGTH = 50;

const isFutureDate = (
  value: string
): boolean => {
  const selectedDate =
    new Date(
      `${value}T00:00:00`
    );

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return (
    selectedDate.getTime() >
    today.getTime()
  );
};

const isInvalidDate = (
  value: string
): boolean =>
  Number.isNaN(
    new Date(
      `${value}T00:00:00`
    ).getTime()
  );

const validateRequiredName = (
  value: string,
  label: string,
  minLength: number,
  maxLength: number
): string | null => {
  const normalizedValue =
    value.trim();

  if (!normalizedValue) {
    return `${label} es obligatorio.`;
  }

  if (
    normalizedValue.length <
    minLength
  ) {
    return `${label} debe tener al menos ${minLength} caracteres.`;
  }

  if (
    normalizedValue.length >
    maxLength
  ) {
    return `${label} debe tener como máximo ${maxLength} caracteres.`;
  }

  if (
    !NAME_PATTERN.test(
      normalizedValue
    )
  ) {
    return `${label} solo debe contener letras, espacios, apóstrofes o guiones.`;
  }

  return null;
};

export const normalizeRegistrarUsuarioForm = (
  form: RegistrarUsuarioFormData
): RegistrarUsuarioFormData => ({
  ...form,

  dni:
    form.dni.trim(),

  nombre:
    form.nombre.trim(),

  apellidoPaterno:
    form.apellidoPaterno.trim(),

  apellidoMaterno:
    form.apellidoMaterno.trim(),

  usuario:
    form.usuario.trim(),

  /*
   * No se aplica trim a la contraseña.
   * Sus espacios podrían formar parte
   * del valor ingresado.
   */
  contrasena:
    form.contrasena,

  perfil:
    form.perfil.trim(),

  grupo:
    form.grupo.trim(),

  estado:
    form.estado,

  fechaNacimiento:
    form.fechaNacimiento.trim(),

  sexo:
    form.sexo,

  departamentoLabor:
    form.departamentoLabor.trim(),

  ciudadGestor:
    form.ciudadGestor.trim(),

  subZonalOficina:
    form.subZonalOficina.trim(),

  movilEmpresa:
    form.movilEmpresa.trim(),

  anexo:
    form.anexo.trim(),

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
  form: RegistrarUsuarioFormData
): Record<string, string> => {
  const errors:
    Record<string, string> = {};

  const normalizedForm =
    normalizeRegistrarUsuarioForm(
      form
    );

  /*
   * DNI
   */
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

  /*
   * Nombre
   */
  const nombreError =
    validateRequiredName(
      normalizedForm.nombre,
      'El nombre',
      NOMBRE_MIN_LENGTH,
      NOMBRE_MAX_LENGTH
    );

  if (nombreError) {
    errors.nombre =
      nombreError;
  }

  /*
   * Apellido paterno
   */
  const apellidoPaternoError =
    validateRequiredName(
      normalizedForm
        .apellidoPaterno,
      'El apellido paterno',
      APELLIDO_MIN_LENGTH,
      APELLIDO_MAX_LENGTH
    );

  if (
    apellidoPaternoError
  ) {
    errors.apellidoPaterno =
      apellidoPaternoError;
  }

  /*
   * Apellido materno
   */
  const apellidoMaternoError =
    validateRequiredName(
      normalizedForm
        .apellidoMaterno,
      'El apellido materno',
      APELLIDO_MIN_LENGTH,
      APELLIDO_MAX_LENGTH
    );

  if (
    apellidoMaternoError
  ) {
    errors.apellidoMaterno =
      apellidoMaternoError;
  }

  /*
   * Usuario
   */
  if (
    !normalizedForm.usuario
  ) {
    errors.usuario =
      'El usuario es obligatorio.';
  } else if (
    !USERNAME_PATTERN.test(
      normalizedForm.usuario
    )
  ) {
    errors.usuario =
      'El usuario debe tener entre 5 y 30 caracteres y solo puede incluir letras, números, punto, guion o guion bajo.';
  }

  /*
   * Contraseña
   *
   * La política completa se valida
   * dinámicamente en el backend.
   */
  if (!form.contrasena) {
    errors.contrasena =
      'La contraseña es obligatoria.';
  }

  /*
   * Fecha de nacimiento
   */
  if (
    !normalizedForm
      .fechaNacimiento
  ) {
    errors.fechaNacimiento =
      'La fecha de nacimiento es obligatoria.';
  } else if (
    isInvalidDate(
      normalizedForm
        .fechaNacimiento
    )
  ) {
    errors.fechaNacimiento =
      'Ingrese una fecha de nacimiento válida.';
  } else if (
    isFutureDate(
      normalizedForm
        .fechaNacimiento
    )
  ) {
    errors.fechaNacimiento =
      'La fecha de nacimiento no puede ser futura.';
  }

  /*
   * Sexo
   */
  if (
    normalizedForm.sexo === ''
  ) {
    errors.sexo =
      'Seleccione el sexo.';
  }

  /*
   * Departamento de labor
   */
  if (
    !normalizedForm
      .departamentoLabor ||
    normalizedForm
      .departamentoLabor === '0'
  ) {
    errors.departamentoLabor =
      'Seleccione el departamento de labor.';
  }

  /*
   * Ciudad del gestor:
   * opcional, pero se valida
   * cuando tiene contenido.
   */
  if (
    normalizedForm
      .ciudadGestor &&
    !NAME_PATTERN.test(
      normalizedForm
        .ciudadGestor
    )
  ) {
    errors.ciudadGestor =
      'La ciudad solo debe contener letras, espacios, apóstrofes o guiones.';
  }

  /*
   * Sub zonal - oficina:
   * no se valida como obligatorio.
   * Su valor inicial es 0 = SIN ZONA.
   */

  /*
   * Móvil empresa:
   * opcional.
   */
  if (
    normalizedForm
      .movilEmpresa &&
    !PHONE_PATTERN.test(
      normalizedForm
        .movilEmpresa
    )
  ) {
    errors.movilEmpresa =
      'El móvil debe contener entre 7 y 15 dígitos.';
  }

  /*
  * Anexo:
  * obligatorio.
  */
  if (!normalizedForm.anexo) {
    errors.anexo =
      'El anexo es obligatorio.';
  } else if (
    !ANNEX_PATTERN.test(normalizedForm.anexo)
  ) {
    errors.anexo =
      'El anexo debe contener exactamente 4 dígitos.';
  }

  /*
   * Email empresa:
   * opcional.
   */
  if (
    normalizedForm
      .emailEmpresa &&
    !EMAIL_PATTERN.test(
      normalizedForm
        .emailEmpresa
    )
  ) {
    errors.emailEmpresa =
      'Ingrese un email de empresa válido.';
  }

  /*
   * Email personal:
   * opcional.
   */
  if (
    normalizedForm
      .emailPersonal &&
    !EMAIL_PATTERN.test(
      normalizedForm
        .emailPersonal
    )
  ) {
    errors.emailPersonal =
      'Ingrese un email personal válido.';
  }

  /*
   * Perfil, grupo, estado y campaña
   * discador no se validan como
   * obligatorios.
   */

  return errors;
};