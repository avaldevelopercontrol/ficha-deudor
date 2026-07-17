const PERU_COUNTRY_CODE = '51';
const PERU_MOBILE_PHONE_LENGTH = 9;

export const normalizeTelefonoForComparison = (
  value: string | number | null | undefined
): string => {
  const digitsOnly = String(value ?? '').replace(/\D/g, '');

  const hasPeruCountryCode =
    digitsOnly.startsWith(PERU_COUNTRY_CODE) &&
    digitsOnly.length ===
      PERU_COUNTRY_CODE.length + PERU_MOBILE_PHONE_LENGTH;

  return hasPeruCountryCode
    ? digitsOnly.slice(PERU_COUNTRY_CODE.length)
    : digitsOnly;
};