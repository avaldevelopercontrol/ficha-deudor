export const PERU_TIME_ZONE = 'America/Lima';

type DateTimePartName =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second';

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
