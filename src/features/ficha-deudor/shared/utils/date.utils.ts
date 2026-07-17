const PERU_TIME_ZONE = 'America/Lima';

const EXPLICIT_TIME_ZONE_PATTERN =
  /(Z|[+-]\d{2}:\d{2})$/i;

type DateTimePartName =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second';

const getDateTimePart = (
  parts: Array<{
    type: string;
    value: string;
  }>,
  type: DateTimePartName
): string => {
  const part = parts.find(
    (currentPart) =>
      currentPart.type === type
  );

  if (!part) {
    throw new Error(
      `No se pudo obtener la parte de fecha: ${type}.`
    );
  }

  return part.value;
};

/**
 * Convierte una fecha absoluta a la hora reloj de Perú.
 *
 * Devuelve:
 * YYYY-MM-DDTHH:mm:ss.SSS
 *
 * No agrega Z ni offset porque el backend almacena
 * la hora local de Perú en sus campos de gestión.
 */
export const formatDateTimeInPeru = (
  date: Date
): string => {
  if (Number.isNaN(date.getTime())) {
    throw new Error(
      'No se puede formatear una fecha inválida.'
    );
  }

  const parts =
    new Intl.DateTimeFormat('en-US', {
      timeZone: PERU_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);

  const year = getDateTimePart(
    parts,
    'year'
  );

  const month = getDateTimePart(
    parts,
    'month'
  );

  const day = getDateTimePart(
    parts,
    'day'
  );

  const hour = getDateTimePart(
    parts,
    'hour'
  );

  const minute = getDateTimePart(
    parts,
    'minute'
  );

  const second = getDateTimePart(
    parts,
    'second'
  );

  const milliseconds = String(
    date.getMilliseconds()
  ).padStart(3, '0');

  return (
    `${year}-${month}-${day}` +
    `T${hour}:${minute}:${second}` +
    `.${milliseconds}`
  );
};

export const getCurrentPeruDateTime =
  (): string => {
    return formatDateTimeInPeru(
      new Date()
    );
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

export const toApiDateTimeOrNull = (
  date: string | null | undefined
): string | null => {
  const normalizedDate =
    normalizeDateValue(date);

  if (!normalizedDate) {
    return null;
  }

  if (
    normalizedDate.includes('T')
  ) {
    return normalizedDate;
  }

  return `${normalizedDate}T00:00:00`;
};

export const toApiDateTimeOrCurrent = (
  date: string | null | undefined
): string => {
  return (
    toApiDateTimeOrNull(date) ??
    getCurrentPeruDateTime()
  );
};

export const toRequiredApiDateTime = (
  date: string | null | undefined,
  fieldName: string
): string => {
  const normalizedDate =
    toApiDateTimeOrNull(date);

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
 *
 * También corrige valores antiguos que puedan contener
 * Z u otro offset de zona horaria.
 */
export const toRequiredPeruApiDateTime = (
  date: string | null | undefined,
  fieldName: string
): string => {
  const normalizedDate =
    toRequiredApiDateTime(
      date,
      fieldName
    );

  /*
   * Una fecha sin Z ni offset ya representa
   * la hora reloj de Perú que necesita la API.
   */
  if (
    !EXPLICIT_TIME_ZONE_PATTERN.test(
      normalizedDate
    )
  ) {
    return normalizedDate;
  }

  const parsedDate =
    new Date(normalizedDate);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    throw new Error(
      `${fieldName} no contiene una fecha válida.`
    );
  }

  return formatDateTimeInPeru(
    parsedDate
  );
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
    date && date.trim()
  );
};