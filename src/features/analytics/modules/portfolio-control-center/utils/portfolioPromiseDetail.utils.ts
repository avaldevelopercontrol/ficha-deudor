import {
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';

import type {
  PortfolioPagination,
} from '../domain/portfolioPromises.types';
import { formatPortfolioCurrency } from './portfolioControlCenter.formatters';

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
