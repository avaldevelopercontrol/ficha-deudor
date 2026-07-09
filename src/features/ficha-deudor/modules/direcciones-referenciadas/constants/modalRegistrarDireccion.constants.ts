import type { DireccionFormData } from '../types/direccion.types';

export const MODAL_REGISTRAR_DIRECCION_INITIAL_FORM: DireccionFormData = {
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  refUbicacion: '',
  comentario: '',
  llegoDeBase: false,
  tipoDeudor: 'TITULAR',
};

export const MODAL_REGISTRAR_DIRECCION_TEXTS = {
  title: 'REGISTRAR DIRECCIÓN',
  submitLabel: 'Registrar',
  validationSummary: 'Por favor, corrija los siguientes errores:',
} as const;

export const MODAL_REGISTRAR_DIRECCION_LABELS = {
  direccion: 'Dirección',
  departamento: 'Departamento',
  provincia: 'Provincia',
  distrito: 'Distrito',
  refUbicacion: 'Referencia de Ubicación',
  comentario: 'Comentario / Des. Ref. (Opcional)',
  llegoDeBase: 'Llegó de Base',
  tipoDeudor: 'Tipo Deudor',
} as const;

export const MODAL_REGISTRAR_DIRECCION_PLACEHOLDERS = {
  direccion: 'Ingrese dirección completa',
  comentario: 'Ingrese comentario o descripción de referencia...',
  select: '-- Seleccione --',
  loading: 'Cargando...',
} as const;

export const MODAL_REGISTRAR_DIRECCION_LIMITS = {
  direccionMaxLength: 200,
  comentarioMaxLength: 500,
  comentarioRows: 3,
} as const;

export const MODAL_REGISTRAR_DIRECCION_LAYOUT = {
  minHeight: 'auto',
  ubicacionColumns: 3,
  footerColumns: 2,
} as const;