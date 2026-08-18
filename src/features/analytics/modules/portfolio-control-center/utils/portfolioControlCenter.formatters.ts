import {
  PERU_TIME_ZONE,
} from '@shared/utils/peruDateTime.utils';

const integerFormatter = new Intl.NumberFormat(
  'es-PE',
  {
    maximumFractionDigits: 0,
  }
);

const currencyFormatter = new Intl.NumberFormat(
  'es-PE',
  {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }
);


const percentageFormatter = new Intl.NumberFormat(
  'es-PE',
  {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
);

const dateTimeFormatter = new Intl.DateTimeFormat(
  'es-PE',
  {
    timeZone: PERU_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h12',
  }
);

export const formatPortfolioInteger = (
  value: number
): string => {
  return integerFormatter.format(value);
};

export const formatPortfolioCurrency = (
  value: number | null
): string => {
  if (value === null) {
    return '—';
  }

  return currencyFormatter.format(value);
};

export const formatPortfolioPercentage = (
  value: number | null
): string => {
  if (value === null) {
    return '—';
  }

  return `${percentageFormatter.format(value)}%`;
};


export const formatPortfolioIntensityPercentage = (
  value: number | null
): string => {
  if (value === null) {
    return '—';
  }

  return formatPortfolioPercentage(value * 100);
};

export const formatPortfolioSignedPercentage = (
  value: number
): string => {
  const prefix = value > 0 ? '+' : '';

  return `${prefix}${formatPortfolioPercentage(value)}`;
};

export const calculatePortfolioRate = (
  value: number,
  total: number
): number => {
  if (total <= 0) {
    return 0;
  }

  return (value / total) * 100;
};

export const formatPortfolioUpdatedAt = (
  value: string
): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha de actualización no disponible';
  }

  return dateTimeFormatter
    .formatToParts(date)
    .map((part) => {
      if (part.type !== 'dayPeriod') {
        return part.value;
      }

      const normalizedDayPeriod =
        part.value.toLocaleLowerCase('es-PE');

      if (normalizedDayPeriod.includes('a')) {
        return 'AM';
      }

      if (normalizedDayPeriod.includes('p')) {
        return 'PM';
      }

      return part.value;
    })
    .join('')
    .replace(/[\u00a0\u202f]/g, ' ');
};

export const formatPortfolioCompactCurrency = (
  value: number
): string => {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absoluteValue >= 1_000_000) {
    return `${sign}S/ ${(absoluteValue / 1_000_000).toFixed(1)}M`;
  }

  if (absoluteValue >= 1_000) {
    return `${sign}S/ ${(absoluteValue / 1_000).toFixed(1)}K`;
  }

  return formatPortfolioCurrency(value);
};

const PORTFOLIO_MONTH_LABELS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

export const formatPortfolioPeriod = (
  value: string
): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    value
  );

  if (!match) {
    return value;
  }

  const monthIndex = Number(match[2]) - 1;
  const day = match[3];
  const monthLabel =
    PORTFOLIO_MONTH_LABELS[monthIndex];

  if (!monthLabel) {
    return value;
  }

  return `${day} ${monthLabel}`;
};
