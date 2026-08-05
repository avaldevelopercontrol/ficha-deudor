import type {
  SelectOption,
} from '@shared/types';

export const MODAL_REGISTRAR_MODULO_TEXTS = {
  title:
    'Registrar nuevo módulo',

  submitLabel:
    'Registrar',

  loadingLabel:
    'Registrando...',

  validationSummary:
    'Revise los siguientes campos antes de registrar:',
} as const;

export const MODAL_REGISTRAR_MODULO_SECTIONS = {
  general:
    'Datos del módulo',
} as const;

export const MODAL_REGISTRAR_MODULO_LABELS = {
  nombre:
    'Nombre',

  descripcion:
    'Descripción',

  codigo:
    'Código',

  icono:
    'Icono',

  padre:
    'Padre',

  visible:
    'Visible',

  estado:
    'Estado',
} as const;

export const MODAL_REGISTRAR_MODULO_PLACEHOLDERS = {
  nombre:
    'Ingrese el nombre del módulo',

  descripcion:
    'Ingrese una descripción del módulo',

  codigo:
    'Ingrese el código del módulo',

  icono:
    'Seleccionar',
} as const;

export const MODAL_REGISTRAR_MODULO_VISIBLE_OPTIONS:
  SelectOption<boolean>[] = [
    {
      id: true,
      label: 'Sí',
    },
    {
      id: false,
      label: 'No',
    },
  ];

export const MODAL_REGISTRAR_MODULO_ESTADO_OPTIONS:
  SelectOption<boolean>[] = [
    {
      id: true,
      label: 'Activo',
    },
    {
      id: false,
      label: 'Inactivo',
    },
  ];
