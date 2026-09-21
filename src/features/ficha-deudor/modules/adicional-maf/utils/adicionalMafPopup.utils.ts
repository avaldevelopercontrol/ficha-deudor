import { ADICIONAL_MAF_POPUP_TEXTS } from '../constants/adicionalMafPopup.constants';
import type {
  AdicionalMafCanal,
  AdicionalMafGestion,
  AdicionalMafOperacion,
} from '../types/adicionalMaf.types';

const LOCAL_ISO_DATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/;

const CHANNEL_CODES: Readonly<
  Record<AdicionalMafCanal, number>
> = {
  CALL: 1,
  CAMPO: 2,
};

const normalizeChannelName = (value: string): string => {
  return value.trim().toUpperCase();
};

export const formatAdicionalMafDate = (
  value: string | null
): string => {
  const normalizedValue = value?.trim() ?? '';

  if (!normalizedValue) {
    return ADICIONAL_MAF_POPUP_TEXTS.emptyValue;
  }

  const match = normalizedValue.match(
    LOCAL_ISO_DATE_PATTERN
  );

  if (!match) {
    return normalizedValue;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const validationDate = new Date(
    Date.UTC(year, month - 1, day)
  );

  const isValidDate =
    validationDate.getUTCFullYear() === year &&
    validationDate.getUTCMonth() === month - 1 &&
    validationDate.getUTCDate() === day;

  if (!isValidDate) {
    return normalizedValue;
  }

  return `${dayText}/${monthText}/${yearText}`;
};

export const getAdicionalMafGestiones = (
  gestiones: readonly AdicionalMafGestion[],
  canal: AdicionalMafCanal,
  ventanaMeses: number
): AdicionalMafGestion[] => {
  const channelCode = CHANNEL_CODES[canal];

  return gestiones.filter((gestion) => {
    if (gestion.ventanaMeses !== ventanaMeses) {
      return false;
    }

    return (
      gestion.canal === channelCode ||
      normalizeChannelName(gestion.canalNombre) === canal
    );
  });
};

export const isAdicionalMafGestionEmpty = (
  gestion: AdicionalMafGestion
): boolean => {
  return (
    gestion.idDocxCobrarOpe === 0 &&
    gestion.idDocxCobrar === 0 &&
    gestion.fecha === null
  );
};

export const getAdicionalMafOperationPrefix = (
  operacion: AdicionalMafOperacion
): string => {
  const operationCode =
    operacion.operacion || '—';
  const plate = operacion.placa
    ? ` | ${operacion.placa}`
    : '';

  return `Op. ${operationCode}${plate}`;
};

export const getAdicionalMafDisplayValue = (
  value: string | null
): string => {
  return value || ADICIONAL_MAF_POPUP_TEXTS.emptyValue;
};
