import type { DeudorInfo } from '../../../shared/types';
import {
  EMAIL_DEUDOR_POPUP_ESTADOS_BADGE,
  EMAIL_DEUDOR_POPUP_FALLBACK_TEXT,
} from '../constants/emailDeudorPopup.constants';

export const formatEmailPopupFecha = (fechaIso: string): string => {
  if (!fechaIso) return EMAIL_DEUDOR_POPUP_FALLBACK_TEXT;

  const date = new Date(fechaIso);

  if (Number.isNaN(date.getTime())) return fechaIso;

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const getEmailEstadoBadgeClass = (estado: string): string =>
  EMAIL_DEUDOR_POPUP_ESTADOS_BADGE[estado] || '';

export const buildEmailDeudorInfo = (
  nombre: string,
  documento: string
): DeudorInfo | null => {
  if (!nombre) return null;

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
  };
};