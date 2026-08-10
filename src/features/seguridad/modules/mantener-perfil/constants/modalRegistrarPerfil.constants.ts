import type {
  SelectOption,
} from '@shared/types';

import type {
  RegistrarPerfilEstado,
  RegistrarPerfilFormData,
} from '../types/registrarPerfil.types';

export const MODAL_REGISTRAR_PERFIL_TEXTS = {
  title:
    'Registrar nuevo perfil',

  submitLabel:
    'Registrar',

  loadingLabel:
    'Registrando...',

  validationSummary:
    'Revise los siguientes campos antes de registrar:',
} as const;

export const MODAL_REGISTRAR_PERFIL_SECTIONS = {
  general:
    'Datos del perfil',
} as const;

export const MODAL_REGISTRAR_PERFIL_LABELS = {
  nombrePerfil:
    'Nombre del Perfil',

  abreviatura:
    'Abreviatura',

  estado:
    'Estado',
} as const;

export const MODAL_REGISTRAR_PERFIL_PLACEHOLDERS = {
  nombrePerfil:
    'Ingrese el nombre del perfil',

  abreviatura:
    'Ingrese la abreviatura',
} as const;

export const MODAL_REGISTRAR_PERFIL_LIMITS = {
  nombrePerfil: 50,
  abreviatura: 20,
} as const;

export const MODAL_REGISTRAR_PERFIL_ESTADO_OPTIONS:
  SelectOption<RegistrarPerfilEstado>[] = [
    {
      id: 1,
      label: 'Activo',
    },
    {
      id: 0,
      label: 'Inactivo',
    },
  ];

export const MODAL_REGISTRAR_PERFIL_INITIAL_FORM:
  RegistrarPerfilFormData = {
    nombrePerfil: '',
    abreviatura: '',
    estado: 1,
  };