export const splitTime = (time: string | null | undefined) => {
  const [hour = '', minute = ''] = String(time ?? '').split(':');

  return {
    hour,
    minute,
  };
};

export const getCurrentDateTime = () => {
  return new Date().toISOString();
};

export const normalizeDateValue = (date: string | null | undefined) => {
  const value = String(date ?? '').trim();

  if (!value) return '';

  const slashDateMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (slashDateMatch) {
    const [, day, month, year] = slashDateMatch;

    return `${year}-${month}-${day}`;
  }

  return value.replace(' ', 'T');
};

export const toApiDateTimeOrNull = (date: string | null | undefined) => {
  const normalizedDate = normalizeDateValue(date);

  if (!normalizedDate) return null;

  if (normalizedDate.includes('T')) {
    return normalizedDate;
  }

  return `${normalizedDate}T00:00:00`;
};

export const toApiDateTimeOrCurrent = (
  date: string | null | undefined
) => {
  return toApiDateTimeOrNull(date) ?? getCurrentDateTime();
};

export const getTimeHour = (time: string) => {
  return time?.split(':')[0] ?? '';
};

export const getTimeMinute = (time: string) => {
  return time?.split(':')[1] ?? '';
};

export const buildTimeValue = (
  currentTime: string,
  type: 'hour' | 'minute',
  value: string
) => {
  const currentHour = getTimeHour(currentTime) || '00';
  const currentMinute = getTimeMinute(currentTime) || '00';

  if (type === 'hour') {
    return `${value}:${currentMinute}`;
  }

  return `${currentHour}:${value}`;
};

export const hasValidDate = (date: string) => {
  return Boolean(date && date.trim());
};