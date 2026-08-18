import type {
  EditarUsuarioFormData,
} from '../types/editarUsuario.types';

export const MODAL_EDITAR_USUARIO_TEXTS = {
  title: 'Editar usuario',
  submitLabel: 'Guardar cambios',
  loadingLabel: 'Guardando...',
  validationSummary:
    'Revise los siguientes campos antes de guardar:',
  currentPassword:
    'Contraseña actual',
  currentPasswordPlaceholder:
    'Ingrese la contraseña actual',
  changePassword:
    'Cambiar contraseña',
  newPassword:
    'Nueva contraseña',
  newPasswordPlaceholder:
    'Ingrese la nueva contraseña',
  groupsSection:
    'Grupos de trabajo',
} as const;

export const MODAL_EDITAR_USUARIO_INITIAL_FORM:
  EditarUsuarioFormData = {
    dni: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    usuario: '',
    contrasenaActual: '',
    cambiarContrasena: false,
    contrasenaNueva: '',
    perfil: '',
    estado: true,
    fechaNacimiento: '',
    sexo: '',
    departamentoLabor: '',
    ciudadGestor: '',
    subZonalOficina: '',
    movilEmpresa: '',
    anexo: '',
    emailEmpresa: '',
    emailPersonal: '',
    campanaDiscador: '',
  };
