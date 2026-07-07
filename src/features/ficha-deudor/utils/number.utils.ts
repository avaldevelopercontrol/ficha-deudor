export const toNumber = (value: string | number | null | undefined) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const toDecimalNumber = (
  value: string | number | null | undefined
) => {
  if (value === null || value === undefined || value === '') return 0;

  const parsedValue = Number(String(value).replace(',', '.'));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const sanitizeDecimalValue = (value: string) => {
  const cleanedValue = value.replace(/[^0-9.]/g, '');
  const [integerPart, ...decimalParts] = cleanedValue.split('.');

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join('')}`;
};