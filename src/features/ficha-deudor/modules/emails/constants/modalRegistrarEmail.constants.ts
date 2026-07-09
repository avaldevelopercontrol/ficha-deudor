import type { EmailFormData } from '../types/email.types';

export const MODAL_REGISTRAR_EMAIL_INITIAL_FORM: EmailFormData = {
  email: '',
  contacto: '',
  comentario: '',
  prioridad: '',
  estado: true,
  status: '',
};

export const MODAL_REGISTRAR_EMAIL_TEXTS = {
  title: 'REGISTRAR EMAIL',
  submitLabel: 'Registrar',
  validationSummary: 'Por favor, corrija los siguientes errores:',
} as const;

export const MODAL_REGISTRAR_EMAIL_LABELS = {
  email: 'Email',
  contacto: 'Contacto',
  prioridad: 'Prioridad',
  estado: 'Estado',
  status: 'Status',
  comentario: 'Comentario',
} as const;

export const MODAL_REGISTRAR_EMAIL_PLACEHOLDERS = {
  email: 'Ingrese email',
  contacto: 'Ingrese nombre del contacto',
  comentario: 'Ingrese comentario...',
  select: '-- Seleccione --',
  loading: 'Cargando...',
} as const;

export const MODAL_REGISTRAR_EMAIL_LIMITS = {
  emailMaxLength: 100,
  contactoMaxLength: 150,
  comentarioRows: 3,
} as const;

export const MODAL_REGISTRAR_EMAIL_LAYOUT = {
  minHeight: 'auto',
  mainColumns: 1,
  selectColumns: 3,
} as const;