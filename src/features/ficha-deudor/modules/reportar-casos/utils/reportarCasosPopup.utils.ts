import type { DeudorInfo } from '../../../shared/types';
import { REPORTAR_CASOS_POPUP_FALLBACK_TEXT } from '../constants/reportarCasosPopup.constants';

export const formatReportarCasoFecha = (value: string): string => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return REPORTAR_CASOS_POPUP_FALLBACK_TEXT;
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return normalizedValue;
  }

  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


export const buildReportarCasoDeudorInfo = (
  nombre: string,
  documento: string
): DeudorInfo | null => {
  if (!nombre) {
    return null;
  }

  return {
    nombreRazonSocial: nombre,
    dniRuc: documento,
    gradoInstruccion: '',
    edad: '',
    contacto: '',
    asesorPostVenta: '',
    asesorComercial: '',
    correoApv: '',
    correoAc: '',
    clienteConSinPe: '',
    clienteListaBlanca: '',
    clientePorVision: '',
  };
};
