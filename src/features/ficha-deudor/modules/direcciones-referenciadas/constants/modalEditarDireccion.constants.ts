import type { DireccionEditFormData } from '../types/direccion.types';

export const MODAL_EDITAR_DIRECCION_INITIAL_FORM: DireccionEditFormData = {
  id: '',
  direccion: '',
  departamento: '',
  provincia: '',
  distrito: '',
  refUbicacion: '',
  comentario: '',
  llegoDeBase: false,
  tipoDeudor: '',
  nombreAval: '',
  estado: true,
};

export const MODAL_EDITAR_DIRECCION_TEXTS = {
  title: 'EDITAR DIRECCIÓN',
  submitLabel: 'Guardar Cambios',
  validationSummary: 'Por favor, corrija los siguientes errores:',
} as const;

export const MODAL_EDITAR_DIRECCION_LABELS = {
  direccion: 'Dirección',
  departamento: 'Departamento',
  provincia: 'Provincia',
  distrito: 'Distrito',
  refUbicacion: 'Referencia de Ubicación',
  comentario: 'Comentario / Des. Ref. (Opcional)',
  llegoDeBase: 'Llegó de Base',
  tipoDeudor: 'Tipo Deudor',
  estado: 'Estado',
} as const;

export const MODAL_EDITAR_DIRECCION_PLACEHOLDERS = {
  direccion: 'Ingrese dirección completa',
  comentario: 'Ingrese comentario o descripción de referencia...',
  select: '-- Seleccione --',
  compactSelect: '---Seleccione---',
  loading: 'Cargando...',
} as const;

export const MODAL_EDITAR_DIRECCION_LAYOUT = {
  minHeight: 'auto',
  ubicacionColumns: 3,
  footerColumns: 2,
  comentarioRows: 3,
} as const;