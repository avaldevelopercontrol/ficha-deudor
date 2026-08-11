export const PERU_TIME_ZONE = 'America/Lima';

type DateTimePartName =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second';


const LOCAL_API_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?$/;

const isValidLocalDateTime = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number
): boolean => {
  const date = new Date(
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
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second &&
    date.getUTCMilliseconds() === millisecond
  );
};

/**
 * Normaliza una fecha/hora local recibida desde la API al formato
 * utilizado por los contratos de escritura: YYYY-MM-DDTHH:mm:ss.SSS.
 *
 * Los listados legacy pueden devolver el separador SQL con espacio y
 * omitir milisegundos; los endpoints PUT/POST esperan el formato ISO
 * local sin sufijo de zona horaria.
 */
export const normalizePeruApiDateTime = (
  value: string,
  fieldName = 'fecha'
): string => {
  const normalizedValue = value.trim();
  const match = normalizedValue.match(
    LOCAL_API_DATE_TIME_PATTERN
  );

  if (!match) {
    throw new Error(
      `${fieldName} debe contener una fecha y hora válida.`
    );
  }

  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    fractionText = '',
  ] = match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const millisecondsText = fractionText
    .slice(0, 3)
    .padEnd(3, '0');
  const millisecond = Number(millisecondsText);

  if (
    !isValidLocalDateTime(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond
    )
  ) {
    throw new Error(
      `${fieldName} debe contener una fecha y hora válida.`
    );
  }

  return (
    `${yearText}-${monthText}-${dayText}` +
    `T${hourText}:${minuteText}:${secondText}` +
    `.${millisecondsText}`
  );
};

const getDateTimePart = (
  parts: Intl.DateTimeFormatPart[],
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
 * Devuelve YYYY-MM-DDTHH:mm:ss.SSS sin Z ni offset porque
 * los endpoints actuales almacenan la fecha recibida como
 * una hora local y no realizan conversión de zona horaria.
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

export const getCurrentPeruDateTime = (
  currentDate = new Date()
): string => {
  return formatDateTimeInPeru(
    currentDate
  );
};
