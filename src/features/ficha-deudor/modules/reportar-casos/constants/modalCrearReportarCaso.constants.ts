import type { SelectOption } from '@shared/types';

import type { ReportarCasoFormData } from '../types/reportarCaso.types';

export const REPORTAR_CASO_MAF_VALUE = 'Reportar Caso MAF' as const;

export const MODAL_CREAR_REPORTAR_CASO_INITIAL_FORM: ReportarCasoFormData = {
  caso: REPORTAR_CASO_MAF_VALUE,
  descripcion: '',
  tipoSiniestro: '',
};

export const MODAL_CREAR_REPORTAR_CASO_TEXTS = {
  title: 'AGREGAR CASO',
  submitLabel: 'Registrar',
  loadingLabel: 'Registrando...',
  validationSummary: 'Por favor, corrija los siguientes errores:',
} as const;

export const MODAL_CREAR_REPORTAR_CASO_LABELS = {
  caso: 'Reportar Caso MAF',
  descripcion: 'Descripción',
  tipoSiniestro: 'Tipo de Siniestro',
} as const;

export const MODAL_CREAR_REPORTAR_CASO_PLACEHOLDERS = {
  select: 'Seleccione',
  descripcion: 'Ingrese la descripción del caso...',
} as const;

export const MODAL_CREAR_REPORTAR_CASO_LAYOUT = {
  minHeight: 'auto',
  descripcionRows: 4,
} as const;

export const REPORTAR_CASO_MAF_OPTIONS: SelectOption<string>[] = [
  {
    id: REPORTAR_CASO_MAF_VALUE,
    label: REPORTAR_CASO_MAF_VALUE,
  },
];

export const REPORTAR_CASO_TIPO_SINIESTRO_OPTIONS: SelectOption<string>[] = [
  {
    id: 'Activación de desgravamen (por falleciemiento)',
    label: 'Activación de desgravamen (por falleciemiento)',
  },
  {
    id: 'Caso Varios',
    label: 'Caso Varios',
  },
  {
    id: 'Extorno de Seguro',
    label: 'Extorno de Seguro',
  },
  {
    id: 'Pago no Reflejado',
    label: 'Pago no Reflejado',
  },
  {
    id: 'Siniestro o Robo o Pérdida Total',
    label: 'Siniestro o Robo o Pérdida Total',
  },
];
