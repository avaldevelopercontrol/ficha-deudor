import type { EmailEditFormData } from '../types/email.types';

export const MODAL_EDITAR_EMAIL_INITIAL_FORM: EmailEditFormData = {
  id: '',
  email: '',
  contacto: '',
  comentario: '',
  prioridad: '',
  estado: true,
  status: '',
  dFecRegistro: '',
};

export const MODAL_EDITAR_EMAIL_TEXTS = {
  title: 'EDITAR EMAIL',
  submitLabel: 'Guardar Cambios',
  loadingEmail: 'Cargando datos del email...',
  errorEmailPrefix: 'Error al cargar el email:',
  emptyEmail: 'No se encontraron datos del email',
  validationSummary: 'Por favor, corrija los siguientes errores:',
} as const;

export const MODAL_EDITAR_EMAIL_LABELS = {
  email: 'Email',
  contacto: 'Contacto',
  prioridad: 'Prioridad',
  estado: 'Estado',
  status: 'Status',
  comentario: 'Comentario',
} as const;

export const MODAL_EDITAR_EMAIL_PLACEHOLDERS = {
  email: 'Ingrese email',
  contacto: 'Ingrese nombre del contacto',
  comentario: 'Ingrese comentario...',
  select: '-- Seleccione --',
  loading: 'Cargando...',
} as const;

export const MODAL_EDITAR_EMAIL_LIMITS = {
  emailMaxLength: 100,
  contactoMaxLength: 150,
  comentarioRows: 3,
} as const;

export const MODAL_EDITAR_EMAIL_LAYOUT = {
  minHeight: 'auto',
  mainColumns: 1,
  selectColumns: 3,
} as const;