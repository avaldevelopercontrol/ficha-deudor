import { PERU_TIME_ZONE } from '@shared/utils/peruDateTime.utils';

import type {
  SesionBiEstado,
  SesionesBiPeriodoPreset,
} from '../domain/sesionesBi.types';

const PERU_UTC_OFFSET_HOURS = 5;
const DAY_MS = 86_400_000;

const peruDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PERU_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: PERU_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const shortDateTimeFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: PERU_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const dayFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: PERU_TIME_ZONE,
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
});

const hourFormatter = new Intl.DateTimeFormat('es-PE', {
  timeZone: PERU_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const splitDate = (value: string): [number, number, number] => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new Error('La fecha debe usar formato YYYY-MM-DD.');
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const addDays = (date: string, days: number): string => {
  const [year, month, day] = splitDate(date);
  const value = new Date(Date.UTC(year, month - 1, day) + days * DAY_MS);

  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, '0'),
    String(value.getUTCDate()).padStart(2, '0'),
  ].join('-');
};

export const getPeruCalendarDate = (
  currentDate = new Date()
): string => peruDateFormatter.format(currentDate);

export const peruDateStartToUtcIso = (date: string): string => {
  const [year, month, day] = splitDate(date);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      PERU_UTC_OFFSET_HOURS,
      0,
      0,
      0
    )
  ).toISOString();
};

export interface SesionesBiPeriodRange {
  fromDate: string;
  toDate: string;
  fromUtc: string;
  toUtc: string;
}

export const resolveSesionesBiPeriod = (
  preset: SesionesBiPeriodoPreset,
  currentDate = new Date(),
  customFrom?: string,
  customTo?: string
): SesionesBiPeriodRange => {
  const today = getPeruCalendarDate(currentDate);
  let fromDate = today;
  let toDate = today;

  switch (preset) {
    case 'YESTERDAY':
      fromDate = addDays(today, -1);
      toDate = fromDate;
      break;
    case 'LAST_7_DAYS':
      fromDate = addDays(today, -6);
      break;
    case 'LAST_30_DAYS':
      fromDate = addDays(today, -29);
      break;
    case 'CUSTOM':
      if (!customFrom || !customTo || customFrom > customTo) {
        throw new Error('Selecciona un rango de fechas válido.');
      }
      fromDate = customFrom;
      toDate = customTo;
      break;
    case 'TODAY':
    default:
      break;
  }

  return {
    fromDate,
    toDate,
    fromUtc: peruDateStartToUtcIso(fromDate),
    toUtc: peruDateStartToUtcIso(addDays(toDate, 1)),
  };
};

export const formatSesionesBiDuration = (
  seconds: number
): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainder}s`;
  }

  return `${remainder}s`;
};

export const formatSesionesBiDateTime = (
  value: string | null
): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : dateTimeFormatter.format(date);
};

export const formatSesionesBiShortDateTime = (
  value: string
): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : shortDateTimeFormatter.format(date);
};

export const formatSesionesBiTrendLabel = (
  value: string,
  granularity: string
): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return granularity.toUpperCase().includes('HORA') ||
    granularity.toUpperCase().includes('HOUR')
    ? hourFormatter.format(date)
    : dayFormatter.format(date);
};

export const getSesionBiStatusLabel = (
  status: SesionBiEstado
): string => {
  switch (status) {
    case 'ACTIVA':
      return 'Activa';
    case 'PAUSADA':
      return 'En pausa';
    case 'EXPIRADA':
      return 'Expirada';
    case 'CERRADA':
    default:
      return 'Cerrada';
  }
};

export const getSesionBiEventLabel = (
  eventType: string
): string => {
  switch (eventType.toUpperCase()) {
    case 'OPEN':
      return 'Abrió el reporte';
    case 'VISIBLE':
      return 'Volvió al reporte';
    case 'HIDDEN':
      return 'Cambió de pestaña';
    case 'CLOSE':
      return 'Cerró el reporte';
    case 'EXPIRE':
      return 'Sesión expirada';
    default:
      return eventType;
  }
};
