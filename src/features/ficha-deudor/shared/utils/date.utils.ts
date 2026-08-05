import {
  formatDateTimeInPeru,
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';

export {
  formatDateTimeInPeru,
  getCurrentPeruDateTime,
  PERU_TIME_ZONE,
} from '@shared/utils/peruDateTime.utils';

export const PERU_UTC_OFFSET = '-05:00';

const EXPLICIT_TIME_ZONE_PATTERN =
  /(Z|[+-]\d{2}:\d{2})$/i;

const DATE_ONLY_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})$/;

const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

const COMPLETE_TIME_PATTERN =
  /^(\d{2}):(\d{2})$/;

interface LocalDateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

const padNumber = (
  value: number,
  length: number
): string => {
  return String(value).padStart(
    length,
    '0'
  );
};

const isValidLocalDateTimeParts = (
  parts: LocalDateTimeParts
): boolean => {
  const {
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
  } = parts;

  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > 31 ||
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59 ||
    !Number.isInteger(second) ||
    second < 0 ||
    second > 59 ||
    !Number.isInteger(millisecond) ||
    millisecond < 0 ||
    millisecond > 999
  ) {
    return false;
  }

  const validationDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      millisecond
    )
  );

  return (
    validationDate.getUTCFullYear() === year &&
    validationDate.getUTCMonth() === month - 1 &&
    validationDate.getUTCDate() === day &&
    validationDate.getUTCHours() === hour &&
    validationDate.getUTCMinutes() === minute &&
    validationDate.getUTCSeconds() === second &&
    validationDate.getUTCMilliseconds() === millisecond
  );
};

const formatLocalDateTimeParts = (
  parts: LocalDateTimeParts,
  includeMilliseconds = true
): string => {
  const baseDateTime = (
    `${padNumber(parts.year, 4)}-` +
    `${padNumber(parts.month, 2)}-` +
    `${padNumber(parts.day, 2)}T` +
    `${padNumber(parts.hour, 2)}:` +
    `${padNumber(parts.minute, 2)}:` +
    `${padNumber(parts.second, 2)}`
  );

  if (!includeMilliseconds) {
    return baseDateTime;
  }

  return (
    `${baseDateTime}.` +
    `${padNumber(parts.millisecond, 3)}`
  );
};

const parseLocalDateTime = (
  value: string
): LocalDateTimeParts | null => {
  const dateOnlyMatch = value.match(
    DATE_ONLY_PATTERN
  );

  if (dateOnlyMatch) {
    const parts: LocalDateTimeParts = {
      year: Number(dateOnlyMatch[1]),
      month: Number(dateOnlyMatch[2]),
      day: Number(dateOnlyMatch[3]),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    };

    return isValidLocalDateTimeParts(parts)
      ? parts
      : null;
  }

  const dateTimeMatch = value.match(
    LOCAL_DATE_TIME_PATTERN
  );

  if (!dateTimeMatch) {
    return null;
  }

  const millisecondText =
    dateTimeMatch[7] ?? '0';

  const parts: LocalDateTimeParts = {
    year: Number(dateTimeMatch[1]),
    month: Number(dateTimeMatch[2]),
    day: Number(dateTimeMatch[3]),
    hour: Number(dateTimeMatch[4]),
    minute: Number(dateTimeMatch[5]),
    second: Number(dateTimeMatch[6] ?? 0),
    millisecond: Number(
      millisecondText.padEnd(3, '0')
    ),
  };

  return isValidLocalDateTimeParts(parts)
    ? parts
    : null;
};

const parseDateAndTime = (
  date: string,
  time: string
): LocalDateTimeParts | null => {
  const normalizedDate = String(
    date ?? ''
  ).trim();

  const normalizedTime = String(
    time ?? ''
  ).trim();

  const dateMatch = normalizedDate.match(
    DATE_ONLY_PATTERN
  );

  const timeMatch = normalizedTime.match(
    COMPLETE_TIME_PATTERN
  );

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const parts: LocalDateTimeParts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
    second: 0,
    millisecond: 0,
  };

  return isValidLocalDateTimeParts(parts)
    ? parts
    : null;
};

/**
 * Alias temporal para evitar romper otros consumidores
 * que todavía importen getCurrentDateTime.
 */
export const getCurrentDateTime =
  getCurrentPeruDateTime;

export const splitTime = (
  time: string | null | undefined
) => {
  const [hour = '', minute = ''] =
    String(time ?? '').split(':');

  return {
    hour,
    minute,
  };
};

