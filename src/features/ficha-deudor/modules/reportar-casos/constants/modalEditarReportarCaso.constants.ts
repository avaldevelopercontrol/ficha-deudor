import type { ReportarCasoFormData } from '../types/reportarCaso.types';
import { REPORTAR_CASO_MAF_VALUE } from './modalCrearReportarCaso.constants';

export const MODAL_EDITAR_REPORTAR_CASO_INITIAL_FORM: ReportarCasoFormData = {
  caso: REPORTAR_CASO_MAF_VALUE,
  descripcion: '',
  tipoSiniestro: '',
};

export const MODAL_EDITAR_REPORTAR_CASO_TEXTS = {
  title: 'EDITAR CASO',
  submitLabel: 'Guardar cambios',
  loadingLabel: 'Guardando...',
  loadingCase: 'Cargando información del caso...',
  errorCasePrefix: 'No se pudo cargar el caso:',
  emptyCase: 'No se encontró información del caso seleccionado.',
  validationSummary: 'Por favor, corrija los siguientes errores:',
} as const;
