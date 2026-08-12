import {
  USUARIO_PASSWORD_MAX_LENGTH,
} from '../../../constants/usuarioPassword.constants';

import type {
  RegistrarUsuarioFormData,
} from '../types/registrarUsuario.types';

export const MODAL_REGISTRAR_USUARIO_TEXTS = {
  title: 'Registrar nuevo usuario',
  submitLabel: 'Registrar',
  loadingLabel: 'Registrando...',
  validationSummary:
    'Revise los siguientes campos antes de registrar:',
  catalogErrorTitle:
  'No se pudieron cargar algunos catálogos:',  
} as const;

export const MODAL_REGISTRAR_USUARIO_SECTIONS = {
  personal: 'Datos personales',
  access: 'Acceso y asignación',
  contact: 'Información laboral y contacto',
} as const;

export const MODAL_REGISTRAR_USUARIO_LABELS = {
  dni: 'DNI',
  nombre: 'Nombre',
  apellidoPaterno: 'Apellido paterno',
  apellidoMaterno: 'Apellido materno',
  usuario: 'Usuario',
  contrasena: 'Contraseña',
  perfil: 'Perfil',
  grupo: 'Grupo',
  estado: 'Estado',
  fechaNacimiento: 'Fecha nacimiento',
  sexo: 'Sexo',
  departamentoLabor: 'Departamento labor',
  ciudadGestor: 'Ciudad gestor',
  subZonalOficina: 'Sub zonal - oficina',
  movilEmpresa: 'Móvil empresa',
  anexo: 'Anexo',
  emailEmpresa: 'Email empresa',
  emailPersonal: 'Email personal',
  campanaDiscador: 'Campaña discador',
} as const;

export const MODAL_REGISTRAR_USUARIO_PLACEHOLDERS = {
  dni: 'Ingrese 8 dígitos',
  nombre: 'Ingrese el nombre',
  apellidoPaterno: 'Ingrese el apellido paterno',
  apellidoMaterno: 'Ingrese el apellido materno',
  usuario: 'Ingrese el usuario',
  contrasena: 'Ingrese la contraseña',
  select: 'Seleccione...',
  ciudadGestor: 'Ingrese la ciudad del gestor',
  movilEmpresa: 'Ingrese el número móvil',
  anexo: 'Ingrese el anexo',
  emailEmpresa: 'nombre@empresa.com',
  emailPersonal: 'nombre@correo.com',
  loading: 'Cargando...',
} as const;

export const MODAL_REGISTRAR_USUARIO_LIMITS = {
  dni: 8,
  nombre: 150,
  apellido: 50,
  usuario: 30,
  contrasena: USUARIO_PASSWORD_MAX_LENGTH,
  ciudadGestor: 100,
  movilEmpresa: 15,
  anexo: 4,
  email: 120,
} as const;

export const MODAL_REGISTRAR_USUARIO_INITIAL_FORM:
  RegistrarUsuarioFormData = {
    dni: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    usuario: '',
    contrasena: '',
    perfil: '',
    grupo: '',
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