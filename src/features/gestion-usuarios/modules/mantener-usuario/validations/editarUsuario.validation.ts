import type {
  RegistrarUsuarioFormData,
} from '../types/registrarUsuario.types';

import type {
  EditarUsuarioCatalogos,
  EditarUsuarioFormData,
  UsuarioGrupoItem,
} from '../types/editarUsuario.types';

import {
  normalizeRegistrarUsuarioForm,
  validateRegistrarUsuarioForm,
} from './registrarUsuario.validation';

const toRegistrarUsuarioForm = (
  form: EditarUsuarioFormData
): RegistrarUsuarioFormData => ({
  dni: form.dni,
  nombre: form.nombre,
  apellidoPaterno:
    form.apellidoPaterno,
  apellidoMaterno:
    form.apellidoMaterno,
  usuario: form.usuario,
  contrasena: form.contrasenaNueva,
  perfil: form.perfil,
  grupo: '',
  estado: form.estado,
  fechaNacimiento:
    form.fechaNacimiento,
  sexo: form.sexo,
  departamentoLabor:
    form.departamentoLabor,
  ciudadGestor:
    form.ciudadGestor,
  subZonalOficina:
    form.subZonalOficina,
  movilEmpresa:
    form.movilEmpresa,
  anexo: form.anexo,
  emailEmpresa:
    form.emailEmpresa,
  emailPersonal:
    form.emailPersonal,
  campanaDiscador:
    form.campanaDiscador,
});

export const normalizeEditarUsuarioForm = (
  form: EditarUsuarioFormData
): EditarUsuarioFormData => {
  const normalized =
    normalizeRegistrarUsuarioForm(
      toRegistrarUsuarioForm(form)
    );

  return {
    dni: normalized.dni,
    nombre: normalized.nombre,
    apellidoPaterno:
      normalized.apellidoPaterno,
    apellidoMaterno:
      normalized.apellidoMaterno,
    usuario: normalized.usuario,
    contrasenaActual:
      form.cambiarContrasena
        ? form.contrasenaActual
        : '',
    cambiarContrasena:
      form.cambiarContrasena,
    contrasenaNueva:
      form.cambiarContrasena
        ? form.contrasenaNueva
        : '',
    perfil: normalized.perfil,
    estado: normalized.estado,
    fechaNacimiento:
      normalized.fechaNacimiento,
    sexo: normalized.sexo,
    departamentoLabor:
      normalized.departamentoLabor,
    ciudadGestor:
      normalized.ciudadGestor,
    subZonalOficina:
      normalized.subZonalOficina,
    movilEmpresa:
      normalized.movilEmpresa,
    anexo: normalized.anexo,
    emailEmpresa:
      normalized.emailEmpresa,
    emailPersonal:
      normalized.emailPersonal,
    campanaDiscador:
      normalized.campanaDiscador,
  };
};

const EDITAR_USUARIO_DATA_FIELDS = [
  'dni',
  'nombre',
  'apellidoPaterno',
  'apellidoMaterno',
  'usuario',
  'perfil',
  'estado',
  'fechaNacimiento',
  'sexo',
  'departamentoLabor',
  'ciudadGestor',
  'subZonalOficina',
  'movilEmpresa',
  'anexo',
  'emailEmpresa',
  'emailPersonal',
  'campanaDiscador',
] as const satisfies readonly (
  keyof EditarUsuarioFormData
)[];

/**
 * Determina si el PUT /v1/Usuario es realmente necesario.
 * Los grupos no forman parte de esta comparación porque se
 * persisten mediante /v1/UGrupo.
 */
export const hasEditarUsuarioDataChanges = (
  current: EditarUsuarioFormData,
  initial: EditarUsuarioFormData
): boolean =>
  current.cambiarContrasena ||
  EDITAR_USUARIO_DATA_FIELDS.some(
    (field) =>
      current[field] !== initial[field]
  );

interface EditarUsuarioValidationContext {
  catalogos?:
    Partial<EditarUsuarioCatalogos>;
  gruposActuales?:
    readonly UsuarioGrupoItem[];
}

export const validateEditarUsuarioForm = (
  form: EditarUsuarioFormData,
  {
    catalogos,
    gruposActuales,
  }: EditarUsuarioValidationContext = {}
): Record<string, string> => {
  const errors =
    validateRegistrarUsuarioForm(
      toRegistrarUsuarioForm(form),
      {
        catalogos,
        requirePassword:
          form.cambiarContrasena,
        validateGroup: false,
      }
    );

  if (errors.contrasena) {
    errors.contrasenaNueva =
      errors.contrasena;
    delete errors.contrasena;
  }

  if (
    form.cambiarContrasena &&
    !form.contrasenaActual
  ) {
    errors.contrasenaActual =
      'La contraseña actual es obligatoria.';
  }

  if (
    gruposActuales &&
    gruposActuales.length === 0
  ) {
    errors.grupos =
      'El usuario debe mantener al menos un grupo de trabajo asignado.';
  }

  return errors;
};