export const normalizeDateValue = (
  date: string | null | undefined
) => {
  const value = String(
    date ?? ''
  ).trim();

  if (!value) {
    return '';
  }

  const slashDateMatch = value.match(
    /^(\d{2})\/(\d{2})\/(\d{4})$/
  );

  if (slashDateMatch) {
    const [
      ,
      day,
      month,
      year,
    ] = slashDateMatch;

    return `${year}-${month}-${day}`;
  }

  return value.replace(' ', 'T');
};

/**
 * Normaliza una fecha para los endpoints que almacenan
 * hora reloj de Perú sin sufijo de zona horaria.
 */
export const toPeruApiDateTimeOrNull = (
  date: string | null | undefined
): string | null => {
  const normalizedDate =
    normalizeDateValue(date);

  if (!normalizedDate) {
    return null;
  }

  if (
    EXPLICIT_TIME_ZONE_PATTERN.test(
      normalizedDate
    )
  ) {
    const localDateTimeText =
      normalizedDate.replace(
        EXPLICIT_TIME_ZONE_PATTERN,
        ''
      );

    if (
      !parseLocalDateTime(
        localDateTimeText
      )
    ) {
      return null;
    }

    const parsedDate = new Date(
      normalizedDate
    );

    return Number.isNaN(
      parsedDate.getTime()
    )
      ? null
      : formatDateTimeInPeru(
          parsedDate
        );
  }

  const localParts =
    parseLocalDateTime(
      normalizedDate
    );

  const includeMilliseconds =
    /\.\d{1,3}$/.test(
      normalizedDate
    );

  return localParts
    ? formatLocalDateTimeParts(
        localParts,
        includeMilliseconds
      )
    : null;
};

export const toApiDateTimeOrNull =
  toPeruApiDateTimeOrNull;

export const toPeruApiDateTimeOrCurrent = (
  date: string | null | undefined,
  currentDate = new Date()
): string => {
  return (
    toPeruApiDateTimeOrNull(date) ??
    getCurrentPeruDateTime(currentDate)
  );
};

export const toApiDateTimeOrCurrent =
  toPeruApiDateTimeOrCurrent;

export const toRequiredApiDateTime = (
  date: string | null | undefined,
  fieldName: string
): string => {
  const normalizedDate =
    toPeruApiDateTimeOrNull(date);

  if (!normalizedDate) {
    throw new Error(
      `${fieldName} es obligatorio y debe contener una fecha válida.`
    );
  }

  return normalizedDate;
};

/**
 * Garantiza que una fecha de auditoría llegue a la API
 * como hora local de Perú.
 */
export const toRequiredPeruApiDateTime =
  toRequiredApiDateTime;

/**
 * Combina una fecha y una hora de formulario como hora
 * local de Perú, sin depender de la zona horaria del equipo.
 */
export const buildPeruApiDateTime = (
  date: string,
  time: string
): string => {
  const parts = parseDateAndTime(
    date,
    time
  );

  if (!parts) {
    throw new Error(
      'La fecha y hora no son válidas.'
    );
  }

  return formatLocalDateTimeParts(
    parts
  );
};

/**
 * Convierte una fecha y hora reloj de Perú en un instante
 * absoluto para comparaciones confiables.
 */
export const parsePeruDateTime = (
  date: string,
  time: string
): Date | null => {
  const parts = parseDateAndTime(
    date,
    time
  );

  if (!parts) {
    return null;
  }

  const localDateTime =
    formatLocalDateTimeParts(
      parts
    );

  const parsedDate = new Date(
    `${localDateTime}${PERU_UTC_OFFSET}`
  );

  return Number.isNaN(
    parsedDate.getTime()
  )
    ? null
    : parsedDate;
};

export const getTimeHour = (
  time: string
) => {
  return (
    time?.split(':')[0] ?? ''
  );
};

export const getTimeMinute = (
  time: string
) => {
  return (
    time?.split(':')[1] ?? ''
  );
};

export const buildTimeValue = (
  currentTime: string,
  type: 'hour' | 'minute',
  value: string
) => {
  const currentHour =
    getTimeHour(currentTime) ||
    '00';

  const currentMinute =
    getTimeMinute(currentTime) ||
    '00';

  if (type === 'hour') {
    return `${value}:${currentMinute}`;
  }

  return `${currentHour}:${value}`;
};

export const hasValidDate = (
  date: string
) => {
  return Boolean(
    toPeruApiDateTimeOrNull(date)
  );
};
