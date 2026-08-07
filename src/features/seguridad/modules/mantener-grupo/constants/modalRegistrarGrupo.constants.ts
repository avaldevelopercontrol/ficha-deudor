import type {
  SelectOption,
} from '@shared/types';

import type {
  RegistrarGrupoEstado,
  RegistrarGrupoFormData,
} from '../types/registrarGrupo.types';

export const MODAL_REGISTRAR_GRUPO_TEXTS = {
  title:
    'Registrar nuevo grupo',

  submitLabel:
    'Registrar',

  loadingLabel:
    'Registrando...',

  loadingClientes:
    'Cargando clientes...',

  retryClientes:
    'Reintentar',

  emptyClientes:
    'No hay clientes activos disponibles para registrar el grupo.',

  validationSummary:
    'Revise los siguientes campos antes de registrar:',
} as const;

export const MODAL_REGISTRAR_GRUPO_SECTIONS = {
  general:
    'Datos del grupo',
} as const;

export const MODAL_REGISTRAR_GRUPO_LABELS = {
  nombre:
    'Nombre',

  sigla:
    'Sigla',

  cliente:
    'Cliente',

  estado:
    'Estado',
} as const;

export const MODAL_REGISTRAR_GRUPO_PLACEHOLDERS = {
  nombre:
    'Ingrese el nombre del grupo',

  sigla:
    'Ingrese la sigla',

  cliente:
    'Seleccione un cliente',
} as const;

export const MODAL_REGISTRAR_GRUPO_ESTADO_OPTIONS:
  SelectOption<RegistrarGrupoEstado>[] = [
    {
      id: true,
      label: 'Activo',
    },
    {
      id: false,
      label: 'Inactivo',
    },
  ];

export const MODAL_REGISTRAR_GRUPO_INITIAL_FORM:
  RegistrarGrupoFormData = {
    nombre: '',
    sigla: '',
    clienteId: '',
    estado: true,
  };
