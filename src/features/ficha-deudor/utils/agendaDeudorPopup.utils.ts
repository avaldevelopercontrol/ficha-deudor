import { AGENDA_DEUDOR_POPUP_FALLBACK_TEXT } from '../constants/agendaDeudorPopup.constants';

export const formatAgendaPopupFecha = (fechaIso: string): string => {
  if (!fechaIso) return AGENDA_DEUDOR_POPUP_FALLBACK_TEXT;

  const date = new Date(fechaIso);

  if (Number.isNaN(date.getTime())) return fechaIso;

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};