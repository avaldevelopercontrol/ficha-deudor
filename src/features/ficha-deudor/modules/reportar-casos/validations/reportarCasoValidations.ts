import {
  REPORTAR_CASO_MAF_VALUE,
  REPORTAR_CASO_TIPO_SINIESTRO_OPTIONS,
} from '../constants/modalCrearReportarCaso.constants';
import type { ReportarCasoFormData } from '../types/reportarCaso.types';

export type ReportarCasoFormErrors = Partial<
  Record<keyof ReportarCasoFormData, string>
>;

const REPORTAR_CASO_TIPO_SINIESTRO_VALUES = new Set(
  REPORTAR_CASO_TIPO_SINIESTRO_OPTIONS.map((option) => String(option.id))
);

const isValidTipoSiniestro = (value: string): boolean =>
  REPORTAR_CASO_TIPO_SINIESTRO_VALUES.has(value.trim());

export const hasRequiredReportarCasoSelections = (
  data: Pick<ReportarCasoFormData, 'caso' | 'tipoSiniestro'>
): boolean =>
  data.caso.trim() === REPORTAR_CASO_MAF_VALUE &&
  isValidTipoSiniestro(data.tipoSiniestro);

export const validateReportarCasoForm = (
  data: ReportarCasoFormData
): ReportarCasoFormErrors => {
  const errors: ReportarCasoFormErrors = {};

  if (data.caso.trim() !== REPORTAR_CASO_MAF_VALUE) {
    errors.caso = 'Debe seleccionar el caso a reportar';
  }

  if (!data.descripcion.trim()) {
    errors.descripcion = 'La descripción es obligatoria';
  }

  if (!isValidTipoSiniestro(data.tipoSiniestro)) {
    errors.tipoSiniestro = 'Debe seleccionar el tipo de siniestro';
  }

  return errors;
};
