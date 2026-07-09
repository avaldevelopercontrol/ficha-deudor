import type { TelefonoFormData } from '../types/telefono.types';

export const MODAL_REGISTRAR_TELEFONO_INITIAL_FORM: TelefonoFormData = {
  id: 0,
  numero: '',
  anexo: '',
  resultado: '',
  operadorTelefonico: '',
  ubicacion: '',
  prioridad: '',
  horarioGestion: '',
  comentario: '',
  fuenteBusqueda: '',
  referencia: 0,
  reclamoIndecopi: false,
  bEstado: false,
  dFecCarga_PersTelef: '',
};

export const MODAL_REGISTRAR_TELEFONO_TEXTS = {
  title: 'REGISTRAR TELÉFONO',
  submitLabel: 'Registrar',
  validationSummary: 'Por favor, corrija los siguientes errores:',
} as const;

export const MODAL_REGISTRAR_TELEFONO_LABELS = {
  numero: 'Número Telefónico',
  anexo: 'Anexo',
  resultado: 'Resultado',
  operadorTelefonico: 'Operador Telf.',
  ubicacion: 'Ubicación',
  prioridad: 'Prioridad',
  horarioGestion: 'Horario Gestión',
  fuenteBusqueda: 'Fuente Búsqueda',
  comentario: 'Comentario',
  referencia: 'Referencia',
  reclamoIndecopi: 'Reclamo Indecopi',
} as const;

export const MODAL_REGISTRAR_TELEFONO_PLACEHOLDERS = {
  select: '-- Seleccione --',
  loading: 'Cargando...',
  numero: 'Ingrese número telefónico',
  anexo: 'Anexo',
  comentario: 'Ingrese comentario...',
} as const;

export const MODAL_REGISTRAR_TELEFONO_LIMITS = {
  numeroMaxLength: 15,
  anexoMaxLength: 10,
  comentarioRows: 2,
} as const;

export const MODAL_REGISTRAR_TELEFONO_LAYOUT = {
  minHeight: 'auto',
  inputColumns: 2,
  selectColumns: 3,
  footerColumns: 2,
} as const;