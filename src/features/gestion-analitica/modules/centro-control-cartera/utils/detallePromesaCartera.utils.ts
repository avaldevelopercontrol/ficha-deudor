import {
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';

import type {
  PortfolioPagination,
  SeguimientoPromesasCarteraPeriodo,
  SeguimientoPromesasCarteraStatusKey,
} from '../domain/promesasCartera.types';
import { formatPortfolioCurrency } from './centroControlCartera.formatters';

export interface PortfolioPromisePaginationView {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export const resolvePortfolioPromisePagination = (
  pagination: PortfolioPagination | null | undefined,
  requestedPage: number,
  requestedPageSize: number
): PortfolioPromisePaginationView => {
  const totalRecords = pagination?.totalItems ?? 0;
  const currentPage = pagination?.page ?? requestedPage;
  const pageSize = pagination?.pageSize ?? requestedPageSize;
  const totalPages = pagination?.totalPages ?? 0;
  const startIndex = totalRecords === 0
    ? 0
    : (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    totalRecords,
    totalPages,
    startIndex,
    endIndex: Math.min(startIndex + pageSize, totalRecords),
  };
};

export const formatPortfolioPromiseDate = (
  value: string | null,
  emptyLabel: string
): string => {
  if (!value) {
    return emptyLabel;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
};

export const formatPortfolioPromiseCutoffLabel = (
  asOfDate: string | null,
  currentDate = new Date()
): string | null => {
  if (!asOfDate) {
    return null;
  }

  const currentPeruDate = getCurrentPeruDateTime(currentDate).slice(0, 10);
  const formattedDate = formatPortfolioPromiseDate(asOfDate, asOfDate);

  return asOfDate === currentPeruDate
    ? `Hoy ${formattedDate}`
    : `Datos al ${formattedDate}`;
};

export const formatPortfolioPromiseCurrencyFilterOption = (
  value: string
): string => {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? formatPortfolioCurrency(amount)
    : value;
};


const shiftIsoDate = (isoDate: string, dayOffset: number): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);

  if (!match) {
    throw new Error('La fecha base debe usar formato YYYY-MM-DD.');
  }

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
  date.setUTCDate(date.getUTCDate() + dayOffset);

  return date.toISOString().slice(0, 10);
};

export const getSeguimientoPromesasCarteraDate = (
  period: SeguimientoPromesasCarteraPeriodo,
  currentDate = new Date()
): string => {
  const today = getCurrentPeruDateTime(currentDate).slice(0, 10);

  return period === 'today' ? today : shiftIsoDate(today, -1);
};

export const formatSeguimientoPromesasPeriodLabel = (
  period: SeguimientoPromesasCarteraPeriodo,
  dueDate: string
): string => {
  const formattedDate = formatPortfolioPromiseDate(dueDate, dueDate);

  return period === 'today'
    ? `Hoy · ${formattedDate}`
    : `Ayer · ${formattedDate}`;
};

export const getSeguimientoPromesaStatusLabel = (
  statusKey: SeguimientoPromesasCarteraStatusKey,
  fallbackLabel: string,
  lastPaymentDate: string | null,
  dueDate: string | null
): string => {
  if (
    statusKey === 'fulfilled' &&
    lastPaymentDate &&
    dueDate &&
    lastPaymentDate < dueDate
  ) {
    return 'Cumplida anticipadamente';
  }

  return fallbackLabel;
};

export const getSeguimientoPromesaEmptyActivityLabel = (
  outstandingAmount: number,
  period: SeguimientoPromesasCarteraPeriodo
): string => {
  const dayLabel = period === 'today' ? 'hoy' : 'ayer';

  return outstandingAmount <= 0
    ? `Sin gestión necesaria ${dayLabel}`
    : `Sin gestión ${dayLabel}`;
};
